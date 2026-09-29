import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Handshake,
  Image as ImageIcon,
  LayoutDashboard,
  Paperclip,
  Plus,
  Search,
  Sun,
  Target,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";

type View = "hari" | "papan" | "minta" | "dok" | "dash" | "kpi";
type Task = { title: string; project: string; hours: number; done: boolean };
type Card = { id: number; title: string; from: string; to: string; due: number; column: number; onTime?: boolean };
type Doc = { id: number; name: string; size: number; context: string; category: string; by: string; date: string; url?: string; image?: boolean };
type Request = { title: string; to: string; due: number; attachments: number };

const DIVISIONS = ["Finance", "HR", "IT", "Operasional", "Sales", "Support"];
const COLUMNS = ["Antrean", "Dikerjakan", "Perlu dicek", "Selesai"];
const PERIODS = ["Okt", "Nov", "Des"];

const initialTasks: Task[] = [
  { title: "Susun dokumen alur permintaan", project: "Proyek Integrasi", hours: 3, done: false },
  { title: "Balas permintaan dari Finance", project: "Lintas divisi", hours: 1, done: false },
  { title: "Rekap data mingguan", project: "Rutin", hours: 2, done: true },
  { title: "Cek draf template sasaran", project: "Proyek Integrasi", hours: 1, done: false },
];

const initialCards: Card[] = [
  { id: 1, title: "Rekap data lintas divisi", from: "Finance", to: "HR", due: 5, column: 0 },
  { id: 2, title: "Perbarui template sasaran", from: "HR", to: "Sales", due: 9, column: 0 },
  { id: 3, title: "Dokumen alur permintaan", from: "IT", to: "Operasional", due: 2, column: 1 },
  { id: 4, title: "Sesi berbagi: cara pakai CRM", from: "Sales", to: "Support", due: 4, column: 1 },
  { id: 5, title: "Laporan mingguan divisi", from: "Operasional", to: "HR", due: 0, column: 2 },
  { id: 6, title: "Notulen koordinasi bulanan", from: "HR", to: "IT", due: 3, column: 3, onTime: true },
  { id: 7, title: "Template permintaan", from: "IT", to: "HR", due: 1, column: 3, onTime: true },
  { id: 8, title: "Data absen divisi Support", from: "Support", to: "HR", due: -1, column: 3, onTime: false },
];

const initialDocs: Doc[] = [
  { id: 1, name: "Notulen_koordinasi_Sep.docx", size: 48213, context: "Berbagi", category: "Notulen", by: "HR", date: "21/9/2026" },
  { id: 2, name: "Materi_sesi_CRM.pdf", size: 1834211, context: "Berbagi", category: "Materi berbagi", by: "Sales", date: "18/9/2026" },
  { id: 3, name: "Bukti_rekap_data.xlsx", size: 96420, context: "Berbagi", category: "Bukti kerja", by: "Finance", date: "15/9/2026" },
];

const navItems = [
  { id: "hari" as const, label: "Hari ini", icon: Sun },
  { id: "papan" as const, label: "Papan", icon: LayoutDashboard },
  { id: "minta" as const, label: "Minta bantuan", icon: Handshake },
  { id: "dok" as const, label: "Dokumen", icon: FolderOpen },
  { id: "dash" as const, label: "Selaras", icon: BarChart3 },
  { id: "kpi" as const, label: "KPI saya", icon: Target },
];

const divisionClass: Record<string, string> = {
  Finance: "avatar-finance", HR: "avatar-hr", IT: "avatar-it",
  Operasional: "avatar-ops", Sales: "avatar-sales", Support: "avatar-support",
};

function Button({ children, tone = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "soft" | "icon" }) {
  return <button className={`sig-button sig-button-${tone} ${className}`} {...props}>{children}</button>;
}

function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "ok" | "warn" | "bad" }) {
  return <span className={`sig-chip sig-chip-${tone}`}>{children}</span>;
}

function Avatar({ division }: { division: string }) {
  return <span className={`sig-avatar ${divisionClass[division] ?? "avatar-it"}`} title={division}>{division[0]}</span>;
}

