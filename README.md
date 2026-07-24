# Savelle Design Portfolio

A modern, responsive portfolio website built with Astro, Tailwind CSS, and Astro Content Collections.

## Features

- 🚀 Built with Astro 7 for optimal performance
- 🎨 Styled with Tailwind CSS
- 📱 Fully responsive design
- 📝 Content managed via Astro Content Collections
- ⚡ Static site generation
- 🎯 SEO-friendly with meta tags
- ♿ Accessible design
- 🖼️ Markdown-controlled image management for portfolio projects

## Site Structure

### Pages

- **Home** (`/`) - Landing page with hero section, featured work, services preview, and testimonials
- **Services** (`/services`) - Service overview with detailed service pages
  - Landing Page Design (`/services/landing-page-design`)
  - Website Refresh (`/services/website-refresh`)
  - Brand Identity (`/services/brand-identity`)
  - Email Campaigns (`/services/email-campaigns`)
- **Works** (`/works`) - Portfolio showcase with project grid
  - Individual project pages (`/works/[slug]`) - Dynamic routes from content collections
- **About** (`/about`) - Background, expertise, and client testimonials
- **Contact** (`/contact`) - Contact information and form

### Portfolio Projects

Portfolio projects are managed through Astro Content Collections, with each project defined in markdown files (`src/content/projects/*.md`). Currently includes:

- **Yoli** - Email design system and marketing campaigns
- **Nikkl** - Fintech branding and website redesign
- **Omegas411** - Landing page for Omega-3 resource guide
- **La Mesa RV & Van Up** - E-commerce design and development
- **Young Living** - News and promotion hub
- **Adorned** - AR game branding

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This site is deployed at [savelledesign.com](https://savelledesign.com). The build output is set to static mode.

### Build Output

The production build is generated in the `dist/` directory with:
- All assets optimized
- Static HTML pages pre-rendered from content collections
- `.nojekyll` file for custom domain compatibility

## Project Structure

```
/
├── public/                    # Static assets
│   ├── .nojekyll             # Custom domain configuration
│   ├── CNAME                 # Domain configuration
│   ├── favicon.svg
│   └── images/               # Image assets
│       ├── about/            # About page images
│       ├── logos/            # Logo assets
│       ├── services/         # Service page images
│       └── works/            # Portfolio project images
├── src/
│   ├── content/              # Content collections
│   │   ├── config.ts         # Content schema definitions
│   │   └── projects/         # Project markdown files
│   │       ├── yoli.md
│   │       ├── nikkl.md
│   │       ├── omegas411.md
│   │       ├── lamesa.md
│   │       ├── young-living.md
│   │       └── adorned.md
│   ├── layouts/              # Layout components
│   │   └── Layout.astro
│   ├── pages/                # Page components
│   │   ├── index.astro       # Homepage
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── services.astro
│   │   ├── services/         # Service detail pages
│   │   │   ├── brand-identity.astro
│   │   │   ├── email-campaigns.astro
│   │   │   ├── landing-page-design.astro
│   │   │   └── website-refresh.astro
│   │   ├── works.astro       # Portfolio grid
│   │   └── works/
│   │       └── [slug].astro  # Dynamic project pages
│   └── env.d.ts
├── astro.config.mjs
└── package.json
```

## Content Management

### Adding a New Project

1. Create a new markdown file in `src/content/projects/` (e.g., `my-project.md`)
2. Add the required frontmatter fields:

```yaml
---
title: "Project Name"
description: "Brief project description"
category: "Project Category"
date: "2025-01-01"
tags: ["Tag1", "Tag2", "Tag3"]
thumbnail: "project-thumbnail.png"
role: "Your Role"
timeline: "2025"
services: "Services Provided"
brief:
  - "Project brief paragraph 1"
  - "Project brief paragraph 2"
results:
  - value: "100+"
    label: "Result metric"
  - value: "50%"
    label: "Another metric"
ctaHeading: "Call to action heading"
ctaDescription: "Call to action description"
images:
  hero: "project-hero.png"
  detail1: "project-detail1.png"
  detail2: "project-detail2.png"
  detail3: "project-detail3.png"
---
```

3. Add corresponding images to `public/images/works/`
4. The project will automatically appear on the works page

### Updating Site Information

1. **Site URL**: Edit `astro.config.mjs` to update the `site` value
2. **Page Content**: Modify content in `src/pages/`
3. **Contact Info**: Update `src/pages/contact.astro`
4. **Content Schema**: Modify `src/content.config.ts` to add/change project fields

### Styling

The site uses Tailwind CSS with a zinc color palette. Main colors:
- Background: White (`bg-white`)
- Text: Zinc shades (`text-zinc-900`, `text-zinc-600`)
- Accents: Zinc dark (`bg-zinc-900`)

Customize theme values in the `@theme` block of `src/styles/global.css` or use
Tailwind's utility classes directly.

## Tech Stack

- **Framework**: Astro 7
- **Styling**: Tailwind CSS 4 (CSS-first config via `src/styles/global.css`)
- **Content**: Astro Content Collections (glob loader) with Zod validation
- **TypeScript**: For type safety
- **Deployment**: Static site generation

## License

This project is proprietary and created for Savelle Design.
