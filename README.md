# Lab Website

Static GitHub Pages site for a MHL lab.

## Edit the content

- `data/members.json`: lab members, contact details, CV summaries, research interests
- `data/available-theses.json`: available diploma thesis projects
- `data/ongoing-theses.json`: diploma theses currently under development
- `data/equipment.json`: lab equipment
- `data/publications.bib`: BibTeX entries for publications
- `data/publications-extra.json`: PDF links, publisher links, and abstracts keyed by BibTeX entry key

## Pages

- `index.html`: introductory page
- `members.html`: lab members
- `available-theses.html`: available diploma thesis projects
- `ongoing-theses.html`: diploma theses under development
- `publications.html`: publications parsed from BibTeX
- `equipment.html`: available equipment

## Preview locally

Run a small static server from this directory:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The data-driven pages use `fetch()`, so they should be previewed through a local server instead of by double-clicking the HTML files.

## Publish on GitHub Pages

Push this repository to GitHub and enable GitHub Pages for the branch. No build step is required.
