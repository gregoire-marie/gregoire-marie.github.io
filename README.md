# gregoire-marie.github.io

Personal research portfolio for [Grégoire Marie](https://gregoire-marie.com).

## Development

```sh
npm ci
npm run dev
```

The production site is deployed to GitHub Pages by `.github/workflows/deploy.yml`. During the build, public repositories are loaded from GitHub and merged with the curated metadata in `data/projects.json`; the local catalogue remains the fallback for offline builds.

Use Node.js 22.19 or later. Before publishing, run `npm test` and `npm run build`; use `npm run preview` to inspect the production build locally.

In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source and retain `gregoire-marie.com` as the custom domain. Pushes to `main` then install the locked npm dependencies, test, build, and deploy the generated `dist/` directory. `public/CNAME` preserves the domain in the build output.

## Content

- `data/about.json` — profile
- `data/cv.json` — complete CV timeline; set an entry's `type` to `education` or `experience` to choose its side
- `data/projects.json` — curated project metadata and build fallback
- `data/publications.json` — scientific publications
- `data/skills.json` — skill categories, icons, and items

### Project categories

Project logos use the `icon` field in `data/projects.json`. Both existing Lordicon hashes (for example, `rmkpgtpt`) and current library paths (for example, `wired/outline/2557-logo-google`) load animated icons. The local player adapter in `src/lib/lordicon.ts` supports JSON and Lordicon's encoded `.li` format. For contact icons, edit the `links` array in `src/components/Contact.astro`.

Project category assignments use each entry's `category` field in `data/projects.json`. The project section derives its filter labels from those values; repositories without a curated category appear under Other.

## License and attribution

The contact section uses the ORCID and ResearchGate outline icons from [Line Awesome by Icons8](https://github.com/icons8/line-awesome). The artwork and its upstream license are stored locally in `public/icons/`. CSS masks follow the site's text colors in both themes, and CSS adds a hover animation.

This website is adapted from [Astro Monograph](https://github.com/theserverlessdev/astro-monograph), created by Ankur Singh and distributed under the MIT License. The original copyright and permission notice is retained in [`LICENSE`](LICENSE).
