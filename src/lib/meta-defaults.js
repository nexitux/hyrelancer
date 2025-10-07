/**
 * Default metadata configuration for the Hyrelancer application
 * This file contains static defaults that can be overridden per page
 */

export const metaDefaults = {
  // Site-wide defaults
  siteTitle: 'Hyrelancer - A Freelancer Marketplace',
  siteDescription: 'Hyrelancer - The best freelancer marketplace to connect clients and freelancers. Find skilled professionals or get your projects done.',
  siteBaseUrl: 'https://hyrelancer.com', // Update with actual domain
  siteName: 'Hyrelancer',
  
  // Default Open Graph image (should be absolute URL)
  defaultOgImage: 'https://hyrelancer.com/images/og-default.jpg', // Update with actual image URL
  
  // Default Twitter Card settings
  twitterHandle: '@hyrelancer', // Update with actual Twitter handle
  
  // Allowed external scripts (security allowlist)
  allowedExternalScripts: [
    'https://www.googletagmanager.com/gtag/js',
    'https://www.google-analytics.com/analytics.js',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://www.linkedin.com/li.lms.js'
  ],
  
  // Default Open Graph settings
  og: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hyrelancer'
  },
  
  // Default Twitter Card settings
  twitter: {
    card: 'summary_large_image',
    creator: '@hyrelancer',
    site: '@hyrelancer'
  },
  
  // Additional meta tags
  additionalMeta: {
    keywords: 'freelancer, marketplace, jobs, clients, hyrelancer, remote work, gig economy',
    author: 'Hyrelancer Team',
    robots: 'index, follow',
    'theme-color': '#3b82f6'
  }
};

/**
 * Helper function to merge page metadata with defaults
 * @param {Object} pageMeta - Page-specific metadata overrides
 * @returns {Object} Merged metadata object
 */
export function mergeMetadata(pageMeta = {}) {
  const merged = {
    ...metaDefaults,
    ...pageMeta,
    og: {
      ...metaDefaults.og,
      ...pageMeta.og
    },
    twitter: {
      ...metaDefaults.twitter,
      ...pageMeta.twitter
    },
    additionalMeta: {
      ...metaDefaults.additionalMeta,
      ...pageMeta.additionalMeta
    }
  };
  
  // Ensure canonical URL is absolute
  if (pageMeta.canonical && !pageMeta.canonical.startsWith('http')) {
    merged.canonical = `${metaDefaults.siteBaseUrl}${pageMeta.canonical}`;
  } else if (pageMeta.canonical) {
    merged.canonical = pageMeta.canonical;
  }
  
  // Ensure OG image is absolute
  if (pageMeta.og?.image && !pageMeta.og.image.startsWith('http')) {
    merged.og.image = `${metaDefaults.siteBaseUrl}${pageMeta.og.image}`;
  } else if (pageMeta.og?.image) {
    merged.og.image = pageMeta.og.image;
  } else {
    merged.og.image = metaDefaults.defaultOgImage;
  }
  
  return merged;
}
