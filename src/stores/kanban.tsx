import { create } from "zustand";

import { PostType } from "@/types/post";

export type KanbanState = {
  activePost: PostType | null;
  activePostIndex: number | null;
  isOpen: boolean;
  feedbackSheetPostId: string | null;
  /** When true, feedback sheet was opened because user dismissed a high-priority post */
  feedbackSheetIsHighPriorityDismiss: boolean;
  setActivePost: (post: PostType | null | ((prev: PostType | null) => PostType | null)) => void;
  setActivePostIndex: (index: number | null) => void;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setFeedbackSheetPostId: (postId: string | null, isHighPriorityDismiss?: boolean) => void;
};

export const useKanbanStore = create<KanbanState>((set) => ({
  activePost: null,
  activePostIndex: null,
  isOpen: false,
  feedbackSheetPostId: null,
  feedbackSheetIsHighPriorityDismiss: false,
  setActivePost: (value) => {
    if (typeof value === "function") {
      set((state) => ({ activePost: value(state.activePost) }));
    } else {
      set({ activePost: value });
    }
  },
  setActivePostIndex: (index) => set({ activePostIndex: index }),
  setFeedbackSheetPostId: (postId, isHighPriorityDismiss = false) =>
    set({
      feedbackSheetPostId: postId,
      feedbackSheetIsHighPriorityDismiss: Boolean(postId) && isHighPriorityDismiss,
    }),
  setIsOpen: (value) => {
    if (typeof value === "boolean") {
      set({ isOpen: value });
    } else {
      set((state) => ({ isOpen: value(state.isOpen) }));
    }
  },
}));
