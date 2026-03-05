import LegalPage from "@/components/ui/legal-layout";

const sections = [
  {
    title: "1. Custom Development Projects",
    content: [
      "Due to the nature of custom development work, refunds are evaluated on a case-by-case basis.",
      "If work has not yet started, you may request a full refund of any deposit paid.",
      "If work is in progress, refunds are prorated based on the amount of work completed. You will receive all deliverables completed up to that point.",
      "Once a project milestone is delivered and approved, that portion is non-refundable.",
    ],
  },
  {
    title: "2. SaaS Subscriptions",
    content: [
      "You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period — you retain access until then.",
      "We do not provide partial refunds for unused time within a billing period.",
      "If you experience a critical issue that prevents you from using the product and we are unable to resolve it within a reasonable timeframe, you may request a refund for the current billing period.",
    ],
  },
  {
    title: "3. How to Request a Refund",
    content:
      "To request a refund, email us at hello@tabsircg.com with your name, the service or product in question, and the reason for your request. We aim to respond within 2 business days.",
  },
  {
    title: "4. Processing",
    content:
      "Approved refunds are processed through Stripe and returned to the original payment method. Refunds typically appear within 5–10 business days depending on your bank or card issuer.",
  },
  {
    title: "5. Disputes",
    content:
      "If you believe a charge was made in error or have a billing dispute, please contact us at hello@tabsircg.com before initiating a chargeback. We are committed to resolving issues fairly and promptly.",
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      lastUpdated="February 11, 2026"
      sections={sections}
    />
  );
}
