import { usePageSEO } from './withSEO';

/**
 * Smart SEO component that only renders when metadata is provided
 * This prevents unnecessary re-renders for pages that don't need custom SEO
 */
export default function PageSEO({ 
  title, 
  description, 
  og, 
  twitter, 
  canonical, 
  scripts,
  ...otherMeta 
}) {
  // Only render SEO component if at least one metadata field is provided
  const hasCustomMetadata = title || description || og || twitter || canonical || scripts || Object.keys(otherMeta).length > 0;
  
  if (!hasCustomMetadata) {
    return null; // Use global defaults
  }

  return usePageSEO({
    title,
    description,
    og,
    twitter,
    canonical,
    scripts,
    ...otherMeta
  });
}

/**
 * Hook for conditional SEO - only renders when needed
 */
export function useConditionalSEO(metadata = {}) {
  const hasMetadata = Object.keys(metadata).length > 0;
  
  if (!hasMetadata) {
    return null;
  }
  
  return usePageSEO(metadata);
}
