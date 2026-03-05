import LegalPage from "@/components/ui/legal-layout";

const sections = [
  {
    title: "1. Agreement to Terms",
    content:
      "By accessing or using services provided by TabsirCG Web & AI Solutions LLC ('Company', 'we', 'us'), you agree to be bound by these Terms of Service. If you do not agree, do not use our services.",
  },
  {
    title: "2. Services",
    content: [
      "We provide web development, SaaS products, workflow automation, and related digital services. The specific scope, deliverables, and timeline for custom projects are defined in individual project agreements or proposals.",
      "For SaaS products (such as Scheduly), additional product-specific terms may apply and will be presented at the time of purchase or signup.",
    ],
  },
  {
    title: "3. Payments",
    content: [
      "All payments are processed securely through Stripe. By making a payment, you agree to Stripe's terms of service in addition to ours.",
      "For custom projects, payment terms (deposits, milestones, final payment) are outlined in the project proposal. For SaaS subscriptions, billing occurs on a recurring basis as specified at checkout.",
      "All prices are in USD unless otherwise stated.",
    ],
  },
  {
    title: "4. Intellectual Property",
    content: [
      "For custom development work, upon full payment, you receive ownership of the final deliverables unless otherwise agreed in writing.",
      "We retain the right to use general techniques, knowledge, and non-proprietary components developed during the project. We may showcase the work in our portfolio unless you request otherwise.",
      "SaaS products remain the intellectual property of TabsirCG Web & AI Solutions LLC. Your subscription grants you a license to use the product, not ownership.",
    ],
  },
  {
    title: "5. Client Responsibilities",
    content:
      "You are responsible for providing accurate information, timely feedback, and necessary access or content required for project completion. Delays caused by lack of client input may affect project timelines.",
  },
  {
    title: "6. Limitation of Liability",
    content:
      "To the maximum extent permitted by law, TabsirCG Web & AI Solutions LLC shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products. Our total liability shall not exceed the amount paid by you for the specific service in question.",
  },
  {
    title: "7. Termination",
    content:
      "Either party may terminate a project agreement with written notice. In case of termination, you are responsible for payment of all work completed up to the termination date. SaaS subscriptions can be cancelled at any time through your account dashboard.",
  },
  {
    title: "8. Changes to Terms",
    content:
      "We reserve the right to update these terms at any time. Changes take effect immediately upon posting. Continued use of our services constitutes acceptance of the updated terms.",
  },
  {
    title: "9. Contact",
    content:
      "For questions about these terms, contact us at hello@tabsircg.com.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="February 11, 2026"
      sections={sections}
    />
  );
}
