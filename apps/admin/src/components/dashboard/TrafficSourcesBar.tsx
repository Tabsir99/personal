"use client";
import { useTrafficSources } from "@/lib/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function TrafficSourcesBar({ days }: { days: number }) {
  const { data, error, isLoading } = useTrafficSources(days);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
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
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data ? data.slice(0, 7) : [];
  const height = chartData.length > 0 ? chartData.length * 40 + 40 : 280;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div style={{ height: `${height}px` }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis type="number" fontSize={12} className="fill-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis dataKey="source" type="category" width={80} fontSize={12} className="fill-muted-foreground" tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md text-sm">
                        <span className="font-medium mr-2">{payload[0].payload.source}:</span>
                        <span>{payload[0].value} sessions</span>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
