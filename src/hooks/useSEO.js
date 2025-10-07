import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SEO from '@/components/SEO/SEO';

/**
 * Custom hook for managing SEO metadata
 * @param {Object} meta - Page-specific metadata overrides
 * @returns {JSX.Element} SEO component
 */
export function useSEO(meta = {}) {
  const pathname = usePathname();
  
  return <SEO meta={meta} pathname={pathname} />;
}

/**
 * Hook for generating metadata object for Next.js App Router
 * @param {Object} pageMeta - Page-specific metadata overrides
 * @returns {Object} Next.js metadata object
 */
export function useMetadata(pageMeta = {}) {
  const { mergeMetadata } = require('@/lib/meta-defaults');
  const mergedMeta = mergeMetadata(pageMeta);
  
  return {
    title: pageMeta.title 
      ? `${pageMeta.title} - ${mergedMeta.siteTitle}`
      : mergedMeta.siteTitle,
    description: mergedMeta.description,
    keywords: mergedMeta.additionalMeta.keywords,
    authors: [{ name: mergedMeta.additionalMeta.author }],
    robots: mergedMeta.additionalMeta.robots,
    openGraph: {
      title: pageMeta.title || mergedMeta.siteTitle,
      description: mergedMeta.description,
      url: mergedMeta.canonical || `${mergedMeta.siteBaseUrl}${pageMeta.pathname || ''}`,
      siteName: mergedMeta.og.siteName,
      images: [
        {
          url: mergedMeta.og.image,
          width: 1200,
          height: 630,
          alt: pageMeta.title || mergedMeta.siteTitle,
        },
      ],
      locale: mergedMeta.og.locale,
      type: mergedMeta.og.type,
    },
    twitter: {
      card: mergedMeta.twitter.card,
      title: pageMeta.title || mergedMeta.siteTitle,
      description: mergedMeta.description,
      images: [mergedMeta.og.image],
      creator: mergedMeta.twitter.creator,
      site: mergedMeta.twitter.site,
    },
    alternates: {
      canonical: mergedMeta.canonical || `${mergedMeta.siteBaseUrl}${pageMeta.pathname || ''}`,
    },
    other: {
      'theme-color': mergedMeta.additionalMeta['theme-color'],
    },
  };
}
