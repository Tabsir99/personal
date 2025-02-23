export interface ValidLinks {
  categoryLinks: string[];
  blogLinks: string[];
}

export interface SiteMapLinks {
  blogLinks: {
    link: string;
    updatedAt: any;
  }[];
}

export interface User {
  userId: string;
  email: string;
  username: string;
  likedBlogs: string[];
}

export enum LocalStorageKeys {
  BlogFormData = "blogFormData",
  HighlightedHTML = "highlightedHTML",
}
