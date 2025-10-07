import { usePageMetadata } from '@/hooks/usePageMetadata';

/**
 * Higher-order component that automatically applies page metadata
 * This makes it super easy to have separate title and description for every page
 * 
 * Usage:
 * export default withPageMetadata(MyPage);
 * 
 * Or with custom overrides:
 * export default withPageMetadata(MyPage, { title: 'Custom Title' });
 */
export function withPageMetadata(WrappedComponent, customOverrides = {}) {
  return function PageWithMetadata(props) {
    const seoComponent = usePageMetadata(customOverrides);
    
    return (
      <>
        {seoComponent}
        <WrappedComponent {...props} />
      </>
    );
  };
}

/**
 * Hook for pages that need custom overrides
 * @param {Object} customOverrides - Custom metadata overrides
 */
export function usePageMetadataWithOverrides(customOverrides = {}) {
  return usePageMetadata(customOverrides);
}
