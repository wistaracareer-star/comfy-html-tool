import { createFileRoute } from "@tanstack/react-router";
import { SigapApp } from "@/components/SigapApp";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Ruang Kerja · SIGAP Project" },
      { name: "description", content: "Ruang kerja kolaborasi, papan tugas, dan KPI SIGAP." },
      { property: "og:title", content: "Ruang Kerja · SIGAP Project" },
      { property: "og:description", content: "Ruang kerja kolaborasi, papan tugas, dan KPI SIGAP." },
    ],
  }),
  component: SigapApp,
});
