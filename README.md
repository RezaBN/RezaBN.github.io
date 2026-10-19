# Reza Barzegar Nozari — English / فارسی

A complete bilingual academic website with an RBN personal logo, biography, research, publications, projects, peer-review activity, a Markdown blog, and a downloadable English Word CV.

- **English:** https://rezabn.github.io/
- **فارسی:** https://rezabn.github.io/fa/

These GitHub URLs serve the bilingual version after the updated files are committed and the Pages workflow succeeds. The `English / فارسی` control on every page opens its counterpart. English links retain their original addresses. The Farsi pages have RTL layout, a self-hosted Vazirmatn font, localized controls, Persian digits, and Persian-calendar blog dates. Publication years remain Gregorian in both languages. Official English titles, authors, journal names, DOIs, and BibTeX are retained; Persian title translations appear above the original titles.

## Publish the complete website on GitHub Pages

This is the **complete website**, including English and Farsi source, the RBN logo, the Word CV, and ready-built pages in `dist`. It does not require the earlier website ZIP or bilingual update ZIP.

1. Extract **RezaBN_Complete_Bilingual_Website.zip** on your computer.
2. Open https://github.com/RezaBN/RezaBN.github.io and choose **Add file → Upload files**, at the repository root on the **Code** page.
3. Upload the extracted `assets`, `content`, `scripts`, and `dist` folders, together with `README.md` and `package.json`, keeping the folder structure. Commit to `main`. Upload the extracted items themselves, not the ZIP or an extra containing folder.
4. Keep **Settings → Pages → Source: GitHub Actions**. Keep your existing `.github/workflows/static.yml`; an identical copy is included in this package for a fresh checkout. Use only that workflow for Pages, so an older `pages.yml`, `jekyll.yml`, or `blank.yml` does not compete with it.
5. Open **Actions** and wait for **Publish academic website** to succeed.
6. Visit **https://rezabn.github.io/** for English and **https://rezabn.github.io/fa/** for Farsi.

The workflow builds the website and publishes **dist**, which contains the homepage `index.html`. There is no need to move `dist/index.html` to the repository root. GitHub's upload dialog may not show hidden folders; your existing workflow is already configured correctly, so it can remain in place.

For a new repository or a Git-based upload, include `.github/workflows/static.yml` and `.gitignore` from this package. Never add `.openai/` or Git credentials to the public repository. This package excludes private hosting metadata and Git history.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## راهنمای انتشار نسخه کامل

این بسته، نسخه کامل وب‌سایت انگلیسی و فارسی، نشان RBN، رزومه Word و صفحه‌های آماده در پوشه `dist` را شامل می‌شود. به بسته‌های قبلی نیازی نیست.

۱. فایل **RezaBN_Complete_Bilingual_Website.zip** را از حالت فشرده خارج کنید.

۲. در صفحه اصلی مخزن `RezaBN/RezaBN.github.io`، گزینه **Add file → Upload files** را انتخاب کنید.

۳. پوشه‌های `assets`، `content`، `scripts` و `dist` را همراه با `README.md` و `package.json` در ریشه مخزن بارگذاری کنید. خود فایل ZIP یا یک پوشه اضافی که همه فایل‌ها را در بر گرفته است بارگذاری نشود.

۴. تغییرات را در شاخه `main` ثبت کنید. تنظیم **Settings → Pages → Source: GitHub Actions** و فایل فعلی `static.yml` را نگه دارید.

۵. در بخش **Actions** منتظر موفقیت اجرای **Publish academic website** بمانید. نسخه فارسی در مسیر `/fa/` در دسترس خواهد بود.

فایل `index.html` در پوشه `dist` قرار دارد و روند انتشار، محتوای همین پوشه را منتشر می‌کند؛ جابه‌جایی این فایل لازم نیست.

## Your RBN logo

