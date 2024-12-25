export type TrafficSources =
  | "organic"
  | "facebook"
  | "reddit"
  | "linkedin"
  | "twitter"
  | "direct"
  | "email";

interface ITrafficSources {
  organic: number;
  facebook: number;
  reddit: number;
  linkedin: number;
  devto: number;
  twitter: number;
}
export interface DailyStat {
  date: string;
  newVisitors: number;
  totalVisitors: number;
  totalSessions: number;
  returningVisitors: number;
  trafficSources: ITrafficSources;
}

export interface DashboardData {
  updatedAt: any;
  totalPosts: number;
  totalCategory: number;
  totalUsers: number;
  totalComments: number;
  totalLikes: number;
  totalBounces: number;
  totalSessions: number;
  totalTimeOnSite: number;
  trafficSources: ITrafficSources;
}

export interface PageMetrics {
  uniqueVisitoris: number;
  totalVisitors: number;
  timeOnPage: {
    totalTime: number;
    timeRange: {
      "0-30": number;
      "30-60": number;
      "60-120": number;
      "120+": number;
    };
  };
  blogMetrics: BlogMetrics | null;
}

export interface BlogMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  clickThroughRate: {
    totalClicks: number;
    totalVisibility: number;
  };
  totalDepthScrolled: number; // how much percent of the page has been scrolled all time,
  // it should be divided by total visits for the blog page to get avg
}

export type AggregationType = "daily" | "weekly" | "monthly";
export interface Aggregation {
  date: Date;
  type: AggregationType;
  trafficSources: Record<TrafficSources, number>;
  geoLocations: Record<string, number>;
  totalVisits: number;
  totalUniqueVisits: number;
  totalSessions: number;
}

export interface Session {
  isReturning: boolean;
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  referralSource: TrafficSources;
  exitPage: string | null;
  pageVisits: Record<
    string,
    {
      entryTime: Date;
      exitTime: Date | null;
      depthScrolled: number;
      recommendationClicks: number;
      recommendationVisible: number;
    }
  >;
  ipAdd?: string;
  country?: string;
}
