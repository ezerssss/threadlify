import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn, isValidUrl } from "@/lib/utils";

interface PropsInterface {
  url: string;
  setUrl: (name: string) => void;
  handleBack: () => void;
  handleNext: () => void;
}

function InputCompanyUrl(props: PropsInterface) {
  const { url, setUrl, handleBack, handleNext } = props;

  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  function handleCheck() {
    try {
      setIsLoading(true);

      isValidUrl(url, (valid) => {
        setIsLoading(false);
        setIsValid(valid);

        if (valid) {
          handleNext();
        }
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <p className="text-muted/70 text-sm">Step 2 of 3</p>

      <h1 className="max-w-[750px] text-3xl font-bold sm:text-4xl lg:text-6xl">What&apos;s your company website?</h1>

      <p className="lg:text-md text-background mt-4 text-sm">
        This helps us learn what your company does so we can tailor everything to you.
      </p>

      <div className="mt-8">
        <input
          autoFocus
          className={cn(
            "text-md mb-1 w-full rounded-lg border px-3 py-2 outline sm:text-lg",
            !isValid && "border-red-700 text-red-700",
          )}
          placeholder="https://yourcompany.com"
          value={url}
          onChange={(e) => {
            setIsValid(true);
            setUrl(e.target.value);
          }}
        />
        {!isValid && (
          <p className="text-red-700">
            We couldn&apos;t reach this URL. Make sure it starts with http:// or https:// and that the site is
            reachable.
          </p>
        )}
      </div>

      <div className="mt-10 flex gap-2">
        <Button
          className="bg-background text-primary hover:bg-background border px-12 py-5 font-bold"
          onClick={handleCheck}
        >
          {isLoading ? <Spinner /> : "Next"}
        </Button>
        <Button className="bg-primary text-background border px-12 py-5 font-bold" onClick={handleBack}>
          Back
        </Button>
      </div>
    </>
  );
}

export default InputCompanyUrl;
