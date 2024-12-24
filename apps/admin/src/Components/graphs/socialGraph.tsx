"use client";
import {
  axisBottom,
  axisLeft,
  max,
  scaleBand,
  scaleLinear,
  select,
  scaleOrdinal,
  arc,
  pie,
} from "d3";
import React, { useEffect, useRef, useState } from "react";
import { FaChartPie } from "react-icons/fa6";

import { DashboardData } from "@/types/dashboardTypes";

const TrafficSourcesBarChart = ({ data }: { data: DashboardData }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const piRef = useRef<HTMLDivElement | null>(null);

  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (data && chartRef.current) {
      createBarChart();
      createPieChart();
    }
  }, [data]);

  const createPieChart = () => {
    // Clear any existing SVG
    select(piRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    // Create SVG
    const svg = select(piRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Prepare data
    const pieData = Object.entries(data.trafficSources || {});
    const total = pieData.reduce((sum, [_, value]) => sum + value, 0);

    // Create pie layout
    const pieLayout = pie().value((d) => d[1]);
    const arcs = pieLayout(pieData as any);

    // Create arc generator
    const arcGenerator = arc()
      .innerRadius(radius * 0)
      .outerRadius(radius);

    // Color scale (same as in bar chart)
    const color = scaleOrdinal()
      .domain(pieData.map((d) => d[0]))
      .range(["#1877F2", "#000000", "#0077B5", "#111", "#FF4500", "#4CAF50"]);

    // Create pie slices
    svg
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arcGenerator as any)
      .attr("fill", (d) => color(d.data[0]) as any)
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          content: `${d.data[0]}: ${((d.data[1] / total) * 100).toFixed(1)}%`,
          position: { x: event.clientX + 10, y: event.clientY - 10 },
        });
      })
      .on("mouseout", () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Add percentage labels
    svg
      .selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const [x, y] = arcGenerator.centroid(d as any);
        const angle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI); // Calculate the angle in degrees
        return `translate(${x},${y}) rotate(${angle - 90})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => `${((d.data[1] / total) * 100).toFixed(1)}%`)
      .style("fill", "#ffffff")
      .style("font-size", "16px")
      .style("font-weight", "bold");
  };

  const createBarChart = () => {
    // Clear any existing SVG
    select(chartRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Format data
    const chartData = Object.entries(data.trafficSources || {}).map(
      ([source, value]) => ({
        source,
        value,
      })
    );

    // Set up scales
    const x = scaleBand().range([0, width]).padding(0.2);

    const y = scaleLinear().range([height, 0]);

    x.domain(chartData.map((d) => d.source));
    y.domain([0, max(chartData, (d) => d.value)]);

    // Color scale
    const color = scaleOrdinal()
      .domain(chartData.map((d) => d.source))
      .range(["#1877F2", "#000000", "#0077B5", "#111", "#FF4500", "#4CAF50"]);

    // Add subtle grid lines (this is moved before the bars)
    svg
      .selectAll("line.y-grid")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("class", "y-grid")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .style("stroke", "rgba(255, 255, 255, 0.3)")
      .style("stroke-width", "1");

    // Create bars (draw after the grid lines)
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.source) as any)
      .attr("width", x.bandwidth() / 1.5)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => color(d.source) as any)
      .attr("rx", 4) // Rounded corners
      .attr("ry", 4)
      .attr("stroke", "#fff7") // Add outline color (e.g., white)
      .attr("stroke-width", "1")
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          content: `${d.source}: ${d.value}`,
          position: { x: event.clientX + 20, y: event.clientY - 20 },
        });
      })
      .on("mouseout", () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Add y axis
    svg
      .append("g")
      .call(axisLeft(y))
      .selectAll("text")
      .style("fill", "#e0e0e0")
      .style("font-size", "14px");

    // Add value labels on top of bars
    svg
      .selectAll(".label")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.source) as any) + x.bandwidth() / 3)
      .attr("y", (d) => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .style("fill", "#ffffff")
      .style("font-size", "15px")
      .text((d) => d.value);

    // Add x-axis with labels at the bottom of each bar
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`) // Move x-axis to the bottom
      .call(axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)") // Adjust vertical position of the labels
      .style("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .style("text-transform", "capitalize");
  };

  return (
    <div className=" rounded-lg justify-between flex flex-col gap-3 border-t-2 border-gray-700 pt-6">
      <div className="flex justify-between items-center ">
        <h2 className="pb-4 pt-3 px-8 flex gap-2 items-center rounded-full bg-neutral-900 text-2xl text-center text-white">
          Traffic Source Analysis{" "}
          <FaChartPie className="w-9 h-9 text-gray-300" />
        </h2>

        <div className=" px-6 py-3 bg-neutral-900 flex gap-6 text-white text-base w-fit">
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-blue-500 inline-block"></span> Facebook
          </p>
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-[#0077B5] inline-block"></span> LinkedIn
          </p>
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-black  inline-block"></span> X
          </p>
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-orange-600 inline-block"></span> Reddit
          </p>
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-gray-900  inline-block"></span> Dev.to
          </p>
          <p className="flex gap-1 justify-center items-center">
            <span className="w-4 h-4 bg-green-600 inline-block"></span> Organic
          </p>
        </div>
      </div>
      <div className="bg-neutral-900 p-4 rounded-lg justify-between flex">
        <div ref={chartRef} className=" w-fit"></div>
        <div
          ref={piRef}
          className=" border-2 border-gray-600 rounded-full cursor-pointer"
        />

        {tooltip.visible && (
          <div
            className="fixed bg-gray-800 capitalize text-xl text-gray-300 border-2 border-gray-500 px-6 py-4 rounded-md transition-all duration-300 shadow-lg"
            style={{ top: tooltip.position.y, left: tooltip.position.x }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficSourcesBarChart;
