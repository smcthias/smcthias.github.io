import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Generated at build time so new posts and case studies show up automatically.
// Format follows the llms.txt convention: https://llmstxt.org/
const SITE = 'https://savelledesign.com';

const link = (title: string, path: string, description: string) =>
  `- [${title}](${SITE}${path}): ${description}`;

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
  const projects = await getCollection('projects');

  const body = `# Savelle Design

> UX/UI design and web development for growing businesses, run by Savelle McThias (he/him) from Scottsdale, Arizona. 18+ years designing for companies ranging from PetSmart, General Motors, Sotheby's, Universal, and bareMinerals to solo-founder startups. The work covers landing pages, website refreshes, brand identity, and email campaigns.

Two ways to start are offered on the site: a free self-serve UX Health Check that scores your site, and a fixed-price 48-hour UX Audit. Project work is quoted from a published rate card.

## Start here

${link('Home', '/', 'Overview of services, selected work, and client results')}
${link('About', '/about', 'Savelle McThias’s background, approach, and client testimonials')}
${link('Contact', '/contact', 'Project inquiry form — project type, budget range, and details')}

## Services

${link('All Services', '/services', 'Overview of the four core service offerings')}
${link('Landing Page Design', '/services/landing-page-design', 'Single-page design focused on a specific conversion goal')}
${link('Website Refresh', '/services/website-refresh', 'Redesign of an existing site’s structure, visuals, and content')}
${link('Brand Identity', '/services/brand-identity', 'Logo, visual system, and brand guidelines')}
${link('Email Campaigns', '/services/email-campaigns', 'Designed and built email templates and campaigns')}
${link('Pricing', '/pricing', 'Published rate card for project work')}

## Products

${link('UX Health Check', '/ux-health-check', 'Free 10-question self-assessment that scores your site’s UX and returns prioritized findings')}
${link('48-Hour UX Audit', '/ux-audit', 'Fixed-price $997 audit: recorded walkthrough video, prioritized issues list, quick-win recommendations, and a 60-minute strategy call. Delivered within two business days.')}

## Work

${link('Case Studies', '/works', 'Detailed project write-ups with brief, role, and measured results')}
${link('Gallery', '/gallery', 'Visual portfolio of web, branding, UI, and email work')}
${projects
  .map((p) =>
    link(
      p.data.title,
      `/works/${p.id.replace(/\.md$/, '')}`,
      `${p.data.category}. ${p.data.description}`
    )
  )
  .join('\n')}

## Writing

${link('Blog', '/blog', 'Articles on UX, conversion, and web design for business owners')}
${posts
  .map((p) =>
    link(p.data.title, `/blog/${p.slug}`, `${p.data.date.slice(0, 10)}. ${p.data.description}`)
  )
  .join('\n')}

## Optional

${link('Privacy Policy', '/privacy', 'How the site handles visitor and form data')}
${link('Terms of Service', '/terms', 'Terms governing use of the site and services')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
