"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DateRangeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <Tabs value={String(value)} onValueChange={(val) => onChange(Number(val))}>
      <TabsList>
        <TabsTrigger value="7">7d</TabsTrigger>
        <TabsTrigger value="14">14d</TabsTrigger>
        <TabsTrigger value="30">30d</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
