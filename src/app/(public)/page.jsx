"use client";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from './Hero/page';
import FAQPage from './FAQPage/page';
import VideSection from './VideSection/page';
import ServicesHome from './Service/page';
import Category from './Category/page';
import { usePageSEO } from '@/components/SEO/withSEO';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // SEO metadata automatically applied based on pathname
  const seoComponent = usePageSEO();

  useEffect(() => {
    // Check for Google signup parameters and redirect to complete-signup
    const googleId = searchParams.get('user_googleid');
    const googleEmail = searchParams.get('user_email');
    
    if (googleId && googleEmail) {
      // Redirect to complete-signup page with Google parameters
      const completeSignupUrl = `/complete-signup?user_googleid=${googleId}&user_email=${encodeURIComponent(googleEmail)}`;
      router.replace(completeSignupUrl);
      return;
    }

    // Only redirect to select-user-type for Google signup completion, not regular email registration
    // Regular email registration should stay on the homepage or go to login
    const message = searchParams.get('message');
    if (message === 'registration-complete') {
      // Clear the URL parameters to prevent repeated redirects
      router.replace('/');
      return;
    }
  }, [searchParams, router]);

  return (
    <>
      {seoComponent}
      <main>
        <HeroSection />
        <Category />
        <ServicesHome />
        <VideSection />
        <FAQPage />
      </main>
    </>
  );
}