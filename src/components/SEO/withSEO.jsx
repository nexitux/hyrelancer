import { useSEO } from '@/hooks/useSEO';

/**
 * Higher-order component for adding SEO metadata to pages
 * @param {React.Component} WrappedComponent - The component to wrap
 * @returns {React.Component} Wrapped component with SEO
 */
export function withSEO(WrappedComponent) {
  return function SEOEnhancedComponent(props) {
    const seoComponent = useSEO();
    
    return (
      <>
        {seoComponent}
        <WrappedComponent {...props} />
      </>
    );
  };
}

/**
 * Hook for pages that need SEO metadata
 * @returns {JSX.Element} SEO component
 */
export function usePageSEO() {
  return useSEO();
}
