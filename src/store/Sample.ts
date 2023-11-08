import { create } from "zustand";

export default create((set: any) => ({
    sample: {},
    addSample: (_sample: any) => set((state: any) => ({ sample: { ...state.sample, ..._sample } }))
}));