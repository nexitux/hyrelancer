# Migration Guide: Static to Dynamic Metadata

This guide shows you how to migrate from static page metadata to dynamic metadata from an API or database.

## 🎯 **Current Static System**

Right now, all page metadata is stored in `src/lib/page-metadata.js`:

```javascript
export const pageMetadata = {
  '/': {
    title: 'Home',
    description: 'Welcome to Hyrelancer...',
    og: { image: '/images/home-og.jpg' }
  },
  '/job-details': {
    title: 'Job Listings',
    description: 'Browse and find the best freelance jobs...'
  }
  // ... more pages
};
```

## 🚀 **Migration to Dynamic Metadata**

### **Step 1: Create API Endpoint**

Create `src/app/api/metadata/route.js`:

```javascript
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('path') || '/';
  
  try {
    // Fetch metadata from your database/CMS
    const metadata = await getMetadataFromDatabase(pathname);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Fallback to static defaults
    const { pageMetadata } = await import('@/lib/page-metadata');
    return NextResponse.json(pageMetadata[pathname] || {});
  }
}

async function getMetadataFromDatabase(pathname) {
  // Replace with your actual database call
  // Example with Prisma:
  // const metadata = await prisma.pageMetadata.findUnique({
  //   where: { pathname }
  // });
  
  // Example with direct database:
  // const metadata = await db.query(
  //   'SELECT * FROM page_metadata WHERE pathname = ?',
  //   [pathname]
  // );
  
  // For now, return mock data
  return {
    title: 'Dynamic Title',
    description: 'Dynamic description from database',
    og: { image: '/images/dynamic-og.jpg' }
  };
}
```

### **Step 2: Update Page Metadata Hook**

Update `src/hooks/usePageMetadata.js`:

```javascript
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePageSEO } from '@/components/SEO/withSEO';

export function usePageMetadata(customOverrides = {}) {
  const pathname = usePathname();
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(`/api/metadata?path=${encodeURIComponent(pathname)}`);
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // Fallback to static defaults
        const { getPageMetadata } = await import('@/lib/page-metadata');
        setMetadata(getPageMetadata(pathname));
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, [pathname]);

  // Merge with custom overrides
  const finalMetadata = {
    ...metadata,
    ...customOverrides,
    og: {
      ...metadata.og,
      ...customOverrides.og
    },
    twitter: {
      ...metadata.twitter,
      ...customOverrides.twitter
    }
  };

  // Don't render SEO component while loading
  if (loading) {
    return null;
  }

  return usePageSEO(finalMetadata);
}
```

### **Step 3: Update Dynamic Pages Hook**

Update `src/hooks/usePageMetadata.js` for dynamic pages:

```javascript
export function useDynamicPageMetadata(dynamicData = {}, customOverrides = {}) {
  const pathname = usePathname();
  const [baseMetadata, setBaseMetadata] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBaseMetadata() {
      try {
        const response = await fetch(`/api/metadata?path=${encodeURIComponent(pathname)}`);
        const data = await response.json();
        setBaseMetadata(data);
      } catch (error) {
        console.error('Error fetching base metadata:', error);
        // Fallback to static defaults
        const { getPageMetadata } = await import('@/lib/page-metadata');
        setBaseMetadata(getPageMetadata(pathname));
      } finally {
        setLoading(false);
      }
    }

    fetchBaseMetadata();
  }, [pathname]);

  // Merge base metadata with dynamic data
  const finalMetadata = {
    ...baseMetadata,
    ...dynamicData,
    ...customOverrides,
    og: {
      ...baseMetadata.og,
      ...dynamicData.og,
      ...customOverrides.og
    },
    twitter: {
      ...baseMetadata.twitter,
      ...dynamicData.twitter,
      ...customOverrides.twitter
    }
  };

  if (loading) {
    return null;
  }

  return usePageSEO(finalMetadata);
}
```

### **Step 4: Database Schema (Example)**

Create a database table for page metadata:

```sql
CREATE TABLE page_metadata (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pathname VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  og_type VARCHAR(50),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO page_metadata (pathname, title, description, og_title, og_description, og_image) VALUES
('/', 'Home', 'Welcome to Hyrelancer...', 'Hyrelancer - Connect with Top Freelancers', 'Join thousands of clients...', '/images/home-og.jpg'),
('/job-details', 'Job Listings', 'Browse and find the best freelance jobs...', 'Find Freelance Jobs - Hyrelancer', 'Browse thousands of opportunities...', '/images/jobs-og.jpg');
```

### **Step 5: Admin Interface (Optional)**

Create an admin interface to manage metadata:

```javascript
// src/app/admin/metadata/page.jsx
"use client";
import { useState, useEffect } from 'react';

export default function MetadataAdmin() {
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMetadata();
  }, []);

  async function fetchAllMetadata() {
    try {
      const response = await fetch('/api/metadata/all');
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateMetadata(pathname, newMetadata) {
    try {
      await fetch(`/api/metadata/${pathname}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMetadata)
      });
      // Refresh data
      fetchAllMetadata();
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Page Metadata Management</h1>
      {Object.entries(metadata).map(([pathname, meta]) => (
        <div key={pathname} className="border p-4 mb-4 rounded">
          <h3 className="font-semibold">{pathname}</h3>
          <input
            type="text"
            value={meta.title || ''}
            onChange={(e) => updateMetadata(pathname, { ...meta, title: e.target.value })}
            className="w-full p-2 border rounded mt-2"
            placeholder="Title"
          />
          <textarea
            value={meta.description || ''}
            onChange={(e) => updateMetadata(pathname, { ...meta, description: e.target.value })}
            className="w-full p-2 border rounded mt-2"
            placeholder="Description"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}
```

## 🔄 **Migration Steps**

### **Phase 1: Setup API (Week 1)**
1. Create the API endpoint
2. Set up database table
3. Migrate existing static data to database
4. Test API endpoints

### **Phase 2: Update Hooks (Week 2)**
1. Update `usePageMetadata` hook
2. Update `useDynamicPageMetadata` hook
3. Test with existing pages
4. Add error handling and fallbacks

### **Phase 3: Admin Interface (Week 3)**
1. Create admin interface
2. Add CRUD operations
3. Test metadata management
4. Train content team

### **Phase 4: Optimization (Week 4)**
1. Add caching (Redis/Memcached)
2. Add ISR (Incremental Static Regeneration)
3. Add performance monitoring
4. Add automated testing

## 🎯 **Benefits of Dynamic Metadata**

1. **Content Management**: Non-technical users can update metadata
2. **A/B Testing**: Test different metadata variations
3. **Analytics**: Track which metadata performs best
4. **Automation**: Generate metadata from content
5. **Scalability**: Handle thousands of pages easily

## 🛡️ **Fallback Strategy**

The system includes multiple fallback layers:

1. **API Error** → Static defaults from `page-metadata.js`
2. **Database Error** → Cached metadata
3. **Network Error** → Local storage cache
4. **Complete Failure** → Global defaults from `meta-defaults.js`

## 📊 **Performance Considerations**

1. **Caching**: Cache metadata for 1 hour
2. **ISR**: Use Next.js ISR for static pages
3. **CDN**: Serve metadata from CDN
4. **Database**: Use read replicas for metadata queries

## 🧪 **Testing Strategy**

1. **Unit Tests**: Test metadata fetching logic
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test metadata rendering
4. **Performance Tests**: Test with large datasets

This migration path ensures a smooth transition from static to dynamic metadata while maintaining all existing functionality! 🚀
