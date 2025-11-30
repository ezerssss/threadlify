import { memo, useCallback } from "react";

import { CheckCircleIcon } from "lucide-react";
import { siReddit } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { formatISODate } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";
import { PostType } from "@/types/post";

interface PropsInteface {
  post: PostType;
  index: number;
}

function KanbanCard(props: PropsInteface) {
  const { post, index } = props;
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);

  const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  const handleClick = useCallback(() => {
    setActivePost(post);
    setActivePostIndex(index);
    setIsOpen(true);
  }, []);

  return (
    <div className="bg-card cursor-grab rounded-md border p-2.5 shadow-xs" onClick={handleClick}>
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <SimpleIcon icon={siReddit} className="size-4" />
            <span>{post.platform}</span>
          </div>
          {post.postCreatedAt && (
            <time className="text-[10px] whitespace-nowrap">{formatISODate(post.postCreatedAt)}</time>
          )}
        </div>

        <span className="line-clamp-2 text-sm font-medium">&quot;{post.title}&quot;</span>

        <Badge variant="outline" className="h-5 shrink-0 gap-1 rounded-sm px-1.5 text-xs text-[11px]">
          <CheckCircleIcon size={12} /> <span>{post.signalType}</span>
        </Badge>

        <div className="flex items-end gap-1">
          <Badge variant={badgeColor} className="h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize">
            {post.priority}
          </Badge>

          <Badge variant="secondary" className="h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize">
            {post.action}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default memo(KanbanCard);
