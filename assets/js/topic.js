(() => {
  // [judul, tujuan, JP, tautan(0 = belum tersedia)]
  const B = {
    1: {t:"Bekerja dengan Data Terstruktur", e:"🗂️", jp:20, d:"Mengenal data terstruktur serta menampilkan, mengolah, mengurutkan, dan menyaringnya secara sistematis.", ev:"evaluasi-1.html", s:[
      ["Konsep Data Terstruktur","Peserta didik mampu memahami pengertian data terstruktur, karakteristik, serta mengidentifikasi contoh data dalam tabel berdasarkan baris, kolom, dan atribut.",4,"materi-1-1.html"],
      ["Jenis dan Sumber Data","Peserta didik mampu memahami jenis dan sumber data, melakukan pengumpulan data, serta membedakan data terstruktur dan tidak terstruktur.",4,"materi-1-2.html"],
      ["Pengolahan Data Terstruktur","Peserta didik mampu memasukkan, mengubah, mengurutkan, menyaring, dan mengelola data terstruktur dalam bentuk tabel menggunakan perangkat digital.",6,"materi-1-3.html"],
      ["Analisis dan Visualisasi Data","Peserta didik mampu mengolah data menggunakan perhitungan sederhana, menemukan informasi yang dibutuhkan, serta menyajikan data dalam bentuk tabel dan grafik.",6,"materi-1-4.html"],
      ["Penerapan Data Terstruktur","Peserta didik mampu menggunakan data terstruktur untuk menyelesaikan masalah sederhana, menganalisis informasi, dan mengambil kesimpulan dalam kehidupan sehari-hari.",4,"materi-1-5.html"]]},
    2: {t:"Menerapkan Berpikir Komputasional", e:"🧩", jp:18, d:"Menerapkan pola pikir komputasional untuk menyelesaikan masalah di berbagai bidang, termasuk sains dan matematika.", ev:"evaluasi-2.html", s:[
      ["Konsep Berpikir Komputasional","Peserta didik mampu memahami pengertian, tujuan, karakteristik, dan manfaat berpikir komputasional dalam menyelesaikan berbagai masalah.",4,"materi-2.1.html"],
      ["Dekomposisi dan Pengenalan Pola","Peserta didik mampu memecah masalah menjadi bagian-bagian yang lebih kecil serta mengenali pola atau kesamaan untuk membantu menemukan solusi.",6,"materi-2.2.html"],
      ["Abstraksi dalam Pemecahan Masalah","Peserta didik mampu menentukan informasi yang penting dan mengabaikan informasi yang tidak diperlukan dalam proses pemecahan masalah.",4,"materi-2.3.html"],
      ["Algoritma dan Penyusunan Langkah","Peserta didik mampu menyusun langkah-langkah sistematis untuk menyelesaikan masalah serta menggunakan pseudocode dan flowchart sederhana.",6,"materi-2.4.html"],
      ["Penerapan Berpikir Komputasional","Peserta didik mampu menerapkan dekomposisi, pengenalan pola, abstraksi, dan algoritma dalam menyelesaikan berbagai masalah dalam kehidupan sehari-hari.",6,"materi-2.5.html"]]},
    3: {t:"Membuat dan Mendesain Konten", e:"🎨", jp:24, d:"Merancang dan membuat konten digital secara kreatif, etis, dan bertanggung jawab.", ev:"evaluasi-3.html", s:[
      ["Konsep dan Jenis Konten Digital","Peserta didik mampu memahami pengertian, tujuan, karakteristik, serta berbagai jenis konten digital berupa teks, gambar, audio, video, dan multimedia.",4,"materi-3.1.html"],
      ["Perencanaan dan Penyusunan Konten","Peserta didik mampu menentukan tujuan, target audiens, topik, ide, konsep, dan membuat rancangan konten digital sesuai kebutuhan.",4,"materi-3.2.html"],
      ["Desain Visual dan Tata Letak","Peserta didik mampu menerapkan prinsip komposisi, warna, tipografi, gambar, ikon, dan tata letak untuk menghasilkan desain konten digital yang menarik dan mudah dipahami.",4,"materi-3.3.html"],
      ["Pembuatan dan Penyuntingan Konten","Peserta didik mampu membuat, mengedit, menggabungkan, dan menyempurnakan teks, gambar, audio, maupun video menggunakan perangkat digital.",6,"materi-3.4.html"],
      ["Publikasi dan Evaluasi Konten Digital","Peserta didik mampu menyimpan, membagikan, mempublikasikan, mengevaluasi, dan memperbaiki konten digital secara kreatif, etis, dan bertanggung jawab.",6,"materi-3.5.html"]]},
    4: {t:"Sistem Komputer", e:"🖥️", jp:18, d:"Memahami sistem bilangan dan pengkodean yang mendasari cara kerja komputer.", ev:"evaluasi-4.html", s:[
      ["Konsep dan Cara Kerja Sistem Komputer","Peserta didik mampu memahami pengertian sistem komputer serta menjelaskan cara kerja komputer melalui proses input, proses, dan output.",4,"materi-4.1.html"],
      ["Perangkat Keras Komputer","Peserta didik mampu mengenali perangkat keras komputer yang meliputi perangkat input, proses, output, dan penyimpanan serta menjelaskan fungsinya.",6,"materi-4.2.html"],
      ["Perangkat Lunak Komputer","Peserta didik mampu memahami jenis dan fungsi perangkat lunak komputer, termasuk sistem operasi, aplikasi, dan perangkat lunak pendukung.",4,"materi-4.3.html"],
      ["Interaksi Hardware, Software, dan Brainware","Peserta didik mampu menjelaskan hubungan antara perangkat keras, perangkat lunak, dan pengguna dalam menjalankan sistem komputer.",4,"materi-4.4.html"],
      ["Perawatan dan Keamanan Sistem Komputer","Peserta didik mampu menerapkan cara perawatan perangkat, menjaga keamanan data dan password, serta menggunakan sistem komputer secara aman dan bertanggung jawab.",6,"materi-4.5.html"]]},
    5: {t:"Analisis Data", e:"📈", jp:18, d:"Menggunakan fungsi statistik dan keuangan untuk mengolah, memprediksi, dan menginterpretasikan data.", s:[
      ["Fungsi Statistik dan Keuangan","Peserta didik mampu menggunakan berbagai fungsi statistik dan keuangan untuk mengolah serta menganalisis data.",8,0],
      ["Mengelola Data dan Membuat Prediksi","Peserta didik mampu mengelola data dan menggunakan hasil pengolahan data untuk membuat prediksi sederhana.",6,0],
      ["Analisis dan Interpretasi Data","Peserta didik mampu menyajikan dan menginterpretasikan hasil analisis data untuk mendukung pengambilan keputusan.",4,0]]},
    6: {t:"Komunikasi dan Keamanan Data", e:"📡", jp:18, d:"Memahami cara kerja jaringan komputer serta ancaman dan langkah menjaga keamanan data.", s:[
      ["Cara Jaringan Komputer Bekerja","Peserta didik mampu memahami konsep komunikasi data dan cara kerja jaringan komputer.",8,0],
      ["Keamanan Data","Peserta didik mampu memahami berbagai ancaman terhadap keamanan data dan cara mengatasinya.",6,0],
      ["Praktik Keamanan Data","Peserta didik mampu menerapkan langkah-langkah menjaga keamanan data dalam penggunaan teknologi digital.",4,0]]},
    7: {t:"Membagikan Informasi dan Perlindungan Data Pribadi", e:"🛡️", jp:16, d:"Memahami etika berbagi informasi digital serta pentingnya perlindungan data pribadi, termasuk aspek legalnya.", s:[
      ["Membagikan Data dan Informasi","Peserta didik mampu memahami prinsip dan etika dalam membagikan data serta informasi melalui media digital.",6,0],
      ["Melindungi Data","Peserta didik mampu memahami pentingnya perlindungan data pribadi dalam lingkungan digital.",4,0],
      ["Aspek Legal Perlindungan Data","Peserta didik mampu memahami aspek legal yang berkaitan dengan perlindungan data pribadi dan menerapkannya dalam kehidupan sehari-hari.",6,0]]},
    8: {t:"Menerapkan Algoritma Perulangan", e:"🔁", jp:16, d:"Memahami dan membangun algoritma perulangan untuk membuat program sederhana.", s:[
      ["Konsep Algoritma Perulangan","Peserta didik mampu memahami konsep algoritma perulangan dan penggunaannya dalam pemrograman.",4,0],
      ["Membangun Algoritma Perulangan","Peserta didik mampu membangun algoritma perulangan untuk menyelesaikan masalah sederhana.",6,0],
      ["Menerapkan Perulangan","Peserta didik mampu menerapkan struktur perulangan dalam membuat program sederhana.",6,0]]}
  };
  const n = +document.body.dataset.bab, b = B[n];
  if (!b) return;
  const $ = id => document.getElementById(id);
  const open = (ok, cls) => ok ? [`<a class="babcard${cls}"`, "</a>"] : [`<div class="babcard off${cls}" role="button" tabindex="0" aria-disabled="true" data-soon`, "</div>"];
  const card = (num, title, desc, jp, href, cls) => {
    const ok = !!href, [o, c] = open(ok, cls);
    return `${o}${ok ? ` href="${encodeURI(href)}"` : ""}>
      <div class="rowtop"><span class="pill">${num}</span><span class="status">${ok ? "Tersedia" : "Segera Hadir"}</span></div>
      <h3>${title}</h3><p class="desc">${desc}</p>
      <div class="rowtop"><span class="pill v">${jp}</span><span class="cta">${ok ? "Buka materi →" : "Belum tersedia"}</span></div>${c}`;
  };

  document.title = `Bab ${n} · ${b.t} | KW Learning`;
  $("tag").textContent = `Semester ${n <= 4 ? "Ganjil" : "Genap"} · Bab ${n}`;
  $("judul").textContent = `${b.e} ${b.t}`;
  $("deskripsi").textContent = b.d;
  $("statTotal").textContent = b.s.length;
  $("statJp").textContent = b.jp + " JP";
  const avail = b.s.filter(s => s[3]).length;
  $("statAvail").textContent = avail;
  $("barFill").style.width = (avail / b.s.length * 100) + "%";

  let html = b.s.map((s, i) => card(`${n}.${i + 1}`, s[0], s[1], `⏱ ${s[2]} JP`, s[3], "")).join("");
  html += card("Evaluasi", `📘 Evaluasi Bab ${n}`, `Mengukur pemahaman menyeluruh peserta didik terhadap seluruh materi Bab ${n} melalui soal pilihan ganda dan masalah kontekstual.`, "📝 Kuis akhir bab", b.ev || 0, " eval");
  $("grid").innerHTML = html;

  $("pager").innerHTML = (n > 1 ? `<a href="infob-bab${n - 1}.html">← Bab ${n - 1}</a>` : "") + (n < 8 ? `<a class="nx" href="infob-bab${n + 1}.html">Bab ${n + 1} →</a>` : "");

  let timer;
  const toast = () => { const t = $("toast"); t.classList.add("show"); clearTimeout(timer); timer = setTimeout(() => t.classList.remove("show"), 2400); };
  $("grid").addEventListener("click", e => { if (e.target.closest("[data-soon]")) toast(); });
  $("grid").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute("data-soon")) { e.preventDefault(); toast(); } });
})();