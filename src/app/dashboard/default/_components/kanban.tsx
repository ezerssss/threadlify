"use client";

import * as React from "react";
import { useState } from "react";

import { arrayMove } from "@dnd-kit/sortable";
import { generateKeyBetween } from "fractional-indexing";
import { siReddit } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanMoveEvent,
  KanbanOverlay,
} from "@/components/ui/kanban";
import { formatISODate } from "@/lib/utils";
import { PostType } from "@/types/posts";

import { mockPosts } from "./data";

const COLUMN_TITLES: Record<string, string> = {
  leads: "Leads",
  inProgress: "In Progress",
  done: "Done",
};

interface PostCardProps extends Omit<React.ComponentProps<typeof KanbanItem>, "value" | "children"> {
  post: PostType;
  asHandle?: boolean;
}

function PostCard({ post, asHandle, ...props }: PostCardProps) {
  const notHighPriorityBadgeColor = post.priority === "medium" ? "default" : "secondary";
  const badgeColor = post.priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  const cardContent = (
    <div className="bg-card touch-none rounded-md border p-3 shadow-xs">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-2 text-sm font-medium">{post.title}</span>
          <Badge
            variant={badgeColor}
            className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[11px] capitalize"
          >
            {post.priority}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <SimpleIcon icon={siReddit} className="size-4" />
            <span className="line-clamp-1">{post.author}</span>
          </div>
          {post.postCreatedAt && (
            <time className="text-[10px] whitespace-nowrap">{formatISODate(post.postCreatedAt)}</time>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <KanbanItem value={post.id} {...props}>
      {asHandle ? <KanbanItemHandle>{cardContent}</KanbanItemHandle> : cardContent}
    </KanbanItem>
  );
}

interface PostColumnProps extends Omit<React.ComponentProps<typeof KanbanColumn>, "children"> {
  posts: PostType[];
  isOverlay?: boolean;
}

function TaskColumn({ value, posts, isOverlay, ...props }: PostColumnProps) {
  return (
    <KanbanColumn
      value={value}
      {...props}
      className="bg-card scrollbar-thin max-h-[1000px] overflow-auto rounded-md border p-2.5 shadow-xs"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold">{COLUMN_TITLES[value]}</span>
          <Badge variant="secondary">{posts.length}</Badge>
        </div>
      </div>
      <KanbanColumnContent value={value} className="flex flex-col gap-2.5 p-0.5">
        {posts.map((posts) => (
          <PostCard key={posts.id} post={posts} asHandle={!isOverlay} />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export default function Component() {
  const [columns, setColumns] = useState<Record<string, PostType[]>>({
    leads: mockPosts.toSorted((a, b) => a.columnRank.localeCompare(b.columnRank)),
    inProgress: [],
    done: [],
  });

  // eslint-disable-next-line complexity
  function handleMove(move: KanbanMoveEvent) {
    const { activeContainer, activeIndex, overContainer, overIndex } = move;

    const overColumn = columns[overContainer];

    // Check if reordering in the same column
    if (activeContainer && overContainer && activeContainer === overContainer && activeIndex !== overIndex) {
      const container = activeContainer;
      const post = columns[activeContainer][activeIndex];

      const isItemGoingDown = activeIndex < overIndex;

      const beforeOffset = isItemGoingDown ? 0 : -1;
      const afterOffset = isItemGoingDown ? 1 : 0;

      const before: string | null = overIndex === 0 ? null : overColumn[overIndex + beforeOffset].columnRank;
      const after: string | null =
        overIndex + 1 >= overColumn.length ? null : overColumn[overIndex + afterOffset].columnRank;

      const newRank = generateKeyBetween(before, after);
      post.columnRank = newRank;

      setColumns({
        ...columns,
        [container]: arrayMove(columns[container], activeIndex, overIndex),
      });
    } // Else reordering is happening on another column from original column
    else if (activeContainer && overContainer && activeContainer !== overContainer) {
      const activeItems = columns[activeContainer];
      const overItems = columns[overContainer];

      const newOverItems = [...overItems];
      const [movedItem] = activeItems.splice(activeIndex, 1);

      const before: string | null = overIndex === 0 ? null : overColumn[overIndex - 1].columnRank;
      const after: string | null = overIndex === overColumn.length ? null : overColumn[overIndex].columnRank;

      const newRank = generateKeyBetween(before, after);
      movedItem.columnRank = newRank;

      newOverItems.splice(overIndex, 0, movedItem);

      setColumns({
        ...columns,
        [activeContainer]: [...activeItems],
        [overContainer]: newOverItems,
      });
    }
  }

  return (
    <Kanban
      className="min-w-[800px]"
      value={columns}
      onValueChange={setColumns}
      getItemValue={(item) => item.id}
      onMove={handleMove}
    >
      <KanbanBoard className="grid auto-rows-fr grid-cols-3">
        {Object.entries(columns).map(([columnValue, tasks]) => (
          <TaskColumn key={columnValue} value={columnValue} posts={tasks} />
        ))}
      </KanbanBoard>
      <KanbanOverlay>
        {({ value }) => {
          const post = Object.values(columns)
            .flat()
            .find((post) => post.id === value);

          if (!post) return null;

          return <PostCard post={post} />;
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
