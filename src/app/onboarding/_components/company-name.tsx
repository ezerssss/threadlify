import { Button } from "@/components/ui/button";

interface PropsInterface {
  name: string;
  setName: (name: string) => void;
  handleNext: (name: string) => void;
}

function InputCompanyName(props: PropsInterface) {
  const { name, setName, handleNext } = props;

  return (
    <>
      <p className="text-muted/70 text-sm">Step 1 of 2</p>

      <h1 className="max-w-[750px] text-3xl font-bold sm:text-4xl lg:text-6xl">
        What&apos;s the name of your company or team?
      </h1>

      <p className="lg:text-md text-background mt-4 text-sm">
        Add your company or team name. You can change it later anytime.
      </p>

      <input
        autoFocus
        className="text-md mt-8 w-full rounded-lg border px-3 py-2 outline sm:text-lg"
        placeholder="Threadlify"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Button
        className="bg-background text-primary hover:bg-background mt-10 border px-12 py-5 font-bold"
        onClick={() => handleNext(name)}
      >
        Next
      </Button>
    </>
  );
}

export default InputCompanyName;
