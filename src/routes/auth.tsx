import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DIVISIONS } from "@/lib/sigap";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk · SIGAP Project" },
      { name: "description", content: "Masuk atau daftar ke ruang kerja SIGAP sebagai Manager, SPV, atau Staf." },
      { property: "og:title", content: "Masuk · SIGAP Project" },
      { property: "og:description", content: "Masuk ke ruang kerja kolaborasi SIGAP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "masuk" | "daftar" | "lupa";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("masuk");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/app" }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/app" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true); setError(""); setMessage("");
    try {
      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "daftar") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { display_name: String(form.get("name") ?? "").trim(), division: String(form.get("division") ?? "HRD") },
          },
        });
        if (error) throw error;
        if (!data.session) setMessage("Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMessage("Tautan atur ulang kata sandi telah dikirim ke email Anda.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setBusy(false); }
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) setError("Gagal masuk dengan Google");
  };

  return (
    <div className="auth-page">
      <div className="sig-card auth-card">
        <div className="brand"><span>S</span><b>SIGAP Project</b></div>
        <h1>{mode === "masuk" ? "Masuk ke ruang kerja" : mode === "daftar" ? "Buat akun baru" : "Lupa kata sandi"}</h1>
        <p className="muted-copy">
          {mode === "daftar" ? "Akun baru terdaftar sebagai Staf. Manager dapat mengubah jabatan Anda menjadi SPV atau Manager." : "Akses menyesuaikan jabatan Anda: Manager, SPV, atau Staf."}
        </p>
        <form className="form-card" onSubmit={submit}>
          {mode === "daftar" && <>
            <label className="form-field"><span>Nama lengkap</span><input name="name" required maxLength={80} /></label>
            <label className="form-field"><span>Divisi</span><select name="division" defaultValue="HRD">{DIVISIONS.map((d) => <option key={d}>{d}</option>)}</select></label>
          </>}
          <label className="form-field"><span>Email</span><input name="email" type="email" required autoComplete="email" /></label>
          {mode !== "lupa" && <label className="form-field"><span>Kata sandi</span><input name="password" type="password" required minLength={6} autoComplete={mode === "masuk" ? "current-password" : "new-password"} /></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-ok" role="status">{message}</p>}
          <button className="sig-button sig-button-primary" type="submit" disabled={busy}>
            {busy ? "Memproses…" : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Kirim tautan"}
          </button>
        </form>
        {mode !== "lupa" && <button className="sig-button sig-button-soft auth-google" type="button" onClick={google}>Lanjutkan dengan Google</button>}
        <div className="auth-links">
          {mode !== "masuk" && <button type="button" onClick={() => setMode("masuk")}>Sudah punya akun? Masuk</button>}
          {mode !== "daftar" && <button type="button" onClick={() => setMode("daftar")}>Belum punya akun? Daftar</button>}
          {mode === "masuk" && <button type="button" onClick={() => setMode("lupa")}>Lupa kata sandi?</button>}
        </div>
      </div>
    </div>
  );
}
