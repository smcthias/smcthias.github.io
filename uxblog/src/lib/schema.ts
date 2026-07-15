/**
 * Structured data (JSON-LD) builders for savellem.com.
 *
 * The Person and WebSite graphs are emitted on every page by BaseLayout.
 * Pages pass additional, page-specific schema (Service, FAQPage, ProfilePage)
 * via the BaseLayout `schema` prop.
 *
 * NOTE: `sameAs` intentionally lists only verified profiles (LinkedIn). Add
 * Behance / Dribbble / X here only once each profile is confirmed live and
 * on-brand — a stale profile in the entity graph hurts more than it helps.
 */

export const SITE_URL = 'https://savellem.com';
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Savelle McThias',
  url: SITE_URL,
  jobTitle: 'UX/UI Designer & Digital Experience Leader',
  description:
    'UX/UI designer and Digital Experience Leader with two decades of creating exceptional user experiences across enterprise SaaS, e-commerce, and AI-powered design workflows.',
  image: `${SITE_URL}/og-image.jpg`,
  email: 'mailto:savellem@gmail.com',
  telephone: '+1-602-931-1474',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Scottsdale',
    addressRegion: 'AZ',
    addressCountry: 'US',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Savelle LLC',
  },
  knowsAbout: [
    'User Experience Design',
    'User Interface Design',
    'Design Systems',
    'E-commerce UX',
    'Enterprise SaaS Design',
    'Conversion Rate Optimization',
    'UX Research',
    'AI-powered design workflows',
  ],
  sameAs: ['https://www.linkedin.com/in/savelle'],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: 'Savelle McThias',
  description: 'Portfolio and services of Savelle McThias, UX/UI Designer.',
  publisher: { '@id': PERSON_ID },
  inLanguage: 'en-US',
};

export type FaqItem = { question: string; answer: string };

/** Build a FAQPage graph from on-page Q&As. Schema must match visible content. */
export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

type ServiceOptions = {
  name: string;
  description: string;
  serviceType: string;
  url: string;
  /** Optional fixed-price offer (e.g. the productized UX audit). */
  offer?: { price: string; priceCurrency?: string };
};

/** Build a Service graph provided by the Person. */
export function serviceSchema({ name, description, serviceType, url, offer }: ServiceOptions) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url,
    provider: { '@id': PERSON_ID },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
  if (offer) {
    schema.offers = {
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.priceCurrency ?? 'USD',
      availability: 'https://schema.org/InStock',
      url,
    };
  }
  return schema;
}

/** Build a ProfilePage graph (for the About page). */
export function profilePageSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: { '@id': PERSON_ID },
  };
}

type CreativeWorkOptions = {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  keywords?: string[];
  about?: string;
};

/** Build a CreativeWork graph for a case study (improves AI citability). */
export function creativeWorkSchema({
  name,
  description,
  url,
  image,
  datePublished,
  keywords,
  about,
}: CreativeWorkOptions) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    headline: name,
    description,
    url,
    creator: { '@id': PERSON_ID },
  };
  if (image) schema.image = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  if (datePublished) schema.datePublished = datePublished;
  if (keywords?.length) schema.keywords = keywords.join(', ');
  if (about) schema.about = about;
  return schema;
}

type BlogPostingOptions = {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  image?: string;
};

/** Build a BlogPosting graph for an insights article. */
export function blogPostingSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  keywords,
  image,
}: BlogPostingOptions) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    url,
    mainEntityOfPage: url,
    datePublished,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
  if (dateModified) schema.dateModified = dateModified;
  if (keywords?.length) schema.keywords = keywords.join(', ');
  if (image) schema.image = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  return schema;
}

/** Build a Review graph for a real client testimonial about the Person. */
export function reviewSchema({ quote, name }: { quote: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewBody: quote,
    author: { '@type': 'Person', name },
    itemReviewed: { '@id': PERSON_ID },
  };
}

export type Crumb = { name: string; url: string };

/** Build a BreadcrumbList graph. `url` values should be absolute. */
export function breadcrumbListSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
