import { createFileRoute, Link } from "@tanstack/react-router";

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
  return (
    <div className="auth-page">
      <div className="sig-card auth-card">
        <div className="brand"><span>S</span><b>SIGAP Project</b></div>
        <h1>Ruang kerja kolaborasi lintas divisi</h1>
        <p className="muted-copy">Task harian, papan lintas divisi, permintaan bantuan, dokumen, sasaran bersama, dan KPI untuk 15 divisi — dengan akses berbeda untuk Manager, SPV, dan Staf.</p>
        <Link to="/app" className="sig-button sig-button-primary">Buka ruang kerja</Link>
        <Link to="/auth" className="sig-button sig-button-soft">Masuk atau daftar</Link>
      </div>
    </div>
  );
}
