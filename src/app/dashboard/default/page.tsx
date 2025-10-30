import { AccountOverview } from "./_components/account-overview";
import { CurrencyExchange } from "./_components/currency-exchange";
import { ExpenseSummary } from "./_components/expense-summary";
import { FinancialOverview } from "./_components/financial-overview";
import Kanban from "./_components/kanban";

export default function Page() {
  return (
    <div className="gap-4 space-y-4 xl:flex">
      <div className="flex-1">
        <AccountOverview />
      </div>

      <div className="flex-2 flex-col gap-4">
        <div className="flex-1 overflow-auto">
          <Kanban />
        </div>
        {/* <div className="flex-1 overflow-x-auto">
          <Kanban />
        </div> */}
        {/* <div className="flex-1">
          <FinancialOverview />
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2">
          <ExpenseSummary />
          <CurrencyExchange />
        </div> */}
      </div>
    </div>
  );
}
