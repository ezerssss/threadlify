"use client";

import { memo, useRef, useState } from "react";

import { DragDropContext, Draggable, Droppable, DragStart } from "@hello-pangea/dnd";

import { Badge } from "@/components/ui/badge";
import useManagedUser from "@/hooks/use-managed-user";
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

interface PropsInterface {
  managedUserId: string;
}

function Kanban(props: PropsInterface) {
  const { managedUserId } = props;

  const { managedUserData: userData } = useManagedUser(managedUserId);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef(false);
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
    handleTrashDrop,
  } = useKanbanData(managedUserId);

  if (!userData) {
    return null;
  }

  const isKanbanEmpty = Object.keys(data.posts).length < 1;

  function handleOnDragStart(start: DragStart) {
    dragStateRef.current = true;
    setIsDragging(true);
  }

  function handleOnDragEndWrapper(result: any) {
    // Use setTimeout to ensure drag library cleanup completes first
    setTimeout(() => {
      dragStateRef.current = false;
      setIsDragging(false);
    }, 0);
    handleOnDragEnd(result);
  }

  return (
    <>
      <div className="relative">
        {!isLoading && isKanbanEmpty && <EmptyKanban />}

        {!isLoading && !isKanbanEmpty && (
          <DragDropContext onDragStart={handleOnDragStart} onDragEnd={handleOnDragEndWrapper}>
            <div className="relative">
              <Droppable droppableId="trash">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "fixed top-4 right-4 z-50 transform transition-all duration-200",
                      isDragging
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0",
                      snapshot.isDraggingOver && "scale-110",
                    )}
                  >
                    <div
                      className={cn(
                        "flex min-w-[140px] flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 shadow-lg transition-colors",
                        snapshot.isDraggingOver
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn(
                          "h-10 w-10 transition-colors",
                          snapshot.isDraggingOver ? "text-red-500" : "text-gray-400",
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <div className="text-center">
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            snapshot.isDraggingOver
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400",
                          )}
                        >
                          Drop to remove
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500">Not relevant</p>
                      </div>
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
            </div>
          </DragDropContext>
        )}
      </div>
      <PopUpContent
        managedUserId={managedUserId}
        handleChangeStatus={handleMoveOnDifferentColumn}
        updateSinglePost={updateSinglePost}
        handleTrashDrop={handleTrashDrop}
      />
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
