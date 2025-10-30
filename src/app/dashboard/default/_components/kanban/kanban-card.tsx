import React, { memo } from "react";

import { CheckCircleIcon } from "lucide-react";
import { siReddit } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { formatISODate } from "@/lib/utils";
import { PostType } from "@/types/posts";

interface PropsInteface {
  post: PostType;
}

function KanbanCard(props: PropsInteface) {
  const { post } = props;

  const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  return (
    <div className="bg-card pointer-events-none cursor-grab touch-none rounded-md border p-2.5 shadow-xs">
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <SimpleIcon icon={siReddit} className="size-4" />
            <span className="line-clamp-1">{post.platform}</span>
          </div>
          {post.postCreatedAt && (
            <time className="text-[10px] whitespace-nowrap">{formatISODate(post.postCreatedAt)}</time>
          )}
        </div>

        <span className="line-clamp-2 text-sm font-medium">&quot;{post.title}&quot;</span>

        <Badge variant="outline" className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px]">
          <div className="flex items-center gap-1 text-xs">
            <CheckCircleIcon size={12} /> <span>{post.signalType}</span>
          </div>
        </Badge>

        <div className="flex items-end gap-1">
          <Badge
            variant={badgeColor}
            className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize"
          >
            {post.priority}
          </Badge>

          <Badge
            variant="secondary"
            className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize"
          >
            {post.action}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default memo(KanbanCard);
