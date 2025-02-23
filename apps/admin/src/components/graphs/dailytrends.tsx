"use client";
import {
  select,
  scaleTime,
  scaleLinear,
  line,
  extent,
  axisBottom,
  axisLeft,
  max,
} from "d3";
import { useEffect, useRef, useState } from "react";

import { DailyStat } from "@/types/dashboardTypes";

export const DailyTrendsChart = ({
  data,
  width,
}: {
  width: number;
  data: DailyStat[];
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [inset, setInset] = useState({
    clientX: 0,
    clientY: 0,
  });

  const [tooltipContent, setTooltipContent] = useState<{
    date: string;
    total: number;
    new: number;
    returning: number;
  } | null>(null);

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();

      const height = 400;
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Step 1: Define Clipping Path
      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Step 2: Apply Clipping Path to Chart Content
      const content = chart.append("g").attr("clip-path", "url(#clip)"); // Clip only the chart content

      const xScale = scaleTime()
        .domain(extent(data, (d) => new Date(d.date)) as any)
        .range([0, innerWidth]);

      const yScale = scaleLinear()
        .domain([0, max(data, (d) => Math.max(d.totalVisitors, d.newVisitors))] as any)
        .range([innerHeight, 0]);

      const newVisitorsLine = line()
        .x((d: any) => xScale(new Date(d.date)))
        .y((d: any) => yScale(d.newVisitors));

      const totalVisitorsLine = line()
        .x((d: any) => xScale(new Date(d.date)))
        .y((d: any) => yScale(d.totalVisitors));

      const returningVisitorsLine = line()
        .x((d: any) => xScale(new Date(d.date)))
        .y((d: any) => yScale(d.returningVisitors));

      chart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(axisBottom(xScale).tickSizeInner(6).tickPadding(12))
        .select(".domain")
        .style("stroke", "#374151")
        .style("opacity", 0.8);

      chart
        .append("g")
        .call(axisLeft(yScale).tickSizeInner(6).tickPadding(6).ticks(8));

        // const newPath =
       content
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 1.5)
        .attr("d", newVisitorsLine as any);

        // const totalPath = 
      content
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("d", totalVisitorsLine as any);

        // const returningPath =
       content
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", returningVisitorsLine as any);

      // Grid lines

      // Create grid lines for y-axis const yGrid =
      chart
        .append("g")

        .call(
          axisLeft(yScale).tickSizeInner(-innerWidth).tickFormat(null).ticks(3)
        )
        .selectAll(".tick line")
        .style("stroke", "#374151")
        .style("opacity", 0.8);

      const addCircles = (lineData, color, type, className) => {
        return content
          .selectAll(`circle.${className}`) // Select only circles with the specific class
          .data(lineData)
          .enter()
          .append("circle")
          .attr("class", className) // Assign a class to differentiate circles
          .attr("cx", (d: {date: Date}) => xScale(new Date(d.date)))
          .attr("cy", (d: {date: Date}) => yScale(d[type])) // Use appropriate y value here for each line
          .attr("r", 4)
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .style("opacity", 0);
      };

      addCircles(data, "#3b82f6", "newVisitors", "new-visitors-circle"); // New Visitors
      addCircles(data, "white", "totalVisitors", "total-visitors-circle"); // Total Visitors
      addCircles(
        data,
        "green",
        "returningVisitors",
        "returning-visitors-circle"
      );

      // const xGrid =
      chart
        .append("g")
        .call(
          axisBottom(xScale)
            .tickSizeInner(innerHeight)
            .tickFormat(null)
            .ticks(16)
        )
        .selectAll(".tick line")
        .style("stroke-width", 18)
        .style("stroke-opacity", 0)
        .on(
          "mouseover",

          (e, d: Date) => {
            e.target.style.cursor = "pointer";

            const hoveredData = data.find(
              (item) => new Date(item.date).toDateString() === d.toDateString()
            );

            content
              .selectAll(".new-visitors-circle")
              .style("opacity", (circleData: { date: Date }) => {
                return new Date(circleData.date).toDateString() ===
                  d.toDateString()
                  ? 1
                  : 0;
              });

            content
              .selectAll(".total-visitors-circle")
              .style("opacity", (circleData: { date: Date }) => {
                return new Date(circleData.date).toDateString() ===
                  d.toDateString()
                  ? 1
                  : 0;
              });

            content
              .selectAll(".returning-visitors-circle")
              .style("opacity", (circleData: { date: Date }) => {
                return new Date(circleData.date).toDateString() ===
                  d.toDateString()
                  ? 1
                  : 0;
              });

            setTooltipContent({
              date: d.toDateString().trim().replace(/\s/g, ", "),
              total: hoveredData?.totalVisitors || 0,
              returning: hoveredData?.returningVisitors || 0,
              new: hoveredData?.newVisitors || 0,
            });
          }
        );
    }
  }, [data, width]);

  return (
    <>
      <svg
        ref={svgRef}
        onMouseOver={(e) => {
          tooltipRef.current?.classList.remove("scale-0");
          const clientX = e.clientX + 35;
          const clientY = e.clientY - 70;

          setInset({
            clientX,
            clientY,
          });
        }}
        onMouseLeave={() => {
          tooltipRef.current?.classList.add("scale-0");
        }}
        width={width}
        height={400}
        className="text-white mx-auto bg-neutral-900 rounded-lg "
      ></svg>
      <div
        ref={tooltipRef}
        style={{ top: inset.clientY, left: inset.clientX }}
        className="fixed tooltipTr bg-gray-800 bg-opacity-30 backdrop-blur-md flex flex-col gap-3 text-sm text-gray-300 border border-gray-700 px-6 py-4 rounded-md transition-all duration-300 shadow-lg scale-0 origin-center pointer-events-none"
      >
        <h4 className="text-base text-white">{tooltipContent?.date}</h4>
        <p className="flex gap-1 flex-col ">
          <span>
            <span className="w-3 h-3 bg-gray-300 inline-block"></span> Total
            Visitors:
          </span>
          <span>{tooltipContent?.total} </span>
        </p>
        <p className="flex gap-1 flex-col ">
          <span>
            <span className="w-3 h-3 bg-blue-500 inline-block"></span> New
            Visitors:
          </span>
          <span>{tooltipContent?.new} </span>
        </p>
        <p className="flex gap-1 flex-col ">
          <span>
            <span className="w-3 h-3 bg-green-500 inline-block"></span>{" "}
            Returning Visitors:
          </span>
          <span>{tooltipContent?.returning} </span>
        </p>
      </div>
    </>
  );
};
