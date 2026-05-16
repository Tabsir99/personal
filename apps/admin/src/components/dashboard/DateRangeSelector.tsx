"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DateRangeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const RANGES = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
] as const;

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <Tabs value={String(value)} onValueChange={(val) => onChange(Number(val))}>
      <TabsList variant="line">
        {RANGES.map((range) => (
          <TabsTrigger
            key={range.value}
            value={String(range.value)}
            className="px-2 font-mono text-xs"
          >
            {range.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
