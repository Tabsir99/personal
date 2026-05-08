import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BlogFormData, SchemaType } from "@/schemas/blogSchemas";
import { saveDraft } from "@/actions/blogActions";
import { callWithToast } from "@/lib/utils";
import type { DocContent } from "@open-notion/editor";

interface BlogEditorState {
  blogFormData: BlogFormData;

  isCreateDialogOpen: boolean;
  isSaving: boolean;
  lastSaved?: number;
  isPublishedBlog: () => boolean;

  setBlogFormData: (data: Partial<BlogFormData>) => void;
  addTag: (tag: string) => void;
  removeTag: (tagToRemove: string) => void;
  resetBlogFormData: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  setSaving: (saving: boolean) => void;
  updateLastSaved: () => void;

  saveDraft: (latestContent: DocContent, showToast?: boolean) => Promise<void>;
}

const defaultBlogFormData: BlogFormData = {
  title: "",
  metaDescription: "",
  tags: [],
  socialTitle: "",
  socialDescription: "",
  coverImageUrl: "",
  content: { type: "doc", content: [] },
  readTime: 0,
  hasDraftChanges: true,
  dek: "",
  seoTitle: "",
  kind: "essay",
  schemaType: SchemaType.Article,
  slug: "",
  blogId: "",
  parentBlogId: null,
  createdAt: 0,
  updatedAt: 0,
  featured: false,
};

export const useBlogEditorStore = create<BlogEditorState>()(
  devtools(
    (set, get) => ({
      blogFormData: defaultBlogFormData,
      isCreateDialogOpen: false,
      isSaving: false,
      lastSaved: undefined,

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
            }),
            false,
            "addTag",
          );
        }
      },

      isPublishedBlog: () => {
        const { blogFormData } = get();
        return Boolean(blogFormData.parentBlogId || blogFormData.publishedVersion);
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

      async saveDraft(latestContent, showToast = true) {
        if (!get().blogFormData.blogId) return;
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
