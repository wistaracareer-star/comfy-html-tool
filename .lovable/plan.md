# SIGAP: Data Permanen, Divisi Baru, dan Login per Jabatan

## Tujuan
Semua fitur SIGAP bisa dipakai sungguhan: data disimpan permanen di Cloud, ada login, dan tiap jabatan (Manager, SPV, Staf) mendapat akses berbeda. Aturan lama "data contoh direset saat reload" diganti dengan penyimpanan permanen.

## Divisi (15)
MR, HRD, Finance, NOC, Keuangan, Procurement, Customer Care, Corporate & Government Technical Support, OPJ, PPJ, Help Desk, Sales Retail, Sales Corporate & Government, Legal, Marketing.
(Ejaan "Coorporate", "Goverment", "Suport", "Marekating" dirapikan.)

## Login
- Halaman masuk/daftar dengan email + kata sandi dan Google.
- Saat daftar: nama, divisi. Jabatan baru otomatis **Staf**; Manager bisa menaikkan jabatan jadi SPV/Manager di halaman "Kelola tim".
- Akun pertama yang mendaftar otomatis menjadi Manager.
- Lupa kata sandi + halaman atur ulang kata sandi.
- Tombol keluar dan nama/jabatan tampil di navigasi.

## Hak akses
| Fitur | Staf | SPV | Manager |
|---|---|---|---|
| Hari ini (task sendiri) | Kelola task sendiri | + lihat task tim divisinya | + lihat semua divisi |
| Papan | Lihat & pindahkan kartu miliknya/divisinya | Kelola semua kartu divisinya | Kelola semua kartu |
| Minta bantuan | Buat & lihat permintaan | + setujui/tugaskan di divisinya | Semua |
| Dokumen | Unggah, lihat dokumen divisi, hapus milik sendiri | + hapus dokumen divisi | Semua |
| Selaras | Lihat sasaran divisi | Ubah progres sasaran divisi | Ubah semua sasaran |
| KPI | KPI sendiri | + KPI staf divisinya | + semua pegawai, filter divisi |
| Kelola tim | – | – | Ubah jabatan & divisi pegawai |

## Sasaran bersama (disesuaikan per divisi)
Setiap divisi punya 2–3 sasaran contoh yang relevan, misalnya:
- NOC: uptime jaringan 99,9%, waktu respon gangguan < 15 menit
- Help Desk / Customer Care: SLA tiket, kepuasan pelanggan
- Sales Retail / Sales Corporate & Government: target pelanggan baru, nilai kontrak
- Finance / Keuangan: penutupan buku tepat waktu, penagihan piutang
- Procurement: lead time pengadaan; Legal: review kontrak ≤ 3 hari
- HRD: rekrutmen & pelatihan; Marketing: leads & kampanye
- MR, OPJ, PPJ, Corp & Gov Technical Support: target operasional divisi
Manager/SPV dapat mengubah target dan progres.

## Detail teknis
- Tabel: profiles (sudah ada, divisi diperluas), user_roles (enum manager/spv/staf, terpisah dari profil) + fungsi has_role dan helper divisi pengguna, tasks, board_cards, help_requests, documents, shared_goals, kpi_scores. Semua dengan GRANT + RLS sesuai tabel akses di atas.
- File dokumen di storage bucket privat; unduh lewat URL bertanda tangan.
- Sasaran bersama per divisi di-seed lewat migrasi.
- Halaman: /auth, /reset-password, area terlindungi di bawah `_authenticated` (/ jadi halaman sambutan yang mengarah ke login atau ke ruang kerja), /team untuk Manager.
- SigapApp.tsx dipecah per area dan memakai TanStack Query ke database, menggantikan useState sesi.
- Pengetahuan proyek "tetap berbasis sesi" diperbarui di AGENTS.md.
- Uji: daftar 3 akun (Manager/SPV/Staf), pastikan batas akses berlaku di tampilan dan di database.
