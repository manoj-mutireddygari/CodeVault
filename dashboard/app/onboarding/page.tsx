"use client";

import { OnboardingModal } from "../../components/OnboardingModal";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="page">
      <OnboardingModal
        onComplete={() => {
          router.push("/dashboard");
        }}
      />
    </main>
  );
}