The original transparent PNG is included at **assets/rbn-logo.png**. It appears in the header, footer, About page, and browser icon for both languages. The footer places it on a light panel for contrast. At narrow mobile widths, the header keeps the logo and language control visible, while the full name remains in the page content.

The original artwork is preserved without recoloring, redrawing, stretching, or mirroring. You can reuse the same PNG in lecture notes, presentations, posts, and blog graphics. Use a light background for contrast. The PNG is 1774 × 887 pixels; preserve its 2:1 aspect ratio when inserting it into a document. It is a raster image, not an SVG vector file.

## Edit content

| Content | Source |
| --- | --- |
| Shared identity, links, research, manuscripts, review counts | `content/site.json` |
| English interface text and biography | `content/locales/en.json` |
| Farsi interface, biography, identity, research, manuscript and project translations, Persian paper titles | `content/locales/fa.json` |
| Official publication metadata and DOI links | `content/publications.json` |
| Project metadata, code links, and original-method attribution | `content/projects.json` |
| English and Farsi blog posts | `content/posts/*.md` |
| English Word CV | `assets/Reza_Barzegar_Nozari_CV.docx` |
| Original transparent RBN logo | `assets/rbn-logo.png` |
| Layout and typography | `assets/style.css` |
| Static page templates and URL generation | `scripts/build.mjs` |

The publication and service record reflects the supplied October 2026 information. The 111 reviews are aggregated across 10 distinct journals. Reproductions retain their original authors' attribution. The introductory blog post is based on the supplied research biography. Persian translations are editable in the files above.

## Add a bilingual blog post

Copy `_template.md` for English and `_template.fa.md` for Farsi. Give each a different filename, such as `2026-11-01-new-note.en.md` and `2026-11-01-new-note.fa.md`, but use the **same slug** to pair translations. Set `lang: en` or `lang: fa`. Files starting with `_` and posts with `draft: true` are excluded.

```markdown
---
title: My research note
date: 2026-11-01
category: Research notes
summary: A short introduction.
slug: my-research-note
lang: en
draft: false
---

Your opening paragraph.

## A section heading

Use **bold**, *emphasis*, `code`, lists, and [links](https://example.com).
```

Dates in source use Gregorian `YYYY-MM-DD`; Farsi display dates convert to the Persian calendar automatically. Each language has its own blog index and RSS feed. New posts are published immediately when `draft: false`, regardless of date. If a future post has no translation, its language switch opens the other language's blog index.

Internal links such as `../../publications/` remain in the reader's selected language. Absolute links use their specified language. The renderer supports headings 2–4, paragraphs, emphasis, links, lists, blockquotes, and fenced code blocks; raw HTML is escaped. It does not render LaTeX, nested lists, or Markdown tables.

## Build and check

Node.js 20+ and Python 3 are required. No npm dependencies, server, database, or API key is needed.

```sh
node scripts/build.mjs
python3 scripts/check_site.py
node scripts/check_interactions.mjs
```

Set `SITE_URL` to change canonical URLs for another host. All page and asset links support a GitHub project-site subpath. For a quick offline preview, open `dist/index.html` for English or `dist/fa/index.html` for Farsi. For browser inspection over HTTP, serve `dist` with your preferred static server. The site content is static and does not require an account or backend. Clipboard copying may use the selection fallback when viewing local files.

Checks cover every local link and anchor, matching language switches, language/direction attributes, structured data, feeds, font/license, academic data and citation exports. Interaction checks exercise the actual browser script in a lightweight Node harness: Persian/Arabic search variants and digits, filters, reset, localized counters, navigation labels, and citation copying. This update was checked without an interactive browser; visual desktop/mobile QA is still unverified.

## Font and hosting

Vazirmatn is self-hosted under the SIL Open Font License; see `assets/fonts/OFL.txt`. Source: https://github.com/rastikerdar/vazirmatn. No third-party font request is made.

The separately hosted preview retains its existing audience. Its `.openai/` configuration and Git history are excluded from GitHub handoffs.
