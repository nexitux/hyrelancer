"use client";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from './Hero/page';
import FAQPage from './FAQPage/page';
import VideSection from './VideSection/page';
import ServicesHome from './Service/page';
import Category from './Category/page';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for Google signup parameters and redirect to complete-signup
    const googleId = searchParams.get('user_googleid');
    const googleEmail = searchParams.get('user_email');
    
    if (googleId && googleEmail) {
      // Redirect to complete-signup page with Google parameters
      const completeSignupUrl = `/complete-signup?user_googleid=${googleId}&user_email=${encodeURIComponent(googleEmail)}`;
      router.replace(completeSignupUrl);
    }
  }, [searchParams, router]);

  return (
    <main>
      <HeroSection />
      <Category />
      <ServicesHome />
      <VideSection />
      <FAQPage />
    </main>
  );
}