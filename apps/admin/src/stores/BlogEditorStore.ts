import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BlogType, BlogFormData } from "@/types/blogTypes";
import { JSONContent } from "@tiptap/react";
import { loadBlogForEditing, saveDraft } from "@/actions/blogActions";
import { callWithToast } from "@/lib/appUtils";

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

  loadBlogFormData: (blogId: string) => Promise<string>;
  saveDraft: (latestContent: JSONContent, showToast?: boolean) => Promise<void>;
}

const defaultBlogFormData: BlogFormData = {
  title: "",
  description: "",
  tags: [],
  recommendationTitle: "Keep reading...",
  socialTitle: "",
  featuredImageUrl: "",
  content: null,
  estReadTime: 0,
  hasDraftChanges: true,

  type: BlogType.Article,
  link: "",
  blogId: "",
  parentBlogId: null,
  createdAt: 0,
  updatedAt: 0,
};

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
          "setBlogFormData",
        ),

      addTag: (trimmedTag) => {
        const { blogFormData } = get();

        if (trimmedTag && !blogFormData.tags.includes(trimmedTag)) {
          set(
            (state) => ({
              blogFormData: {
                ...state.blogFormData,
                tags: [...state.blogFormData.tags, trimmedTag],
              },
              tagInput: "",
            }),
            false,
            "addTag",
          );
        }
      },

      removeTag: (tagToRemove) =>
        set(
          (state) => ({
            blogFormData: {
              ...state.blogFormData,
              tags: state.blogFormData.tags.filter(
                (tag) => tag !== tagToRemove,
              ),
            },
          }),
          false,
          "removeTag",
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
        if (blogId === get().blogFormData.blogId) return blogId;

        set({ isLoading: true }, false, "loadBlogFormData-start");
        const { data } = await loadBlogForEditing(blogId);

        if (!data) throw new Error("Blog not found");

        set({ blogFormData: data, isLoading: false }, false);
        return data.blogId;
      },

      async saveDraft(latestContent, showToast = true) {
        if (!get().blogFormData.blogId) return;
        console.log(get().blogFormData);
        set((state) => ({
          ...state,
          blogFormData: { ...state.blogFormData, content: latestContent },
        }));

        showToast
          ? await callWithToast(
              // Important to stringify the blogFormData as NextJS server actions corrupt the serialization of complex objects
              () => saveDraft(JSON.stringify(get().blogFormData)),
              {
                loading: "Drafting blog...",
                success: "Blog drafted",
                err: "Failed to draft blog",
              },
            )
          : await saveDraft(JSON.stringify(get().blogFormData)).catch((err) => {
              console.error(err);
            });
      },
    }),

    { name: "blog-editor-store" },
  ),
);
