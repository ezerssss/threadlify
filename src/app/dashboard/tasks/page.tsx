"use client";

import { ScanResultsCards } from "./components/scan-results-cards";
import { ScanResultsTable } from "./components/table-cards";

function TasksPage() {
  return (
    <div className="space-y-4 p-4">
      <section className="space-y-1">
        <h1 className="text-primary text-xl font-bold">Actionable Insights</h1>
        <p className="text-sm text-gray-500">
          A curated set of recommendations generated from real user insights, helping you understand what to improve and
          where to focus next.
        </p>
      </section>
      <ScanResultsCards />
    </div>
  );
}

export default TasksPage;
