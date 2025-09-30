import Desginedh2 from "../UI/DesginedH2";
import Available from "../UI/Available";
import PortfolioCard, { PortfolioCardProps } from "./PortfolioCards";
import blogsiteImg from "../../../public/projects/dashb.png";
import simpleChatImg from "../../../public/projects/simpleChat.png";

export default function Projects() {
  const portfolioInfo: PortfolioCardProps[] = [
    {
      imageLink: blogsiteImg,
      alt: "Image of a dashboard of the project Tabsir's Blog",
      skillUsed: ["NextJS", "Firestore", "Tailwind", "ProseMirror"],
      projectTitle: "Full stack BlogSite with custom CMS",
      type: "Personal",
      projectName: "Tabsir's Blog",
      description:
        "Developed a personal blog site with a custom CMS using Next.js and Firebase. Features includes: 1)Dashboard for various statistics, 2)Custom text editor, 3)Full Blog Management system etc",
      shortDescription:
        "Created a blog site with a custom CMS using Next.js and Firebase, featuring a dashboard, text editor, and full blog management.",
      link1: {
        text: "Visit Site",
        href: "https://blog.tabsircg.com",
      },
      link2: {
        href: "https://blog.tabsircg.com/blogs/case-study%3A-development-of-a-blogsite-with-a-intregated-custom-cms",
        text: "Case Study",
      },
    },

    {
      alt: "Simple chat project image",
      description:
        "Built a full stack chat application from scratch using Next.js, ExpressJS and websockets. All core features included such as- Group chats, Reactions, Attachments, Audio & Video calls etc",
      imageLink: simpleChatImg,
      shortDescription:
        "Built a full-stack chat app with Next.js, Express, and WebSockets, featuring group chats, reactions, attachments, and audio/video calls.",
      projectName: "Simple Chat",
      projectTitle: "Realtime chat application",
      type: "Demo",
      skillUsed: ["React", "ExpressJS", "Websocket", "WebRTC", "PostgreSQL"],
      link1: {
        href: "https://github.com/Tabsir99/simple-chat-frontend",
        text: "Frontend Code",
      },
      link2: {
        href: "https://github.com/Tabsir99/simple-chat-backend",
        text: "Backend Code",
      },
    },
  ];

  return (
    <section
      id="portfolio"
      className="text-white text-xl bg-[#101018] z-10 relative px-8 max-lg:px-3 max-sm:px-1 max-sm:py-10 max-sm:gap-10  py-20 flex flex-col gap-16 "
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Desginedh2 h2text="Featured Projects" />
        <Available />
      </div>

      {portfolioInfo.map((project) => (
        <PortfolioCard
          key={project.link1.href}
          imageLink={project.imageLink}
          type={project.type}
          projectTitle={project.projectTitle}
          description={project.description}
          alt={project.alt}
          shortDescription={project.shortDescription}
          link1={project.link1}
          skillUsed={project.skillUsed}
          link2={project.link2}
          projectName={project.projectName}
        />
      ))}
    </section>
  );
}
