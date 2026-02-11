import { create } from "zustand";

import type { EditableProfileFieldKey, EditUserProfileType } from "@/types/user";

export type AiProfileEditStep = "input" | "review";

export type Decision = "accepted" | "discarded";

type AiProfileEditState = {
  instruction: string;
  step: AiProfileEditStep;
  proposed: EditUserProfileType | null;
  changedFields: EditableProfileFieldKey[];
  decisions: Partial<Record<EditableProfileFieldKey, Decision>>;
};

type AiProfileEditActions = {
  setInstruction: (value: string) => void;
  setStep: (step: AiProfileEditStep) => void;
  setProposedAndReview: (proposed: EditUserProfileType, changedFields: EditableProfileFieldKey[]) => void;
  setDecision: (field: EditableProfileFieldKey, value: Decision) => void;
  clearDecision: (field: EditableProfileFieldKey) => void;
  reset: () => void;
};

const initialState: AiProfileEditState = {
  instruction: "",
  step: "input",
  proposed: null,
  changedFields: [],
  decisions: {},
};

export const useAiProfileEditStore = create<AiProfileEditState & AiProfileEditActions>((set) => ({
  ...initialState,

  setInstruction: (value) => set({ instruction: value }),

  setStep: (step) => set({ step }),

  setProposedAndReview: (proposed, changedFields) => set({ proposed, changedFields, step: "review", decisions: {} }),

  setDecision: (field, value) =>
    set((state) => ({
      decisions: { ...state.decisions, [field]: value },
    })),

  clearDecision: (field) =>
    set((state) => {
      const next = { ...state.decisions };
      delete next[field];
      return { decisions: next };
    }),

  reset: () => set(initialState),
}));
