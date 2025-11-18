import OnboardingModal from "./_components/intro-modal";
import Kanban from "./_components/kanban";

export default function Page() {
  return (
    <>
      <OnboardingModal />
      <div className="overflow-x-auto">
        <Kanban />
      </div>
    </>
  );
}
