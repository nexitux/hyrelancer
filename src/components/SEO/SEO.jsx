'use client';
import { useEffect } from 'react';
import { mergeMetadata } from '@/lib/meta-defaults';

/**
 * SEO Component for managing metadata
 * 
 * Expected meta shape:
 * {
 *   title: string,                    // Page title (will be combined with siteTitle)
 *   description: string,              // Meta description
 *   canonical: string,                // Canonical URL (absolute or relative)
 *   og: {                            // Open Graph tags
 *     title: string,
 *     description: string,
 *     image: string,
 *     type: string,
 *     url: string
 *   },
 *   twitter: {                       // Twitter Card tags
 *     card: string,
 *     title: string,
 *     description: string,
 *     image: string
 *   },
 *   scripts: string[],               // External script URLs (must be in allowlist)
 *   additionalMeta: object           // Additional meta tags
 * }
 */

export default function SEO({ meta = {}, pathname = '' }) {
  const mergedMeta = mergeMetadata(meta);
  
  useEffect(() => {
    // Update document title
    const title = meta.title 
      ? `${meta.title} - ${mergedMeta.siteTitle}`
      : mergedMeta.siteTitle;
    
    document.title = title;
    
    // Update or create meta tags
    updateMetaTag('name', 'description', mergedMeta.description);
    updateMetaTag('name', 'keywords', mergedMeta.additionalMeta.keywords);
    updateMetaTag('name', 'author', mergedMeta.additionalMeta.author);
    updateMetaTag('name', 'robots', mergedMeta.additionalMeta.robots);
    updateMetaTag('name', 'theme-color', mergedMeta.additionalMeta['theme-color']);
    
    // Open Graph tags
    updateMetaTag('property', 'og:title', meta.title || mergedMeta.siteTitle);
    updateMetaTag('property', 'og:description', mergedMeta.description);
    updateMetaTag('property', 'og:image', mergedMeta.og.image);
    updateMetaTag('property', 'og:type', mergedMeta.og.type);
    updateMetaTag('property', 'og:site_name', mergedMeta.og.siteName);
    updateMetaTag('property', 'og:locale', mergedMeta.og.locale);
    
    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', mergedMeta.twitter.card);
    updateMetaTag('name', 'twitter:title', meta.title || mergedMeta.siteTitle);
    updateMetaTag('name', 'twitter:description', mergedMeta.description);
    updateMetaTag('name', 'twitter:image', mergedMeta.og.image);
    updateMetaTag('name', 'twitter:creator', mergedMeta.twitter.creator);
    updateMetaTag('name', 'twitter:site', mergedMeta.twitter.site);
    
    // Canonical URL
    updateCanonicalLink(mergedMeta.canonical || `${mergedMeta.siteBaseUrl}${pathname}`);
    
    // Handle external scripts
    handleExternalScripts(mergedMeta.scripts || []);
    
  }, [meta, mergedMeta, pathname]);
  
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

/**
 * Handle external scripts with security allowlist
 */
function handleExternalScripts(scripts) {
  const { allowedExternalScripts } = require('@/lib/meta-defaults').metaDefaults;
  
  scripts.forEach(scriptUrl => {
    // Check if script is in allowlist
    const isAllowed = allowedExternalScripts.some(allowedScript => 
      scriptUrl.startsWith(allowedScript)
    );
    
    if (!isAllowed) {
      console.warn(`Script ${scriptUrl} is not in the allowed list and will not be loaded.`);
      return;
    }
    
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) return;
    
    // Create and load script
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-noscript', 'true');
    
    document.head.appendChild(script);
  });
}
