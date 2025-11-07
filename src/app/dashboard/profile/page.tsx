import { AccountOverview } from "./components/account-overview";
import { ScanResultsTable } from "./components/scans-table/table-cards";

function Page() {
  return (
    <div className="gap-4 xl:flex space-y-4">
      <div className="flex-1 xl:max-w-[450px]">
        <AccountOverview />
      </div>
      <div className="flex-1">
        <ScanResultsTable />
      </div>
    </div>
  );
}

export default Page;
