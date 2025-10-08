import { usePathname } from 'next/navigation';
import SEO from '@/components/SEO/SEO';

/**
 * Custom hook for managing SEO metadata
 * @returns {JSX.Element} SEO component
 */
export function useSEO() {
  const pathname = usePathname();
  
  return <SEO pathname={pathname} />;
}

