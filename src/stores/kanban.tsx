import { boolean } from "zod";
import { create } from "zustand";

import { PostType } from "@/types/post";

export type KanbanState = {
  activePost: PostType | null;
  isOpen: boolean;
  setActivePost: (post: PostType | null) => void;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useKanbanStore = create<KanbanState>((set) => ({
  activePost: null,
  isOpen: false,
  setActivePost: (post) => set({ activePost: post }),
  setIsOpen: (value) => {
    if (typeof value === "boolean") {
      set({ isOpen: value });
    } else {
      set((state) => ({ isOpen: value(state.isOpen) }));
    }
  },
}));
