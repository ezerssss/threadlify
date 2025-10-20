import { Button } from "@/components/ui/button";

interface PropsInterface {
  url: string;
  setUrl: (name: string) => void;
  handleBack: () => void;
  handleNext: () => void;
}

function InputCompanyUrl(props: PropsInterface) {
  const { url, setUrl, handleBack, handleNext } = props;

  return (
    <>
      <p className="text-muted/70 text-sm">Step 2 of 3</p>

      <h1 className="max-w-[750px] text-3xl font-bold sm:text-4xl lg:text-6xl">What&apos;s your company website?</h1>

      <p className="lg:text-md text-background mt-4 text-sm">
        This helps us learn what your company does so we can tailor everything to you.
      </p>

      <input
        autoFocus
        className="text-md mt-8 w-full rounded-lg border px-3 py-2 outline sm:text-lg"
        placeholder="yourcompany.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <div className="mt-10 flex gap-2">
        <Button
          className="bg-background text-primary hover:bg-background border px-12 py-5 font-bold"
          onClick={handleNext}
        >
          Next
        </Button>
        <Button className="bg-primary text-background border px-12 py-5 font-bold" onClick={handleBack}>
          Back
        </Button>
      </div>
    </>
  );
}

export default InputCompanyUrl;
