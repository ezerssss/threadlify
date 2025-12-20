import OnboardingModal from "./_components/intro-modal";
import Kanban from "./_components/kanban";
import UpgradeToProModal from "./_components/upgrade-to-pro";

export default function Page() {
  return (
    <>
      <OnboardingModal />
      <UpgradeToProModal />
      <div className="overflow-x-auto">
        <Kanban />
      </div>
    </>
  );
}
