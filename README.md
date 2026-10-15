# Reza Barzegar Nozari academic website

A complete static academic website and Markdown blog, prepared for GitHub Pages. It includes biography and education, three research directions, current manuscripts, eight journal articles and one preprint, four GitHub projects, peer-review activity, and a downloadable Word CV.

The website uses HTML, CSS, and small JavaScript enhancements. A dependency-free Node.js script turns editable JSON and Markdown files into static pages. No server, database, npm install, paid service, or API key is required.

## Publish on GitHub Pages

1. Connect or sign in to the GitHub account **RezaBN**.
2. Create the public repository **RezaBN.github.io** if it does not already exist. If it exists, review its current contents before replacing anything.
3. Add the contents of this project to that repository's `main` branch, including `.github/workflows/pages.yml`. The ZIP handoff excludes private preview hosting metadata and Git history.
4. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
5. Commit the files. The **Publish academic website** workflow builds, validates, and deploys the site. If the initial run happens before Pages is enabled, rerun it from **Actions**.
6. After a successful workflow, the intended public address is **https://rezabn.github.io/**. This address is a target, not a claim that publication has already occurred.

The workflow obtains its canonical base URL from GitHub Pages. It also supports a repository project site. No credentials belong in website source files.

Official instructions: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Edit your information

| Content | File |
| --- | --- |
| Identity, contact links, research areas, manuscripts, reviewer counts | `content/site.json` |
| Papers, DOI links, authors, venue metadata and associated code | `content/publications.json` |
| Featured software repositories and attribution | `content/projects.json` |
| Blog posts | `content/posts/*.md` |
| Word CV | `assets/Reza_Barzegar_Nozari_CV.docx` |
| Colors, typography and responsive layout | `assets/style.css` |
| Page layouts and biography text | `scripts/build.mjs` |

Update `updated` in `content/site.json` when revising the academic record. The content and review counts initially reflect information provided in October 2026. Two projects are explicitly attributed as reproductions of other authors' work. The introductory blog post was drafted from the supplied research biography and is editable.

## Write a blog post

Copy `content/posts/_template.md` to a new filename, such as `2026-11-01-my-new-note.md`. Set the title, date, category, summary and a unique lower-case hyphenated slug. Change `draft: true` to `draft: false` when ready. Files beginning with `_` and posts marked `draft: true` are excluded from the published site.

```markdown
---
title: My new research note
date: 2026-11-01
category: Research notes
summary: A brief introduction to the note.
slug: my-new-note
draft: false
---

The first paragraph goes here.

## A descriptive heading

Use **bold**, *emphasis*, `inline code`, and [links](https://example.com).

- An item
- Another item
```

The included Markdown renderer supports paragraphs, headings at levels 2–4, links, emphasis, ordered and unordered lists, blockquotes, inline code, and fenced code blocks. Raw HTML is escaped. It does not render LaTeX equations, nested lists, or Markdown tables. Dates use `YYYY-MM-DD`; metadata values are plain text. Posts marked for publication appear immediately, irrespective of date. Publishing a new post refreshes the blog index, RSS feed, and sitemap automatically on the next workflow run.

## Build locally

Requirements: Node.js 20 or newer; Python 3 for checks. No third-party packages are required.

```sh
node scripts/build.mjs
python3 scripts/check_site.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Change a source file, rebuild, and refresh. Do not edit `dist` directly: it is regenerated from source. The default canonical address comes from `content/site.json`; set `SITE_URL` to override it during a build.

## Features

- Responsive navigation and layouts with keyboard focus styles, skip navigation, and reduced-motion support.
- Static, searchable publication list with year and publication-type filters.
- Per-paper BibTeX disclosure, copy button with fallback selection, and a complete `.bib` download.
- Project filters for original research software and research reproductions.
- Markdown blog with article navigation, reading time, RSS, and a sitemap.
- Search-engine metadata, structured profile data, and a custom 404 page.
- All academic content is present in generated HTML; it remains readable without JavaScript.
- No analytics, tracking, contact-form backend, or visitor accounts.

## Deployment and validation notes

The build validates local file links and in-page anchors. The checks verify publication and review totals, duplicate IDs, SEO titles, language declarations, and the CV download. The initial implementation was checked without an interactive browser, so a final visual check on your preferred devices is recommended before making the GitHub site public.

The source of the private preview is synchronized separately. Files under `.openai/` belong only to that preview environment and should not be added to the public GitHub repository. The supplied GitHub ZIP excludes those files.
