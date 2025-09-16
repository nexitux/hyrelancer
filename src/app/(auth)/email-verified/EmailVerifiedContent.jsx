"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function EmailVerifiedInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/Login"); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-md">
        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              ✅ Email Verified Successfully!
            </h1>
            <p className="mt-4 text-gray-600">Redirecting you to login...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              ❌ Verification Failed
            </h1>
            <p className="mt-4 text-gray-600">
              The link is invalid or expired.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function EmailVerifiedContent() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <EmailVerifiedInner />
    </Suspense>
  );
}
