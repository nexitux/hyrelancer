/**
 * Page-wise SEO metadata configuration
 * This file contains static SEO metadata for each page
 */

export const pageSEOData = {
  // Home page
  '/': {
    title: 'Hyrelancer - Freelancer Marketplace',
    description: 'Connect with skilled freelancers or find your next project on Hyrelancer. The best platform for freelancers and clients to collaborate.',
    keywords: 'freelancer marketplace, hire freelancers, find work, remote jobs, gig economy',
    og: {
      title: 'Hyrelancer - Freelancer Marketplace',
      description: 'Connect with skilled freelancers or find your next project on Hyrelancer.',
      image: '/images/og-home.jpg',
      type: 'website'
    }
  },

  // Auth pages
  '/Login': {
    title: 'Login - Hyrelancer',
    description: 'Sign in to your Hyrelancer account to access your dashboard and manage your projects.',
    keywords: 'login, sign in, freelancer login, client login',
    og: {
      title: 'Login - Hyrelancer',
      description: 'Sign in to your Hyrelancer account.',
      image: '/images/og-login.jpg',
      type: 'website'
    }
  },

  '/registration': {
    title: 'Register - Hyrelancer',
    description: 'Join Hyrelancer today! Create your account as a freelancer or client and start your journey.',
    keywords: 'register, sign up, freelancer registration, client registration',
    og: {
      title: 'Register - Hyrelancer',
      description: 'Join Hyrelancer today! Create your account.',
      image: '/images/og-register.jpg',
      type: 'website'
    }
  },

  '/select-user-type': {
    title: 'Choose Account Type - Hyrelancer',
    description: 'Select whether you want to join as a freelancer or client on Hyrelancer.',
    keywords: 'account type, freelancer, client, choose role',
    og: {
      title: 'Choose Account Type - Hyrelancer',
      description: 'Select your account type on Hyrelancer.',
      image: '/images/og-account-type.jpg',
      type: 'website'
    }
  },

  // Public pages
  '/Category': {
    title: 'Browse Categories - Hyrelancer',
    description: 'Explore different service categories on Hyrelancer. Find freelancers in web development, design, marketing, and more.',
    keywords: 'service categories, freelancer categories, web development, design, marketing',
    og: {
      title: 'Browse Categories - Hyrelancer',
      description: 'Explore different service categories on Hyrelancer.',
      image: '/images/og-categories.jpg',
      type: 'website'
    }
  },

  '/categerylist': {
    title: 'Service Categories - Hyrelancer',
    description: 'Browse all available service categories and find the right freelancers for your project.',
    keywords: 'service categories, freelancer services, project categories',
    og: {
      title: 'Service Categories - Hyrelancer',
      description: 'Browse all available service categories.',
      image: '/images/og-category-list.jpg',
      type: 'website'
    }
  },

  '/servicelist': {
    title: 'All Services - Hyrelancer',
    description: 'Discover all available services on Hyrelancer. Find skilled freelancers for your projects.',
    keywords: 'freelancer services, all services, project services',
    og: {
      title: 'All Services - Hyrelancer',
      description: 'Discover all available services on Hyrelancer.',
      image: '/images/og-services.jpg',
      type: 'website'
    }
  },

  '/job-list': {
    title: 'Job Listings - Hyrelancer',
    description: 'Browse available job opportunities on Hyrelancer. Find your next project or hire talented freelancers.',
    keywords: 'job listings, freelance jobs, project opportunities, remote work',
    og: {
      title: 'Job Listings - Hyrelancer',
      description: 'Browse available job opportunities on Hyrelancer.',
      image: '/images/og-jobs.jpg',
      type: 'website'
    }
  },

  '/FAQPage': {
    title: 'Frequently Asked Questions - Hyrelancer',
    description: 'Find answers to common questions about using Hyrelancer platform for freelancers and clients.',
    keywords: 'FAQ, help, support, questions, freelancer help, client help',
    og: {
      title: 'FAQ - Hyrelancer',
      description: 'Find answers to common questions about Hyrelancer.',
      image: '/images/og-faq.jpg',
      type: 'website'
    }
  },

  '/privacy-policy': {
    title: 'Privacy Policy - Hyrelancer',
    description: 'Read Hyrelancer\'s privacy policy to understand how we protect and use your personal information.',
    keywords: 'privacy policy, data protection, user privacy',
    og: {
      title: 'Privacy Policy - Hyrelancer',
      description: 'Read Hyrelancer\'s privacy policy.',
      image: '/images/og-privacy.jpg',
      type: 'website'
    }
  },

  '/userList': {
    title: 'Freelancers - Hyrelancer',
    description: 'Browse our community of skilled freelancers. Find the perfect match for your project.',
    keywords: 'freelancers, skilled professionals, hire freelancers',
    og: {
      title: 'Freelancers - Hyrelancer',
      description: 'Browse our community of skilled freelancers.',
      image: '/images/og-freelancers.jpg',
      type: 'website'
    }
  },

  '/UsersList': {
    title: 'All Users - Hyrelancer',
    description: 'View all users on Hyrelancer platform including freelancers and clients.',
    keywords: 'users, freelancers, clients, community',
    og: {
      title: 'All Users - Hyrelancer',
      description: 'View all users on Hyrelancer platform.',
      image: '/images/og-users.jpg',
      type: 'website'
    }
  },

  // Dashboard pages
  '/freelancer-dashboard': {
    title: 'Freelancer Dashboard - Hyrelancer',
    description: 'Manage your freelancer profile, projects, and earnings on Hyrelancer dashboard.',
    keywords: 'freelancer dashboard, manage profile, projects, earnings',
    og: {
      title: 'Freelancer Dashboard - Hyrelancer',
      description: 'Manage your freelancer profile and projects.',
      image: '/images/og-freelancer-dashboard.jpg',
      type: 'website'
    }
  },

  '/customer-dashboard': {
    title: 'Client Dashboard - Hyrelancer',
    description: 'Manage your projects, hire freelancers, and track progress on Hyrelancer client dashboard.',
    keywords: 'client dashboard, manage projects, hire freelancers',
    og: {
      title: 'Client Dashboard - Hyrelancer',
      description: 'Manage your projects and hire freelancers.',
      image: '/images/og-client-dashboard.jpg',
      type: 'website'
    }
  }
};

/**
 * Get SEO metadata for a specific page
 * @param {string} pathname - The current pathname
 * @returns {Object} SEO metadata object
 */
export function getPageSEO(pathname) {
  // Remove query parameters and hash
  const cleanPath = pathname.split('?')[0].split('#')[0];
  
  // Return page-specific metadata or default
  return pageSEOData[cleanPath] || {
    title: 'Hyrelancer - Freelancer Marketplace',
    description: 'Connect with skilled freelancers or find your next project on Hyrelancer.',
    keywords: 'freelancer marketplace, hire freelancers, find work',
    og: {
      title: 'Hyrelancer - Freelancer Marketplace',
      description: 'Connect with skilled freelancers or find your next project on Hyrelancer.',
      image: '/images/og-default.jpg',
      type: 'website'
    }
  };
}
