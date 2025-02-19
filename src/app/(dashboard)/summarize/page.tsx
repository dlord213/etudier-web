"use client";
import { SummarizePDFPage } from "./components";
import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";

export default function Page() {
  return (
    <main className="flex flex-col min-h-screen">
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-4 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        <SummarizePDFPage />
      </section>
      <FloatingDock items={links} />
    </main>
  );
}
