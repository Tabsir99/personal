import { FaChartColumn } from "react-icons/fa6";
// @ts-expect-error
import { DashboardData } from "@/types/dashboardTypes";

const DashboardCard = ({
  CardIcon,
  cardTitle,
  cardContent,
}: {
  CardIcon: any;
  cardTitle: string;
  cardContent: string | number;
}) => {
  return (
    <div
      key={cardTitle}
      className="w-full px-6 py-5 bg-zinc-900 rounded-lg shadow flex items-center min-h-28"
    >
      <CardIcon className="h-8 w-8 text-gray-400 mr-4" />
      <div>
        <h3 className="text-sm font-medium text-gray-400 truncate">
          {cardTitle}
        </h3>
        <span className="mt-1 text-3xl font-semibold text-gray-100">
          {cardContent}
        </span>
      </div>
    </div>
  );
};

export default function DashboardStats({
  dashboardStats,
  categoryCount,
  growthRate,
}: {
  dashboardStats: DashboardData;
  categoryCount?: number;
  growthRate?: number;
}) {
  const cardInfos = [
    {
      CardIcon: FaChartColumn,
      cardTitle: "Total Post",
      cardContent: dashboardStats.totalPosts,
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Total Categories",
      cardContent: categoryCount || 1,
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Total Comments",
      cardContent: dashboardStats?.totalComments,
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Total Reacts",
      cardContent: dashboardStats?.totalLikes,
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Total Users",
      cardContent: dashboardStats?.totalUsers,
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Avg Time on Site(Minutes)",
      cardContent: (
        dashboardStats?.totalTimeOnSite /
        dashboardStats?.totalSessions /
        60
      ).toFixed(0),
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Bounce Rate",
      cardContent:
        (
          (dashboardStats?.totalBounces / dashboardStats?.totalSessions) *
          100
        ).toFixed(1) + "%",
    },
    {
      CardIcon: FaChartColumn,
      cardTitle: "Growth Rate(Monthly)",
      cardContent: `${growthRate}%`,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 mb-12 lg:grid-cols-4">
      {cardInfos.map((cardInfo) => {
        return (
          <DashboardCard
            key={cardInfo.cardTitle}
            CardIcon={cardInfo.CardIcon}
            cardContent={cardInfo.cardContent}
            cardTitle={cardInfo.cardTitle}
          />
        );
      })}
    </div>
  );
}
