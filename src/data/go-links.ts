// Branded short links for off-site posts (LinkedIn first, but any channel).
//
//   savelledesign.com/go/<key>  ->  the full destination URL with UTMs attached.
//
// Add an entry, push to main, and the short link is live on the next deploy.
// The UTMs are assembled from the entry so every link follows one taxonomy:
//   utm_source   = platform   (default "linkedin")
//   utm_medium   = channel    (default "social")
//   utm_campaign = program    (default "linkedin-posts")
//   utm_content  = <date>-<content>
// All values lowercase-hyphenated. Only use /go links on links pointing INTO
// the site (or to Substack) from somewhere else — never on internal nav, where
// UTMs would overwrite the visitor's real traffic source.
//
// GitHub Pages can't send server redirects, so each key builds a tiny static
// page (src/pages/go/[key].astro) that forwards instantly. The build fails if
// an entry is malformed or points at a page that doesn't exist.
//
// Rules:
// - Never change the `date` or `content` of a key that has already been
//   posted. They become utm_content, so changing them rewrites attribution for
//   clicks already counted. Mint a NEW key for a new post, even when it points
//   at the same page.
// - Never delete a key that has been posted. Old LinkedIn posts keep their
//   links forever, and a deleted key is a 404.

const SITE = 'https://savelledesign.com';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Destination =
  /** on-site path, e.g. "/works/young-living" or "/" */
  | { path: string; url?: never }
  /** off-site https URL, e.g. a Substack post */
  | { url: string; path?: never };

export type GoLink = Destination & {
  /** the day the post goes live — becomes the <date> half of utm_content */
  date: string;
  /** short post identifier — the second half of utm_content */
  content: string;
  /** utm_source; defaults to "linkedin" */
  source?: string;
  /** utm_medium; defaults to "social" */
  medium?: string;
  /** utm_campaign; defaults to "linkedin-posts" */
  campaign?: string;
  /** link-preview title/description, for when a platform previews the /go URL itself */
  previewTitle?: string;
  previewDescription?: string;
};

// key = the short slug -> savelledesign.com/go/<key>
const LINKS: Record<string, GoLink> = {
  // Starter links for the LinkedIn profile (Featured section / website field).
  work: {
    path: '/works',
    date: '2026-10-28',
    content: 'profile-work',
  },
  substack: {
    url: 'https://savelledesign.substack.com',
    date: '2026-10-28',
    content: 'profile-substack',
    previewTitle: 'Savelle Design on Substack',
    previewDescription: 'Everything I wish clients knew before starting a website. From a designer who’s built them.',
  },
};

export type ResolvedGoLink = {
  key: string;
  /** full destination with UTMs */
  destination: string;
  /** true when the destination is on savelledesign.com */
  onSite: boolean;
  /** the on-site path without query/hash, for existence checks */
  sitePath: string | null;
  previewTitle?: string;
  previewDescription?: string;
};

function assertSlug(key: string, field: string, value: string): void {
  if (!SLUG.test(value)) {
    throw new Error(`go-links: "${key}" has invalid ${field} "${value}" (use lowercase letters, numbers and single hyphens)`);
  }
}

function resolve(key: string, link: GoLink): ResolvedGoLink {
  assertSlug(key, 'key', key);
  assertSlug(key, 'content', link.content);
  if (!ISO_DATE.test(link.date) || Number.isNaN(Date.parse(link.date))) {
    throw new Error(`go-links: "${key}" has invalid date "${link.date}" (use YYYY-MM-DD)`);
  }

  const source = link.source ?? 'linkedin';
  const medium = link.medium ?? 'social';
  const campaign = link.campaign ?? 'linkedin-posts';
  assertSlug(key, 'source', source);
  assertSlug(key, 'medium', medium);
  assertSlug(key, 'campaign', campaign);

  let url: URL;
  if (link.path !== undefined) {
    if (!link.path.startsWith('/')) {
      throw new Error(`go-links: "${key}" path "${link.path}" must start with "/"`);
    }
    url = new URL(link.path, SITE);
    // GitHub Pages 301s "/works" to "/works/" — go straight there and skip the extra hop.
    if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname += '/';
  } else {
    url = new URL(link.url);
    if (url.protocol !== 'https:') {
      throw new Error(`go-links: "${key}" url "${link.url}" must be https`);
    }
  }

  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', `${link.date}-${link.content}`);

  const onSite = url.origin === SITE;
  return {
    key,
    destination: url.toString(),
    onSite,
    sitePath: onSite ? url.pathname : null,
    previewTitle: link.previewTitle,
    previewDescription: link.previewDescription,
  };
}

/** Every short link, resolved and validated. Throws (failing the build) on a bad entry. */
export function allGoLinks(): ResolvedGoLink[] {
  return Object.entries(LINKS).map(([key, link]) => resolve(key, link));
}
