/**
 * Examples of different SEO implementation patterns
 * This file shows various ways to implement SEO across different page types
 */

import { usePageSEO, useConditionalSEO } from './PageSEO';

// ========================================
// PATTERN 1: No SEO (Uses Global Defaults)
// ========================================
export function SimplePage() {
  // No SEO code needed - uses global defaults
  return (
    <div>
      <h1>Simple Page</h1>
      <p>This page uses default metadata from meta-defaults.js</p>
    </div>
  );
}

// ========================================
// PATTERN 2: Minimal SEO (Title Only)
// ========================================
export function MinimalSEOPage() {
  const seoComponent = usePageSEO({
    title: 'About Us' // Only customizes title, everything else uses defaults
  });

  return (
    <>
      {seoComponent}
      <div>
        <h1>About Us</h1>
        <p>This page only customizes the title.</p>
      </div>
    </>
  );
}

// ========================================
// PATTERN 3: Standard SEO (Common Fields)
// ========================================
export function StandardSEOPage() {
  const seoComponent = usePageSEO({
    title: 'Contact Us',
    description: 'Get in touch with our team for support and inquiries.',
    canonical: '/contact'
  });

  return (
    <>
      {seoComponent}
      <div>
        <h1>Contact Us</h1>
        <p>Contact information and form.</p>
      </div>
    </>
  );
}

// ========================================
// PATTERN 4: Full SEO (All Fields)
// ========================================
export function FullSEOPage({ job }) {
  const seoComponent = usePageSEO({
    title: job.title,
    description: job.description,
    canonical: `/jobs/${job.id}`,
    og: {
      title: `${job.title} - Hyrelancer`,
      description: job.description,
      image: job.ogImage || '/images/default-job-og.jpg',
      type: 'article'
    },
    twitter: {
      title: `${job.title} - Hyrelancer`,
      description: job.description
    },
    scripts: ['https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID']
  });

  return (
    <>
      {seoComponent}
      <div>
        <h1>{job.title}</h1>
        <p>{job.description}</p>
      </div>
    </>
  );
}

// ========================================
// PATTERN 5: Conditional SEO (Dynamic)
// ========================================
export function ConditionalSEOPage({ data, showSEO }) {
  // Only render SEO if showSEO is true and data exists
  const seoComponent = useConditionalSEO(
    showSEO && data ? {
      title: data.title,
      description: data.description,
      og: { image: data.image }
    } : {}
  );

  return (
    <>
      {seoComponent}
      <div>
        <h1>{data?.title || 'Loading...'}</h1>
        <p>{data?.description || 'Please wait...'}</p>
      </div>
    </>
  );
}

// ========================================
// PATTERN 6: Template-Based SEO
// ========================================
export function TemplateSEOPage({ type, data }) {
  // Define SEO templates for different page types
  const seoTemplates = {
    job: {
      title: data.title,
      description: data.description,
      og: { image: data.image, type: 'article' },
      canonical: `/jobs/${data.id}`
    },
    service: {
      title: data.name,
      description: data.description,
      og: { image: data.image, type: 'website' },
      canonical: `/services/${data.slug}`
    },
    user: {
      title: `${data.name} - Freelancer`,
      description: data.bio,
      og: { image: data.avatar, type: 'profile' },
      canonical: `/profile/${data.slug}`
    }
  };

  const seoComponent = usePageSEO(seoTemplates[type] || {});

  return (
    <>
      {seoComponent}
      <div>
        <h1>{data.title || data.name}</h1>
        <p>{data.description || data.bio}</p>
      </div>
    </>
  );
}

// ========================================
// PATTERN 7: HOC Pattern (For Reusable Components)
// ========================================
import { withSEO } from './withSEO';

// Define SEO for a specific component
const JobCardWithSEO = withSEO(
  function JobCard({ job }) {
    return (
      <div className="job-card">
        <h3>{job.title}</h3>
        <p>{job.description}</p>
      </div>
    );
  },
  {
    title: 'Job Card',
    description: 'Browse available job opportunities'
  }
);

export { JobCardWithSEO };
