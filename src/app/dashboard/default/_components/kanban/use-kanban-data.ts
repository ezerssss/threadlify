import { useState, useEffect } from "react";

import { DropResult } from "@hello-pangea/dnd";
import { arrayMoveImmutable } from "array-move";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, Unsubscribe, where } from "firebase/firestore";
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
  const [data, setData] = useState<KanbanDataInterface>({ ...defaultData });

  function getAllPostsFromColumnId(columnId: string): PostType[] {
    const postIds = data.columns[columnId].postIds;
    const posts: PostType[] = postIds.map((id) => data.posts[id]);

    return posts;
  }

  // Get all data
  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      // Fetch data here already sorted by columnRank
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return;
      }

      const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);
      const postQuery = query(postsCollectionRef, orderBy("columnRank"));
      const snapshot = await getDocs(postQuery);

      const sortedPosts = snapshot.docs.map((post) => {
        const data = post.data() as PostType;
        return data;
      });

      const newPosts: Record<string, PostType> = {};
      const newColumnsData: Record<string, KanbanColumnInterface> = {
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
      };

      for (const post of sortedPosts) {
        const { id, boardColumnId } = post;
        newPosts[id] = post;
        newColumnsData[boardColumnId].postIds.push(id);
      }

      setData({
        posts: newPosts,
        columns: newColumnsData,
      });
    })();
  }, [user]);

  // Listener for new posts
  useEffect(() => {
    if (!user) {
      return;
    }

    let unsub: Unsubscribe;
    (async () => {
      // Fetch data here already sorted by columnRank
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return;
      }

      const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);
      const postQuery = query(postsCollectionRef, where("boardColumnId", "==", "new"), orderBy("columnRank"));

      unsub = onSnapshot(postQuery, (snapshot) => {
        const sortedPosts = snapshot.docs.map((post) => {
          const data = post.data() as PostType;
          return data;
        });

        const newPosts: Record<string, PostType> = {};
        const newColumnsData: Record<string, KanbanColumnInterface> = {
          new: {
            id: "new",
            title: "New",
            postIds: [],
          },
        };

        for (const post of sortedPosts) {
          const { id, boardColumnId } = post;
          newPosts[id] = post;
          newColumnsData[boardColumnId].postIds.push(id);
        }

        setData((prev) => ({
          posts: { ...prev.posts, ...newPosts },
          columns: {
            ...prev.columns,
            ...newColumnsData,
          },
        }));
      });
    })();

    return () => unsub();
  }, [user]);

  async function handleMoveOnSameColumn(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!idToken) {
      return;
    }

    if (!destination || source.droppableId !== destination.droppableId || source.index === destination.index) {
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

      // Update db to reflect new rank
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

    if (!idToken) {
      return;
    }

    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }

    try {
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
      post.boardColumnId = destination.droppableId;
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

  return { data, getAllPostsFromColumnId, handleOnDragEnd };
}

export default useKanbanData;
