import React from "react";
import Section from "../ui/section";
import { Star, ArrowRight, Sparkles, Code2 } from "lucide-react";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiNodedotjs,
  SiPostgresql,
  SiTailwindcss,
} from "react-icons/si";
import { getPageData } from "@/app/layout";
import { PageData } from "@/app/page.type";
import { HighlightText } from "../ui/HighLightText";

const HeroSection = async () => {
  const pageData = await getPageData();

  return (
    <Section
      id="home"
      data-navlink="#home"
      className="relative min-h-screen scroll-mt-16"
    >
      <div className="absolute inset-0 -z-20">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"
          style={{ animation: "gridFloat 15s ease-in-out infinite" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <HeroContent pageData={pageData} />
        <HeroVisual pageData={pageData} />
      </div>
    </Section>
  );
};

export default HeroSection;

const HeroContent = ({ pageData }: { pageData: PageData }) => {
  const avgRating =
    pageData.testimonials.length > 0
      ? (
          pageData.testimonials.reduce((sum, t) => sum + t.rating, 0) /
          pageData.testimonials.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="flex flex-col justify-center space-y-8">
      {/* Badge */}
      <div className="inline-flex w-fit animate-fade-in items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 backdrop-blur-sm">
        <div className="relative">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        </div>
        <span className="text-sm font-medium text-emerald-400">
          Taking 2 new projects in January
        </span>
      </div>

      {/* Heading with Spotlight Effect */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          I Ship <HighlightText text="MVPs in 4-6 Weeks," /> Not Months
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          Full-stack developer specializing in{" "}
          <span className="font-semibold text-white">
            production-ready SaaS products
          </span>
          . Database to deployment, I ship the complete solution.
        </p>
      </div>

      {/* Social Proof - Just Upwork Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="font-semibold text-white">{avgRating}</span>
        <span className="text-zinc-500">on Upwork</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-4">
        <a
          href="#portfolio"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40"
        >
          <span className="relative z-10">View My Work</span>
          <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />

          {/* Shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </a>

        <a
          href="#contact"
          className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800/80"
        >
          Start a Project
          <Sparkles className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110" />
        </a>
      </div>
    </div>
  );
};

const TerminalLine = ({
  icon,
  text,
  delay,
  iconColor,
  subtext,
}: {
  icon: string;
  text: string;
  delay: number;
  iconColor: string;
  subtext?: string;
}) => {
  const loadingDelay = delay;
  const completeDelay = delay + 600;

  return (
    <div className="relative h-6">
      {" "}
      <div
        className="absolute inset-0 flex items-center gap-2 opacity-0"
        style={{
          animation: `fadeIn 0.2s ease-out ${loadingDelay}ms forwards, fadeOut 0.2s ease-out ${completeDelay}ms forwards`,
        }}
      >
        <span className="animate-spin text-zinc-500">⟳</span>
        <span className="text-zinc-600">{text}</span>
      </div>
      <div
        className="absolute inset-0 flex items-center gap-2 opacity-0"
        style={{
          animation: `popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${completeDelay}ms forwards`,
        }}
      >
        <span className={`${iconColor} font-bold`}>{icon}</span>
        <span className="text-zinc-300">{text}</span>
        {subtext && (
          <span className="ml-auto text-xs text-zinc-600">{subtext}</span>
        )}
      </div>
    </div>
  );
};
const TerminalCard = () => {
  const terminalSteps = [
    {
      icon: "✓",
      text: "Requirements analyzed",
      iconColor: "text-emerald-400",
      subtext: "Day 1",
    },
    {
      icon: "✓",
      text: "Architecture planned",
      iconColor: "text-emerald-400",
      subtext: "Day 2",
    },
    {
      icon: "✓",
      text: "Database designed",
      iconColor: "text-emerald-400",
      subtext: "Day 4",
    },
    {
      icon: "✓",
      text: "MVP features built",
      iconColor: "text-emerald-400",
      subtext: "Week 4",
    },
    {
      icon: "✓",
      text: "Testing completed",
      iconColor: "text-emerald-400",
      subtext: "Week 5",
    },
    {
      icon: "🎉",
      text: "Launched to production",
      iconColor: "text-purple-400",
      subtext: "Week 6",
    },
  ];

  const baseDelay = 1500;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 shadow-2xl shadow-black/60">
      <div className="relative border-b border-zinc-700/50 bg-zinc-800/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
              <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <span className="text-xs font-medium text-zinc-400">zsh</span>
          </div>
          <Code2 className="h-4 w-4 text-zinc-500" />
        </div>
      </div>

      <div className="relative bg-black/40 p-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px]"
          style={{ animation: "scanline 8s linear infinite" }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]" />

        <div className="relative space-y-2 font-mono text-sm">
          {terminalSteps.map((step, index) => (
            <TerminalLine
              key={index}
              icon={step.icon}
              text={step.text}
              delay={baseDelay + index * 1000}
              iconColor={step.iconColor}
              subtext={step.subtext}
            />
          ))}

          <div className="flex items-center gap-2 pt-2">
            <span className="text-blue-400">›</span>
            <span
              className="inline-block h-4 w-2 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
              style={{
                animation: "blink 1s step-end infinite",
              }}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
};

const HeroVisual = ({ pageData }: { pageData: PageData }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <TerminalCard />
        <StatsGrid pageData={pageData} />

        {/* Tech Stack */}
        <div className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {[
              SiNextdotjs,
              SiReact,
              SiTypescript,
              SiNodedotjs,
              SiPostgresql,
              SiTailwindcss,
            ].map((Icon, i) => (
              <Icon
                key={i}
                className="h-6 w-6 text-zinc-600 transition-colors hover:text-zinc-400"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Blurs */}
      <div className="absolute -z-10 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute -right-20 -z-10 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px]" />
    </div>
  );
};

import {
  HiRocketLaunch,
  HiStar,
  HiCheckBadge,
  HiUserGroup,
} from "react-icons/hi2";

const StatsGrid = ({ pageData }: { pageData: PageData }) => {
  const roundDown = (num: number) => Math.floor(num / 5) * 5;

  const stats = [
    {
      icon: HiCheckBadge,
      label: "Projects Delivered",
      parentClass: "hover:border-emerald-500/30",
      bgClass: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconClass: "text-emerald-400",
      value: roundDown(pageData.stats.projectsCompleted),
      suffix: "+",
    },
    {
      icon: HiRocketLaunch,
      label: "MVP Delivery",
      parentClass: "hover:border-orange-500/30",
      bgClass: "bg-orange-500/10 group-hover:bg-orange-500/20",
      iconClass: "text-orange-400",
      value: "4-8w",
      suffix: "",
    },
    {
      icon: HiUserGroup,
      label: "Happy Clients",
      parentClass: "hover:border-blue-500/30",
      bgClass: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconClass: "text-blue-400",
      value: roundDown(pageData.stats.happyClients),
      suffix: "+",
    },
    {
      icon: HiStar,
      label: "Success Rate",
      parentClass: "hover:border-yellow-500/30",
      bgClass: "bg-yellow-500/10 group-hover:bg-yellow-500/20",
      iconClass: "text-yellow-400 fill-yellow-400",
      value: pageData.stats.jobSuccessRate,
      suffix: "%",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all opacity-0 ${stat.parentClass}`}
          style={{
            animation: `fadeInUp 0.6s ease-out ${i * 150}ms forwards`,
          }}
        >
          <div
            className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl transition-all ${stat.bgClass}`}
          />

          <stat.icon className={`relative mb-3 h-6 w-6 ${stat.iconClass}`} />

          <div className="relative text-2xl font-bold text-white">
            {typeof stat.value === "number" ? (
              <div
                data-countup={stat.value}
                data-suffix={stat.suffix}
                className="relative text-2xl font-bold text-white"
              >
                {stat.value}
                {stat.suffix}
              </div>
            ) : (
              stat.value
            )}
          </div>
          <div className="relative text-xs text-zinc-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
