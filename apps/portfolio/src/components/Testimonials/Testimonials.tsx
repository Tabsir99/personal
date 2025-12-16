import React from "react";
import Section from "../ui/section";
import { Card } from "@/components/ui/card";
import { Star, ExternalLink, Calendar, DollarSign, Clock } from "lucide-react";
import { getPageData } from "@/app/layout";
import { PageData } from "@/app/page.type";
const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: PageData["testimonials"][number];
  index: number;
}) => {
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return url;
  };

  const videoUrl = testimonial.video
    ? getVideoEmbedUrl(testimonial.video)
    : null;

  return (
    <div
      data-fadein
      className={`group opacity-0 ${
        testimonial.video
          ? "md:row-span-2"
          : testimonial.size === "large"
          ? "md:col-span-2"
          : testimonial.size === "medium"
          ? "md:col-span-1"
          : ""
      }`}
      style={{
        animationDelay: `${index * 400}ms`,
      }}
    >
      <Card
        className={`relative h-full overflow-hidden transition-all duration-300 ${
          testimonial.featured
            ? "border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-zinc-950 shadow-2xl shadow-emerald-500/25"
            : "border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700 hover:shadow-xl hover:shadow-emerald-500/5"
        }`}
      >
        {/* Featured glow effect */}
        {testimonial.featured && (
          <>
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 blur-xl opacity-50 animate-pulse" />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          </>
        )}

        {/* Featured badge */}
        {testimonial.featured && (
          <div className="absolute right-4 top-4 z-10">
            <div className="relative">
              {/* Badge glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md" />

              {/* Badge content */}
              <div className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/50">
                <Star className="h-3.5 w-3.5 fill-white animate-pulse" />
                FEATURED
              </div>
            </div>
          </div>
        )}

        {/* Hover gradient overlay - different for featured */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            testimonial.featured
              ? "bg-gradient-to-br from-emerald-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100"
              : "bg-gradient-to-br from-emerald-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-10"
          }`}
        />

        <div className="relative p-6 h-full flex flex-col">
          {/* Video embed */}
          {videoUrl ? (
            <div
              className={`relative mb-6 overflow-hidden rounded-lg flex-shrink-0 ${
                testimonial.featured ? "ring-2 ring-emerald-500/30" : ""
              }`}
            >
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${testimonial.name} testimonial`}
                  loading="lazy"
                />
              </div>
            </div>
          ) : null}

          {/* Rating */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 transition-all ${
                    i < testimonial.rating
                      ? testimonial.featured
                        ? "fill-emerald-400 text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]"
                        : "fill-yellow-400 text-yellow-400"
                      : "fill-zinc-800 text-zinc-800"
                  }`}
                />
              ))}
            </div>
            <span
              className={`text-sm font-medium ${
                testimonial.featured ? "text-emerald-400" : "text-zinc-400"
              }`}
            >
              {testimonial.rating}.0
            </span>
          </div>

          {/* Testimonial text */}
          {testimonial.text && (
            <blockquote className="mb-6 flex-1">
              <p
                className={`leading-relaxed ${
                  testimonial.featured
                    ? "text-zinc-100 font-medium"
                    : "text-zinc-300"
                } ${testimonial.size === "large" ? "text-lg" : "text-sm"}`}
              >
                "{testimonial.text}"
              </p>
            </blockquote>
          )}

          {/* Author info */}
          <div className="mb-4 flex items-start gap-3">
            {testimonial.avatar && (
              <div className="flex-shrink-0">
                <div
                  className={`h-12 w-12 overflow-hidden rounded-full ${
                    testimonial.featured
                      ? "ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/30"
                      : "ring-2 ring-emerald-500/20"
                  }`}
                >
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  testimonial.featured ? "text-white text-base" : "text-white"
                }`}
              >
                {testimonial.name}
              </h4>
              <p className="text-sm text-zinc-400">
                {testimonial.role} at {testimonial.company}
              </p>
              <p className="text-xs text-zinc-500">{testimonial.location}</p>
            </div>
            <div className="flex-shrink-0">
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  testimonial.featured
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                    : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                }`}
              >
                Upwork
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs ${
                testimonial.featured
                  ? "bg-emerald-900/30 ring-1 ring-emerald-500/20 text-zinc-300"
                  : "bg-zinc-800/50 text-zinc-400"
              }`}
            >
              <span
                className={`font-medium ${
                  testimonial.featured ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                Project:
              </span>
              {testimonial.project}
            </div>

            <div className="flex flex-wrap gap-2">
              {testimonial.date && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${
                    testimonial.featured
                      ? "bg-zinc-800/50 text-zinc-300 ring-1 ring-emerald-500/10"
                      : "bg-zinc-800/30 text-zinc-400"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {new Date(testimonial.date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
              {testimonial.projectDuration && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${
                    testimonial.featured
                      ? "bg-zinc-800/50 text-zinc-300 ring-1 ring-emerald-500/10"
                      : "bg-zinc-800/30 text-zinc-400"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {testimonial.projectDuration}
                </div>
              )}
              {testimonial.projectBudget && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${
                    testimonial.featured
                      ? "bg-zinc-800/50 text-zinc-300 ring-1 ring-emerald-500/10"
                      : "bg-zinc-800/30 text-zinc-400"
                  }`}
                >
                  <DollarSign className="h-3 w-3" />
                  {testimonial.projectBudget}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity ${
            testimonial.featured
              ? "bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 group-hover:opacity-100"
              : "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100"
          }`}
        />
      </Card>
    </div>
  );
};
const InfiniteMarquee = ({
  testimonials,
}: {
  testimonials: PageData["testimonials"];
}) => {
  return (
    <div className="relative mb-12 overflow-hidden">
      <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="flex marquee-container gap-4">
        <div className="flex animate-marquee gap-4">
          {testimonials.map((testimonial, i) => (
            <MarqueeTestimonialCard
              key={`set1-${i}`}
              testimonial={testimonial}
            />
          ))}
        </div>

        <div className="flex animate-marquee gap-4" aria-hidden="true">
          {testimonials.map((testimonial, i) => (
            <MarqueeTestimonialCard
              key={`set2-${i}`}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
const MarqueeTestimonialCard = ({
  testimonial,
}: {
  testimonial: PageData["testimonials"][number];
}) => {
  return (
    <div className="flex w-80 max-sm:w-60 flex-shrink-0 items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
      {testimonial.avatar && (
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-10 w-10 rounded-full ring-2 ring-emerald-500/20"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-1">
          {[...Array(testimonial.rating)].map((_, j) => (
            <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="mb-2 text-xs leading-relaxed text-zinc-300 line-clamp-2">
          "{testimonial.text?.slice(0, 100)}..."
        </p>
        <p className="text-xs font-medium text-white truncate">
          {testimonial.name}
        </p>
        <p className="text-xs text-zinc-500 truncate">{testimonial.company}</p>
      </div>
    </div>
  );
};

export default async function Testimonials() {
  const { testimonials, contact } = await getPageData();

  const activeTestimonials = testimonials.filter((t) => t.isActive);
  const marqueeTestimonials = activeTestimonials.filter(
    (t) => t.size === "small" && !t.video
  );

  const featuredTestimonials = activeTestimonials.filter((t) => t.featured);
  const regularTestimonials = activeTestimonials.filter(
    (t) => !t.featured && t.size !== "small"
  );

  return (
    <Section
      id="testimonials"
      data-navlink="#testimonials"
      headerText="Client Testimonials"
      headerDescription="Don't just take my word for it. Here's what clients say about working with me."
      className="scroll-mt-16"
    >
      <InfiniteMarquee testimonials={marqueeTestimonials} />

      {featuredTestimonials.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Featured Reviews
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            {featuredTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {regularTestimonials.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
          {regularTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index + featuredTestimonials.length}
            />
          ))}
        </div>
      )}

      <div
        className="mt-16 animate-fade-in text-center"
        style={{ animationDelay: "300ms", animationFillMode: "both" }}
      >
        <a
          href={
            contact.social.find((s) => s.name.toLowerCase() === "upwork")?.url
          }
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
        >
          View All Reviews on Upwork
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </Section>
  );
}
