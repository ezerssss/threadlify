import { useRouter } from "next/navigation";

import ReadMoreArea from "@foxeian/react-read-more";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, toastError } from "@/lib/utils";
import { CommentType, RecommendedReplyType } from "@/types/post";

import { StatusSelectButton } from "./status-select-button";

interface PropsInterface {
  recommendedReply: RecommendedReplyType | null;
  comments: CommentType[];
  boardColumnId: string;
  onStatusChange: (newStatus: string) => Promise<void>;
  userName: string;
  postUrl: string;
}

function CommentSection(props: PropsInterface) {
  const { recommendedReply, comments, boardColumnId, onStatusChange, userName, postUrl } = props;

  async function handleCopy() {
    if (!recommendedReply) {
      return;
    }

    try {
      await navigator.clipboard.writeText(recommendedReply.reply);

      const url = recommendedReply.targetComment?.url ?? postUrl;

      window.open(url, "_blank");
      toast.success("Copied to clipboard.");
    } catch (error) {
      toastError(error);
    }
  }

  return (
    <div className="border-accent flex h-full max-w-[30%] min-w-[30%] flex-col space-y-2 border-l">
      <div className="ml-3 flex items-center justify-end gap-2 text-sm">
        <p>Status:</p>
        <StatusSelectButton value={boardColumnId} onChange={(status) => onStatusChange(status)} />
      </div>

      <div className="scrollbar-thin flex grow flex-col space-y-2 overflow-auto">
        {recommendedReply?.reply && (
          <section className="flex flex-1 flex-col gap-1">
            <h2 className="ml-3 font-bold">Recommended Reply</h2>

            <div className="px-3">
              {recommendedReply.targetComment && (
                <div className="bg-card relative block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs">
                  <ReadMoreArea lettersLimit={100} className="wrap-anywhere">
                    {recommendedReply.targetComment.body}
                  </ReadMoreArea>

                  <div className="flex items-end justify-between">
                    <p className="text-sm italic">-{recommendedReply.targetComment.author}</p>
                  </div>
                </div>
              )}

              <div className="relative pt-2">
                <div
                  className={cn(
                    "border-primary bg-card z-20 block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs",
                    recommendedReply.targetComment && "ml-6",
                  )}
                >
                  {recommendedReply.reply}

                  <div className="flex items-end justify-between">
                    <p className="text-sm italic">-{userName}</p>
                  </div>
                </div>

                {recommendedReply.targetComment && (
                  <>
                    <div className="absolute top-0 left-2 -z-10 h-1/2 w-px border border-gray-400" />
                    <div className="absolute top-1/2 left-2 -z-10 h-px w-20 -translate-y-1/2 transform border border-gray-400" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-1 ml-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleCopy}>
                Copy and open thread
              </Button>

              <Button variant="outline" size="sm" className="flex-1">
                Regenerate reply
              </Button>
            </div>
          </section>
        )}

        <section className="flex flex-1 flex-col gap-1">
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
        </section>
      </div>
    </div>
  );
}

export default CommentSection;
