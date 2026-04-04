"use client";
import { useState } from "react";
import { DateRangeSelector } from "./DateRangeSelector";
import { MetricCards } from "./MetricCards";
import { SessionsChart } from "./SessionsChart";
import { PagesTable } from "./PagesTable";
import { DeviceDonut } from "./DeviceDonut";
import { TrafficSourcesBar } from "./TrafficSourcesBar";
import { CountriesBar } from "./CountriesBar";

export function DashboardShell() {
  const [days, setDays] = useState<number>(7);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      
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
