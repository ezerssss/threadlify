import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface PropsInterface {
  strategy: string;
  setStrategy: (strategy: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  isLoading: boolean;
}

function InputCompanyStrategy(props: PropsInterface) {
  const { strategy, setStrategy, handleBack, handleNext, isLoading } = props;

  return (
    <>
      <p className="text-muted/70 text-sm">Step 3 of 3</p>

      <h1 className="max-w-[800px] text-3xl font-bold sm:text-4xl lg:text-6xl">
        What&apos;s your current growth strategy or focus?
      </h1>

      <p className="lg:text-md text-background mt-4 text-sm">
        Tell us what your company&apos;s trying to achieve right now — maybe you&apos;re hunting for early users,
        learning from your audience, or refining positioning. Your agents will use this to think like you.
      </p>

      <textarea
        autoFocus
        className="text-md mt-5 w-full rounded-lg border px-3 py-2 outline sm:text-lg"
        placeholder="finding early users who'll actually use the product"
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
      />

      <div className="mt-10 flex gap-2">
        <Button
          className="bg-background text-primary hover:bg-background border px-12 py-5 font-bold"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : "Submit"}
        </Button>
        <Button
          className="bg-primary text-background border px-12 py-5 font-bold"
          onClick={handleBack}
          disabled={isLoading}
        >
          Back
        </Button>
      </div>
    </>
  );
}

export default InputCompanyStrategy;
