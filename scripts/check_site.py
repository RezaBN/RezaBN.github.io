"""Validate generated local links, document structure, and academic data."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
errors = []

class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.ids = []
        self.links = []
        self.titles = 0
        self.h1s = 0
        self.lang = None
        self.direction = None
        self.switches = []
        self.alternates = {}
        self.json_scripts = []
        self.active_json = None
        self.descriptions = 0
        self.canonicals = 0
        self.scripts = 0
        self.feed(file.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
            self.direction = attrs.get('dir')
        if tag == 'title':
            self.titles += 1
        if tag == 'h1':
            self.h1s += 1
        if tag == 'meta' and attrs.get('name') == 'description':
            self.descriptions += bool(attrs.get('content'))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals += 1
        if tag == 'link' and attrs.get('hreflang'):
            self.alternates[attrs['hreflang']] = attrs.get('href')
        if tag == 'a' and 'language-link' in attrs.get('class', '').split():
            self.switches.append(attrs)
        if tag == 'script' and attrs.get('type') in ['application/json', 'application/ld+json']:
            self.active_json = ''
        for key in ['href', 'src']:
            if key in attrs:
                self.links.append(attrs[key])
        if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''):
            errors.append(f'{self.file}: external new-tab link lacks noopener')
        if tag == 'script' and attrs.get('src'):
            self.scripts += 1

    def handle_data(self, data):
        if self.active_json is not None:
            self.active_json += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.active_json is not None:
            self.json_scripts.append(json.loads(self.active_json))
            self.active_json = None

pages = {file.resolve(): Page(file) for file in DIST.rglob('*.html')}
assert pages, 'No generated HTML found'
for file, page in pages.items():
    label = file.relative_to(DIST)
    for name, found, expected in [('title', page.titles, 1), ('h1', page.h1s, 1), ('description', page.descriptions, 1), ('canonical', page.canonicals, 1)]:
        if found != expected:
            errors.append(f'{label}: expected one {name}, found {found}')
    expected_lang = 'fa' if label.parts[0] == 'fa' else 'en'
    if page.lang != expected_lang or page.direction != ('rtl' if expected_lang == 'fa' else 'ltr'):
        errors.append(f'{label}: incorrect language or direction')
    if len(page.switches) != 1:
        errors.append(f'{label}: expected one language switch')
    else:
        switch = page.switches[0]
        other = 'en' if expected_lang == 'fa' else 'fa'
        expected_file = DIST / (Path(*label.parts[1:]) if expected_lang == 'fa' else Path('fa') / label)
        if switch.get('hreflang') != other or switch.get('lang') != other:
            errors.append(f'{label}: incorrect switch language')
        counterpart_exists = expected_file.is_file()
        if not counterpart_exists:
            if 'blog' in label.parts and label.parts[-2] != 'blog':
                expected_file = DIST / ('fa/blog/index.html' if other == 'fa' else 'blog/index.html')
            else:
                errors.append(f'{label}: translation counterpart missing')
        if file.name != '404.html':
            target = (file.parent / unquote(urlsplit(switch['href']).path)).resolve() / 'index.html'
            if target != expected_file.resolve():
                errors.append(f'{label}: switch points to wrong translated page')
    expected_alternates = {'en','fa','x-default'} if len(page.switches) == 1 and counterpart_exists else {expected_lang,'x-default'}
    if set(page.alternates) != expected_alternates:
        errors.append(f'{label}: incorrect hreflang metadata')
    if len(page.json_scripts) != 2:
        errors.append(f'{label}: missing structured data or translated client messages')
    if expected_lang == 'fa' and not any('\u0600' <= c <= '\u06ff' for c in file.read_text()):
        errors.append(f'{label}: Persian text missing')
    if any(count > 1 for count in Counter(page.ids).values()):
        errors.append(f'{label}: duplicate element IDs')
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        if url.path.startswith('/'):
            target = DIST / unquote(url.path.lstrip('/'))
        elif url.path:
            target = file.parent / unquote(url.path)
        else:
            target = file
        target = target.resolve()
        if target.is_dir():
            target /= 'index.html'
        if not target.exists():
            errors.append(f'{label}: broken local link {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{label}: missing anchor {link}')

data = json.loads((ROOT / 'content/site.json').read_text())
pubs = json.loads((ROOT / 'content/publications.json').read_text())
projects = json.loads((ROOT / 'content/projects.json').read_text())
if len({journal for journal, _ in data['reviews']}) != len(data['reviews']):
    errors.append('Duplicate journal in review activity')
if any(not isinstance(n, int) or n < 0 for _, n in data['reviews']):
    errors.append('Invalid review count')
if len({p['id'] for p in pubs}) != len(pubs) or len({p['doi'] for p in pubs}) != len(pubs):
    errors.append('Duplicate publication ID or DOI')
if len({p['id'] for p in projects}) != len(projects):
    errors.append('Duplicate project ID')
if not (DIST / 'assets/Reza_Barzegar_Nozari_CV.docx').is_file():
    errors.append('CV download missing')
if not (DIST / 'publications.bib').read_text().count('@') == len(pubs):
    errors.append('Incomplete BibTeX export')
if not (DIST / 'assets/fonts/Vazirmatn-Variable.woff2').read_bytes().startswith(b'wOF2'):
    errors.append('Persian font is missing or invalid')
if 'SIL OPEN FONT LICENSE' not in (DIST / 'assets/fonts/OFL.txt').read_text():
    errors.append('Font license missing')
for name in ['sitemap.xml', 'feed.xml', 'fa/feed.xml']:
    ET.parse(DIST / name)
for lang, prefix in [('en', ''), ('fa', 'fa/')]:
    feed = ET.parse(DIST / prefix / 'feed.xml').getroot()
    if feed.findtext('./channel/language') != lang:
        errors.append(f'{lang}: incorrect RSS language')
    pub_html = (DIST / prefix / 'publications/index.html').read_text()
    for pub in pubs:
        if f'id="{pub["id"]}"' not in pub_html or f'https://doi.org/{pub["doi"]}' not in pub_html:
            errors.append(f'{lang}: missing publication {pub["id"]}')
if (DIST / 'blog/your-article-slug').exists() or (DIST / 'fa/blog/your-article-slug').exists():
    errors.append('Draft template was accidentally published')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML files; bilingual links, language switches, RTL/LTR, SEO, feeds, fonts, exports, and academic totals checked.')
