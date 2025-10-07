import { useSEO } from '@/hooks/useSEO';

/**
 * Higher-order component for adding SEO metadata to pages
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {Object} defaultMeta - Default metadata for this page
 * @returns {React.Component} Wrapped component with SEO
 */
export function withSEO(WrappedComponent, defaultMeta = {}) {
  return function SEOEnhancedComponent(props) {
    const seoComponent = useSEO(defaultMeta);
    
    return (
      <>
        {seoComponent}
        <WrappedComponent {...props} />
      </>
    );
  };
}

/**
 * Hook for pages that need dynamic metadata
 * @param {Object} meta - Page-specific metadata
 * @returns {JSX.Element} SEO component
 */
export function usePageSEO(meta = {}) {
  return useSEO(meta);
}
