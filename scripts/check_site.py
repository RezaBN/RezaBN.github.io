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
        if tag == 'title':
            self.titles += 1
        if tag == 'h1':
            self.h1s += 1
        if tag == 'meta' and attrs.get('name') == 'description':
            self.descriptions += bool(attrs.get('content'))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals += 1
        for key in ['href', 'src']:
            if key in attrs:
                self.links.append(attrs[key])
        if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''):
            errors.append(f'{self.file}: external new-tab link lacks noopener')
        if tag == 'script' and attrs.get('src'):
            self.scripts += 1

pages = {file.resolve(): Page(file) for file in DIST.rglob('*.html')}
assert pages, 'No generated HTML found'
for file, page in pages.items():
    label = file.relative_to(DIST)
    for name, found, expected in [('title', page.titles, 1), ('h1', page.h1s, 1), ('description', page.descriptions, 1), ('canonical', page.canonicals, 1)]:
        if found != expected:
            errors.append(f'{label}: expected one {name}, found {found}')
    if page.lang != 'en':
        errors.append(f'{label}: missing language declaration')
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
for name in ['sitemap.xml', 'feed.xml']:
    ET.parse(DIST / name)
if (DIST / 'blog/your-article-slug').exists():
    errors.append('Draft template was accidentally published')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML files; all local links, anchors, SEO metadata, exports, and academic totals checked.')
