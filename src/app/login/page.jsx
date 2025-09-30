"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get all search parameters and redirect to /Login with them
    const params = new URLSearchParams();
    
    // Copy all existing parameters
    for (const [key, value] of searchParams.entries()) {
      params.set(key, value);
    }
    
    // Redirect to /Login with all parameters
    const redirectUrl = `/Login${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
