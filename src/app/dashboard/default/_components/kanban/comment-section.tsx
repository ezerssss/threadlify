import { useState } from "react";

import ReadMoreArea from "@foxeian/react-read-more";
import ky from "ky";
import { CopyIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";

import { TWEAK_REPLY_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";
import { CommentType, RecommendedReplyType } from "@/types/post";

import ReplyActions from "./reply-actions";
import { StatusSelectButton } from "./status-select-button";

interface PropsInterface {
  postId: string;
  recommendedReply: RecommendedReplyType | null;
  comments: CommentType[];
  boardColumnId: string;
  onStatusChange: (newStatus: string) => Promise<void>;
  userName: string;
  postUrl: string;
  updateSinglePost: (postId: string, newData: any) => void;
}

function CommentSection(props: PropsInterface) {
  const { recommendedReply, comments, boardColumnId, onStatusChange, userName, postUrl, postId, updateSinglePost } =
    props;
  const setActivePost = useKanbanStore((state) => state.setActivePost);

  const { idToken, userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  async function handleCopy(redirect: boolean = true) {
    if (!recommendedReply) {
      return;
    }

    try {
      await navigator.clipboard.writeText(recommendedReply.reply);

      const url = recommendedReply.targetComment?.url ?? postUrl;

      if (redirect) {
        window.open(url, "_blank");
      }
      toast.success("Copied to clipboard.");
    } catch (error) {
      toastError(error);
    }
  }

  async function handleTweak(tweak: string, postId: string) {
    if (isLoading || !userData) {
      return;
    }

    const { subscription } = userData;
    const isUserFreeOrNotActive = subscription.plan === "free" || subscription.status !== "active";
    if (isUserFreeOrNotActive) {
      toast.error("You can't tweak a reply on the free plan. Upgrade your plan to access this feature.");
      return;
    }

    try {
      setIsLoading(true);
      const { tweakedReply } = await ky
        .post(TWEAK_REPLY_URL, {
          timeout: 40000,
          json: { postId, tweak },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .json<{ tweakedReply: RecommendedReplyType }>();

      setActivePost((prev) => {
        if (prev === null) {
          return null;
        }

        if (postId !== prev.id) {
          return prev;
        }

        return {
          ...prev,
          recommendedReply: tweakedReply,
        };
      });

      updateSinglePost(postId, { recommendedReply: tweakedReply });

      toast.success("Successfully tweaked reply.");
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border-accent flex h-full max-w-[30%] min-w-[30%] flex-col space-y-1 border-l">
      <div className="ml-3 flex items-center justify-end gap-2 text-sm">
        <p>Status:</p>
        <StatusSelectButton value={boardColumnId} onChange={(status) => onStatusChange(status)} />
      </div>

      <div className="scrollbar-thin flex grow flex-col space-y-6 overflow-auto">
        {recommendedReply?.reply && (
          <section className="flex flex-1 flex-col gap-1">
            <h2 className="ml-3 font-bold">Recommended Reply</h2>

            <div className="px-3">
              {recommendedReply.targetComment?.body && recommendedReply.targetComment?.author && (
                <div className="bg-card relative block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs">
                  <ReadMoreArea lettersLimit={100} className="wrap-anywhere">
                    {recommendedReply.targetComment.body}
                  </ReadMoreArea>

                  <div className="flex items-end justify-between">
                    <p className="text-sm italic">-{recommendedReply.targetComment.author}</p>
                  </div>
                </div>
              )}

              <div className={cn("relative pt-2", isLoading && "animate-pulse")}>
                <div
                  className={cn(
                    "border-primary bg-card z-20 block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs",
                    recommendedReply.targetComment && "ml-6",
                  )}
                >
                  <p>{recommendedReply.reply}</p>

                  <div className="flex items-end justify-between">
                    <p className="text-sm italic">-{userName}</p>

                    <CopyIcon className="cursor-pointer" size={14} onClick={() => handleCopy(false)} />
                  </div>
                </div>

                {recommendedReply.targetComment && (
                  <div className="border-accent absolute top-0 left-3 -z-10 h-1/2 w-3 rounded-bl-sm border border-t-0 border-r-0" />
                )}
              </div>
            </div>

            <ReplyActions
              disabled={isLoading}
              handleCopy={handleCopy}
              onRegenerate={(tweak) => handleTweak(tweak, postId)}
            />
          </section>
        )}

        <div className="px-3">
          <div className="bg-muted/30 flex items-start gap-2 rounded-md border p-2.5">
            <InfoIcon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-xs">
              You can customize your reply tone for future replies in your profile settings.
            </p>
          </div>
        </div>

        {/* <section className="flex flex-1 flex-col gap-1">
          <h2 className="ml-3 font-bold">Top Comments</h2>

          {comments.length < 1 && <p className="mt-1 text-center text-sm italic">No comments</p>}
          <div className="space-y-2 px-3">
            {comments.map((comment, index) => (
              <div
                key={comment.id ?? index}
                className="bg-card relative block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs"
              >
                <ReadMoreArea lettersLimit={100} className="wrap-anywhere">
                  {comment.body}
                </ReadMoreArea>

                <div className="flex items-end justify-between">
                  <p className="text-sm italic">-{comment.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section> */}
      </div>
    </div>
  );
}

export default CommentSection;
