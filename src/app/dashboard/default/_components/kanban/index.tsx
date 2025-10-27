"use client";

import { memo } from "react";

import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";

import { Badge } from "@/components/ui/badge";
import { PostType } from "@/types/posts";

import KanbanCard from "./kanban-card";
import useKanbanData from "./use-kanban-data";

const COLUMN_IDS = ["leads", "inProgress", "done"];

function Kanban() {
  const { data, getAllPostsFromColumnId, handleOnDragEnd } = useKanbanData();

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="grid min-w-[800px] auto-rows-fr grid-cols-3 gap-4">
        {COLUMN_IDS.map((columnId) => (
          <Droppable key={columnId} droppableId={columnId}>
            {(provided) => (
              <div className="bg-card flex flex-col gap-2.5 rounded-md border p-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{data.columns[columnId].title}</span>
                    <Badge variant="secondary">{data.columns[columnId].postIds.length}</Badge>
                  </div>
                </div>
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px] flex-1 space-y-2.5">
                  <MemoizedInnerList posts={getAllPostsFromColumnId(columnId)} />
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

interface InnerListPropInterface {
  posts: PostType[];
}

function InnerList(props: InnerListPropInterface) {
  const { posts } = props;

  return (
    <>
      {posts.map((post, index) => (
        <Draggable key={post.id} draggableId={post.id} index={index}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <KanbanCard post={post} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
}

const MemoizedInnerList = memo(InnerList);

export default Kanban;
