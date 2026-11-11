import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="p-6 max-w-4xl mx-auto py-12 text-zinc-300 space-y-6 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold font-heading text-white">Privacy Policy & GDPR Compliance</h1>
        <p className="text-xs text-zinc-500 mt-1">Last Updated: February 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Data Minimization & Vocal Samples</h2>
        <p>
          We collect vocal recordings strictly for training and inferencing requested synthetic voices. Your training
          audio is stored in isolated S3 buckets encrypted at rest (AES-256).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Right to Erasure (GDPR Article 17)</h2>
        <p>
          You have the unconditional right to delete any uploaded voice recording, cloned weights, or generation history.
          Deletion is permanent across all cold storage backups and inference GPU memory within 24 hours.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Data Portability</h2>
        <p>
          You may export your complete generation history and voice configuration metadata anytime from the Account Settings panel.
        </p>
      </section>
    </div>
  );
}
