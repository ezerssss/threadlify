import { useState, useEffect } from "react";

import { DropResult } from "@hello-pangea/dnd";
import { arrayMoveImmutable } from "array-move";
import { generateKeyBetween } from "fractional-indexing";

import { PostType } from "@/types/posts";

import { mockPosts } from "./data";

interface KanbanColumnInterface {
  id: string;
  title: string;
  postIds: string[];
}

interface KanbanDataInterface {
  posts: Record<string, PostType>;
  columns: Record<string, KanbanColumnInterface>;
}

const defaultData: KanbanDataInterface = {
  posts: {},
  columns: {
    leads: {
      id: "leads",
      title: "Leads",
      postIds: [],
    },
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      postIds: [],
    },
    done: {
      id: "done",
      title: "Done",
      postIds: [],
    },
  },
};
function useKanbanData() {
  const [data, setData] = useState<KanbanDataInterface>({ ...defaultData });

  function getAllPostsFromColumnId(columnId: string): PostType[] {
    const postIds = data.columns[columnId].postIds;
    const posts: PostType[] = postIds.map((id) => data.posts[id]);

    return posts;
  }

  useEffect(() => {
    // Fetch data here already sorted by columnRank
    const newPosts: Record<string, PostType> = {};
    const newColumnsData: Record<string, KanbanColumnInterface> = {
      leads: {
        id: "leads",
        title: "Leads",
        postIds: [],
      },
      inProgress: {
        id: "inProgress",
        title: "In Progress",
        postIds: [],
      },
      done: {
        id: "done",
        title: "Done",
        postIds: [],
      },
    };

    for (const post of mockPosts) {
      const { id, boardColumnId } = post;
      newPosts[id] = post;
      newColumnsData[boardColumnId].postIds.push(id);
    }

    setData({
      posts: newPosts,
      columns: newColumnsData,
    });
  }, []);

  function handleMoveOnSameColumn(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination || source.droppableId !== destination.droppableId || source.index === destination.index) {
      return;
    }

    const postIds = data.columns[source.droppableId].postIds;

    const isItemGoingDown = source.index < destination.index;

    const beforeOffset = isItemGoingDown ? 0 : -1;
    const afterOffset = isItemGoingDown ? 1 : 0;

    const before: string | null =
      destination.index === 0 ? null : data.posts[postIds[destination.index + beforeOffset]].columnRank;
    const after: string | null =
      destination.index + 1 >= postIds.length ? null : data.posts[postIds[destination.index + afterOffset]].columnRank;

    const newRank = generateKeyBetween(before, after);
    const post = data.posts[draggableId];
    // Update db to reflect new rank
    post.columnRank = newRank;

    const newArray = arrayMoveImmutable(postIds, source.index, destination.index);
    setData((prev) => ({
      posts: prev.posts,
      columns: {
        ...prev.columns,
        [source.droppableId]: {
          ...prev.columns[source.droppableId],
          postIds: newArray,
        },
      },
    }));
  }

  function handleMoveOnDifferentColumn(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    const sourcePostIds = data.columns[source.droppableId].postIds;
    const destinationPostIds = data.columns[destination.droppableId].postIds;

    const newDestinationPostIds = [...destinationPostIds];
    const [movedPostId] = sourcePostIds.splice(source.index, 1);

    const before: string | null =
      destination.index === 0 ? null : data.posts[destinationPostIds[destination.index - 1]].columnRank;
    const after: string | null =
      destination.index === destinationPostIds.length
        ? null
        : data.posts[destinationPostIds[destination.index]].columnRank;

    const newRank = generateKeyBetween(before, after);
    const post = data.posts[draggableId];
    // Update db to reflect new rank
    post.columnRank = newRank;

    newDestinationPostIds.splice(destination.index, 0, movedPostId);

    setData((prev) => ({
      posts: prev.posts,
      columns: {
        ...prev.columns,
        [source.droppableId]: {
          ...prev.columns[source.droppableId],
          postIds: [...sourcePostIds],
        },
        [destination.droppableId]: {
          ...prev.columns[destination.droppableId],
          postIds: newDestinationPostIds,
        },
      },
    }));
  }

  function handleOnDragEnd(result: DropResult) {
    const { source, destination } = result;
    console.log(result);

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      handleMoveOnSameColumn(result);
      return;
    }

    handleMoveOnDifferentColumn(result);
  }

  return { data, getAllPostsFromColumnId, handleOnDragEnd };
}

export default useKanbanData;
