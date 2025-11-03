import { AccountOverview } from "./components/account-overview";
import { TableCards } from "./components/leads-table/table-cards";

function Page() {
  return (
    <div className="gap-4 xl:flex">
      <div className="flex-1 xl:max-w-[450px]">
        <AccountOverview />
      </div>
      <div className="flex-1">
        <TableCards />
      </div>
    </div>
  );
}

export default Page;
