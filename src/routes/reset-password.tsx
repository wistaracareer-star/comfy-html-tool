import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Atur Ulang Kata Sandi · SIGAP Project" },
      { name: "description", content: "Buat kata sandi baru untuk akun SIGAP Anda." },
      { property: "og:title", content: "Atur Ulang Kata Sandi · SIGAP Project" },
      { property: "og:description", content: "Buat kata sandi baru untuk akun SIGAP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message); else navigate({ to: "/app" });
  };
  return (
    <div className="auth-page">
      <form className="sig-card auth-card form-card" onSubmit={submit}>
        <div className="brand"><span>S</span><b>SIGAP Project</b></div>
        <h1>Kata sandi baru</h1>
        <label className="form-field"><span>Kata sandi baru</span><input name="password" type="password" minLength={6} required autoComplete="new-password" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="sig-button sig-button-primary" disabled={busy} type="submit">{busy ? "Menyimpan…" : "Simpan kata sandi"}</button>
      </form>
    </div>
  );
}
