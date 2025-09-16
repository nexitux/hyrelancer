"use client";

import { Suspense } from "react";
import EmailVerifiedContent from "./EmailVerifiedContent";

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EmailVerifiedContent />
    </Suspense>
  );
}