import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BlogType, BlogFormData, BlogStatus } from "@/types/blogTypes";
import { LocalStorageKeys } from "@/types/settingTypes";

interface BlogEditorState {
  // Blog form data
  blogFormData: BlogFormData;

  // UI state
  isCreateDialogOpen: boolean;
  isSaving: boolean;
  lastSaved?: number;

  // Actions
  setBlogFormData: (data: Partial<BlogFormData>) => void;
  addTag: (tag: string) => void;
  removeTag: (tagToRemove: string) => void;
  resetBlogFormData: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  setSaving: (saving: boolean) => void;
  updateLastSaved: () => void;
}

const defaultBlogFormData: BlogFormData = {
  blogName: "",
  blogDescription: "",
  blogTags: [],
  recommendationTitle: "Keep reading...",
  socialTitle: "",
  featuredImageUrl: "",
  type: BlogType.Article,
  link: "",
  content: null,
  estReadTime: 1,
  status: BlogStatus.Draft,
  blogId: "",
};

export const useBlogEditorStore = create<BlogEditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      blogFormData: defaultBlogFormData,
      isCreateDialogOpen: false,
      isSaving: false,
      lastSaved: undefined,

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

        if (trimmedTag && !blogFormData.blogTags.includes(trimmedTag)) {
          set(
            (state) => ({
              blogFormData: {
                ...state.blogFormData,
                blogTags: [...state.blogFormData.blogTags, trimmedTag],
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
              blogTags: state.blogFormData.blogTags.filter(
                (tag) => tag !== tagToRemove
              ),
            },
          }),
          false,
          "removeTag"
        ),

      resetBlogFormData: () => {
        localStorage.removeItem(LocalStorageKeys.BlogFormData);
        set({ blogFormData: defaultBlogFormData }, false, "resetBlogFormData");
      },

      openCreateDialog: () =>
        set({ isCreateDialogOpen: true }, false, "openCreateDialog"),

      closeCreateDialog: () =>
        set({ isCreateDialogOpen: false }, false, "closeCreateDialog"),

      setSaving: (saving) => set({ isSaving: saving }, false, "setSaving"),

      updateLastSaved: () =>
        set({ lastSaved: Date.now() }, false, "updateLastSaved"),
    }),
    { name: "blog-editor-store" }
  )
);
