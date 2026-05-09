import { ArrowLeft, Info } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-transparent py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {children}

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 flex gap-3">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-500 leading-relaxed">
            Individual products and services operated by TabsirCG Web & AI
            Solutions LLC may have their own additional terms, privacy policies,
            and refund policies. Where product-specific policies exist, they
            take precedence over these general policies for that product.
          </p>
        </div>
      </div>
    </main>
  );
}
