import { FaChartBar } from "react-icons/fa6";


// import { DailyTrendsChart } from "@/Components/graphs/dailytrends";
// import DashboardStats from "@/Components/dashboard/DashboardCard";
// import TrafficSourcesBarChart from "@/Components/graphs/socialGraph";
import RefreshBtn from "@/components/dashboard/RefreshBtn";
import CustomSelect from "@/components/ui/common/CustomSelect";

const Heading = ({ text }: { text: string }) => {
  return (
    <h2 className=" text-2xl py-3 px-6  text-center text-white w-fit rounded-full border-2 border-neutral-700 flex gap-2">
      {text}
      <FaChartBar className="w-9 h-9 text-gray-300" />
    </h2>
  );
};
const Dashboard = async () => {
  // const dashboardData = await getDashboardStats();

  // const { dailyStats, dashboardStats, growthRate } = dashboardData;

  const timeOptions = ["LifeTime", "Last 30 days", "Last Year"];

  return (
    <div className="p-3  bg-neutral-900 bg-opacity-60 min-h-[100dvh] ">
      <div className=" mb-6  text-white pr-3  flex justify-between items-center">
        <Heading text="Key Metrics Overview" />
        <RefreshBtn />
      </div>
      {/* <DashboardStats dashboardStats={dashboardStats} growthRate={growthRate} /> */}

      <div className="text-gray-300 flex flex-col gap-y-3 my-10 relative border-t-2 border-gray-700 py-6">
        <Heading text="Visitor Trends and Statistics" />
        <div className=" text-white text-center p-3 flex gap-10">
          <CustomSelect
            options={timeOptions}
            defaultActiveOption={timeOptions[1]}
            className="relative z-50 w-full"
            // onOptionChange={() => {}}
          />

          <div className="flex-grow w-full px-6 py-3 bg-neutral-900 flex gap-6">
            <p className="flex gap-1 justify-center items-center ">
              <span className="w-3 h-3 bg-gray-300 inline-block"></span> Total
              Visitors
            </p>
            <p className="flex gap-1 justify-center items-center">
              <span className="w-3 h-3 bg-blue-500 inline-block"></span> New
              Visitors
            </p>
            <p className="flex gap-1 justify-center items-center">
              <span className="w-3 h-3 bg-green-500 inline-block"></span>
              Returning Visitors
            </p>
          </div>
        </div>

        <div className="relative w-full text-gray-300 font-bold bg-neutral-900 pt-3 pb-7 px-6 rounded-lg ">
          <div className=" text-sm rotate-90 absolute top-1/2 -translate-y-1/2 -left-9 ">
            Number of Visitors
          </div>
          <div className=" text-sm absolute bottom-2 left-1/2 -translate-x-1/2 ">
            Individual Days
          </div>
          {/* <DailyTrendsChart data={dailyStats} width={1200} /> */}
        </div>
      </div>

      {/* <TrafficSourcesBarChart data={dashboardStats} /> */}

      {/* <EngagementTrend data={dailyStats} width={1200} /> */}
    </div>
  );
};

export default Dashboard;
