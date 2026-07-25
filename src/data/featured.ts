// Curated featured work — single source of truth for the homepage and /works.
// Order is editorial (strongest first). Each entry pairs a plain-language hook
// with the one number that proves it (pulled out so the design can set it big).
export type FeaturedWork = {
  slug: string;
  stat: string;
  statLabel: string;
  hook: string;
};

export const FEATURED: FeaturedWork[] = [
  {
    slug: 'young-living',
    stat: '6M+',
    statLabel: 'partners served',
    hook: 'A global wellness brand’s site, built to move 6M+ partners and 100+ products.',
  },
  {
    slug: 'lamesa',
    stat: '11',
    statLabel: 'dealerships, one inventory',
    hook: '11 RV dealerships pulled into one inventory customers could actually search.',
  },
  {
    slug: 'nikkl',
    stat: '5 days',
    statLabel: 'brand to launch',
    hook: 'A fintech brand and website designed, built, and launched in five days.',
  },
  {
    slug: 'omegas411',
    stat: '2,000',
    statLabel: 'visits a month',
    hook: 'A scattered pile of media turned into a hub doing 2,000 visits a month.',
  },
  {
    slug: 'yoli',
    stat: '10K',
    statLabel: 'subscribers reached',
    hook: '100+ emails that reached 10K subscribers across four countries.',
  },
];
