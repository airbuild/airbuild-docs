# AirBuild Docs

The documentation site for [AirBuild](https://airbuild.dev) — the OTA app distribution platform for uploading builds, sharing install links, and managing testers.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

## Structure

```
docs-site/
├── src/
│   ├── assets/              # Logo, favicon, images
│   ├── content/
│   │   └── docs/            # Markdown documentation pages
│   │       ├── getting-started/   # Quick start, organization setup
│   │       ├── guides/            # Upload, install links, iOS/Android, UDID, billing
│   │       ├── developer/         # API keys, REST API, webhooks, CLI, SDKs
│   │       └── resources/         # FAQ, troubleshooting
│   ├── styles/
│   │   └── custom.css       # Custom theme overrides
│   └── content.config.ts    # Content collection schema
├── astro.config.mjs         # Starlight config (sidebar, nav, social)
├── package.json
└── tsconfig.json
```

## Documentation sections

- **Getting Started** — Quick start guide, creating an organization
- **Guides** — Upload builds, install links & QR codes, iOS OTA installation, Android APK installation, UDID capture, team management, billing & plans
- **Developer** — API keys, REST API reference, webhooks, CLI tool, SDKs
- **Resources** — FAQ, troubleshooting

## Commands

| Command           | Action                                       |
| ----------------- | -------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview the production build locally         |

## Writing docs

Documentation pages are Markdown (`.md`) or MDX (`.mdx`) files in `src/content/docs/`. Each file is exposed as a route based on its file path.

### Frontmatter

```markdown
---
title: Page Title
description: Short description shown in search and sidebar
---

# Page Title

Content here...
```

### Sidebar navigation

The sidebar is configured in `astro.config.mjs` under the `sidebar` key. To add a new page, create the Markdown file and add an entry to the appropriate sidebar section.

### Links

- Internal links use relative paths: `[Quick Start](../getting-started/quick-start/)`
- External links use full URLs: `[AirBuild](https://airbuild.dev)`

## Deployment

The site is configured for `https://docs.airbuild.dev`. Build with `npm run build` and deploy the `./dist/` directory to your hosting provider.
