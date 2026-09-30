import { createFileRoute } from "@tanstack/react-router";
import { SigapApp } from "@/components/SigapApp";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Ruang Kerja · SIGAP Project" },
      { name: "description", content: "Kelola task harian, papan lintas divisi, dokumen, sasaran bersama, dan KPI." },
      { property: "og:title", content: "Ruang Kerja · SIGAP Project" },
      { property: "og:description", content: "Ruang kerja kolaborasi SIGAP untuk Manager, SPV, dan Staf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SigapApp,
});
