import ky from "ky";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  SparkleIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useWindowSize } from "react-use";
import { siReddit } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { POST_SEEN_URL } from "@/constants/url";
import useManagedUser from "@/hooks/use-managed-user";
import useUser from "@/hooks/use-user";
import { formatISODate } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";

import CommentSection from "./comment-section";
import { ChangeColumnInterface } from "./use-kanban-data";

interface PropsInterface {
  managedUserId: string;
  handleChangeStatus: (change: ChangeColumnInterface) => Promise<void>;
  updateSinglePost: (postId: string, newData: any) => void;
  handleTrashDrop: (postId: string) => Promise<void>;
}

function PopUpContent(props: PropsInterface) {
  const { managedUserId, handleChangeStatus, updateSinglePost, handleTrashDrop } = props;

  const { managedUserData: userData } = useManagedUser(managedUserId);
  const { idToken } = useUser();
  const [isTrashing, setIsTrashing] = useState(false);
  const isOpen = useKanbanStore((state) => state.isOpen);
  const post = useKanbanStore((state) => state.activePost);
  const index = useKanbanStore((state) => state.activePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const setFeedbackSheetPostId = useKanbanStore((state) => state.setFeedbackSheetPostId);
  const { height } = useWindowSize();

  // Mark post as seen when opened
  useEffect(() => {
    if (!isOpen || !post || !idToken || post.isSeen) {
      return;
    }

    (async () => {
      try {
        await ky.post(POST_SEEN_URL, {
          json: { id: post.id, managedUserId },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Update local data
        updateSinglePost(post.id, { isSeen: true });
        setActivePost({ ...post, isSeen: true });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error("Failed to mark post as seen:", error);
      }
    })();
  }, [isOpen, post, idToken, managedUserId, updateSinglePost, setActivePost]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setActivePost(null);
        setActivePostIndex(null);
      }

      setIsOpen(open);
    },
    [setActivePost, setActivePostIndex, setIsOpen],
  );

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

  async function handleMarkAsNotRelevant() {
    if (!post || isTrashing) {
      return;
    }

    setIsTrashing(true);
    try {
      await handleTrashDrop(post.id);
      setIsOpen(false);
      setActivePost(null);
      setActivePostIndex(null);
    } finally {
      setIsTrashing(false);
    }
  }

  if (!post || !userData) {
    return null;
  }

  const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

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

            <section className="flex w-full flex-wrap items-center justify-between pr-3">
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

                <Badge className="gap-1">
                  <Link className="flex gap-1 p-0" href={post.url} target="_blank">
                    Open
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Link>
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isTrashing}
                    className="h-6 gap-1.5 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                  >
                    {isTrashing ? (
                      <>
                        <Spinner className="h-3! w-3!" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2Icon className="h-3! w-3!" />
                        Not relevant
                        <ChevronDownIcon className="h-3! w-3!" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={handleMarkAsNotRelevant}
                    className="gap-2 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/20 dark:focus:text-red-400"
                  >
                    <Trash2Icon className="h-4 w-4 shrink-0" />
                    <div className="text-left">
                      <p className="font-medium">Dismiss</p>
                      <p className="text-muted-foreground text-[10px]">Not for me, remove immediately</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFeedbackSheetPostId(post.id)} className="gap-2">
                    <MessageCircleIcon className="h-4 w-4 shrink-0 text-amber-500" />
                    <div className="text-left">
                      <p className="font-medium">Give feedback</p>
                      <p className="text-muted-foreground text-[10px]">Close but not quite, tell us why</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </section>

            <section className="scrollbar-thin flex-2 space-y-2 overflow-auto">
              <Link href={post.url} target="_blank" className="block w-fit pr-5 text-xl font-bold underline">
                {post.title}
              </Link>
              <div className="pr-5 whitespace-pre-wrap">
                <Markdown>{post.body}</Markdown>
              </div>
            </section>

            <hr />

            <div className="from-primary to-secondary flex items-center gap-1 bg-linear-to-r bg-clip-text text-transparent">
              <SparkleIcon className="text-primary" size={18} />
              <h2 className="text-xl font-bold">Insights</h2>
            </div>
            <section className="scrollbar-thin flex-1 overflow-auto pr-5">
              <p className="whitespace-pre-wrap">{post.insights}</p>
            </section>
          </div>

          <CommentSection
            managedUserId={managedUserId}
            postId={post.id}
            recommendedReply={post.recommendedReply}
            recommendedDM={post.recommendedDM}
            comments={post.topComments}
            boardColumnId={post.boardColumnId}
            onStatusChange={onStatusChange}
            userName={userData.name}
            postUrl={post.url}
            updateSinglePost={updateSinglePost}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(PopUpContent);
