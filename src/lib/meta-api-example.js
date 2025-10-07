/**
 * Example API service for dynamic metadata
 * This file demonstrates how to migrate from static to dynamic metadata
 * 
 * To use this:
 * 1. Replace the static import in your pages with this API call
 * 2. Update the SEO component to use the fetched data
 * 3. Add proper error handling and caching
 */

/**
 * Fetch metadata from API
 * @param {string} pagePath - The current page path
 * @returns {Promise<Object>} Metadata object
 */
export async function fetchPageMetadata(pagePath = '/') {
  try {
    // Example API call - replace with your actual endpoint
    const response = await fetch(`/api/meta?path=${encodeURIComponent(pagePath)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Fallback to static defaults
    const { metaDefaults } = await import('./meta-defaults.js');
    return metaDefaults;
  }
}

/**
 * Example of how to use dynamic metadata in a page component
 */
export async function getPageMetadata(pagePath) {
  const metadata = await fetchPageMetadata(pagePath);
  
  // You can add page-specific logic here
  if (pagePath === '/') {
    return {
      ...metadata,
      title: 'Home',
      description: 'Welcome to our homepage'
    };
  }
  
  if (pagePath.startsWith('/jobs/')) {
    const jobId = pagePath.split('/')[2];
    // Fetch job-specific data
    return {
      ...metadata,
      title: `Job ${jobId}`,
      description: `Details for job ${jobId}`,
      og: {
        ...metadata.og,
        title: `Job ${jobId} - ${metadata.siteTitle}`,
        image: `/images/job-${jobId}-og.jpg`
      }
    };
  }
  
  return metadata;
}

/**
 * Example API route handler (pages/api/meta.js or app/api/meta/route.js)
 * 
 * export async function GET(request) {
 *   const { searchParams } = new URL(request.url);
 *   const path = searchParams.get('path') || '/';
 *   
 *   // Fetch from database or CMS
 *   const metadata = await getMetadataFromDatabase(path);
 *   
 *   return Response.json(metadata);
 * }
 */
