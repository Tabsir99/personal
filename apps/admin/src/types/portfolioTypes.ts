export interface PageData {
  title: string;
  description: string;
  keywords: string[];
  profilePicture: string;

  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    jobSuccessRate: number; // 0-100
    responseTime: string; // e.g., "<2h"
    happyClients: number;
  };

  projects: {
    image: string;
    title: string;
    type: "Personal" | "Demo" | "Freelance";
    description: string;
    link1: { text: string; url: string };
    link2: { text: string; url: string };
    skills: string[];
    isActive: boolean;
  }[];

  testimonials: {
    name: string;
    company: string;
    location: string;
    role: string;
    project: string;
    size: "large" | "medium" | "small";
    rating: number;

    text?: string;
    video?: string;
    isActive: boolean;
  }[];

  about: string[]; // Array of html strings. One Card is rendered for each string.

  skills: {
    title: string;
    icon: string;
    skills: { name: string; level: number; icon: string }[];
    isActive: boolean;
  }[];

  credentials: {
    title: string;
    issuer: string;
    date: string;
    description: string;
    link: string;
    image: string;
    isActive: boolean;
  }[];

  contact: {
    email: string;
    social: {
      name: string;
      url: string;
      icon: string;
    }[];
  };

  services: {
    title: string;
    content: string;
    icon: string;
    isActive: boolean;
  }[];
}
