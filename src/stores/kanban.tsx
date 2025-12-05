import { create } from "zustand";

import { PostType } from "@/types/post";

export type KanbanState = {
  activePost: PostType | null;
  activePostIndex: number | null;
  isOpen: boolean;
  setActivePost: (post: PostType | null | ((prev: PostType | null) => PostType | null)) => void;
  setActivePostIndex: (index: number | null) => void;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useKanbanStore = create<KanbanState>((set) => ({
  activePost: null,
  activePostIndex: null,
  isOpen: false,
  setActivePost: (value) => {
    if (typeof value === "function") {
      set((state) => ({ activePost: value(state.activePost) }));
    } else {
      set({ activePost: value });
    }
  },
  setActivePostIndex: (index) => set({ activePostIndex: index }),
  setIsOpen: (value) => {
    if (typeof value === "boolean") {
      set({ isOpen: value });
    } else {
      set((state) => ({ isOpen: value(state.isOpen) }));
    }
  },
}));
