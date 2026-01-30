import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PropsInterface {
  disabled?: boolean;
  handleCopy: () => Promise<void>;
  onRegenerate: (prompt: string) => void;
  copyButtonText?: string;
  tweakButtonText?: string;
  /** Clarifies that tweak only affects this reply/DM, not future ones. */
  tweakButtonTooltip?: string;
}

const DEFAULT_TWEAK_TOOLTIP = "Rewrite this reply only. Doesn't change your default tone.";

function ReplyActions({
  handleCopy,
  onRegenerate,
  disabled,
  copyButtonText = "Copy and open thread",
  tweakButtonText = "Tweak Reply",
  tweakButtonTooltip = DEFAULT_TWEAK_TOOLTIP,
}: PropsInterface) {
  const [showTweakBox, setShowTweakBox] = useState(false);
  const [tweakText, setTweakText] = useState("");
  const [error, setError] = useState(false);

  const toggleTweakBox = () => setShowTweakBox((prev) => !prev);

  const handleRegenerateClick = () => {
    if (!showTweakBox) {
      toggleTweakBox();
      return;
    }

    // Require non-empty text
    if (tweakText.trim().length === 0) {
      setError(true);

      // brief shake animation
      setTimeout(() => setError(false), 400);

      toast.error("Tweak cannot be empty.");
      return;
    }

    onRegenerate(tweakText);
    setShowTweakBox(false);
    setTweakText("");
  };

  return (
    <div className="mt-1 px-3">
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleCopy}>
          {copyButtonText}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex flex-1">
              <Button
                variant={showTweakBox ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={handleRegenerateClick}
                disabled={disabled}
              >
                {disabled && <Spinner />}
                {showTweakBox ? "Submit tweak" : tweakButtonText}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px]">
            <p>{tweakButtonTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {showTweakBox && (
        <div className="mt-2">
          <Textarea
            autoFocus
            placeholder={`Describe how you'd like to tweak the ${tweakButtonText.toLowerCase().replace("tweak ", "")}`}
            value={tweakText}
            onChange={(e) => setTweakText(e.target.value)}
            className={cn("transition-all", error && "animate-shake border-red-500")}
          />
        </div>
      )}
    </div>
  );
}

export default ReplyActions;
