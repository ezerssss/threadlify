import { memo, useCallback } from "react";

import Link from "next/link";

import ReadMoreArea from "@foxeian/react-read-more";
import { CheckCircleIcon, CopyIcon, LinkIcon, SparkleIcon } from "lucide-react";
import { useWindowSize } from "react-use";
import { siReddit } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useUser from "@/hooks/use-user";
import { cn, formatISODate, toastError } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";
import { CommentType } from "@/types/post";

import { StatusSelectButton } from "./status-select-button";
import { ChangeColumnInterface } from "./use-kanban-data";

interface PropsInterface {
  handleChangeStatus: (change: ChangeColumnInterface) => Promise<void>;
}

// eslint-disable-next-line complexity
function PopUpContent(props: PropsInterface) {
  const { handleChangeStatus } = props;

  const { userData } = useUser();
  const isOpen = useKanbanStore((state) => state.isOpen);
  const post = useKanbanStore((state) => state.activePost);
  const index = useKanbanStore((state) => state.activePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const { height } = useWindowSize();

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setActivePost(null);
      setActivePostIndex(null);
    }

    setIsOpen(open);
  }, []);

  if (!post || !userData) {
    return null;
  }

  const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  const comments = [...post.topComments];
  const { recommendedReply } = post;

  let recommendedReplyObject: CommentType | null = null;

  if (recommendedReply && Object.keys(recommendedReply).length > 0 && recommendedReply.reply) {
    recommendedReplyObject = {
      author: userData.name,
      body: recommendedReply.reply,
    };
  }

  let indexOfReply = 0;

  if (recommendedReply?.targetComment) {
    const { targetComment } = recommendedReply;
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];

      if (comment.author === targetComment.author && comment.body === targetComment.body) {
        indexOfReply = i + 1;
        break;
      }
    }
  }

  if (recommendedReplyObject) {
    comments.splice(indexOfReply, 0, recommendedReplyObject);
  }

  async function handleCopy(comment: CommentType, index: number) {
    if (!recommendedReplyObject || index !== indexOfReply) {
      return;
    }

    try {
      await navigator.clipboard.writeText(comment.body);
      toast.success("Copied to clipboard.");
    } catch (error) {
      toastError(error);
    }
  }

  async function onStatusChange(newStatus: string) {
    if (!post || index === null) {
      return;
    }

    const data: ChangeColumnInterface = {
      source: {
        droppableId: post.boardColumnId,
        index,
      },
      destination: {
        droppableId: newStatus,
        index: 0,
      },
      draggableId: post.id,
    };

    await handleChangeStatus(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card min-w-[95%] p-0">
        <DialogHeader hidden>
          <DialogTitle hidden>{post.title}</DialogTitle>
          <DialogDescription hidden>Reddit | {post.title}</DialogDescription>
        </DialogHeader>
        <div className="flex p-5 md:p-10" style={{ height: height * 0.95 }}>
          <div className="flex h-full flex-1 flex-col gap-y-2">
            <section className="flex items-end justify-between pr-3">
              <div className="flex items-center gap-1">
                <SimpleIcon icon={siReddit} className="size-5" />
                <span>{post.platform}</span>
              </div>
              {post.postCreatedAt && (
                <time className="text-xs whitespace-nowrap">{formatISODate(post.postCreatedAt)}</time>
              )}
            </section>

            <section className="flex items-center justify-between pr-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={badgeColor} className="h-6 shrink-0 rounded-sm px-1.5 capitalize">
                  {post.priority}
                </Badge>

                <Badge variant="secondary" className="h-6 shrink-0 rounded-sm px-1.5 capitalize">
                  {post.action}
                </Badge>

                <Badge variant="outline" className="flex h-6 shrink-0 items-center gap-1 rounded-sm px-1.5">
                  <CheckCircleIcon size={12} /> <span>{post.signalType}</span>
                </Badge>
              </div>

              {/* <ShowReasoning reasoning={post.reasoning} /> */}
            </section>

            <section className="scrollbar-thin flex-3 space-y-2 overflow-auto">
              <Link href={post.url} target="_blank" className="block w-fit pr-5 text-xl font-bold underline">
                {post.title}
              </Link>
              <p className="pr-5 whitespace-pre-wrap">{post.body}</p>
            </section>

            <hr />

            <div className="from-primary to-secondary flex items-center gap-1 bg-gradient-to-r bg-clip-text text-transparent">
              <SparkleIcon className="text-primary" size={18} />
              <h2 className="text-xl font-bold">Insights</h2>
            </div>
            <section className="scrollbar-thin flex-1 overflow-auto pr-5">
              <p>{post.explanation}</p>
            </section>
          </div>

          <div className="border-accent flex h-full max-w-[30%] min-w-[30%] flex-col space-y-2 border-l">
            <div className="ml-3 flex items-center justify-end gap-2 text-sm">
              <p>Status:</p>
              <StatusSelectButton value={post.boardColumnId} onChange={(status) => onStatusChange(status)} />
            </div>

            <h2 className="ml-3 font-bold">Top Comments</h2>

            <div className="scrollbar-thin flex-1 space-y-2 overflow-auto px-3">
              {comments.length < 1 && <p className="mt-2 text-center text-sm italic">No comments</p>}
              {comments.map((comment, index) => {
                const isRecommendedReply = !!recommendedReplyObject && index === indexOfReply;

                return (
                  <div
                    key={comment.author + index}
                    className={cn(
                      "bg-card relative block max-w-full cursor-default space-y-2 rounded-md border p-2.5 text-sm shadow-xs",
                      isRecommendedReply && "border-primary mt-4 cursor-pointer",
                      isRecommendedReply && indexOfReply !== 0 && "ml-5",
                    )}
                    onClick={() => handleCopy(comment, index)}
                  >
                    {isRecommendedReply && (
                      <Badge variant="default" className="absolute -top-3 right-2">
                        Recommended Reply
                      </Badge>
                    )}

                    {isRecommendedReply ? (
                      <p>{comment.body}</p>
                    ) : (
                      <ReadMoreArea lettersLimit={100} className="wrap-anywhere">
                        {comment.body}
                      </ReadMoreArea>
                    )}

                    <div className="flex items-end justify-between">
                      <p className="italic">-{comment.author}</p>

                      {isRecommendedReply && (
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger>
                              <Link href={post.url} target="_blank">
                                <LinkIcon
                                  className="cursor-pointer"
                                  size={14}
                                  onClick={() => handleCopy(comment, index)}
                                />
                              </Link>
                              <TooltipContent>Click to go to post</TooltipContent>
                            </TooltipTrigger>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <CopyIcon
                                className="cursor-pointer"
                                size={14}
                                onClick={() => handleCopy(comment, index)}
                              />
                              <TooltipContent>Click to copy to clipboard</TooltipContent>
                            </TooltipTrigger>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(PopUpContent);
