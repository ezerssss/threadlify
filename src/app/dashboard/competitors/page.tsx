"use client";

import { WorkInProgressOverlay } from "@/components/work-in-progress-overlay";

import { CompetitorTrackingCards } from "./_components/competitor-tracking-cards";

function CompetitorsPage() {
  return (
    <WorkInProgressOverlay
      title="Competitor Tracking - Work in Progress"
      description="We're building powerful competitor insights to help you track what your competitors are doing in the market, understand market demands, and identify pain points. This feature will be available soon!"
    >
      <div className="space-y-4">
        <CompetitorTrackingCards />
      </div>
    </WorkInProgressOverlay>
  );
}

export default CompetitorsPage;
