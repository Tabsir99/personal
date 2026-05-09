import { PageData } from "@tabsircg/schemas/portfolio";
import type { ApiResponse } from "@/lib/appUtils";
import { callWithToast } from "@/lib/utils";
import { create } from "zustand";

const defaultPageData: PageData = {
  title: "Tabsir - Full Stack Developer",
  description: "Portfolio of Tabsir, a full-stack developer",
  keywords: ["developer", "full-stack", "react"],
  stats: {
    yearsExperience: 0,
    projectsCompleted: 0,
    jobSuccessRate: 0,
    responseTime: "",
    happyClients: 0,
  },
  contact: { email: "", social: [] },
  projects: [],
  testimonials: [],
  about: [],
  profilePicture: "",
  skills: [],
  credentials: [],
  services: [],
};

type ArrayElement<K extends keyof PageData> =
  PageData[K] extends Array<infer U> ? U : never;

type EntityHandlers<K extends keyof PageData> = {
  add: (
    item: ArrayElement<K> | ((prev: ArrayElement<K>[]) => ArrayElement<K>)
  ) => void;

  update: (
    index: number,
    updates: PageData[K] extends Array<infer U>
      ? Partial<U> | ((prev: U) => Partial<U>)
      : never
  ) => void;
  delete: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  toggle: <F extends keyof ArrayElement<K>>(index: number, field: F) => void;
};

interface PortfolioStore {
  initialData: PageData;
  pageData: PageData;

  loading: boolean;
  fetching: boolean;
  saving: boolean;
  isDirty: boolean;

  _checkForChanges: () => void;
  resetChanges: () => void;
  loadPageData: () => Promise<void>;
  savePageData: () => Promise<void>;
  updatePageData: (updates: Partial<PageData>) => void;

  projects: EntityHandlers<"projects">;
  testimonials: EntityHandlers<"testimonials">;
  credentials: EntityHandlers<"credentials">;
  services: EntityHandlers<"services">;
  skills: EntityHandlers<"skills">;
  about: EntityHandlers<"about">;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => {
  const createEntityHandlers = <K extends keyof PageData>(
    key: K
  ): EntityHandlers<K> => {
    type T = ArrayElement<K>;

    return {
      add: (item) => {
        set((state) => {
          const prevArray = state.pageData[key] as T[];
          const newItem =
            typeof item === "function"
              ? (item as (prev: T[]) => T)(prevArray)
              : item;
          return {
            pageData: {
              ...state.pageData,
              [key]: [...prevArray, newItem],
            },
          };
        });
        get()._checkForChanges();
      },
      update: (index: number, updates) => {
        set((state) => {
          const prevArray = state.pageData[key] as T[];
          return {
            pageData: {
              ...state.pageData,
              [key]: prevArray.map((item, i) => {
                if (i === index) {
                  const updateData =
                    typeof updates === "function"
                      ? (updates as (prev: T) => Partial<T>)(item)
                      : updates;
                  return { ...(item as object), ...updateData };
                }
                return item;
              }),
            },
          };
        });
        get()._checkForChanges();
      },

      delete: (index) => {
        set((state) => ({
          pageData: {
            ...state.pageData,
            [key]: (state.pageData[key] as T[]).filter((_, i) => i !== index),
          },
        }));
        get()._checkForChanges();
      },

      moveUp: (index) => {
        if (index === 0) return;
        set((state) => {
          const prevArray = [...(state.pageData[key] as T[])];
          const temp = prevArray[index];
          prevArray[index] = prevArray[index - 1];
          prevArray[index - 1] = temp;
          return {
            pageData: {
              ...state.pageData,
              [key]: prevArray,
            },
          };
        });
        get()._checkForChanges();
      },

      moveDown: (index) => {
        set((state) => {
          const prevArray = [...(state.pageData[key] as T[])];
          if (index === prevArray.length - 1) return state;
          const temp = prevArray[index];
          prevArray[index] = prevArray[index + 1];
          prevArray[index + 1] = temp;
          return {
            pageData: {
              ...state.pageData,
              [key]: prevArray,
            },
          };
        });
        get()._checkForChanges();
      },

      toggle: (index, field) => {
        set((state) => {
          const prevArray = state.pageData[key] as T[];
          return {
            pageData: {
              ...state.pageData,
              [key]: prevArray.map((item, i) =>
                i === index
                  ? { ...(item as object), [field]: !item[field] }
                  : item
              ),
            },
          };
        });
        get()._checkForChanges();
      },
    };
  };

  return {
    initialData: defaultPageData,
    pageData: defaultPageData,

    loading: true,
    fetching: false,
    saving: false,
    isDirty: false,

    _checkForChanges: () => {
      set({
        isDirty:
          JSON.stringify(get().pageData) !== JSON.stringify(get().initialData),
      });
    },

    resetChanges: () => set({ pageData: get().initialData, isDirty: false }),

    loadPageData: async () => {
      if (get().fetching) return;
      set({ fetching: true, loading: true }, false);
      const res = await fetch("/api/page-data");
      const body = (await res.json()) as ApiResponse<PageData | null>;

      if (body.status === "success" && body.data) {
        const merged = { ...defaultPageData, ...body.data };
        set({ pageData: merged, initialData: merged });
      }

      set({ fetching: false, loading: false }, false);
    },

    savePageData: async () => {
      if (get().saving) return;
      set({ saving: true }, false);

      await callWithToast(
        async () => {
          const uploaded = await extractAndUploadBlobs(get().pageData);
          const res = await fetch("/api/page-data", {
            method: "POST",
            body: JSON.stringify(uploaded),
            headers: { "Content-Type": "application/json" },
          });
          const body = (await res.json()) as ApiResponse<unknown>;
          if (body.status !== "success") throw new Error(body.message);
          set({ pageData: uploaded, initialData: uploaded }, false);
          return uploaded;
        },
        {
          loading: "Saving page data...",
          success: "Page data saved",
          err: "Failed to save page data",
        },
      );

      set({ saving: false }, false);
      get()._checkForChanges();
    },

    updatePageData: (updates) => {
      set((state) => ({
        pageData: { ...state.pageData, ...updates },
      }));
      get()._checkForChanges();
    },

    projects: createEntityHandlers("projects"),
    testimonials: createEntityHandlers("testimonials"),
    credentials: createEntityHandlers("credentials"),
    services: createEntityHandlers("services"),
    skills: createEntityHandlers("skills"),
    about: createEntityHandlers("about"),
  };
});

