import { create } from "zustand";

export type UpgradeModalState = {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isOpen: false,
  setIsOpen: (value) => {
    if (typeof value === "boolean") {
      set({ isOpen: value });
    } else {
      set((state) => ({ isOpen: value(state.isOpen) }));
    }
  },
}));
