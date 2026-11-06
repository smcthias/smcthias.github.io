// Display names (and optional short descriptions) for gallery pieces.
// Gallery images in public/images/gallery/full/ are named
// `full-<category>-<client>[-NN].jpg`; files sharing <client> become ONE
// piece in the masonry grid (src/components/Gallery.astro). Add a
// `description` here to show a line of copy in that piece's modal — pieces
// that match a case-study project in src/content/projects use the project's
// description automatically (see PROJECT_ALIASES).
export const CLIENTS: Record<string, { name: string; description?: string }> = {
  adorned: { name: 'Adorned' },
  inboxinc: { name: 'Inbox Inc' },
  porkbun: { name: 'Porkbun' },
  seedlings: { name: 'Seedlings' },
  lifewave: { name: 'LifeWave' },
  ifoodds: { name: 'iFoodDS' },
  missioncommand: { name: 'Mission Command' },
  plexus: { name: 'Plexus Worldwide' },
  santa: { name: 'Santa' },
  yoli: { name: 'Yoli' },
  greencompass: { name: 'Green Compass' },
  joyome: { name: 'Joyome' },
  lamesa: { name: 'La Mesa RV' },
  mikelove: { name: 'Mike Love' },
  nikkl: { name: 'Nikkl' },
  suncard: { name: 'SunCard' },
  vanup: { name: 'VanUp' },
  youngliving: { name: 'Young Living' },
};

// Gallery client slug -> project id in src/content/projects, when they differ.
export const PROJECT_ALIASES: Record<string, string> = {
  youngliving: 'young-living',
};

// Gallery filename category -> site filter.
export const CATEGORY_TO_FILTER: Record<string, 'web' | 'email' | 'social' | 'brand'> = {
  branding: 'brand',
  email: 'email',
  ui: 'web',
  web: 'web',
  social: 'social',
};

// Pieces pinned to the top of the grid as a full-width feature tile (in this
// order). Feature tiles use the piece's first full-size screenshot, cropped.
export const FEATURE_FIRST: string[] = ['vanup'];
