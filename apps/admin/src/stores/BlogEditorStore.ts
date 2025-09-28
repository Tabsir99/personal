import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BlogType, BlogFormData, BlogStatus } from "@/types/blogTypes";
import { JSONContent } from "@tiptap/react";
import { saveDraft } from "@/actions/blogActions";
import { callWithToast } from "@/lib/utils";

interface BlogEditorState {
  // Blog form data
  blogFormData: BlogFormData;

  // UI state
  isCreateDialogOpen: boolean;
  isSaving: boolean;
  lastSaved?: number;
  isPublishedBlog: () => boolean;
  isLoading: boolean;

  // Actions
  setBlogFormData: (data: Partial<BlogFormData>) => void;
  addTag: (tag: string) => void;
  removeTag: (tagToRemove: string) => void;
  resetBlogFormData: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  setSaving: (saving: boolean) => void;
  updateLastSaved: () => void;

  loadBlogFormData: (blogId: string) => Promise<BlogFormData>;
  saveDraft: (latestContent: JSONContent) => Promise<void>;
}

const defaultBlogFormData: BlogFormData = {
  draftTitle: "",
  draftDescription: "",
  draftTags: [],
  draftRecommendationTitle: "Keep reading...",
  draftSocialTitle: "",
  draftFeaturedImageUrl: "",
  draftContent: null,
  draftEstReadTime: 0,
  hasDraftChanges: true,

  type: BlogType.Article,
  link: "",
  status: BlogStatus.Draft,
  blogId: "",
} as const;

export const useBlogEditorStore = create<BlogEditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      blogFormData: defaultBlogFormData,
      isCreateDialogOpen: false,
      isSaving: false,
      lastSaved: undefined,
      isLoading: false,

      // Actions
      setBlogFormData: (data) =>
        set(
          (state) => ({
            blogFormData: { ...state.blogFormData, ...data },
          }),
          false,
          "setBlogFormData"
        ),

      addTag: (trimmedTag) => {
        const { blogFormData } = get();

        if (trimmedTag && !blogFormData.draftTags.includes(trimmedTag)) {
          set(
            (state) => ({
              blogFormData: {
                ...state.blogFormData,
                draftTags: [...state.blogFormData.draftTags, trimmedTag],
              },
              tagInput: "",
            }),
            false,
            "addTag"
          );
        }
      },

      removeTag: (tagToRemove) =>
        set(
          (state) => ({
            blogFormData: {
              ...state.blogFormData,
              draftTags: state.blogFormData.draftTags!.filter(
                (tag) => tag !== tagToRemove
              ),
            },
          }),
          false,
          "removeTag"
        ),

      resetBlogFormData: () => {
        set({ blogFormData: defaultBlogFormData }, false, "resetBlogFormData");
      },

      openCreateDialog: () =>
        set({ isCreateDialogOpen: true }, false, "openCreateDialog"),

      closeCreateDialog: () =>
        set({ isCreateDialogOpen: false }, false, "closeCreateDialog"),

      setSaving: (saving) => set({ isSaving: saving }, false, "setSaving"),

      updateLastSaved: () =>
        set({ lastSaved: Date.now() }, false, "updateLastSaved"),

      async loadBlogFormData(blogId) {
        if (blogId !== get().blogFormData.blogId) {
          set({ isLoading: true }, false, "loadBlogFormData-start");
          const blogFormData = (await (
            await fetch(`/api/blogs/${blogId}`)
          ).json()) as BlogFormData;
          if (blogFormData) {
            set({ blogFormData });
          }
          set({ isLoading: false }, false, "loadBlogFormData-success");
        }

        return get().blogFormData;
      },

      async saveDraft(latestContent) {
        if (!get().blogFormData.blogId) return;
        set((state) => ({
          ...state,
          blogFormData: { ...state.blogFormData, draftContent: latestContent },
        }));

        await callWithToast(
          // Important to stringify the blogFormData as NextJS server actions corrupt the serialization of complex objects
          () => saveDraft(JSON.stringify(get().blogFormData)),
          {
            loading: "Drafting blog...",
            success: "Blog drafted",
            err: "Failed to draft blog",
          }
        );
      },
    }),

    { name: "blog-editor-store" }
  )
);