async function extractAndUploadBlobs(pageData: PageData): Promise<PageData> {
  // Deep-clone so we don't mutate live Zustand state.
  const next: PageData = JSON.parse(JSON.stringify(pageData));

  const blobsToUpload: Array<{
    url: string;
    path: string;
    blob?: Blob;
  }> = [];

  if (next.profilePicture.startsWith("blob:")) {
    blobsToUpload.push({
      url: next.profilePicture,
      path: "profilePicture",
    });
  }

  next.projects.forEach((project, i) => {
    if (project.image.startsWith("blob:")) {
      blobsToUpload.push({ url: project.image, path: `projects/${i}` });
    }
  });

  next.credentials.forEach((credential, i) => {
    if (credential.image.startsWith("blob:")) {
      blobsToUpload.push({ url: credential.image, path: `credentials/${i}` });
    }
  });

  if (blobsToUpload.length === 0) return next;

  await Promise.all(
    blobsToUpload.map(async (item) => {
      const response = await fetch(item.url);
      item.blob = await response.blob();
    })
  );

  const urlResponse = await fetch("/api/page-data/upload-urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      blobsToUpload.map((item) => ({
        type: item.blob!.type,
        size: item.blob!.size,
        path: item.path,
      }))
    ),
  });

  const urlBody = (await urlResponse.json()) as ApiResponse<
    Array<{ presignedUrl: string; key: string; path: string }>
  >;
  if (urlBody.status !== "success") throw new Error(urlBody.message);
  const urls = urlBody.data;

  await Promise.all(
    blobsToUpload.map(async (item, index) => {
      const res = await fetch(urls[index].presignedUrl, {
        method: "PUT",
        body: item.blob!,
        headers: { "Content-Type": item.blob!.type },
      });
      if (!res.ok) throw new Error("Upload failed");
    })
  );

  urls.forEach(({ key, path }) => {
    if (path === "profilePicture") next.profilePicture = key;
    else if (path.startsWith("projects/")) {
      const projectIndex = parseInt(path.split("/")[1]);
      next.projects[projectIndex].image = key;
    } else if (path.startsWith("credentials/")) {
      const credentialIndex = parseInt(path.split("/")[1]);
      next.credentials[credentialIndex].image = key;
    }
  });

  return next;
}
