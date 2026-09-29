import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

const divisions = ["Finance", "HR", "IT", "Operasional", "Sales", "Support"];

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk · SIGAP Project" },
      { name: "description", content: "Masuk atau daftar ke ruang kerja SIGAP Project." },
      { property: "og:title", content: "Masuk · SIGAP Project" },
      { property: "og:description", content: "Masuk atau daftar ke ruang kerja SIGAP Project." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [division, setDivision] = useState("IT");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/workspace", replace: true }); });
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ ok: false, text: "Email atau kata sandi salah, atau email belum dikonfirmasi." });
      else navigate({ to: "/workspace", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/workspace", data: { display_name: name, division } },
      });
      if (error) setMsg({ ok: false, text: error.message });
      else if (data.session) navigate({ to: "/workspace", replace: true });
      else setMsg({ ok: true, text: "Cek email Anda untuk mengonfirmasi pendaftaran." });
    }
    setBusy(false);
  }

  return (
    <div className="auth-page">
      <form className="sig-card auth-card" onSubmit={submit}>
        <div className="brand"><span>S</span><b>SIGAP Project</b></div>
        <h1>{mode === "in" ? "Masuk" : "Buat akun"}</h1>
        {mode === "up" && (
          <>
            <label>Nama tampilan<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Divisi<select value={division} onChange={(e) => setDivision(e.target.value)}>{divisions.map((d) => <option key={d}>{d}</option>)}</select></label>
          </>
        )}
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Kata sandi<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {msg && <p className={msg.ok ? "auth-ok" : "auth-err"}>{msg.text}</p>}
        <button className="sig-button" disabled={busy}>{busy ? "Memproses…" : mode === "in" ? "Masuk" : "Daftar"}</button>
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
          {mode === "in" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </form>
    </div>
  );
}
