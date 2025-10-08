'use client';
import { useEffect } from 'react';
import { getPageSEO } from '@/lib/page-seo-metadata';
import { metaDefaults } from '@/lib/meta-defaults';

/**
 * SEO Component for managing metadata
 * Automatically gets page-specific SEO data based on pathname
 */

export default function SEO({ pathname = '' }) {
  const pageMeta = getPageSEO(pathname);
  
  useEffect(() => {
    // Update document title
    document.title = pageMeta.title;
    
    // Update or create meta tags
    updateMetaTag('name', 'description', pageMeta.description);
    updateMetaTag('name', 'keywords', pageMeta.keywords);
    updateMetaTag('name', 'author', metaDefaults.additionalMeta.author);
    updateMetaTag('name', 'robots', metaDefaults.additionalMeta.robots);
    updateMetaTag('name', 'theme-color', metaDefaults.additionalMeta['theme-color']);
    
    // Open Graph tags
    updateMetaTag('property', 'og:title', pageMeta.og.title);
    updateMetaTag('property', 'og:description', pageMeta.og.description);
    updateMetaTag('property', 'og:image', pageMeta.og.image);
    updateMetaTag('property', 'og:type', pageMeta.og.type);
    updateMetaTag('property', 'og:site_name', metaDefaults.og.siteName);
    updateMetaTag('property', 'og:locale', metaDefaults.og.locale);
    
    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', metaDefaults.twitter.card);
    updateMetaTag('name', 'twitter:title', pageMeta.og.title);
    updateMetaTag('name', 'twitter:description', pageMeta.og.description);
    updateMetaTag('name', 'twitter:image', pageMeta.og.image);
    updateMetaTag('name', 'twitter:creator', metaDefaults.twitter.creator);
    updateMetaTag('name', 'twitter:site', metaDefaults.twitter.site);
    
    // Canonical URL
    updateCanonicalLink(`${metaDefaults.siteBaseUrl}${pathname}`);
    
  }, [pageMeta, pathname]);
  
  return null; // This component doesn't render anything
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(attribute, name, content) {
  if (!content) return;
  
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * Update canonical link
 */
function updateCanonicalLink(href) {
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  
  canonicalLink.setAttribute('href', href);
}

