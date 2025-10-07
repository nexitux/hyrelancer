import { usePathname } from 'next/navigation';
import { getPageMetadata } from '@/lib/page-metadata';
import { usePageSEO } from '@/components/SEO/withSEO';

/**
 * Hook that automatically applies page metadata based on the current pathname
 * This makes it easy to have separate title and description for every page
 * while keeping the migration to dynamic metadata simple
 */
export function usePageMetadata(customOverrides = {}) {
  const pathname = usePathname();
  
  // Get the page metadata for the current pathname
  const pageMetadata = getPageMetadata(pathname);
  
  // Merge with any custom overrides
  const finalMetadata = {
    ...pageMetadata,
    ...customOverrides,
    // Deep merge for nested objects
    og: {
      ...pageMetadata.og,
      ...customOverrides.og
    },
    twitter: {
      ...pageMetadata.twitter,
      ...customOverrides.twitter
    }
  };

  // Return the SEO component with the merged metadata
  return usePageSEO(finalMetadata);
}

/**
 * Hook for dynamic pages that need to override specific fields
 * @param {Object} dynamicData - Dynamic data from API/database
 * @param {Object} customOverrides - Additional custom overrides
 */
export function useDynamicPageMetadata(dynamicData = {}, customOverrides = {}) {
  const pathname = usePathname();
  const pageMetadata = getPageMetadata(pathname);
  
  // Merge dynamic data with page metadata
  const finalMetadata = {
    ...pageMetadata,
    ...dynamicData,
    ...customOverrides,
    // Deep merge for nested objects
    og: {
      ...pageMetadata.og,
      ...dynamicData.og,
      ...customOverrides.og
    },
    twitter: {
      ...pageMetadata.twitter,
      ...dynamicData.twitter,
      ...customOverrides.twitter
    }
  };

  return usePageSEO(finalMetadata);
}
