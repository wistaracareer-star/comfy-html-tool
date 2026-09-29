import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGAP Project · Ruang Kerja Kolaborasi" },
      { name: "description", content: "Kelola tugas harian, kolaborasi lintas divisi, dan KPI dalam satu ruang kerja." },
      { property: "og:title", content: "SIGAP Project · Ruang Kerja Kolaborasi" },
      { property: "og:description", content: "Kelola tugas harian, kolaborasi lintas divisi, dan KPI dalam satu ruang kerja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="auth-page">
      <div className="sig-card auth-card">
        <div className="brand"><span>S</span><b>SIGAP Project</b></div>
        <h1>Ruang kerja kolaborasi tim Anda</h1>
        <p>Tugas harian, papan lintas divisi, dokumen, dan KPI — semuanya di satu tempat.</p>
        <Link to="/auth" className="sig-button">Masuk atau daftar</Link>
      </div>
    </div>
  );
}
