import { AccountOverview } from "./components/account-overview";
import { ScanResultsTable } from "./components/scans-table/table-cards";

function Page() {
  return (
    <div className="space-y-6">
      <AccountOverview />
      <ScanResultsTable />
    </div>
  );
}

export default Page;
