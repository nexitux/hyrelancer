/**
 * Page-level metadata configuration
 * This file contains metadata for each page, making it easy to migrate to dynamic later
 * 
 * Structure:
 * - Each page has its own metadata object
 * - Easy to convert to API calls later
 * - Centralized management
 */

export const pageMetadata = {
  // Home page
  '/': {
    title: 'Home',
    description: 'Welcome to Hyrelancer - The best freelancer marketplace to connect clients and freelancers. Find skilled professionals or get your projects done.',
    og: {
      title: 'Hyrelancer - Connect with Top Freelancers',
      description: 'Join thousands of clients and freelancers on Hyrelancer. Find your next project or hire the perfect talent.',
      image: '/images/home-og.jpg'
    },
    twitter: {
      title: 'Hyrelancer - Connect with Top Freelancers',
      description: 'Join thousands of clients and freelancers on Hyrelancer. Find your next project or hire the perfect talent.'
    }
  },

  // Job listings
  '/job-details': {
    title: 'Job Listings',
    description: 'Browse and find the best freelance jobs on Hyrelancer. Discover opportunities in design, development, marketing, and more.',
    og: {
      title: 'Find Freelance Jobs - Hyrelancer',
      description: 'Browse thousands of freelance job opportunities. Connect with clients and grow your career.',
      image: '/images/jobs-og.jpg'
    },
    twitter: {
      title: 'Find Freelance Jobs - Hyrelancer',
      description: 'Browse thousands of freelance job opportunities. Connect with clients and grow your career.'
    },
    canonical: '/job-details'
  },

  // Job list
  '/job-list': {
    title: 'Browse Jobs',
    description: 'Explore thousands of freelance job opportunities. Filter by category, location, and salary to find your perfect match.',
    og: {
      title: 'Browse Freelance Jobs - Hyrelancer',
      description: 'Find your next freelance opportunity from thousands of available jobs.',
      image: '/images/job-list-og.jpg'
    },
    canonical: '/job-list'
  },

  // Services
  '/Service': {
    title: 'Services',
    description: 'Discover professional services offered by skilled freelancers. From design to development, find the perfect service for your needs.',
    og: {
      title: 'Freelance Services - Hyrelancer',
      description: 'Browse professional services from verified freelancers.',
      image: '/images/services-og.jpg'
    },
    canonical: '/Service'
  },

  // Categories
  '/Category': {
    title: 'Categories',
    description: 'Browse freelance services by category. Find experts in design, development, marketing, writing, and more.',
    og: {
      title: 'Freelance Categories - Hyrelancer',
      description: 'Explore services by category and find the right freelancer for your project.',
      image: '/images/categories-og.jpg'
    },
    canonical: '/Category'
  },

  // FAQ
  '/FAQPage': {
    title: 'FAQ',
    description: 'Frequently asked questions about Hyrelancer. Get answers to common questions about our platform, services, and policies.',
    og: {
      title: 'Frequently Asked Questions - Hyrelancer',
      description: 'Find answers to common questions about our freelance marketplace.',
      image: '/images/faq-og.jpg'
    },
    canonical: '/FAQPage'
  },

  // Login
  '/login': {
    title: 'Login',
    description: 'Sign in to your Hyrelancer account to access your dashboard, manage projects, and connect with clients or freelancers.',
    og: {
      title: 'Login - Hyrelancer',
      description: 'Access your Hyrelancer account and start your freelance journey.',
      image: '/images/login-og.jpg'
    },
    canonical: '/login'
  },

  // Registration
  '/select-user-type': {
    title: 'Join Hyrelancer',
    description: 'Join Hyrelancer as a freelancer or client. Create your account and start your freelance journey today.',
    og: {
      title: 'Join Hyrelancer - Freelance Marketplace',
      description: 'Sign up for free and start your freelance career or find talented professionals.',
      image: '/images/join-og.jpg'
    },
    canonical: '/select-user-type'
  },

  // Profile setup
  '/profile-setup': {
    title: 'Complete Your Profile',
    description: 'Complete your profile setup to start using Hyrelancer. Add your skills, portfolio, and experience.',
    og: {
      title: 'Complete Profile - Hyrelancer',
      description: 'Finish setting up your profile to start freelancing.',
      image: '/images/profile-setup-og.jpg'
    },
    canonical: '/profile-setup'
  },

  // User list
  '/userList': {
    title: 'Freelancers',
    description: 'Browse our community of skilled freelancers. Find the perfect match for your project needs.',
    og: {
      title: 'Browse Freelancers - Hyrelancer',
      description: 'Discover talented freelancers ready to work on your projects.',
      image: '/images/freelancers-og.jpg'
    },
    canonical: '/userList'
  },

  // Dashboard pages (minimal SEO)
  '/freelancer-dashboard': {
    title: 'Freelancer Dashboard',
    description: 'Manage your freelance business with our comprehensive dashboard. Track projects, earnings, and client communications.'
  },

  '/customer-dashboard': {
    title: 'Customer Dashboard',
    description: 'Manage your projects and connect with freelancers through our customer dashboard.'
  },

  '/control': {
    title: 'Admin Panel',
    description: 'Administrative panel for managing the Hyrelancer platform.'
  }
};

/**
 * Get metadata for a specific page
 * @param {string} pathname - The page pathname
 * @returns {Object} Page metadata or empty object
 */
export function getPageMetadata(pathname) {
  return pageMetadata[pathname] || {};
}

/**
 * Get all page metadata (for migration to dynamic later)
 * @returns {Object} All page metadata
 */
export function getAllPageMetadata() {
  return pageMetadata;
}

/**
 * Add or update page metadata
 * @param {string} pathname - The page pathname
 * @param {Object} metadata - The metadata object
 */
export function setPageMetadata(pathname, metadata) {
  pageMetadata[pathname] = metadata;
}
