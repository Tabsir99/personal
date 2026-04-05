"use client";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { SessionsChart } from "@/components/dashboard/SessionsChart";
import { PagesTable } from "@/components/dashboard/PagesTable";
import { DeviceDonut } from "@/components/dashboard/DeviceDonut";
import { TrafficSourcesBar } from "@/components/dashboard/TrafficSourcesBar";
import { CountriesBar } from "@/components/dashboard/CountriesBar";
import { PageHeader } from "@/components/ui/common/PageHeader";

export default function DashboardShell() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      <MetricCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SessionsChart />
          <PagesTable />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <DeviceDonut />
          <TrafficSourcesBar />
          <CountriesBar />
        </div>
      </div>
    </div>
  );
}
