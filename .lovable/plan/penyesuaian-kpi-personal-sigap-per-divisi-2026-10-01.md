# Penyesuaian KPI Personal SIGAP per Divisi

## Tujuan
Mengganti tampilan KPI lama dengan KPI personal berbasis SIGAP sesuai file acuan, memakai divisi dan jabatan pengguna yang sedang masuk.

## Yang akan dibangun
- KPI dasar **S, I, G, A, P** dengan fokus, indikator, objektif, target, bobot, realisasi, dan nilai capaian yang berbeda untuk setiap divisi.
- Pilihan periode bulanan, ringkasan nilai akhir, total bobot, serta status Sangat Baik/Baik/Cukup/Kurang.
- Input realisasi KPI dan catatan bukti untuk Staf; SPV dan Manager dapat menilai pegawai sesuai cakupan aksesnya.
- KPI khusus jabatan dan tambahan KPI level pimpinan mengikuti pola pada file acuan.
- Lampiran bukti memakai dokumen SIGAP yang sudah tersedia.
- Rekap nilai per orang/divisi untuk Manager dan rekap satu divisi untuk SPV; Staf hanya melihat KPI sendiri.
- Tampilan responsif yang menyatu dengan navigasi dan gaya SIGAP saat ini.

## Penyimpanan dan akses
- Nilai, target, bobot, realisasi, catatan, dan periode disimpan permanen di Lovable Cloud.
- Aturan akses mengikuti akun yang sedang masuk: Staf untuk dirinya, SPV untuk divisinya, Manager untuk semua divisi.
- Data KPI awal tiap divisi dibuat dari definisi lengkap dalam file acuan.

## Pemeriksaan
- Uji simpan dan muat ulang nilai KPI.
- Uji tampilan dan batas akses Staf, SPV, dan Manager.
- Uji desktop dan seluler serta pastikan tidak ada kesalahan aplikasi.
