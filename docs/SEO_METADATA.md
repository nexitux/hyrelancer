# SEO Metadata System

This document explains how to use the site-wide SEO metadata system in the Hyrelancer application.

## Overview

The SEO system provides a centralized way to manage metadata across the application, with support for:
- Page titles and descriptions
- Open Graph tags for social media
- Twitter Card tags
- Canonical URLs
- External script management (with security allowlist)
- Easy migration to dynamic metadata in the future

## File Structure

```
src/
├── lib/
│   └── meta-defaults.js          # Default metadata configuration
├── components/
│   └── SEO/
│       ├── SEO.jsx              # Main SEO component
│       └── withSEO.jsx          # HOC and hooks for easy usage
└── hooks/
    └── useSEO.js                # SEO hooks for Next.js App Router
```

## Default Configuration

The default metadata is stored in `src/lib/meta-defaults.js`. This includes:

- Site title and description
- Base URL for canonical links
- Default Open Graph image
- Twitter Card settings
- Allowed external scripts (security allowlist)
- Additional meta tags

### Updating Defaults

To update default metadata, edit `src/lib/meta-defaults.js`:

```javascript
export const metaDefaults = {
  siteTitle: 'Your Site Title',
  siteDescription: 'Your site description',
  siteBaseUrl: 'https://yoursite.com',
  // ... other defaults
};
```

## Usage

### Method 1: Using the SEO Hook (Recommended for Client Components)

```jsx
import { usePageSEO } from '@/components/SEO/withSEO';

export default function MyPage() {
  const seoComponent = usePageSEO({
    title: 'Page Title',
    description: 'Page description',
    og: {
      title: 'Custom OG Title',
      image: '/images/page-og.jpg'
    },
    twitter: {
      title: 'Custom Twitter Title'
    }
  });

  return (
    <>
      {seoComponent}
      <div>Your page content</div>
    </>
  );
}
```

### Method 2: Using the HOC

```jsx
import { withSEO } from '@/components/SEO/withSEO';

function MyPage() {
  return <div>Your page content</div>;
}

// Wrap with default metadata
export default withSEO(MyPage, {
  title: 'Page Title',
  description: 'Page description'
});
```

### Method 3: Using Next.js App Router Metadata API

For server components, you can use the `useMetadata` hook:

```jsx
import { useMetadata } from '@/hooks/useSEO';

export async function generateMetadata({ params }) {
  const metadata = useMetadata({
    title: 'Page Title',
    description: 'Page description',
    pathname: '/my-page'
  });
  
  return metadata;
}
```

## Metadata Object Shape

The metadata object supports the following properties:

```javascript
{
  title: string,                    // Page title (combined with siteTitle)
  description: string,              // Meta description
  canonical: string,                // Canonical URL (absolute or relative)
  og: {                            // Open Graph tags
    title: string,
    description: string,
    image: string,
    type: string,
    url: string
  },
  twitter: {                       // Twitter Card tags
    card: string,
    title: string,
    description: string,
    image: string
  },
  scripts: string[],               // External script URLs (must be in allowlist)
  additionalMeta: object           // Additional meta tags
}
```

## Security Features

### External Script Allowlist

Only scripts from the allowlist in `meta-defaults.js` can be loaded:

```javascript
allowedExternalScripts: [
  'https://www.googletagmanager.com/gtag/js',
  'https://www.google-analytics.com/analytics.js',
  // Add more allowed scripts here
]
```

Scripts not in the allowlist will be blocked and a warning will be logged to the console.

## Migration to Dynamic Metadata

To switch from static to dynamic metadata (API/DB), follow these steps:

### Step 1: Create API Endpoint

```javascript
// pages/api/meta.js or app/api/meta/route.js
export async function GET() {
  const meta = await fetchFromDatabase(); // Your database call
  return Response.json(meta);
}
```

### Step 2: Update Defaults Import

Replace the static import in your pages:

```javascript
// Before
import { metaDefaults } from '@/lib/meta-defaults';

// After
async function getMetaDefaults() {
  const response = await fetch('/api/meta');
  return response.json();
}
```

### Step 3: Update Page Components

```javascript
// Before
const seoComponent = usePageSEO({ title: 'My Page' });

// After
const metaDefaults = await getMetaDefaults();
const seoComponent = usePageSEO({ 
  ...metaDefaults, 
  title: 'My Page' 
});
```

The SEO component itself requires no changes - only the data source changes.

## Testing Checklist

- [ ] Home page shows default title and description
- [ ] Page with title override shows "Page Title - Site Title"
- [ ] Open Graph tags are properly set
- [ ] Twitter Card tags are properly set
- [ ] Canonical URLs are absolute
- [ ] External scripts load only if in allowlist
- [ ] Console warnings appear for blocked scripts
- [ ] No duplicate title elements
- [ ] Meta tags update when navigating between pages

## Best Practices

1. **Always use absolute URLs** for Open Graph images and canonical URLs
2. **Keep images optimized** - Open Graph images should be 1200x630px
3. **Test social media previews** using tools like Facebook Debugger and Twitter Card Validator
4. **Update the allowlist** when adding new external scripts
5. **Use descriptive titles** that include relevant keywords
6. **Keep descriptions under 160 characters** for optimal display

## Troubleshooting

### Meta tags not updating
- Ensure the SEO component is rendered in the component tree
- Check that the meta object is being passed correctly
- Verify the component is not being unmounted/remounted unnecessarily

### Scripts not loading
- Check if the script URL is in the allowlist
- Verify the URL is accessible
- Check browser console for errors

### Duplicate meta tags
- Ensure only one SEO component is rendered per page
- Check for conflicting meta tag management in other parts of the app
