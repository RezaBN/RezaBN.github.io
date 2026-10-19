import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'content', name), 'utf8'));
const site = read('site.json'), publications = read('publications.json'), projects = read('projects.json');
const locales = {en: read('locales/en.json'), fa: read('locales/fa.json')};
const languages = Object.keys(locales);
const origin = (process.env.SITE_URL || site.url).replace(/\/$/, '');
const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg class="directional-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const northeast = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const external = (url, label, cls='text-link') => `<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}${northeast}</a>`;
const totalReviews = site.reviews.reduce((sum, item) => sum + item[1], 0);
const journalCount = publications.filter(p => p.type === 'journal').length;
const preprintCount = publications.filter(p => p.type === 'preprint').length;
const languageRoot = lang => lang === 'en' ? '' : `${lang}/`;
const absolute = (lang, route='') => origin + '/' + languageRoot(lang) + route;

function graph(kind='hero', t) {
  if (kind === 'matrix') return `<svg viewBox="0 0 400 160" class="project-art" aria-hidden="true"><g fill="currentColor">${Array.from({length:32},(_,i)=>`<rect x="${69+(i%8)*34}" y="${24+Math.floor(i/8)*30}" width="23" height="20" rx="3" opacity="${[.12,.3,.6,.85][(i*3+Math.floor(i/8))%4]}"/>`).join('')}</g></svg>`;
  if (kind === 'layers') return '<svg viewBox="0 0 400 160" class="project-art" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3"><path d="m125 35 75-24 75 24-75 24Z"/><path d="m125 60 75-24 75 24-75 24Z" opacity=".7"/><path d="m125 85 75-24 75 24-75 24Z" opacity=".5"/><path d="m125 110 75-24 75 24-75 24Z" opacity=".3"/></g><circle cx="200" cy="143" r="4" fill="currentColor"/></svg>';
  if (kind === 'alignment') return '<svg viewBox="0 0 400 160" class="project-art" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><ellipse cx="142" cy="80" rx="65" ry="44" transform="rotate(-25 142 80)"/><ellipse cx="258" cy="80" rx="65" ry="44" transform="rotate(25 258 80)"/><path d="M107 58c48 61 130-39 184 47M109 99c42-69 135 40 180-44" opacity=".5"/></g><g fill="currentColor"><circle cx="142" cy="80" r="5"/><circle cx="258" cy="80" r="5"/></g></svg>';
  if (kind === 'network') return '<svg viewBox="0 0 400 160" class="project-art" aria-hidden="true"><g stroke="currentColor" fill="none" opacity=".5"><path d="m90 90 70-50 65 45 75-37-35 77-105-85 15 90 50-45-135 5m85 40 90-5 35-77M90 90l85 40"/></g><g fill="currentColor"><circle cx="90" cy="90" r="7"/><circle cx="160" cy="40" r="8"/><circle cx="225" cy="85" r="13"/><circle cx="300" cy="48" r="6"/><circle cx="265" cy="125" r="6"/><circle cx="175" cy="130" r="5"/></g></svg>';
  return `<svg class="hero-graph" direction="ltr" viewBox="0 0 440 470" aria-hidden="true"><defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#b6c9bf" opacity=".42"/></pattern></defs><rect x="0" y="0" width="440" height="470" fill="url(#dots)"/><g fill="none" stroke="#9db6a9"><circle cx="220" cy="220" r="153" opacity=".25"/><circle cx="220" cy="220" r="103" opacity=".45"/><ellipse cx="220" cy="220" rx="153" ry="67" transform="rotate(-35 220 220)" opacity=".5"/><path d="M89 139 220 220 358 151M89 139l50 181 81-100 95 110 43-179M139 320l176 10M220 220l-8-155" opacity=".7"/></g><g fill="#c4d4c7"><circle cx="89" cy="139" r="6"/><circle cx="139" cy="320" r="8"/><circle cx="315" cy="330" r="6"/><circle cx="358" cy="151" r="7"/><circle cx="212" cy="65" r="4"/></g><circle cx="220" cy="220" r="23" fill="#d9b08c"/><circle cx="220" cy="220" r="36" fill="none" stroke="#d9b08c" opacity=".5"/><g fill="#e4e9e0" font-family="var(--sans)" font-size="11" letter-spacing="2"><text x="36" y="117">${t('influence')}</text><text x="288" y="130">${t('learning')}</text><text x="270" y="362">${t('adaptation')}</text></g><path d="M36 416h368" stroke="#6e8d7e" opacity=".5"/><text x="36" y="442" fill="#c4d4c7" font-family="var(--serif)" font-size="17">${t('artLine')}</text></svg>`;
}

