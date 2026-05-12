import {
  siteConfigSchema,
  type SiteConfig,
  type NowReadingItem,
} from "@tabsircg/schemas/site";
import { callWithToast } from "@/lib/utils";
import { create } from "zustand";
import { updateSiteConfig } from "@/actions/configActions";

const defaultSiteConfig: SiteConfig = siteConfigSchema.parse({});

// Client-only stable identity for now-reading rows so React keys + the
// "edited" diff survive reorders. Not persisted to Firestore.
const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface SiteConfigStore {
  hydrated: boolean;
  initial: SiteConfig;
  draft: SiteConfig;

  // Parallel arrays of stable ids aligned with `initial.nowReading` /
  // `draft.nowReading`. An entry in draftIds with no match in initialIds is
  // a brand-new row.
  initialIds: string[];
  draftIds: string[];

  saving: boolean;
  isDirty: boolean;

  _diff: () => void;
  reset: () => void;
  hydrate: (config: SiteConfig) => void;
  save: () => Promise<void>;

  setBlogLanding: (patch: Partial<SiteConfig["blogLanding"]>) => void;
  setCurrentlyBuilding: (patch: Partial<SiteConfig["currentlyBuilding"]>) => void;

  addNowReading: () => void;
  updateNowReading: (index: number, patch: Partial<NowReadingItem>) => void;
  removeNowReading: (index: number) => void;
  moveNowReading: (index: number, dir: -1 | 1) => void;
  toggleNowReadingDone: (index: number) => void;
}

export const useSiteConfigStore = create<SiteConfigStore>((set, get) => ({
  hydrated: false,
  initial: defaultSiteConfig,
  draft: defaultSiteConfig,
  initialIds: [],
  draftIds: [],
  saving: false,
  isDirty: false,

  _diff: () =>
    set({
      isDirty: JSON.stringify(get().draft) !== JSON.stringify(get().initial),
    }),

  reset: () =>
    set({
      draft: get().initial,
      draftIds: [...get().initialIds],
      isDirty: false,
    }),

  hydrate: (config) => {
    const ids = config.nowReading.map(() => rid());
    set({
      hydrated: true,
      initial: config,
      draft: config,
      initialIds: ids,
      draftIds: [...ids],
      isDirty: false,
    });
  },

  save: async () => {
    if (get().saving || !get().isDirty) return;
    set({ saving: true });
    await callWithToast(
      async () => {
        const next = get().draft;
        const res = await updateSiteConfig(next);
        if (res.status !== "success") throw new Error(res.message);
        const ids = res.data.nowReading.map(() => rid());
        set({
          initial: res.data,
          draft: res.data,
          initialIds: ids,
          draftIds: [...ids],
          isDirty: false,
        });
        return res.data;
      },
      {
        loading: "Saving blog site…",
        success: "Saved",
        err: "Save failed",
      },
    );
    set({ saving: false });
    get()._diff();
  },

  setBlogLanding: (patch) => {
    set((s) => ({
      draft: { ...s.draft, blogLanding: { ...s.draft.blogLanding, ...patch } },
    }));
    get()._diff();
  },

  setCurrentlyBuilding: (patch) => {
    set((s) => ({
      draft: {
        ...s.draft,
        currentlyBuilding: { ...s.draft.currentlyBuilding, ...patch },
      },
    }));
    get()._diff();
  },

  addNowReading: () => {
    set((s) => ({
      draft: {
        ...s.draft,
        nowReading: [
          ...s.draft.nowReading,
          { title: "", author: "", done: false },
        ],
      },
      draftIds: [...s.draftIds, rid()],
    }));
    get()._diff();
  },

  updateNowReading: (index, patch) => {
    set((s) => ({
      draft: {
        ...s.draft,
        nowReading: s.draft.nowReading.map((row, i) =>
          i === index ? { ...row, ...patch } : row,
        ),
      },
    }));
    get()._diff();
  },

  removeNowReading: (index) => {
    set((s) => ({
      draft: {
        ...s.draft,
        nowReading: s.draft.nowReading.filter((_, i) => i !== index),
      },
      draftIds: s.draftIds.filter((_, i) => i !== index),
    }));
    get()._diff();
  },

  moveNowReading: (index, dir) => {
    set((s) => {
      const next = [...s.draft.nowReading];
      const ids = [...s.draftIds];
      const target = index + dir;
      if (target < 0 || target >= next.length) return s;
      [next[index], next[target]] = [next[target], next[index]];
      [ids[index], ids[target]] = [ids[target], ids[index]];
      return { draft: { ...s.draft, nowReading: next }, draftIds: ids };
    });
    get()._diff();
  },

  toggleNowReadingDone: (index) => {
    set((s) => ({
      draft: {
        ...s.draft,
        nowReading: s.draft.nowReading.map((row, i) =>
          i === index ? { ...row, done: !row.done } : row,
        ),
      },
    }));
    get()._diff();
  },
}));
