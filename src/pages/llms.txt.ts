import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Generated at build time so new case studies show up automatically.
// Format follows the llms.txt convention: https://llmstxt.org/
const SITE = 'https://savelledesign.com';

const link = (title: string, path: string, description: string) =>
  `- [${title}](${SITE}${path}): ${description}`;

export const GET: APIRoute = async () => {
  const projects = await getCollection('projects');

  const body = `# Savelle Design

> UX/UI design and web development for growing businesses, run by Savelle McThias (he/him) from Scottsdale, Arizona. 18+ years designing for companies ranging from PetSmart, General Motors, Sotheby's, Universal, and bareMinerals to solo-founder startups. The work covers landing pages, website refreshes, brand identity, and email campaigns.

A free self-serve UX Health Check scores your site and surfaces prioritized fixes. Project work is quoted individually as a fixed price after a conversation about scope.

## Start here

${link('Home', '/', 'Overview of services, selected work, and client results')}
${link('About', '/about', 'Savelle McThias’s background and approach')}
${link('Contact', '/#contact', 'Project inquiry modal, opens from any page — name, work email, and project details')}

## Work

${link('Case Studies', '/works', 'Detailed project write-ups with brief, role, and measured results')}
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

- [Substack](https://savelledesign.substack.com): Everything I wish clients knew before starting a website. From a designer who’s built them.

## Optional

${link('Privacy Policy', '/privacy', 'How the site handles visitor and form data')}
${link('Terms of Service', '/terms', 'Terms governing use of the site and services')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
