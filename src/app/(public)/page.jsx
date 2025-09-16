"use client";
import React from 'react';
import HeroSection from './Hero/page';
import FAQPage from './FAQPage/page';
import VideSection from './VideSection/page';
import ServicesHome from './Service/page';
import Category from './Category/page';

export default function HomePage() {
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
