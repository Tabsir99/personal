import LegalPage from "@/components/ui/legal-layout";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We collect information you provide directly: name, email address, payment information, and any details shared during project communication.",
      "We automatically collect basic usage data such as IP address, browser type, and pages visited through analytics tools. We do not sell your data to third parties.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To provide and improve our services and SaaS products.",
      "To process payments and send transaction-related communications.",
      "To respond to inquiries and provide customer support.",
      "To send occasional updates about our services (you can opt out at any time).",
    ],
  },
  {
    title: "3. Payment Processing",
    content:
      "Payments are processed by Stripe. We do not store your credit card details on our servers. Stripe's privacy policy governs the handling of your payment information. Visit stripe.com/privacy for details.",
  },
  {
    title: "4. Data Storage & Security",
    content: [
      "All our services and infrastructure are hosted on Hetzner, a German data center provider that is fully GDPR-compliant under EU law. Data processed through our non-cloud products is stored exclusively within the EU, ensuring it is not transferred to jurisdictions with weaker privacy standards.",
      "Hetzner maintains ISO 27001:2022 certification for information security, uses state-of-the-art encryption protocols, and undergoes regular independent security audits by TÜV Rheinland. We have a Data Processing Agreement (DPA) in place with Hetzner in accordance with Art. 28 GDPR.",
      "We implement additional security measures including HTTPS encryption across all services, access controls, and secure authentication practices. However, no method of transmission over the internet is 100% secure.",
    ],
  },
  {
    title: "5. Third-Party Services",
    content:
      "We may use third-party services that collect data under their own privacy policies. Key providers include: Stripe (payments — stripe.com/privacy), Hetzner (hosting — hetzner.com/legal/privacy-policy), and Vercel (edge delivery — vercel.com/legal/privacy-policy).",
  },
  {
    title: "6. Cookies",
    content:
      "Our website may use cookies for analytics and functionality. You can disable cookies in your browser settings, though some features may not work as intended.",
  },
  {
    title: "7. Your Rights",
    content: [
      "Under GDPR and applicable data protection laws, you have the right to access, correct, delete, or export your personal data at any time.",
      "For SaaS products, you can manage or delete your account data through the product's settings. For all other requests, contact us at hello@tabsircg.com.",
    ],
  },
  {
    title: "8. Children's Privacy",
    content:
      "Our services are not directed at individuals under 13. We do not knowingly collect personal information from children.",
  },
  {
    title: "9. Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. Changes take effect upon posting to this page.",
  },
  {
    title: "10. Contact",
    content: "For privacy-related questions, contact us at hello@tabsircg.com.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="February 11, 2026"
      sections={sections}
    />
  );
}
