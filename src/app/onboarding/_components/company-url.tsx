import { useState } from "react";

import isUrl from "is-url";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PropsInterface {
  url: string;
  setUrl: (name: string) => void;
  isValid: boolean;
  setIsValid: (value: boolean) => void;
  handleNext: () => void;
}

function InputCompanyUrl(props: PropsInterface) {
  const { url, setUrl, isValid, setIsValid, handleNext } = props;

  const [isLoading, setIsLoading] = useState(false);

  function handleCheck() {
    try {
      setIsLoading(true);

      const valid = isUrl(url);

      setIsValid(valid);

      if (valid) {
        handleNext();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <p className="text-muted/70 text-sm">Step 1 of 2</p>

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
            Unable to verify this URL. Make sure it starts with http:// or https:// and that the site is reachable.
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
      </div>
    </>
  );
}

export default InputCompanyUrl;