function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <header className="page-header"><div className="min-w-0"><h1>{title}</h1><p>{subtitle}</p></div>{children}</header>;
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 40;
  return <div className="progress-ring"><svg viewBox="0 0 96 96" aria-hidden="true"><circle className="ring-track" cx="48" cy="48" r="40" /><circle className="ring-value" cx="48" cy="48" r="40" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value)} /></svg><b>{Math.round(value * 100)}%</b></div>;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const Icon = /^(jpg|jpeg|png|gif|webp)$/.test(ext ?? "") ? FileImage : /^(xlsx|xls|csv)$/.test(ext ?? "") ? FileSpreadsheet : /^(zip|rar|7z)$/.test(ext ?? "") ? FileArchive : FileText;
  return <Icon size={21} />;
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function statusForCard(card: Card) {
  if (card.column === 3) return card.onTime ? <Chip tone="ok">Tepat waktu</Chip> : <Chip tone="bad">Terlambat</Chip>;
  if (card.due <= 0) return <Chip tone="bad">Jatuh tempo</Chip>;
  if (card.due <= 2) return <Chip tone="warn">{card.due} hari lagi</Chip>;
  return <Chip>{card.due} hari lagi</Chip>;
}

export function SigapApp() {
  const [view, setView] = useState<View>("hari");
  const [tasks, setTasks] = useState(initialTasks);
  const [cards, setCards] = useState(initialCards);
  const [docs, setDocs] = useState(initialDocs);
  const [requests, setRequests] = useState<Request[]>([]);
  const [sessions, setSessions] = useState(3);
  const [linked, setLinked] = useState(() => new Set(["HR", "IT", "Finance", "Sales"]));
  const [period, setPeriod] = useState(2);
  const [sigapWeight, setSigapWeight] = useState(30);
  const [openValues, setOpenValues] = useState(() => new Set(["S"]));
  const [development, setDevelopment] = useState([false, false, false]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [category, setCategory] = useState("Bukti kerja");
  const [preview, setPreview] = useState<Doc | null>(null);
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [uploadContext, setUploadContext] = useState("Berbagi");
  const [uploadCategory, setUploadCategory] = useState("Bukti kerja");
  const fileInput = useRef<HTMLInputElement>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const moveCard = (id: number, column: number) => {
    if (column < 0 || column > 3) return;
    setCards((current) => current.map((card) => {
      if (card.id !== id) return card;
      return column === 3 ? { ...card, column, onTime: card.due >= 0 } : { ...card, column };
    }));
  };

  const chooseFiles = (context: string, selectedCategory = "Bukti kerja") => {
    setUploadContext(context);
    setUploadCategory(selectedCategory);
    window.setTimeout(() => fileInput.current?.click(), 0);
  };

  const addFiles = (files: FileList | File[], context = uploadContext, selectedCategory = uploadCategory) => {
    const safeFiles = Array.from(files).filter((file) => {
      if (/\.(exe|bat|cmd|msi|sh|js|vbs|scr|com|jar|ps1)$/i.test(file.name)) { notify(`Ditolak: ${file.name}`); return false; }
      if (file.size > 10 * 1024 * 1024) { notify(`Ditolak: ${file.name} melebihi 10 MB`); return false; }
      return true;
    });
    if (!safeFiles.length) return;
    const now = new Date().toLocaleDateString("id-ID");
    setDocs((current) => [...safeFiles.map((file, index) => ({ id: Date.now() + index, name: file.name, size: file.size, context, category: selectedCategory, by: "Rina", date: now, url: URL.createObjectURL(file), image: file.type.startsWith("image/") })), ...current]);
    notify(`${safeFiles.length} file diunggah`);
  };

  const renderToday = () => {
    const completed = tasks.filter((task) => task.done).length;
    const progress = completed / tasks.length;
    const hours = tasks.filter((task) => task.done).reduce((sum, task) => sum + task.hours, 0);
    return <><Header title="Selamat bekerja, Rina" subtitle="Rencanakan hari ini dan catat hasilnya. Manager melihat ringkasan Anda saat hari ditutup." />
      <div className="two-column-layout"><div className="content-stack">
        <section className="sig-card today-hero"><ProgressRing value={progress} /><div><h2>{completed} dari {tasks.length} task selesai</h2><p>{progress === 1 ? "Semua beres. Saatnya tutup hari." : progress >= 0.5 ? "Tinggal sedikit lagi." : "Yuk mulai dari yang paling mendesak."}</p></div></section>
        <section className="sig-card"><h3>Rencana hari ini</h3><div className="task-list">{tasks.map((task, index) => <label className={`task-row ${task.done ? "is-done" : ""}`} key={`${task.title}-${index}`}><input type="checkbox" checked={task.done} onChange={(event) => setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: event.target.checked } : item))} /><span className="task-copy"><b>{task.title}</b><small>{task.project} · estimasi {task.hours} jam</small></span><Chip tone={task.done ? "ok" : "default"}>{task.done ? "Selesai" : "Belum"}</Chip></label>)}</div>
          <form className="add-task" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("task") ?? "").trim(); if (title) { setTasks((current) => [...current, { title, project: "Tambahan", hours: 1, done: false }]); event.currentTarget.reset(); } }}><input name="task" placeholder="Tambah task baru, lalu tekan Enter" aria-label="Task baru" /><Button tone="soft" type="submit"><Plus size={17} />Tambah</Button></form>
        </section>
        <section className="sig-card"><h3>Bukti dan lampiran hari ini</h3><DropZone onChoose={() => chooseFiles("Task Harian")} onDrop={(files) => addFiles(files, "Task Harian")} />{docs.filter((doc) => doc.context === "Task Harian").map(renderFile)}</section>
      </div><aside className="sig-card summary-card"><h3>Ringkasan hari ini</h3><SummaryRow label="Jam tercatat" value={`${hours} jam`} /><SummaryRow label="Task tersisa" value={String(tasks.length - completed)} /><SummaryRow label="Kendala terbuka" value="1" /><Button tone="soft" onClick={() => notify("Kendala terkirim ke manager")}>Laporkan kendala</Button><Button onClick={() => notify("Hari ditutup. Ringkasan dikirim ke manager.")}>Tutup hari</Button><p>Jam diisi sendiri. Aplikasi tidak memantau layar Anda.</p></aside></div></>;
  };

  const renderBoard = () => <><Header title="Papan task lintas divisi" subtitle="Geser kartu antar kolom, atau pakai tombol panah. Tepat waktu atau terlambat tercatat otomatis saat kartu masuk Selesai." /><div className="board">{COLUMNS.map((column, columnIndex) => <section key={column} className={`board-column ${dragOver === columnIndex ? "is-over" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragOver(columnIndex); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => { event.preventDefault(); moveCard(Number(event.dataTransfer.getData("text/plain")), columnIndex); setDragOver(null); }}><h3>{column}<Chip>{cards.filter((card) => card.column === columnIndex).length}</Chip></h3>{cards.filter((card) => card.column === columnIndex).map((card) => <article draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(card.id))} className="board-card" key={card.id}><b>{card.title}</b><div className="card-flow"><Avatar division={card.from} /><span>→</span><Avatar division={card.to} /><span>{card.from} ke {card.to}</span></div><footer>{statusForCard(card)}<span><Button tone="icon" aria-label="Mundur" onClick={() => moveCard(card.id, card.column - 1)} disabled={card.column === 0}><ArrowLeft size={15} /></Button><Button tone="icon" aria-label="Maju" onClick={() => moveCard(card.id, card.column + 1)} disabled={card.column === 3}><ArrowRight size={15} /></Button></span></footer></article>)}</section>)}</div></>;

  const renderRequest = () => <><Header title="Minta bantuan divisi lain" subtitle="Isi sekali, penerima langsung melihatnya di papan. Jika lewat batas waktu, manager penerima diberi tahu." /><div className="two-column-layout"><form className="sig-card form-card" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const title = String(data.get("title") ?? ""); const to = String(data.get("to") ?? "HR"); const due = Number(data.get("due") ?? 5); const attachments = docs.filter((doc) => doc.context === "Draf permintaan").length; setRequests((current) => [{ title, to, due, attachments }, ...current]); setCards((current) => [...current, { id: Date.now(), title, from: "HR", to, due, column: 0 }]); notify(`Permintaan terkirim ke ${to}`); event.currentTarget.reset(); }}><Field label="Apa yang Anda butuhkan?"><input name="title" required placeholder="Contoh: Data absensi bulan ini" /></Field><Field label="Divisi tujuan"><select name="to">{DIVISIONS.map((division) => <option key={division}>{division}</option>)}</select></Field><Field label="Sasaran bersama"><select name="goal"><option>Retensi karyawan</option><option>Efisiensi proses</option><option>Kepuasan pelanggan</option></select></Field><Field label="Dibutuhkan dalam (hari)"><input name="due" type="number" min="1" max="30" defaultValue="5" /></Field><label className="field-label">Lampiran (opsional)</label><DropZone onChoose={() => chooseFiles("Draf permintaan")} onDrop={(files) => addFiles(files, "Draf permintaan")} />{docs.filter((doc) => doc.context === "Draf permintaan").map(renderFile)}<Button type="submit">Kirim permintaan</Button></form><section className="sig-card"><h3>Permintaan Anda</h3>{requests.length ? requests.map((request, index) => <div className="request-row" key={`${request.title}-${index}`}><b>{request.title}</b><small>ke {request.to} · {request.due} hari{request.attachments ? ` · ${request.attachments} lampiran` : ""}</small><div className="request-steps"><i className="active" />Diajukan<i />Diterima<i />Selesai</div></div>) : <p className="muted-copy">Belum ada permintaan. Isi formulir di samping untuk memulai.</p>}</section></div></>;

  const completedCards = cards.filter((card) => card.column === 3);
  const onTimeScore = completedCards.length ? Math.round(completedCards.filter((card) => card.onTime).length / completedCards.length * 100) : 0;
  const linkedScore = Math.round(linked.size / DIVISIONS.length * 100);
  const renderAlignment = () => <><Header title="Dashboard Selaras" subtitle="Tiga angka ini mengukur kolaborasi lintas divisi dan menjadi masukan KPI. Data di sini contoh dan bereaksi saat Anda menggeser kartu." /><div className="metric-grid"><MetricCard label="S1 · Tepat waktu" value={`${onTimeScore}%`} progress={onTimeScore} detail={`Permintaan lintas divisi selesai sesuai batas waktu (${completedCards.filter((card) => card.onTime).length} dari ${completedCards.length}).`} /><MetricCard label="S2 · Berbagi ilmu" value={String(sessions)} progress={Math.min(100, sessions * 20)} detail="Sesi berbagi pengetahuan bulan ini."><Button tone="soft" onClick={() => setSessions((value) => value + 1)}><Plus size={16} />Catat sesi</Button></MetricCard><MetricCard label="S3 · Sasaran bersama" value={`${linkedScore}%`} progress={linkedScore} detail="Divisi yang sasarannya terhubung ke sasaran perusahaan. Klik untuk mengubah."><div className="division-toggles">{DIVISIONS.map((division) => <button key={division} className={linked.has(division) ? "active" : ""} onClick={() => setLinked((current) => { const next = new Set(current); next.has(division) ? next.delete(division) : next.add(division); return next; })}>{division}</button>)}</div></MetricCard></div><Button className="top-gap" onClick={() => notify("Data Selaras dikirim ke Database KPI")}>Kirim ke Database KPI</Button></>;

  const fileType = (name: string) => { const ext = name.split(".").pop()?.toLowerCase(); if (/^(jpg|jpeg|png|gif|webp)$/.test(ext ?? "")) return "Gambar"; if (ext === "pdf") return "PDF"; if (/^docx?$/.test(ext ?? "")) return "Word"; if (/^(xlsx|xls|csv)$/.test(ext ?? "")) return "Excel"; return "Lainnya"; };
  const visibleDocs = docs.filter((doc) => (filter === "Semua" || fileType(doc.name) === filter) && doc.name.toLowerCase().includes(query.toLowerCase()));
  const renderDocuments = () => <><Header title="Dokumen" subtitle="Simpan bukti kerja, notulen, dan materi berbagi pengetahuan di satu tempat agar semua divisi bisa menemukannya." /><div className="two-column-layout documents-layout"><section className="sig-card"><div className="document-toolbar"><label className="search-box"><Search size={17} /><input aria-label="Cari dokumen" placeholder="Cari nama dokumen" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="segments">{["Semua", "Gambar", "PDF", "Word", "Excel", "Lainnya"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>{visibleDocs.length ? visibleDocs.map(renderFile) : <p className="muted-copy">Tidak ada dokumen yang cocok.</p>}</section><section className="sig-card form-card"><h3>Unggah dokumen</h3><Field label="Kategori"><select value={category} onChange={(event) => setCategory(event.target.value)}>{["Bukti kerja", "Notulen", "Materi berbagi", "Kebijakan", "Lainnya"].map((item) => <option key={item}>{item}</option>)}</select></Field><DropZone onChoose={() => chooseFiles("Berbagi", category)} onDrop={(files) => addFiles(files, "Berbagi", category)} /><p className="muted-copy">File berbahaya selalu ditolak. Pratinjau tersedia untuk gambar; dokumen lain dapat diunduh. File baru hanya tersimpan sampai halaman ditutup.</p></section></div></>;

  const values = [
    { code: "S", name: "Selaras", score: Math.round((onTimeScore + sessions * 20 + linkedScore) / 3), items: ["Permintaan lintas divisi selesai sesuai batas waktu", "Sesi berbagi pengetahuan yang diisi", "Sasaran pribadi terhubung ke sasaran divisi"] },
    { code: "I", name: "Integritas", score: [83, 88, 94][period] ?? 94, items: ["Catatan kerja sesuai dengan log kerja", "Kepatuhan kode etik dan aturan", "Kendala dilaporkan lebih awal"] },
    { code: "G", name: "Gigih", score: period === 2 ? Math.round(tasks.filter((task) => task.done).length / tasks.length * 100) : ([82, 88][period] ?? 88), items: ["Task selesai tepat waktu", "Capaian target stabil antar periode", "Perbaikan proses dari pembelajaran"] },
    { code: "A", name: "Adaptif", score: [70, 90, 95][period] ?? 95, items: ["Adopsi sistem atau kebijakan baru tepat waktu", "Pelatihan sistem atau proses baru selesai", "Kepatuhan SOP di kondisi khusus"] },
    { code: "P", name: "Profesional", score: [76, 85, 92][period] ?? 92, items: ["Kepatuhan SOP pada audit sampel", "Etika kerja: disiplin dan tanggung jawab", "Jam pelatihan pengembangan kompetensi"] },
  ];
  const behaviorScore = Math.round(values.reduce((sum, item) => sum + item.score, 0) / values.length);
  const workScore = [84, 93, 96][period] ?? 96;
  const totalScore = Math.round(workScore * (100 - sigapWeight) / 100 + behaviorScore * sigapWeight / 100);
  const renderKpi = () => <><Header title="KPI saya" subtitle="Rina · Divisi HR · hasil kerja dan perilaku SIGAP dalam satu tampilan"><div className="segments period-tabs">{PERIODS.map((item, index) => <button key={item} className={period === index ? "active" : ""} onClick={() => setPeriod(index)}>{item} 2026</button>)}</div></Header><div className="kpi-grid"><section className="sig-card score-card"><Chip>Skor akhir · {PERIODS[period]}</Chip><div className="score-number">{totalScore}<span>/100</span></div><p><b>{totalScore >= 90 ? "Sangat baik" : totalScore >= 80 ? "Baik" : "Perlu pembinaan"}</b></p><div className="split-bar"><i style={{ width: `${100 - sigapWeight}%` }} /><i style={{ width: `${sigapWeight}%` }} /></div><div className="legend"><span><i />Hasil kerja <b>{workScore}</b> · bobot {100 - sigapWeight}%</span><span><i />Perilaku SIGAP <b>{behaviorScore}</b> · bobot {sigapWeight}%</span></div><Field label={`Bobot SIGAP (contoh, ditetapkan direksi): ${sigapWeight}%`}><input type="range" min="10" max="50" step="5" value={sigapWeight} onChange={(event) => setSigapWeight(Number(event.target.value))} /></Field></section><section className="sig-card radar-card"><b>Profil nilai SIGAP</b><Radar values={values.map((item) => item.score)} /></section><section className="sig-card trend-card"><b>Tren skor akhir</b><Trend current={period} values={[82, 90, totalScore]} /><p className="muted-copy">Data Des ikut berubah saat Anda mencentang Task Harian atau menggeser kartu di Papan.</p></section></div><h2 className="section-title">Perilaku SIGAP per nilai</h2>{values.map((value) => { const open = openValues.has(value.code); return <section className="sig-card value-card" key={value.code}><button className="value-heading" onClick={() => setOpenValues((current) => { const next = new Set(current); next.has(value.code) ? next.delete(value.code) : next.add(value.code); return next; })} aria-expanded={open}><span className={`value-letter value-${value.code.toLowerCase()}`}>{value.code}</span><span><b>{value.name}</b><span className="progress"><i style={{ width: `${value.score}%` }} /></span></span><strong>{value.score}</strong>{open ? <ChevronUp /> : <ChevronDown />}</button>{open && value.items.map((item, index) => <div className="value-row" key={item}><Chip>{value.code}{index + 1}</Chip><span>{item}<small>Bukti: catatan dan laporan terkait</small></span><span><span className="progress"><i style={{ width: `${Math.min(100, value.score + index * 2)}%` }} /></span><small>{Math.min(100, value.score + index * 2)}% dari target 90%</small></span><Chip tone={value.score >= 90 ? "ok" : value.score >= 80 ? "warn" : "bad"}>{value.score >= 90 ? "Tercapai" : value.score >= 80 ? "Hampir" : "Perlu perhatian"}</Chip></div>)}</section>; })}<h2 className="section-title">Hasil kerja (KPI jabatan, contoh)</h2><section className="sig-card work-list">{["Laporan divisi selesai tepat waktu", "Akurasi data yang diinput", "Target tugas jabatan tercapai"].map((item, index) => <div className="value-row" key={item}><Chip>H{index + 1}</Chip><span>{item}<small>Bukti: laporan dan audit data</small></span><span><span className="progress"><i style={{ width: `${workScore - index * 2}%` }} /></span><small>{workScore - index * 2}% dari target 95%</small></span><Chip tone="ok">Tercapai</Chip></div>)}</section><div className="bottom-kpi-grid"><section className="sig-card"><b>Penilaian manager</b><p>Konsisten dan mulai membantu rekan divisi lain. Tantangan berikutnya: berbagi pengetahuan secara rutin.</p><p className="muted-copy">Wajib disertai bukti atau alasan dan dikalibrasi Komite SIGAP. <Chip tone="ok">Sudah dikalibrasi</Chip></p></section><section className="sig-card development"><b>Rencana development</b>{["Ikuti pelatihan sistem baru (A2)", "Isi satu sesi berbagi pengetahuan (S2)", "Laporkan kendala lebih awal (I3)"].map((item, index) => <label key={item}><input type="checkbox" checked={development[index]} onChange={(event) => setDevelopment((current) => current.map((checked, itemIndex) => itemIndex === index ? event.target.checked : checked))} />{item}</label>)}</section></div></>;

  function renderFile(doc: Doc) {
    return <div className="file-row" key={doc.id}><span className="file-icon"><FileIcon name={doc.name} /></span><span className="file-copy"><b title={doc.name}>{doc.name}</b><small>{fileSize(doc.size)} · {doc.category} · {doc.by} · {doc.date}{!doc.url && <> · <Chip>contoh</Chip></>}</small></span>{doc.image && <Button tone="soft" onClick={() => setPreview(doc)}><ImageIcon size={15} />Lihat</Button>}{doc.url && <a className="file-action" href={doc.url} download={doc.name}>Unduh</a>}<Button tone="icon" aria-label={`Hapus ${doc.name}`} onClick={() => { if (doc.url) URL.revokeObjectURL(doc.url); setDocs((current) => current.filter((item) => item.id !== doc.id)); }}><Trash2 size={16} /></Button></div>;
  }

  const currentContent = view === "hari" ? renderToday() : view === "papan" ? renderBoard() : view === "minta" ? renderRequest() : view === "dok" ? renderDocuments() : view === "dash" ? renderAlignment() : renderKpi();

  return <div className="sigap-shell"><nav aria-label="Menu utama"><div className="brand"><span>S</span><b>SIGAP Project</b></div>{navItems.map((item) => { const Icon = item.icon; return <button className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} key={item.id}><Icon size={19} /><span>{item.label}</span></button>; })}</nav><main>{currentContent}<p className="prototype-note">Prototipe untuk pembahasan desain. Semua data adalah contoh.</p></main><input ref={fileInput} hidden multiple type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />{toast && <div className="sig-toast" role="status">{toast}</div>}{preview?.url && <div className="preview-backdrop" role="dialog" aria-modal="true" aria-label="Pratinjau gambar"><div className="preview-dialog"><Button tone="icon" aria-label="Tutup pratinjau" onClick={() => setPreview(null)}><X /></Button><img src={preview.url} alt={`Pratinjau ${preview.name}`} /></div></div>}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="summary-row"><span>{label}</span><b>{value}</b></div>; }
function DropZone({ onChoose, onDrop }: { onChoose: () => void; onDrop: (files: FileList) => void }) { const [over, setOver] = useState(false); return <button type="button" className={`drop-zone ${over ? "is-over" : ""}`} onClick={onChoose} onDragOver={(event) => { event.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(event) => { event.preventDefault(); setOver(false); onDrop(event.dataTransfer.files); }}><Upload size={24} /><b>Tarik file ke sini atau klik untuk memilih</b><small>JPG, PNG, PDF, Word, Excel, PowerPoint, TXT, CSV, ZIP · maks. 10 MB per file</small></button>; }
function MetricCard({ label, value, progress, detail, children }: { label: string; value: string; progress: number; detail: string; children?: React.ReactNode }) { return <section className="sig-card metric-card"><Chip>{label}</Chip><div>{value}</div><span className="progress"><i style={{ width: `${progress}%` }} /></span><p>{detail}</p>{children}</section>; }

function Radar({ values }: { values: number[] }) {
  const point = (index: number, scale: number) => { const angle = index * 2 * Math.PI / 5; return `${110 + Math.sin(angle) * 76 * scale},${110 - Math.cos(angle) * 76 * scale}`; };
  return <svg viewBox="0 0 220 220" aria-label="Radar nilai SIGAP">{[0.25, 0.5, 0.75, 1].map((scale) => <polygon key={scale} points={values.map((_, index) => point(index, scale)).join(" ")} className="radar-grid" />)}<polygon points={values.map((value, index) => point(index, value / 100)).join(" ")} className="radar-shape" />{["S", "I", "G", "A", "P"].map((label, index) => { const [x, y] = point(index, 1.2).split(","); return <text key={label} x={x} y={Number(y) + 4} textAnchor="middle">{label}</text>; })}</svg>;
}

function Trend({ values, current }: { values: number[]; current: number }) {
  const points = values.map((value, index) => `${30 + index * 120},${90 - (value - 60) / 40 * 70}`).join(" ");
  return <svg viewBox="0 0 300 120" aria-label="Tren skor"><polyline points={points} className="trend-line" />{values.map((value, index) => { const x = 30 + index * 120; const y = 90 - (value - 60) / 40 * 70; return <g key={PERIODS[index]}><circle cx={x} cy={y} r={current === index ? 7 : 5} className={current === index ? "current" : ""} /><text x={x} y={y - 12} textAnchor="middle">{value}</text><text className="axis-label" x={x} y="112" textAnchor="middle">{PERIODS[index]}</text></g>; })}</svg>;
}