import React from "react";
import { Calendar, ExternalLink, Award, CheckCircle2, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Section from "../ui/section";
import { PageData } from "@/app/page.type";
import { getPageData } from "@/app/layout";
import Img from "../ui/image";

const CertificateCard = ({
  title,
  issuer,
  date,
  description,
  link,
  image,
  index,
}: PageData["credentials"][number] & { index: number }) => {
  return (
    <>
      <Card
        data-fadein
        style={{ animationDelay: `${index * 400}ms` }}
        className="group border-white/8 bg-white/2 backdrop-blur-sm hover:bg-white/4 hover:border-white/15 transition-all duration-300 opacity-0"
      >
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white/95 mb-1 group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>{issuer}</span>
              </div>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4 grow leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/8">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
            <div className="flex gap-2">
              <a
                href={`#cert-${index}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/8 transition-colors"
              >
                View
              </a>

              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors flex items-center gap-1"
              >
                Verify
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <CertificateModal title={title} image={image} index={index} link={link} />
    </>
  );
};

const CertificateModal = ({
  title,
  image,
  index,
  link,
}: {
  title: string;
  image: string | null;
  index: number;
  link: string;
}) => {
  return (
    <div
      id={`cert-${index}`}
      className="fixed bg-transparent backdrop-blur-sm z-50 top-[-9999px] target:inset-0
               opacity-0 scale-95 target:scale-100 invisible pointer-events-none
               target:opacity-100 target:visible target:pointer-events-auto
               target:flex
               items-center justify-center p-4
               transition-[opacity,scale] duration-200"
    >
      <div className="relative bg-[#1a1a24] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white/95">{title}</h3>
          </div>
          <a
            href="#"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white/90"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </a>
        </div>

        <div className="relative rounded-xl flex justify-center items-center py-4">
          <Img
            src={image as string}
            alt={`${title} certificate`}
            className="max-h-[60vh] rounded-lg"
            fetchPriority="low"
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/8">
          <a
            href="#"
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/8 transition-colors text-sm"
          >
            Close
          </a>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors flex items-center gap-2 text-sm"
          >
            Verify Certificate
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

const Credentials = async () => {
  const pageData = await getPageData();
  return (
    <Section
      className="bg-zinc-950/40"
      id="credentials"
      data-navlink="#credentials"
      headerText="Certifications"
      headerDescription="Professional certifications and completed coursework"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageData.credentials.map((cert, index) => (
            <CertificateCard key={index} {...cert} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Credentials;
