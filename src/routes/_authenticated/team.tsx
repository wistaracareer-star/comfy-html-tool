import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DIVISIONS, ROLE_LABEL, useMe, type Role } from "@/lib/sigap";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Kelola Tim · SIGAP Project" },
      { name: "description", content: "Manager mengatur jabatan dan divisi pegawai SIGAP." },
      { property: "og:title", content: "Kelola Tim · SIGAP Project" },
      { property: "og:description", content: "Atur jabatan Manager, SPV, dan Staf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("Semua");
  const [msg, setMsg] = useState("");
  const { data: people = [] } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, division").order("display_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (profiles ?? []).map((p) => ({ ...p, role: (roles?.find((r) => r.user_id === p.id)?.role ?? "staf") as Role }));
    },
  });

  if (me && me.role !== "manager") {
    return <div className="auth-page"><div className="sig-card auth-card"><h1>Khusus Manager</h1><p className="muted-copy">Halaman ini hanya untuk Manager.</p><Link className="sig-button sig-button-primary" to="/app">Kembali</Link></div></div>;
  }

  const update = async (id: string, patch: { role?: Role; division?: string }) => {
    setMsg("");
    const res = patch.role
      ? await supabase.from("user_roles").update({ role: patch.role }).eq("user_id", id)
      : await supabase.from("profiles").update({ division: patch.division }).eq("id", id);
    if (res.error) setMsg(res.error.message); else setMsg("Tersimpan");
    qc.invalidateQueries({ queryKey: ["team"] });
    if (id === me?.id) qc.invalidateQueries({ queryKey: ["me"] });
  };

  const shown = people.filter((p) => filter === "Semua" || p.division === filter);
  return (
    <main className="team-page">
      <header className="page-header"><div><h1>Kelola tim</h1><p>Atur jabatan (Manager, SPV, Staf) dan divisi setiap pegawai.</p></div><Link className="sig-button sig-button-soft" to="/app">Kembali ke ruang kerja</Link></header>
      <section className="sig-card">
        <label className="form-field"><span>Filter divisi</span><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Semua</option>{DIVISIONS.map((d) => <option key={d}>{d}</option>)}</select></label>
        {msg && <p className="muted-copy" role="status">{msg}</p>}
        <div className="team-list">
          {shown.map((p) => (
            <div className="team-row" key={p.id}>
              <b>{p.display_name || "(tanpa nama)"}{p.id === me?.id ? " (Anda)" : ""}</b>
              <select aria-label="Divisi" value={p.division} onChange={(e) => update(p.id, { division: e.target.value })}>{DIVISIONS.map((d) => <option key={d}>{d}</option>)}</select>
              <select aria-label="Jabatan" value={p.role} onChange={(e) => update(p.id, { role: e.target.value as Role })}>{(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
            </div>
          ))}
          {!shown.length && <p className="muted-copy">Belum ada pegawai.</p>}
        </div>
      </section>
    </main>
  );
}
