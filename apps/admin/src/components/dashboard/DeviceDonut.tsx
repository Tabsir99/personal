"use client";
import { useGeoStats } from "@/lib/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function DeviceDonut({ days }: { days: number }) {
  const { data, error, isLoading } = useGeoStats(days);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          Failed to load
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  let mobile = 0;
  let desktop = 0;
  let tablet = 0;

  if (data) {
    data.forEach((d: any) => {
      if (d.devices) {
        mobile += d.devices.mobile || 0;
        desktop += d.devices.desktop || 0;
        tablet += d.devices.tablet || 0;
      }
    });
  }

  const chartData = [
    { name: "Desktop", value: desktop },
    { name: "Mobile", value: mobile },
    { name: "Tablet", value: tablet },
  ].filter(d => d.value > 0);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-2))"];
  const total = mobile + desktop + tablet;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] relative">
        {total > 0 ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{new Intl.NumberFormat().format(total)}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill }} />
                        <span className="font-medium">{data.name}:</span>
                        <span>{data.value}</span>
                        <span className="text-muted-foreground ml-1">
                          ({((data.value / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  );
}
