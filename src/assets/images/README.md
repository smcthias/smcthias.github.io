# Astro Assets Images Directory

This directory contains images that will be optimized by Astro's image processing.

## Directory Structure

- **works/** - Portfolio and project images (optimized)
- **services/** - Service page images and graphics (optimized)
- **about/** - About page photos (optimized)
- **icons/** - Icon assets and small graphics

## Usage

Import and use with Astro's Image component for automatic optimization:

```astro
---
import { Image } from 'astro:assets';
import projectImage from '@/assets/images/works/project.jpg';
---

<Image src={projectImage} alt="Project" width={800} height={600} />
```

Benefits:
- Automatic image optimization
- Responsive image generation
- Modern format conversion (WebP, AVIF)
- Lazy loading support
- Better performance
