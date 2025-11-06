/* eslint-disable max-lines */
import { useState, useEffect, useCallback } from "react";

import { DropResult } from "@hello-pangea/dnd";
import { arrayMoveImmutable } from "array-move";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { generateKeyBetween } from "fractional-indexing";
import ky from "ky";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { KANBAN_CHANGE_URL } from "@/constants/url";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { KanbanChangeRequestType } from "@/types/kanban";
import { PostType } from "@/types/post";

interface KanbanColumnInterface {
  id: string;
  title: string;
  postIds: string[];
}

interface KanbanDataInterface {
  posts: Record<string, PostType>;
  columns: Record<string, KanbanColumnInterface>;
}

interface PaginationState {
  [columnId: string]: {
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
    loading: boolean;
  };
}

const ITEMS_PER_PAGE = 100;

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

function useKanbanData() {
  const { user, idToken } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<KanbanDataInterface>({ ...defaultData });
  const [pagination, setPagination] = useState<PaginationState>({
    new: { lastDoc: null, hasMore: true, loading: false },
    inProgress: { lastDoc: null, hasMore: true, loading: false },
    done: { lastDoc: null, hasMore: true, loading: false },
  });

  function getAllPostsFromColumnId(columnId: string): PostType[] {
    const postIds = data.columns[columnId].postIds;
    const posts: PostType[] = postIds.map((id) => data.posts[id]);
    return posts;
  }

  // Initial load - fetch first page for each column
  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      try {
        setIsLoading(true);

        const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
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
        const newPagination: PaginationState = {
          new: { lastDoc: null, hasMore: true, loading: false },
          inProgress: { lastDoc: null, hasMore: true, loading: false },
          done: { lastDoc: null, hasMore: true, loading: false },
        };

        // Fetch first page for each column
        for (const columnId of ["new", "inProgress", "done"]) {
          const postQuery = query(
            postsCollectionRef,
            where("boardColumnId", "==", columnId),
            orderBy("columnRank"),
            // limit(ITEMS_PER_PAGE),
          );

          const snapshot = await getDocs(postQuery);

          snapshot.docs.forEach((doc) => {
            const post = doc.data() as PostType;
            newPosts[post.id] = post;
            newColumnsData[columnId].postIds.push(post.id);
          });

          newPagination[columnId] = {
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
            hasMore: snapshot.docs.length === ITEMS_PER_PAGE,
            loading: false,
          };
        }

        setData({
          posts: newPosts,
          columns: newColumnsData,
        });
        setPagination(newPagination);
      } catch (error) {
        toastError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  // Listener for new posts in "new" column only (real-time updates)
  useEffect(() => {
    if (!user) {
      return;
    }

    let unsub: Unsubscribe;
    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
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
        where("boardColumnId", "==", "new"),
        where("createdAt", ">", date.toISOString()),
        orderBy("columnRank"),
        // limit(ITEMS_PER_PAGE),
      );

      unsub = onSnapshot(postQuery, (snapshot) => {
        const sortedPosts = snapshot.docs.map((doc) => doc.data() as PostType);

        const newPosts: Record<string, PostType> = {};
        const newPostIds: string[] = [];

        for (const post of sortedPosts) {
          newPosts[post.id] = post;
          newPostIds.push(post.id);
        }

        setData((prev) => {
          // Keep existing posts from pagination
          const existingPostIds = prev.columns.new.postIds;
          const mergedPostIds = [...newPostIds];

          // Add remaining posts that aren't in the new snapshot
          existingPostIds.forEach((id) => {
            if (!newPostIds.includes(id)) {
              mergedPostIds.push(id);
            }
          });

          return {
            posts: { ...prev.posts, ...newPosts },
            columns: {
              ...prev.columns,
              new: {
                ...prev.columns.new,
                postIds: mergedPostIds,
              },
            },
          };
        });
      });
    })();

    return () => unsub?.();
  }, [user]);

  // Load more items for a specific column
  const loadMoreForColumn = useCallback(
    async (columnId: string) => {
      if (!user || pagination[columnId].loading || !pagination[columnId].hasMore) {
        return;
      }

      setPagination((prev) => ({
        ...prev,
        [columnId]: { ...prev[columnId], loading: true },
      }));

      try {
        const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
        const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);

        const postQuery = pagination[columnId].lastDoc
          ? query(
              postsCollectionRef,
              where("boardColumnId", "==", columnId),
              orderBy("columnRank"),
              startAfter(pagination[columnId].lastDoc),
              limit(ITEMS_PER_PAGE),
            )
          : query(
              postsCollectionRef,
              where("boardColumnId", "==", columnId),
              orderBy("columnRank"),
              limit(ITEMS_PER_PAGE),
            );

        const snapshot = await getDocs(postQuery);
        const newPosts: Record<string, PostType> = {};
        const newPostIds: string[] = [];

        snapshot.docs.forEach((doc) => {
          const post = doc.data() as PostType;
          newPosts[post.id] = post;
          newPostIds.push(post.id);
        });

        setData((prev) => ({
          posts: { ...prev.posts, ...newPosts },
          columns: {
            ...prev.columns,
            [columnId]: {
              ...prev.columns[columnId],
              postIds: [...prev.columns[columnId].postIds, ...newPostIds],
            },
          },
        }));

        setPagination((prev) => ({
          ...prev,
          [columnId]: {
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || prev[columnId].lastDoc,
            hasMore: snapshot.docs.length === ITEMS_PER_PAGE,
            loading: false,
          },
        }));
      } catch (error) {
        toastError(error);
        setPagination((prev) => ({
          ...prev,
          [columnId]: { ...prev[columnId], loading: false },
        }));
      }
    },
    [user, pagination],
  );

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

    try {
      const postIds = data.columns[source.droppableId].postIds;
      const isItemGoingDown = source.index < destination.index;
      const beforeOffset = isItemGoingDown ? 0 : -1;
      const afterOffset = isItemGoingDown ? 1 : 0;

      const before: string | null =
        destination.index === 0 ? null : data.posts[postIds[destination.index + beforeOffset]].columnRank;
      const after: string | null =
        destination.index + 1 >= postIds.length
          ? null
          : data.posts[postIds[destination.index + afterOffset]].columnRank;

      const newRank = generateKeyBetween(before, after);
      const post = data.posts[draggableId];

      post.boardColumnId = destination.droppableId;
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

      const kanbanChangeRequest: KanbanChangeRequestType = {
        id: post.id,
        boardColumnId: post.boardColumnId,
        columnRank: post.columnRank,
      };

      ky.post(KANBAN_CHANGE_URL, {
        json: kanbanChangeRequest,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
    }
  }

  async function handleMoveOnDifferentColumn(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!idToken || !destination || source.droppableId === destination.droppableId) {
      return;
    }

    try {
      const sourcePostIds = [...data.columns[source.droppableId].postIds];
      const destinationPostIds = [...data.columns[destination.droppableId].postIds];

      const [movedPostId] = sourcePostIds.splice(source.index, 1);

      const before: string | null =
        destination.index === 0 ? null : data.posts[destinationPostIds[destination.index - 1]].columnRank;
      const after: string | null =
        destination.index === destinationPostIds.length
          ? null
          : data.posts[destinationPostIds[destination.index]].columnRank;

      const newRank = generateKeyBetween(before, after);
      const post = data.posts[draggableId];

      post.boardColumnId = destination.droppableId;
      post.columnRank = newRank;

      destinationPostIds.splice(destination.index, 0, movedPostId);

      setData((prev) => ({
        posts: prev.posts,
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

      const kanbanChangeRequest: KanbanChangeRequestType = {
        id: post.id,
        boardColumnId: post.boardColumnId,
        columnRank: post.columnRank,
      };

      ky.post(KANBAN_CHANGE_URL, {
        json: kanbanChangeRequest,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
    }
  }

  function handleOnDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      handleMoveOnSameColumn(result);
      return;
    }

    handleMoveOnDifferentColumn(result);
  }

  return {
    data,
    getAllPostsFromColumnId,
    handleOnDragEnd,
    loadMoreForColumn,
    pagination,
    isLoading,
  };
}

export default useKanbanData;
