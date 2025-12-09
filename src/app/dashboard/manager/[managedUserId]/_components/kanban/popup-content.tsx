import { memo, useCallback } from "react";

import Link from "next/link";

import { CheckCircleIcon, SparkleIcon } from "lucide-react";
import { useWindowSize } from "react-use";
import { siReddit } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useManagedUser from "@/hooks/use-managed-user";
import { formatISODate } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";

import CommentSection from "./comment-section";
import { ChangeColumnInterface } from "./use-kanban-data";

interface PropsInterface {
  managedUserId: string;
  handleChangeStatus: (change: ChangeColumnInterface) => Promise<void>;
  updateSinglePost: (postId: string, newData: any) => void;
}

function PopUpContent(props: PropsInterface) {
  const { managedUserId, handleChangeStatus, updateSinglePost } = props;

  const { managedUserData: userData } = useManagedUser(managedUserId);
  const isOpen = useKanbanStore((state) => state.isOpen);
  const post = useKanbanStore((state) => state.activePost);
  const index = useKanbanStore((state) => state.activePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const { height } = useWindowSize();

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
            </section>

            <section className="scrollbar-thin flex-2 space-y-2 overflow-auto">
              <Link href={post.url} target="_blank" className="block w-fit pr-5 text-xl font-bold underline">
                {post.title}
              </Link>
              <p className="pr-5 whitespace-pre-wrap">{post.body}</p>
            </section>

            <hr />

            <div className="from-primary to-secondary flex items-center gap-1 bg-linear-to-r bg-clip-text text-transparent">
              <SparkleIcon className="text-primary" size={18} />
              <h2 className="text-xl font-bold">Insights</h2>
            </div>
            <section className="scrollbar-thin flex-1 overflow-auto pr-5">
              <p>{post.explanation}</p>
            </section>
          </div>

          <CommentSection
            managedUserId={managedUserId}
            postId={post.id}
            recommendedReply={post.recommendedReply}
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
