"use client";

import { useState, useEffect, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function OnboardingModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showModal = searchParams.get("showIntro");

  const [open, setOpen] = useState(!!showModal);
  const steps = [
    "Generating company profile...",
    "Analyzing your content...",
    "Fetching relevant posts...",
    "Preparing insights...",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function handleClick() {
    setOpen(false);
    router.replace("/dashboard/default");
  }

  return (
    <Suspense>
      <Dialog open={open}>
        <DialogContent className="border-border bg-background text-foreground max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-semibold">Welcome aboard!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-0">
            <p className="text-sm leading-relaxed">
              We&apos;re setting things up for you. Your dashboard will update as we finish building your company
              profile and gather the most relevant posts. This can take a bit, but updates will roll in automatically.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-primary text-sm"
              >
                {steps[currentStep]}
              </motion.span>
            </div>

            <Button
              onClick={handleClick}
              className="bg-primary text-primary-foreground mt-6 w-full rounded-2xl hover:opacity-90"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
