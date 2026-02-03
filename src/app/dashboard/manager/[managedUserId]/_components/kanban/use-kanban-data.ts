import { DropResult } from "@hello-pangea/dnd";
import { arrayMoveImmutable } from "array-move";
import { collection, doc, getDoc, getDocs, onSnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { generateKeyBetween } from "fractional-indexing";
import ky from "ky";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { KANBAN_CHANGE_URL, KANBAN_PRUNE_URL, KANBAN_TRASH_URL } from "@/constants/url";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useManagedUser from "@/hooks/use-managed-user";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";
import { KanbanChangeRequestType } from "@/types/kanban";
import { PostType } from "@/types/post";

import { ActionFilter, FilterState, PriorityFilter, ReadStatusFilter } from "./filter-by";
import { SortState } from "./sort-by";

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
    new: {
      id: "new",
      title: "New",
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

export interface SortByInterface {
  new: SortState;
  inProgress: SortState;
  done: SortState;
}

const defaultSortState: SortByInterface = {
  new: {
    field: "priority",
    direction: "desc",
  },
  inProgress: {
    field: "none",
    direction: "desc",
  },
  done: {
    field: "none",
    direction: "desc",
  },
};

export interface FilterByInterface {
  new: FilterState;
  inProgress: FilterState;
  done: FilterState;
}

const defaultFilterState: FilterByInterface = {
  new: {
    priority: ["high", "medium", "low"],
    action: ["engage", "listen"],
    seenStatus: ["read", "unread"],
  },
  inProgress: {
    priority: ["high", "medium", "low"],
    action: ["engage", "listen"],
    seenStatus: ["read", "unread"],
  },
  done: {
    priority: ["high", "medium", "low"],
    action: ["engage", "listen"],
    seenStatus: ["read", "unread"],
  },
};

const actionRank: Record<string, number> = {
  engage: 2,
  listen: 1,
};

export interface ChangeColumnInterface {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
}

function useKanbanData(managedUserId: string) {
  const { idToken } = useUser();
  const { managedUserData: userData } = useManagedUser(managedUserId);
  const [sortBy, setSortBy] = useState<SortByInterface>(defaultSortState);
  const [filterBy, setFilterBy] = useState<FilterByInterface>(defaultFilterState);
  const [isLoading, setIsLoading] = useState(true);
  const [isPruningInProgress, setIsPruningInProgress] = useState(false);
  const [data, setData] = useState<KanbanDataInterface>({ ...defaultData });
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);
  const setFeedbackSheetPostId = useKanbanStore((state) => state.setFeedbackSheetPostId);

  // Haha any
  function updateSinglePost(postId: string, newData: any) {
    setData((prev) => ({
      ...prev,
      posts: {
        ...prev.posts,
        [postId]: {
          ...prev.posts[postId],
          ...newData,
        },
      },
    }));
  }

  function sortPosts(posts: PostType[], field: string, direction: string): PostType[] {
    const sortedPosts: PostType[] = [...posts];

    switch (field) {
      case "none":
        sortedPosts.sort((a, b) => (a.columnRank < b.columnRank ? -1 : 1));

        break;

      case "priority": {
        const getFinalScore = (p: PostType) => p.priorityDetails?.finalScore ?? -1;
        sortedPosts.sort((a, b) => {
          const scoreA = getFinalScore(a);
          const scoreB = getFinalScore(b);

          if (scoreA !== scoreB) {
            return direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
          }

          // Tiebreaker: action, then date
          if (actionRank[a.action] !== actionRank[b.action]) {
            const aAction = actionRank[a.action.toLowerCase()];
            const bAction = actionRank[b.action.toLowerCase()];
            return direction === "asc" ? aAction - bAction : bAction - aAction;
          }

          const A1 = a.postCreatedAt;
          const B1 = b.postCreatedAt;
          return direction === "asc" ? A1.localeCompare(B1) : B1.localeCompare(A1);
        });
        break;
      }

      case "date":
        sortedPosts.sort((a, b) => {
          const A = a.postCreatedAt;
          const B = b.postCreatedAt;

          return direction === "asc" ? A.localeCompare(B) : B.localeCompare(A);
        });
    }

    return sortedPosts;
  }

  function handleSortChange(columnId: keyof SortByInterface, value: SortState) {
    setSortBy((prev) => ({
      ...prev,
      [columnId]: value,
    }));

    const posts = getAllPostsFromColumnId(columnId);
    const sortedPosts = sortPosts(posts, value.field, value.direction);
    const sortedPostIds = sortedPosts.map((post) => post.id);

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          postIds: sortedPostIds,
        },
      },
    }));
  }

  function filterPosts(
    posts: PostType[],
    priorityFilter: PriorityFilter[],
    actionFilter: ActionFilter[],
    seenStatusFilter: ReadStatusFilter[],
  ) {
    return posts
      .filter((post) => priorityFilter.includes(post.priority as PriorityFilter))
      .filter((post) => actionFilter.includes(post.action as ActionFilter))
      .filter((post) => {
        const isSeen = post.isSeen;
        return (isSeen && seenStatusFilter.includes("read")) || (!isSeen && seenStatusFilter.includes("unread"));
      });
  }

  function handleFilterChange(columnId: keyof SortByInterface, value: FilterState) {
    setFilterBy((prev) => ({
      ...prev,
      [columnId]: value,
    }));

    const posts = [];

    for (const id in data.posts) {
      const post = data.posts[id];

      if (post.boardColumnId === columnId) posts.push(post);
    }

    const sortState = sortBy[columnId];
    const sortedPosts = sortPosts(posts, sortState.field, sortState.direction);
    const filteredPosts = filterPosts(sortedPosts, value.priority, value.action, value.seenStatus);
    const filteredPostIds = filteredPosts.map((post) => post.id);

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          postIds: filteredPostIds,
        },
      },
    }));
  }

  function getAllPostsFromColumnId(columnId: string): PostType[] {
    const postIds = data.columns[columnId].postIds;
    const posts: PostType[] = postIds.map((id) => data.posts[id]);
    return posts;
  }

  // Initial load - fetch first page for each column
  useEffect(() => {
    if (!managedUserId || !userData?.id) {
      return;
    }

    (async () => {
      try {
        setIsLoading(true);

        const userDocRef = doc(USERS_COLLECTION_REF, managedUserId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          return;
        }

        const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);

        // Fetch initial data for all columns
        const newPosts: Record<string, PostType> = {};
        const newColumnsData: Record<string, KanbanColumnInterface> = {
          new: { id: "new", title: "New", postIds: [] },
          inProgress: { id: "inProgress", title: "In Progress", postIds: [] },
          done: { id: "done", title: "Done", postIds: [] },
        };

        for (const columnId of ["new", "inProgress", "done"]) {
          const postQuery = query(
            postsCollectionRef,
            where("isHidden", "==", false),
            where("boardColumnId", "==", columnId),
            where("recommendedReply.reply", "!=", null),
          );

          const snapshot = await getDocs(postQuery);
          const posts: PostType[] = [];

          snapshot.docs.forEach((doc) => {
            const post = doc.data() as PostType;
            posts.push(post);
            newPosts[post.id] = post;
          });

          const sortState = defaultSortState[columnId as keyof SortByInterface];
          const sortedPosts = sortPosts(posts, sortState.field, sortState.direction);

          const filterState = defaultFilterState[columnId as keyof FilterByInterface];
          const filteredPosts = filterPosts(
            sortedPosts,
            filterState.priority,
            filterState.action,
            filterState.seenStatus,
          );

          const sortedAndFilteredPostIds: string[] = filteredPosts.map((post) => post.id);
          newColumnsData[columnId].postIds = sortedAndFilteredPostIds;
        }

        setData({
          posts: newPosts,
          columns: newColumnsData,
        });
      } catch (error) {
        toastError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [managedUserId, userData?.id]);

  // Listener for new posts in "new" column only (real-time updates)
  useEffect(() => {
    if (!managedUserId || !userData?.id) {
      return;
    }

    let unsub: Unsubscribe;
    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, managedUserId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return;
      }

      // Get posts that are new
      const date = new Date();

      const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);
      // Only listen to first page to avoid loading entire column
      const postQuery = query(
        postsCollectionRef,
        where("isHidden", "==", false),
        where("boardColumnId", "==", "new"),
        where("recommendedReply.reply", "!=", null),
        where("createdAt", ">", date.toISOString()),
      );

      unsub = onSnapshot(postQuery, (snapshot) => {
        const posts = snapshot.docs.map((doc) => doc.data() as PostType);

        const newPosts: Record<string, PostType> = {};
        const newPostIds: string[] = [];

        for (const post of posts) {
          newPosts[post.id] = post;
          newPostIds.push(post.id);
        }

        setData((prev) => {
          const mergedPosts = { ...prev.posts, ...newPosts };

          // Keep existing posts from pagination
          const existingPostIds = prev.columns.new.postIds;
          const mergedPostIds = [...newPostIds];

          // Add remaining posts that aren't in the new snapshot
          existingPostIds.forEach((id) => {
            if (!newPostIds.includes(id)) {
              mergedPostIds.push(id);
            }
          });

          const mergedNewPosts: PostType[] = mergedPostIds.map((postId) => mergedPosts[postId]);
          const sortedNewPosts: PostType[] = sortPosts(mergedNewPosts, sortBy.new.field, sortBy.new.direction);

          const filteredNewPosts = filterPosts(
            sortedNewPosts,
            filterBy.new.priority,
            filterBy.new.action,
            filterBy.new.seenStatus,
          );

          const sortedAndFilteredNewPostIds: string[] = filteredNewPosts.map((post) => post.id);

          return {
            posts: mergedPosts,
            columns: {
              ...prev.columns,
              new: {
                ...prev.columns.new,
                postIds: sortedAndFilteredNewPostIds,
              },
            },
          };
        });
      });
    })();

    return () => unsub();
  }, [managedUserId, userData?.id, sortBy.new.field, sortBy.new.direction]);

  // Listener for posts that become isHidden: true in "new" column (filter them from state)
  useEffect(() => {
    if (!managedUserId || !userData?.id) {
      return;
    }

    let unsubHidden: Unsubscribe;
    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, managedUserId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return;
      }

      const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);
      const hiddenInNewQuery = query(
        postsCollectionRef,
        where("isHidden", "==", true),
        where("boardColumnId", "==", "new"),
      );

      unsubHidden = onSnapshot(hiddenInNewQuery, (snapshot) => {
        const hiddenPostIds = snapshot.docs.map((d) => d.id);
        if (hiddenPostIds.length === 0) return;

        setData((prev) => {
          const newColumnPostIds = prev.columns.new.postIds.filter((id) => !hiddenPostIds.includes(id));
          if (newColumnPostIds.length === prev.columns.new.postIds.length) return prev;

          const newPosts = { ...prev.posts };
          hiddenPostIds.forEach((id) => delete newPosts[id]);

          return {
            ...prev,
            posts: newPosts,
            columns: {
              ...prev.columns,
              new: {
                ...prev.columns.new,
                postIds: newColumnPostIds,
              },
            },
          };
        });
      });
    })();

    return () => unsubHidden?.();
  }, [managedUserId, userData?.id]);

  async function handleMoveOnSameColumn(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (
      !idToken ||
      !destination ||
      source.droppableId !== destination.droppableId ||
      source.index === destination.index
    ) {
      return;
    }

    if (sortBy[destination.droppableId as keyof SortByInterface].field !== "none") {
      toast.info("Reordering is disabled while this column is sorted. Remove sorting to drag items.");
      return;
    }

    try {
      const postIds = data.columns[source.droppableId].postIds;
      const isItemGoingDown = source.index < destination.index;
      const beforeOffset = isItemGoingDown ? 0 : -1;
      const afterOffset = isItemGoingDown ? 1 : 0;

      let before: string | null =
        destination.index === 0 ? null : data.posts[postIds[destination.index + beforeOffset]].columnRank;
      let after: string | null =
        destination.index + 1 >= postIds.length
          ? null
          : data.posts[postIds[destination.index + afterOffset]].columnRank;

      if (before !== null && after !== null) {
        if (before === after) {
          before += "a";
        }

        if (before > after) {
          [before, after] = [after, before];
        }
      }

      const newRank = generateKeyBetween(before, after);
      const post = data.posts[draggableId];

      post.boardColumnId = destination.droppableId;
      post.columnRank = newRank;

      const newArray = arrayMoveImmutable(postIds, source.index, destination.index);
      setData((prev) => ({
        posts: { ...prev.posts, [post.id]: post },
        columns: {
          ...prev.columns,
          [source.droppableId]: {
            ...prev.columns[source.droppableId],
            postIds: newArray,
          },
        },
      }));

      const kanbanChangeRequest: KanbanChangeRequestType = {
        id: post.id,
        boardColumnId: post.boardColumnId,
        columnRank: post.columnRank,
      };

      ky.post(KANBAN_CHANGE_URL, {
        json: { ...kanbanChangeRequest, managedUserId },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
    }
  }

  async function handleMoveOnDifferentColumn(result: ChangeColumnInterface) {
    const { source, destination, draggableId } = result;

    if (!idToken || source.droppableId === destination.droppableId) {
      return;
    }

    try {
      const sourcePostIds = [...data.columns[source.droppableId].postIds];
      let sourceIndex = source.index;
      const foundSourceIndex = sourcePostIds.findIndex((postId) => postId === draggableId);

      if (sourceIndex !== foundSourceIndex) {
        console.log("Source index mismatch! Changing to found source index.");
        sourceIndex = foundSourceIndex;
      }

      const destinationPostIds = [...data.columns[destination.droppableId].postIds];

      const [movedPostId] = sourcePostIds.splice(sourceIndex, 1);

      let destinationIndex = destination.index;

      const sortState = sortBy[destination.droppableId as keyof SortByInterface];
      if (sortState.field !== "none") {
        const mergedIds: string[] = [...destinationPostIds, movedPostId];
        const posts: PostType[] = mergedIds.map((id) => data.posts[id]);
        const sortedPosts: PostType[] = sortPosts(posts, sortState.field, sortState.direction);

        destinationIndex = sortedPosts.findIndex((post) => post.id === draggableId);

        if (destinationIndex === -1) {
          destinationIndex = destinationPostIds.length;
        }
      }

      let before: string | null =
        destinationIndex === 0 ? null : data.posts[destinationPostIds[destinationIndex - 1]].columnRank;
      let after: string | null =
        destinationIndex === destinationPostIds.length
          ? null
          : data.posts[destinationPostIds[destinationIndex]].columnRank;

      if (before !== null && after !== null) {
        if (before === after) {
          before += "a";
        }

        if (before > after) {
          [before, after] = [after, before];
        }
      }

      const newRank = generateKeyBetween(before, after);
      const post = data.posts[draggableId];

      post.boardColumnId = destination.droppableId;
      post.columnRank = newRank;

      destinationPostIds.splice(destinationIndex, 0, movedPostId);

      setData((prev) => ({
        posts: { ...prev.posts, [post.id]: post },
        columns: {
          ...prev.columns,
          [source.droppableId]: {
            ...prev.columns[source.droppableId],
            postIds: sourcePostIds,
          },
          [destination.droppableId]: {
            ...prev.columns[destination.droppableId],
            postIds: destinationPostIds,
          },
        },
      }));

      setActivePost(post);
      setActivePostIndex(destinationIndex);

      const kanbanChangeRequest: KanbanChangeRequestType = {
        id: post.id,
        boardColumnId: post.boardColumnId,
        columnRank: post.columnRank,
      };

      ky.post(KANBAN_CHANGE_URL, {
        json: { ...kanbanChangeRequest, managedUserId },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
    }
  }

  function removePostFromKanban(postId: string) {
    setData((prev) => {
      const post = prev.posts[postId];
      if (!post) {
        return prev;
      }

      const sourceColumnId = post.boardColumnId;
      const sourcePostIds = [...prev.columns[sourceColumnId].postIds];
      const sourceIndex = sourcePostIds.findIndex((id) => id === postId);

      if (sourceIndex === -1) {
        return prev;
      }

      sourcePostIds.splice(sourceIndex, 1);

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [sourceColumnId]: {
            ...prev.columns[sourceColumnId],
            postIds: sourcePostIds,
          },
        },
      };
    });
  }

  async function handleTrashDrop(postId: string) {
    if (!idToken) {
      return;
    }

    try {
      removePostFromKanban(postId);

      // Call backend to train the server
      await ky.post(KANBAN_TRASH_URL, {
        json: { id: postId, managedUserId },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
      // Revert the local state change on error
      // Note: In a production app, you might want to restore the post to its original position
    }
  }

  async function triggerPrune() {
    if (!idToken || isPruningInProgress) {
      return;
    }
    try {
      setIsPruningInProgress(true);
      await ky.post(KANBAN_PRUNE_URL, {
        json: { managedUserId },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success("Rechecking new posts for relevance…");
    } catch (error) {
      toastError(error);
    } finally {
      setIsPruningInProgress(false);
    }
  }

  function handleNotRelevantFeedbackSuccess(postId: string) {
    removePostFromKanban(postId);
    const activePost = useKanbanStore.getState().activePost;
    if (activePost?.id === postId) {
      setIsOpen(false);
      setActivePost(null);
      setActivePostIndex(null);
    }
  }

  function handleOnDragEnd(result: DropResult) {
    const { source, destination } = result;

    // If no destination, drag was cancelled - just return
    if (!destination) {
      return;
    }

    // Check if dropped in trash
    if (destination.droppableId === "trash") {
      const post = data.posts[result.draggableId];
      if (post?.priority === "high") {
        setFeedbackSheetPostId(result.draggableId, true);
        return;
      }
      handleTrashDrop(result.draggableId);
      return;
    }

    // Check if dropped in feedback zone
    if (destination.droppableId === "feedback") {
      setFeedbackSheetPostId(result.draggableId, false);
      return;
    }

    if (source.droppableId === destination.droppableId) {
      handleMoveOnSameColumn(result);
      return;
    }

    handleMoveOnDifferentColumn({ source, destination, draggableId: result.draggableId });
  }

  return {
    data,
    getAllPostsFromColumnId,
    handleOnDragEnd,
    isLoading,
    isPruningInProgress,
    isProgressActive: !!userData?.processStatus && Object.keys(userData.processStatus).length > 0,
    isEligibleForPrune: !userData?.lastPruneDate || userData.lastPruneDate < userData.updatedAt,
    triggerPrune,
    sortBy,
    handleSortChange,
    handleMoveOnDifferentColumn,
    filterBy,
    handleFilterChange,
    updateSinglePost,
    handleTrashDrop,
    handleNotRelevantFeedbackSuccess,
  };
}

export default useKanbanData;
