export interface PageData {
  title: string;
  description: string;
  keywords: string[];
  profilePicture: string;

  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    jobSuccessRate: number;
    responseTime: string;
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
    featured: boolean;
    metrics: {
      label: string;
      value: string;
    }[];
    isActive: boolean;
    year: string;
    duration: string;
    role?: string;
    clientType: "Enterprise" | "Startup" | "Personal";
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

    avatar?: string;
    date?: string;
    projectDuration: string;
    projectBudget: string;
    featured: boolean;
  }[];

  about: string[];

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
