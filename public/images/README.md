# Public Images Directory

This directory contains static images that are served as-is without processing.

## Directory Structure

- **works/** - Portfolio and project showcase images
- **services/** - Service-related images and illustrations
- **about/** - About page photos and personal images
- **logos/** - Company logos, client logos, and branding assets

## Usage

Files in `public/images/` are accessible at `/images/` in your site.

Example:
```astro
<img src="/images/works/project-screenshot.jpg" alt="Project" />
```

Use this directory for:
- Large images that don't need optimization
- SVG files that should remain unchanged
- Third-party logos and assets
- Images referenced in markdown or external sources
