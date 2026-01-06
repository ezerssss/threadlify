"use client";

import { useState, useEffect } from "react";

import { Sparkles, TrendingUp, Search } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useUser from "@/hooks/use-user";
import { useUpgradeModalStore } from "@/stores/upgrade";

export default function UpgradeToProModal() {
  const [open, setOpen] = useState(false);
  const setOpenUpgradeModal = useUpgradeModalStore((state) => state.setIsOpen);

  const { userData } = useUser();

  useEffect(() => {
    if (!userData) {
      return;
    }

    const { totalScans, subscription, isInitialFetchDone } = userData;
    const { plan } = subscription;

    const shouldShow = totalScans < 2 && plan === "free" && isInitialFetchDone;

    setOpen(shouldShow);
  }, [userData]);

  function handleUpgrade() {
    setOpen(false);
    setOpenUpgradeModal(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-background max-w-md rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Get more with Threadlify ✨</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Want to unlock even more value from Threadlify? Pro gives you access to expanded discovery, more relevant
            conversations, and richer insights around your company — all designed to help you move faster and with more
            confidence.
          </p>

          <div className="space-y-3">
            <Feature icon={<Search className="h-4 w-4" />} text="Scan significantly more relevant posts" />
            <Feature icon={<TrendingUp className="h-4 w-4" />} text="Deeper trend & sentiment analysis" />
            <Feature icon={<Sparkles className="h-4 w-4" />} text="Richer, more detailed insights about your company" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-2"
          >
            <Button
              onClick={handleUpgrade}
              className="bg-primary text-primary-foreground w-full rounded-2xl hover:opacity-90"
            >
              Upgrade to Pro
            </Button>

            <button onClick={handleClose} className="text-muted-foreground mt-3 w-full text-sm hover:underline">
              Maybe later
            </button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="border-border flex items-center gap-3 rounded-xl border p-3">
      <div className="text-primary">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
