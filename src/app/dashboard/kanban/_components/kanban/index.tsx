"use client";

import { memo } from "react";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import { Badge } from "@/components/ui/badge";
import useUser from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { PostType } from "@/types/post";

import EmptyKanban from "./empty";
import { FilterButton } from "./filter-by";
import KanbanCard from "./kanban-card";
import PopUpContent from "./popup-content";
import { SortByButton } from "./sort-by";
import useKanbanData, { FilterByInterface, SortByInterface } from "./use-kanban-data";

const COLUMN_IDS = ["new", "inProgress", "done"];
const COLUMN_COLOR: Record<string, string> = { new: "bg-green-500", inProgress: "bg-yellow-500", done: "bg-gray-400" };

function Kanban() {
  const { userData } = useUser();
  const {
    data,
    getAllPostsFromColumnId,
    handleOnDragEnd,
    isLoading,
    sortBy,
    filterBy,
    handleFilterChange,
    handleSortChange,
    handleMoveOnDifferentColumn,
    updateSinglePost,
  } = useKanbanData();

  if (!userData) {
    return null;
  }

  const isKanbanEmpty = Object.keys(data.posts).length < 1;

  return (
    <>
      <div className="relative">
        {!isLoading && isKanbanEmpty && <EmptyKanban />}

        {!isLoading && !isKanbanEmpty && (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="grid h-full min-w-[800px] auto-rows-fr grid-cols-3 gap-4">
              {COLUMN_IDS.map((columnId) => (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided) => (
                    <div className="bg-card flex flex-col gap-2.5 rounded-md border p-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-full", COLUMN_COLOR[columnId])} />
                            <span className="text-sm font-semibold">{data.columns[columnId].title}</span>
                          </div>
                          <Badge variant="secondary">{data.columns[columnId].postIds.length}</Badge>
                        </div>

                        <div className="flex items-center gap-1">
                          <SortByButton
                            value={sortBy[columnId as keyof SortByInterface]}
                            disabled={isLoading}
                            onChange={(value) => handleSortChange(columnId as keyof SortByInterface, value)}
                          />
                          <FilterButton
                            value={filterBy[columnId as keyof FilterByInterface]}
                            onChange={(value) => handleFilterChange(columnId as keyof SortByInterface, value)}
                          />
                        </div>
                      </div>
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[400px] flex-1 space-y-2.5"
                      >
                        <MemoizedInnerList posts={getAllPostsFromColumnId(columnId)} columnId={columnId} />
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
      <PopUpContent handleChangeStatus={handleMoveOnDifferentColumn} updateSinglePost={updateSinglePost} />
    </>
  );
}

interface InnerListPropInterface {
  posts: PostType[];
  columnId: string;
}

function InnerList(props: InnerListPropInterface) {
  const { posts, columnId } = props;

  return (
    <>
      {posts.map((post, index) => (
        <Draggable key={post.id} draggableId={post.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(columnId === "done" && "opacity-50")}
            >
              <KanbanCard post={post} index={index} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
}

const MemoizedInnerList = memo(InnerList);

export default Kanban;
