import { createFileRoute } from "@tanstack/react-router";
import { SigapApp } from "@/components/SigapApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGAP Project · Ruang Kerja Kolaborasi" },
      { name: "description", content: "Ruang kerja SIGAP untuk mengelola task, kolaborasi lintas divisi, dokumen, dan pencapaian KPI." },
      { property: "og:title", content: "SIGAP Project · Ruang Kerja Kolaborasi" },
      { property: "og:description", content: "Kelola pekerjaan harian, kolaborasi lintas divisi, dan KPI dalam satu ruang kerja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <SigapApp />;
}
