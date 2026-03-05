import { Mail, Heart, ArrowUpRight, Code2, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./Header";
import { getPageData } from "@/app/layout";
import Img from "./image";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Services", href: "#services" },
  { label: "Blogs", href: "/blogs" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const Footer = async () => {
  const pageData = await getPageData();
  return (
    <footer
      id="contact"
      className="relative border-t border-zinc-800 bg-transparent py-20 px-4 md:px-8"
    >
      <div className="grid gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Let's build something amazing
            </h3>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
              Open to new opportunities and collaborations. Let's connect and
              create something great together.
            </p>
          </div>

          <a
            href={`mailto:${pageData.contact.email}`}
            target="_blank"
            rel="noopener noreferrer"
            draggable="false"
            className="block max-w-96 group flex-1 relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-zinc-500">
                  Get in touch
                </p>
                <span className="text-sm font-medium text-zinc-300">
                  {pageData.contact.email}
                </span>
              </div>
            </div>
          </a>

          <div className="flex items-start gap-4 max-w-96 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
              <MapPin className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-zinc-300">
                TabsirCG Web & AI Solutions LLC
              </p>
              <p className="text-sm text-zinc-500">30 N Gould St Ste R</p>
              <p className="text-sm text-zinc-500">Sheridan, WY 82801</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Connect with me
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {pageData.contact.social.map((social, index) => (
                <SocialMediaLink
                  key={social.name}
                  href={social.url}
                  icon={social.icon}
                  label={social.name}
                  index={index}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 max-w-96">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors p-2 hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-12 bg-zinc-800" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
        <div className="flex items-center gap-3 text-zinc-500">
          <Logo width={24} />
          <span className="font-medium">
            © {new Date().getFullYear()} TabsirCG Web & AI Solutions LLC
          </span>
        </div>

        <div className="flex items-center gap-4">
          {legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

const SocialMediaLink = ({
  href,
  icon,
  label,
  index,
}: {
  href: string;
  icon: string;
  label: string;
  index: number;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group opacity-0 relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-4 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
      aria-label={`${label} icon`}
      data-fadein
      style={{
        animationDelay: `${index * 400}ms`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-3">
        <Img
          src={icon}
          alt={`${label} icon`}
          fetchPriority="low"
          loading="lazy"
          className={`h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity`}
        />
        <span className="text-sm font-semibold text-zinc-200">{label}</span>
      </div>

      <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
};
