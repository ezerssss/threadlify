"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import ProtectedRouteWrapper from "@/components/protected-route-wrapper";

import InputCompanyName from "./_components/company-name";
import InputCompanyUrl from "./_components/company-url";

function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(0);

  function handleNameInput(companyName: string) {
    if (!companyName) {
      return;
    }

    setStep(1);
  }

  function handleUrlInput(companyUrl: string) {
    if (!companyUrl) {
      return;
    }

    setUrl(companyUrl);
    router.replace("/dashboard");
  }

  return (
    <ProtectedRouteWrapper>
      <main>
        <div className="h-dvh justify-center p-2 lg:grid lg:grid-cols-6">
          <div className="bg-primary text-primary-foreground order-1 h-full space-y-5 rounded-3xl p-8 sm:p-14 md:p-28 lg:order-2 lg:col-span-5">
            {step === 0 && <InputCompanyName name={name} setName={setName} handleNext={handleNameInput} />}
            {step === 1 && (
              <InputCompanyUrl url={url} setUrl={setUrl} handleBack={() => setStep(0)} handleNext={handleUrlInput} />
            )}
          </div>

          <div className="order-2 hidden h-full lg:order-1 lg:flex" />
        </div>
      </main>
    </ProtectedRouteWrapper>
  );
}

export default OnboardingPage;
