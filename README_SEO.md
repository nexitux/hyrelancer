# SEO Implementation - Hyrelancer

This document describes the simplified SEO system implemented for the Hyrelancer application.

## 📁 File Structure

```
src/
├── lib/
│   ├── meta-defaults.js          # Site-wide SEO defaults
│   └── page-seo-metadata.js      # Page-specific SEO metadata
├── components/
│   └── SEO/
│       ├── SEO.jsx              # Main SEO component
│       └── withSEO.jsx          # HOC and hooks
└── hooks/
    └── useSEO.js                # SEO hook
```

## 🚀 How to Use

### Automatic SEO (Recommended)

The SEO system automatically applies page-specific metadata based on the current pathname. No additional code is needed in most cases.

### Manual SEO in Pages

If you need to add SEO to a specific page:

```jsx
import { usePageSEO } from '@/components/SEO/withSEO';

export default function MyPage() {
  const seoComponent = usePageSEO();
  
  return (
    <>
      {seoComponent}
      <div>Your page content</div>
    </>
  );
}
```

### Using HOC

```jsx
import { withSEO } from '@/components/SEO/withSEO';

function MyPage() {
  return <div>Your page content</div>;
}

export default withSEO(MyPage);
```

## ⚙️ Configuration

### Adding New Pages

To add SEO metadata for a new page, edit `src/lib/page-seo-metadata.js`:

```javascript
export const pageSEOData = {
  '/your-new-page': {
    title: 'Your Page Title - Hyrelancer',
    description: 'Your page description',
    keywords: 'relevant, keywords, here',
    og: {
      title: 'Your Page Title - Hyrelancer',
      description: 'Your page description',
      image: '/images/og-your-page.jpg',
      type: 'website'
    }
  }
};
```

### Updating Site Defaults

Edit `src/lib/meta-defaults.js` to update site-wide settings:

```javascript
export const metaDefaults = {
  siteTitle: 'Your Site Title',
  siteDescription: 'Your site description',
  siteBaseUrl: 'https://yourdomain.com',
  // ... other settings
};
```

## 📋 Supported Pages

The following pages have SEO metadata configured:

- `/` - Home page
- `/Login` - Login page
- `/registration` - Registration page
- `/select-user-type` - Account type selection
- `/Category` - Browse categories
- `/categerylist` - Service categories
- `/servicelist` - All services
- `/job-list` - Job listings
- `/FAQPage` - FAQ page
- `/privacy-policy` - Privacy policy
- `/userList` - Freelancers list
- `/UsersList` - All users
- `/freelancer-dashboard` - Freelancer dashboard
- `/customer-dashboard` - Client dashboard

## 🔧 Future Dynamic Implementation

When you're ready to make SEO dynamic and admin-editable:

1. Create an API endpoint to fetch metadata from database
2. Update `getPageSEO()` function to fetch from API
3. Add admin interface for editing metadata
4. No changes needed to SEO component or hooks

## 📝 Notes

- All metadata is currently static and defined in `page-seo-metadata.js`
- The system automatically detects the current pathname
- Open Graph and Twitter Card metadata is included
- Canonical URLs are automatically generated
- The system is designed for easy migration to dynamic metadata later