function bibtex(p) {
  const fields = {title:p.title, author:p.bibAuthors, year:p.year};
  if (p.type === 'preprint') Object.assign(fields,{eprint:p.arxiv,archivePrefix:'arXiv',doi:p.doi});
  else Object.assign(fields,{journal:p.venue,volume:p.volume,number:p.issue,pages:p.pages?.replace('–','--'),eid:p.article,doi:p.doi});
  return `@${p.type === 'preprint' ? 'misc' : 'article'}{${p.id},\n${Object.entries(fields).filter(([,v])=>v).map(([k,v])=>`  ${k} = {${v}}`).join(',\n')}\n}`;
}

function inline(value) {
  let s=e(value), tokens=[];
  const keep=html=>{tokens.push(html);return `@@TOKEN${tokens.length-1}@@`;};
  s=s.replace(/`([^`]+)`/g,(_,v)=>keep(`<code>${v}</code>`));
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>/^(https?:\/\/|mailto:|\.\.\/|\.\/|#)/.test(url)?keep(`<a href="${url}"${url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`):label);
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return s.replace(/@@TOKEN(\d+)@@/g,(_,n)=>tokens[Number(n)]);
}

function markdown(src) {
  const lines=src.split('\n');let output=[],para=[],list=[],listType='',code=null,codeLines=[],headings=[];
  function flushPara(){if(para.length){output.push(`<p>${inline(para.join(' '))}</p>`);para=[];}}
  function flushList(){if(list.length){output.push(`<${listType}>${list.map(x=>`<li>${inline(x)}</li>`).join('')}</${listType}>`);list=[];}}
  for(const line of lines){
    if(line.startsWith('```')){flushPara();flushList();if(code!==null){output.push(`<pre><code class="language-${e(code)}">${e(codeLines.join('\n'))}</code></pre>`);code=null;codeLines=[];}else code=line.slice(3).trim();continue;}
    if(code!==null){codeLines.push(line);continue;}
    if(!line.trim()){flushPara();flushList();continue;}
    const head=line.match(/^(#{2,4}) (.+)$/);
    if(head){flushPara();flushList();const slug=head[2].toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');const id=headings.some(h=>h.id===slug)||!slug?`${slug || 'section'}-${headings.length+1}`:slug;headings.push({id,title:head[2]});output.push(`<h${head[1].length} id="${id}">${inline(head[2])}</h${head[1].length}>`);continue;}
    const li=line.match(/^(- |\d+\. )(.+)$/);
    if(li){flushPara();const type=li[1].startsWith('-')?'ul':'ol';if(listType&&listType!==type)flushList();listType=type;list.push(li[2]);continue;}
    if(line.startsWith('> ')){flushPara();flushList();output.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`);continue;}
    flushList();para.push(line);
  }
  flushPara();flushList();if(code!==null)throw Error('Unclosed Markdown code fence');
  return {html:output.join('\n'),headings};
}

const postDir=path.join(root,'content/posts');
const allPosts=fs.readdirSync(postDir).filter(f=>f.endsWith('.md')&&!f.startsWith('_')).map(file=>{
  const raw=fs.readFileSync(path.join(postDir,file),'utf8');
  const match=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!match)throw Error(`Missing front matter: ${file}`);
  const meta=Object.fromEntries(match[1].split('\n').filter(Boolean).map(line=>{const n=line.indexOf(':');return [line.slice(0,n).trim(),line.slice(n+1).trim()];}));
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug))throw Error('Invalid post slug');
  if(!['en','fa'].includes(meta.lang || 'en'))throw Error(`Unsupported post language: ${file}`);
  return {...meta,lang:meta.lang || 'en',...markdown(match[2]),minutes:Math.max(1,Math.ceil(match[2].split(/\s+/).length/210))};
}).filter(p=>p.draft!=='true').sort((a,b)=>b.date.localeCompare(a.date));

// Content keys must match across languages; bibliographic identifiers remain unchanged.
for (const lang of languages) {
  for (const key of Object.keys(locales.en.ui)) {
    if (!locales[lang].ui[key]) throw Error(`Missing ${lang} translation: ${key}`);
  }
}
for (const kind of ['research','projects','papers']) {
  const records = kind === 'research' ? site.research : kind === 'projects' ? projects : publications;
  for (const record of records) if (!locales.fa[kind][record.id]) throw Error(`Missing Farsi ${kind}: ${record.id}`);
}
const postKeys = allPosts.map(p => `${p.lang}/${p.slug}`);
if (new Set(postKeys).size !== postKeys.length) throw Error('Duplicate blog slug within a language');
if (locales.fa.manuscripts.length !== site.manuscripts.length) throw Error('Missing manuscript translations');

fs.mkdirSync(out,{recursive:true});
for (const file of fs.readdirSync(out)) fs.rmSync(path.join(out,file),{recursive:true,force:true});
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
function write(route,content) {
  const full=path.join(out,route);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  fs.writeFileSync(full,content);
}
const urls = [];

function buildLocale(lang) {
  const loc = locales[lang], fa = lang === 'fa';
  const name = loc.name || site.name;
  const role = loc.role || site.role;
  const university = loc.university || site.university;
  const department = loc.department || site.department;
  const location = loc.location || site.location;
  const localeResearch = site.research.map(r => ({...r,...loc.research?.[r.id]}));
  const localeProjects = projects.map(p => ({...p,...loc.projects?.[p.id]}));
  const localeManuscripts = site.manuscripts.map((m,i) => ({...m,...loc.manuscripts?.[i]}));
  const posts = allPosts.filter(p => p.lang === lang);
  const n = value => String(value).replace(/\d/g,d => fa ? '۰۱۲۳۴۵۶۷۸۹'[Number(d)] : d);
  const t = (key, values={}) => {
    if (!(key in loc.ui)) throw Error(`Unknown translation: ${key}`);
    return loc.ui[key].replace(/\{(\w+)\}/g,(_,token) => values[token] ?? `{${token}}`);
  };
  const prettyDate = date => new Intl.DateTimeFormat(fa ? 'fa-IR' : 'en',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
  const sectionLabel = (number,label) => `<p class="eyebrow"><span>${n(number)}</span>${t(label)}</p>`;
  const intro = (kicker,title,description) => `<section class="page-intro container"><p class="eyebrow">${t(kicker)}</p><h1>${t(title)}</h1><p class="page-description">${description}</p></section>`;
  const english = value => `<bdi lang="en" dir="ltr">${e(value)}</bdi>`;

  function publication(p, compact=false) {
    const translated = loc.papers?.[p.id];
    const venue = [p.venue,p.volume ? `${p.volume}${p.issue ? `(${p.issue})` : ''}` : '',p.article ? `Article ${p.article}` : p.pages].filter(Boolean).join(', ');
    const search = `${p.title} ${p.authors} ${p.venue} ${p.topic} ${p.year} ${locales.fa.papers[p.id].title} ${locales.fa.papers[p.id].topic}`;
    return `<article class="publication ${compact?'compact':''}" data-year="${p.year}" data-type="${p.type}" data-search="${e(search)}" id="${p.id}"><div class="pub-year">${n(p.year)}<span>${t(p.type==='preprint'?'preprint':'journal')}</span></div><div class="pub-main">${translated?`<p class="translated-title" lang="fa" dir="rtl">${e(translated.title)}</p>`:''}<h3 lang="en" dir="ltr"><a href="https://doi.org/${e(p.doi)}" target="_blank" rel="noopener noreferrer">${e(p.title)}</a></h3><p class="authors" lang="en" dir="ltr">${e(p.authors).replace('Barzegar Nozari, R.','<strong>Barzegar Nozari, R.</strong>')}</p><p class="venue" lang="en" dir="ltr">${e(venue)}</p><div class="pub-links">${external('https://doi.org/'+p.doi,t('readPaper'))}${p.code?external(p.code,t('code')):''}${compact?'':`<details class="citation"><summary><bdi dir="ltr">BibTeX</bdi></summary><div class="citation-content"><button class="copy-citation small-button" type="button">${t('copyCitation')}</button><pre lang="en" dir="ltr"><code>${e(bibtex(p))}</code></pre><span class="copy-status sr-only" aria-live="polite"></span></div></details>`}</div></div></article>`;
  }

  function project(p) {
    return `<article class="project" data-category="${p.category}"><a class="project-image ${p.motif}" href="${e(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${e(p.title)} — ${t('repository')}">${graph(p.motif,t)}<span class="project-number" dir="ltr" lang="en">${e(p.language)}</span><span class="project-open">${northeast}</span></a><div class="project-info"><span class="project-type">${e(p.kind)}</span><h3><a href="${e(p.url)}" target="_blank" rel="noopener noreferrer">${english(p.title)} <span>${e(p.subtitle)}</span></a></h3><p>${e(p.description)}</p>${p.attribution?`<p class="attribution">${e(p.attribution)}</p>`:''}<div class="pub-links">${external(p.url,t('viewRepository'))}${p.doi?external('https://doi.org/'+p.doi,t('relatedPaper')):''}</div></div></article>`;
  }

  function blogCard(p,prefix) {
    return `<article class="blog-card"><div class="blog-meta"><span>${e(p.category)}</span><time datetime="${e(p.date)}">${prettyDate(p.date)}</time></div><h3><a href="${prefix}blog/${e(p.slug)}/">${e(p.title)}</a></h3><p>${e(p.summary)}</p><a class="text-link" href="${prefix}blog/${e(p.slug)}/">${t('readNote')} ${arrow}</a><span class="reading-time">${t('minutes',{n:n(p.minutes)})}</span></article>`;
  }

  function paths(route,absoluteLinks=false) {
    // Prefixes are relative to the current document, including project-site subpaths.
    const folder = languageRoot(lang) + route.replace(/[^/]*\.html$/,'');
    const relative = target => {
      if (absoluteLinks) return `${origin}/${target}`;
      const rel = path.posix.relative(folder || '.',target || '.');
      return rel ? `${rel}/` : './';
    };
    return {home:relative(languageRoot(lang)),root:relative(''),relative};
  }

  function layout({title,description,active='',body,route='',article,error=false}) {
    const p = paths(route,error);
    const other = fa?'en':'fa';
    const translatedPost = !article || allPosts.some(post=>post.lang===other&&post.slug===article.slug);
    const otherRoute = article&&!translatedPost?'blog/':route;
    const switchHref = error ? absolute(other,route) : p.root+languageRoot(other)+otherRoute;
    const canonical = absolute(lang,route);
    const fullTitle = title?`${title} — ${name}`:`${name} — ${t('brandRole')}`;
    const pageTranslations = languages.filter(l=>!article||allPosts.some(post=>post.lang===l&&post.slug===article.slug));
    const schema = article ? {'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,datePublished:article.date,description:article.summary,inLanguage:lang,author:{'@type':'Person',name:site.name,url:origin},url:canonical} : {'@context':'https://schema.org','@type':'Person',name,alternateName:fa?site.name:locales.fa.name,jobTitle:role,affiliation:{'@type':'CollegeOrUniversity',name:university},url:absolute(lang),sameAs:Object.values(site.links)};
    const clientMessages = Object.fromEntries(['openMenu','closeMenu','showPubs','showProjects','copyCitation','copied','copiedStatus','selectCopy','selectStatus'].map(key=>[key,t(key)]));
    const header = `<a class="skip-link" href="#main">${t('skip')}</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${p.home}" aria-label="${e(name)} — ${t('homeLabel')}"><span class="brand-mark" lang="en" dir="ltr">R<span>.</span></span><span class="brand-name">${e(name)}<span>${t('brandRole')}</span></span></a><nav id="primary-nav" aria-label="${t('navLabel')}">${['about','research','publications','projects','blog'].map(key=>`<a href="${p.home}${key}/"${key===active?' aria-current="page"':''}>${t(key)}</a>`).join('')}<a class="nav-contact" href="mailto:${e(site.email)}">${t('contact')}${northeast}</a></nav><div class="header-controls"><div class="language-switch" role="group" aria-label="${t('language')}"><span lang="${lang}" dir="${fa?'rtl':'ltr'}" aria-current="true">${fa?'فارسی':'English'}</span><a class="language-link" href="${switchHref}" lang="${other}" hreflang="${other}" dir="${fa?'ltr':'rtl'}">${fa?'English':'فارسی'}</a></div><button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="${t('openMenu')}"><span></span><span></span></button></div></div></header>`;
    const footer = `<footer class="site-footer"><div class="container"><div class="footer-top"><div><p class="eyebrow">${t('connect')}</p><h2>${t('contactHeading')}</h2><a class="footer-email" href="mailto:${e(site.email)}" dir="ltr" lang="en">${e(site.email)} ${northeast}</a></div><div class="footer-links"><span>${t('elsewhere')}</span>${['Google Scholar','GitHub','ORCID','LinkedIn'].map(key=>external(site.links[key],key)).join('')}</div></div><div class="footer-bottom"><p>© ${n(site.updated.slice(0,4))} ${e(name)}</p><div><a href="${p.root}assets/Reza_Barzegar_Nozari_CV.docx" download>${t('downloadCV')}</a><a href="${p.home}feed.xml">${t('rss')}</a><a href="#top">${t('backTop')}</a></div></div></div></footer>`;
    return `<!doctype html><html lang="${lang}" dir="${fa?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#173e35"><title>${e(fullTitle)}</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(canonical)}">${pageTranslations.map(l=>`<link rel="alternate" hreflang="${l}" href="${e(absolute(l,route))}">`).join('')}<link rel="alternate" hreflang="x-default" href="${e(absolute(pageTranslations.includes('en')?'en':lang,route))}"><meta property="og:type" content="${article?'article':'website'}"><meta property="og:title" content="${e(fullTitle)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:locale" content="${fa?'fa_IR':'en_US'}"><meta property="og:locale:alternate" content="${fa?'en_US':'fa_IR'}"><meta name="twitter:card" content="summary"><link rel="icon" type="image/svg+xml" href="${p.root}assets/favicon.svg">${fa?`<link rel="preload" href="${p.root}assets/fonts/Vazirmatn-Variable.woff2" as="font" type="font/woff2" crossorigin>`:''}<link rel="alternate" type="application/rss+xml" title="${e(name)} — ${t('feedTitle')}" href="${p.home}feed.xml"><link rel="stylesheet" href="${p.root}assets/style.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><script type="application/json" id="site-messages">${JSON.stringify(clientMessages).replace(/</g,'\\u003c')}</script><script defer src="${p.root}assets/site.js"></script></head><body id="top">${header}<main id="main">${body}</main>${footer}</body></html>`;
  }

  const assetHome = fa?'../':'./';
  const stats = `<div class="stats">${[[String(journalCount).padStart(2,'0'),'journalArticles'],[String(preprintCount).padStart(2,'0'),'preprint'],[totalReviews,'peerReviews'],[site.reviews.length,'reviewedJournals']].map(([count,key])=>`<div><strong>${n(count)}</strong><span>${t(key)}</span></div>`).join('')}</div>`;
  const home = `<section class="hero container"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>${e(role)}</p><h1>${t('heroName')}</h1><p class="hero-line">${t('heroLine')}</p><p class="hero-description">${t('heroDescription')}</p><div class="hero-actions"><a class="button" href="./research/">${t('explore')}${arrow}</a><a class="text-link" href="${assetHome}assets/Reza_Barzegar_Nozari_CV.docx" download>${t('downloadCV')} ↓</a></div><div class="hero-location"><span class="location-dot"></span>${e(university)}<span class="divider">/</span>${e(location)}</div></div><div class="hero-art"><div class="art-label">${t('artLabel')}</div>${graph('hero',t)}<span class="art-corner" dir="ltr">RBN / ${site.updated.slice(0,4)}</span></div></section><section class="stats-section"><div class="container">${stats}</div></section><section class="section container"><div class="section-heading">${sectionLabel('01','researchDirections')}<h2>${t('researchHeading')}</h2><a class="text-link" href="./research/">${t('allResearch')}${arrow}</a></div><div class="research-grid">${localeResearch.map(r=>`<a class="research-card" href="./research/#${r.id}"><span class="research-num">${n(r.number)}</span><h3>${e(r.short)}</h3><p>${e(r.description)}</p><span class="research-arrow">${northeast}</span></a>`).join('')}</div></section><section class="section tinted"><div class="container"><div class="section-heading">${sectionLabel('02','selectedPubs')}<h2>${t('recentWork')}</h2><a class="text-link" href="./publications/">${t('allPubs')}${arrow}</a></div><div class="publication-list">${publications.filter(p=>p.featured).map(p=>publication(p,true)).join('')}</div></div></section><section class="section container"><div class="section-heading">${sectionLabel('03','practice')}<h2>${t('ideasImplemented')}</h2><a class="text-link" href="./projects/">${t('allProjects')}${arrow}</a></div><div class="project-grid">${localeProjects.slice(0,2).map(project).join('')}</div></section><section class="section notebook-section"><div class="container notebook-layout"><div>${sectionLabel('04','fromNotebook')}<h2>${t('thinking')}</h2><p>${t('notebookDescription')}</p><a class="text-link" href="./blog/">${t('visitBlog')}${arrow}</a></div><div>${posts.slice(0,1).map(p=>blogCard(p,'./')).join('')}</div></div></section>`;

  const subAssets = fa?'../../':'../';
  const about = `${intro('biography','aboutTitle',t('aboutDescription'))}<section class="container about-layout section-bottom"><aside class="about-aside"><div class="monogram"><bdi dir="ltr" lang="en">RBN</bdi><span>${t('aiResearch')}</span></div><p class="eyebrow">${t('affiliation')}</p><p>${e(department)}<br><strong>${e(university)}</strong><br>${t('iran')}</p><a class="button" href="${subAssets}assets/Reza_Barzegar_Nozari_CV.docx" download>${t('fullCV')} ↓</a><div class="profile-links">${Object.entries(site.links).map(([k,v])=>external(v,k)).join('')}</div></aside><div class="prose about-prose"><h2>${t('bioHeading')}</h2>${loc.biography.map(p=>`<p>${e(p)}</p>`).join('')}<h2>${t('education')}</h2><div class="education">${[['phd','ai'],['msc','aiRobotics'],['bsc','softwareEngineering']].map(([degree,subject],i)=>`<div><span class="education-mark">${t(degree)}</span><div><h3>${t(subject)}</h3>${i===0?`<p>${e(university)}${fa?'،':','} ${t('iran')} · ${t('inProgress')}</p>`:''}</div></div>`).join('')}</div></div></section><section class="section tinted"><div class="container service-layout"><div><p class="eyebrow">${t('service')}</p><h2>${t('serviceHeading')}</h2><p class="service-stat"><strong>${n(totalReviews)}</strong>${t('completedReviews')}</p><p>${t('reviewScope',{n:n(site.reviews.length)})}</p></div><div class="table-wrap"><table><caption class="sr-only">${t('reviewCaption')}</caption><thead><tr><th scope="col">${t('journal')}</th><th scope="col">${t('reviews')}</th></tr></thead><tbody>${site.reviews.map(([journal,count])=>`<tr><th scope="row">${english(journal)}</th><td>${n(count)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">${t('total')}</th><td>${n(totalReviews)}</td></tr></tfoot></table></div></div></section>`;

  const research = `${intro('research','researchTitle',t('researchDescription'))}<section class="container section-bottom">${localeResearch.map(r=>`<article class="research-detail" id="${r.id}"><span class="detail-number">${n(r.number)}</span><div><p class="eyebrow">${e(r.short)}</p><h2>${e(r.title)}</h2><p class="research-question">${e(r.description)}</p><p>${e(r.detail)}</p><div class="tags">${r.tags.map(tag=>`<span class="tag">${e(tag)}</span>`).join('')}</div></div></article>`).join('')}</section><section class="section tinted" id="current-manuscripts"><div class="container"><div class="section-heading"><p class="eyebrow">${t('workInProgress')}</p><h2>${t('manuscripts')}</h2></div><p class="section-description">${t('manuscriptDescription')}</p><div class="manuscript-list">${localeManuscripts.map((m,i)=>`<article><span class="manuscript-index">${n(String(i+1).padStart(2,'0'))}</span><div><span class="status-tag">${e(m.status)}</span>${m.translatedTitle?`<p class="translated-title">${e(m.translatedTitle)}</p>`:''}<h3 lang="en" dir="ltr">${e(m.title)}</h3><p>${e(m.topic)}</p></div></article>`).join('')}</div></div></section>`;

  const pubPage = `${intro('publications','pubTitle',t('pubDescription',{journals:n(journalCount),preprints:n(preprintCount)}))}<section class="container section-bottom"><div class="publication-tools"><div class="filters" role="group" aria-label="${t('pubType')}">${[['all','all',publications.length],['journal','journalArticles',journalCount],['preprint','preprint',preprintCount]].map(([type,label,count],i)=>`<button type="button" class="filter${i?'':' active'}" data-type-filter="${type}" aria-pressed="${!i}">${t(label)} <span>${n(count)}</span></button>`).join('')}</div><a class="text-link" href="${subAssets}publications.bib" download>${t('downloadBib')}</a></div><div class="search-row"><label class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">${t('searchPubs')}</span><input id="publication-search" type="search" dir="auto" placeholder="${t('searchPlaceholder')}" autocomplete="off"></label><label class="year-field"><span class="sr-only">${t('pubYear')}</span><select id="publication-year"><option value="all">${t('allYears')}</option>${[...new Set(publications.map(p=>p.year))].map(y=>`<option value="${y}">${n(y)}</option>`).join('')}</select></label></div><p id="publication-count" class="results-count" aria-live="polite">${t('showPubs',{n:n(publications.length)})}</p><div class="publication-list filterable-publications">${publications.map(p=>publication(p)).join('')}</div><div class="empty-state" id="no-publications" hidden><h2>${t('noPubs')}</h2><p>${t('tryKeywords')}</p><button type="button" class="small-button" id="reset-publications">${t('clearFilters')}</button></div><div class="page-note"><p>${t('ongoingWork')}</p><a class="text-link" href="../research/#current-manuscripts">${t('currentResearch')}${arrow}</a></div></section>`;

  const projectsPage = `${intro('codeProjects','projectTitle',t('projectDescription'))}<section class="container section-bottom"><div class="project-tools"><div class="filters" role="group" aria-label="${t('projectType')}">${[['all','allProjects'],['research','researchSoftware'],['reproduction','reproductions']].map(([value,label],i)=>`<button type="button" class="filter${i?'':' active'}" data-project-filter="${value}" aria-pressed="${!i}">${t(label)}${i?'':` <span>${n(projects.length)}</span>`}</button>`).join('')}</div>${external(site.links.GitHub,t('viewGithub'))}</div><p class="sr-only" id="project-count" aria-live="polite">${t('showProjects',{n:n(projects.length)})}</p><div class="project-grid">${localeProjects.map(project).join('')}</div></section>`;

  const blog = `${intro('notebook','blogTitle',t('blogDescription'))}<section class="container blog-index section-bottom"><div class="blog-index-header"><p>${t('noteCount',{n:n(posts.length)})}</p><a class="text-link" href="../feed.xml">${t('subscribe')}${northeast}</a></div><div class="blog-list">${posts.map(p=>blogCard(p,'../')).join('')}</div></section>`;

  const emit = (route,body,title,description,active='',article) => {
    write(languageRoot(lang)+route+'index.html',layout({route,body,title,description,active,article}));
    urls.push({lang,route});
  };
  emit('',home,undefined,t('metaHome'));
  for (const [key,body] of Object.entries({about,research,publications:pubPage,projects:projectsPage,blog})) emit(key+'/',body,t(key),t('meta'+key[0].toUpperCase()+key.slice(1)),key);
  for (const post of posts) {
    const body = `<article class="container article-page"><a class="text-link back-link" href="../"><span aria-hidden="true">${fa?'→':'←'}</span>${t('allNotes')}</a><header class="article-header"><p class="eyebrow">${e(post.category)}</p><h1>${e(post.title)}</h1><p class="article-summary">${e(post.summary)}</p><div class="article-byline"><span>${e(name)}</span><span>·</span><time datetime="${post.date}">${prettyDate(post.date)}</time><span>·</span><span>${t('minutes',{n:n(post.minutes)})}</span></div></header><div class="article-layout"><aside class="article-toc"><p class="eyebrow">${t('inNote')}</p><nav aria-label="${t('articleSections')}">${post.headings.map(h=>`<a href="#${e(h.id)}">${e(h.title)}</a>`).join('')}</nav></aside><div class="prose article-body">${post.html}<div class="article-end"><span>${t('thanks')}</span><a href="mailto:${e(site.email)}">${t('continueConversation')}${northeast}</a></div></div></div></article>`;
    emit(`blog/${post.slug}/`,body,post.title,post.summary,'blog',post);
  }
  write(languageRoot(lang)+'404.html',layout({title:t('notFound'),route:'404.html',description:t('notFoundDescription'),error:true,body:`<section class="container page-intro error-page"><p class="eyebrow">${n(404)}</p><h1>${t('notFoundTitle')}</h1><p>${t('notFoundDescription')}</p><a class="button" href="${e(absolute(lang))}">${t('returnHome')}${arrow}</a></section>`}));
  write(languageRoot(lang)+'feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${e(name)} — ${t('feedTitle')}</title><link>${e(absolute(lang,'blog/'))}</link><description>${t('feedDescription')}</description><language>${lang}</language><atom:link href="${e(absolute(lang,'feed.xml'))}" rel="self" type="application/rss+xml"/>${posts.map(p=>`<item><title>${e(p.title)}</title><link>${e(absolute(lang,'blog/'+p.slug+'/'))}</link><guid>${e(absolute(lang,'blog/'+p.slug+'/'))}</guid><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate><description>${e(p.summary)}</description></item>`).join('')}</channel></rss>`);
}
for (const lang of languages) buildLocale(lang);
write('publications.bib',publications.map(bibtex).join('\n\n')+'\n');
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.map(({lang,route})=>`<url><loc>${e(absolute(lang,route))}</loc><lastmod>${site.updated}</lastmod>${urls.filter(other=>other.route===route).map(other=>`<xhtml:link rel="alternate" hreflang="${other.lang}" href="${e(absolute(other.lang,route))}"/>`).join('')}</url>`).join('')}</urlset>`);
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
write('.nojekyll','');
console.log(`Built ${urls.length} pages in English and Farsi, ${publications.length} publications, ${projects.length} projects, and ${allPosts.length} localized blog posts. Output: ${out}`);
