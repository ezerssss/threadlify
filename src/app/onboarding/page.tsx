"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { StatusCodes } from "http-status-codes";
import ky from "ky";

import ProtectedRouteWrapper from "@/components/protected-route-wrapper";
import { ONBOARDING_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { GenericAPIResponse } from "@/types/generics";

import InputCompanyName from "./_components/company-name";
import InputCompanyStrategy from "./_components/company-strategy";
import InputCompanyUrl from "./_components/company-url";

function OnboardingPage() {
  const router = useRouter();
  const { user, idToken } = useUser();
  const [name, setName] = useState("");

  const [url, setUrl] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(true);

  const [strategy, setStrategy] = useState("");

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  function handleNameNext() {
    if (!name) {
      return;
    }

    setStep(1);
  }

  function handleUrlNext() {
    if (!url) {
      return;
    }

    setStep(2);
  }

  async function handleStrategyNext() {
    if (!strategy) {
      return;
    }

    try {
      setIsLoading(true);

      if (!user || !idToken) {
        throw new Error("Your are unauthorized to do this action.");
      }

      const res = await ky.post(ONBOARDING_URL, {
        json: { name, url, strategy },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        throwHttpErrors: false,
      });

      if (res.status !== StatusCodes.OK) {
        const data: GenericAPIResponse = await res.json();

        if (data.message === "URL not valid") {
          setStep(1);
          setIsUrlValid(false);
          throw new Error("We couldn’t reach this URL. Please check that the address is correct and accessible.");
        } else {
          throw new Error(data.message);
        }
      }

      router.replace("/dashboard");
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ProtectedRouteWrapper>
      <main>
        <div className="h-dvh justify-center p-2 lg:grid lg:grid-cols-6">
          <div className="bg-primary text-primary-foreground order-1 h-full space-y-5 rounded-3xl p-8 sm:p-14 md:p-28 lg:order-2 lg:col-span-5">
            {step === 0 && <InputCompanyName name={name} setName={setName} handleNext={handleNameNext} />}
            {step === 1 && (
              <InputCompanyUrl
                url={url}
                setUrl={setUrl}
                isValid={isUrlValid}
                setIsValid={setIsUrlValid}
                handleBack={() => setStep(0)}
                handleNext={handleUrlNext}
              />
            )}
            {step === 2 && (
              <InputCompanyStrategy
                strategy={strategy}
                setStrategy={setStrategy}
                handleBack={() => setStep(1)}
                handleNext={handleStrategyNext}
                isLoading={isLoading}
              />
            )}
          </div>

          <div className="order-2 hidden h-full lg:order-1 lg:flex" />
        </div>
      </main>
    </ProtectedRouteWrapper>
  );
}

export default OnboardingPage;
