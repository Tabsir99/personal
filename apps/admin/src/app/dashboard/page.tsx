"use client";
import { useState } from "react";
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

      <MetricCards days={days} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — 3/5 width */}
        <div className="lg:col-span-3 space-y-6">
          <SessionsChart days={days} />
          <PagesTable days={days} />
        </div>
        {/* Right column — 2/5 width */}
        <div className="lg:col-span-2 space-y-6">
          <DeviceDonut days={days} />
          <TrafficSourcesBar days={days} />
          <CountriesBar days={days} />
        </div>
      </div>
    </div>
  );
}
