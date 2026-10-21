(() => {
  // [judul, deskripsi, ikon, tautan, tersedia(1/0), JP atau pertemuan]
  const P = {
    "matematika-7": {s:"matematika", g:7, u:"pertemuan", game:["mtk kls 7/game/index.html","Tantang kemampuanmu melalui permainan matematika interaktif Bab 4–7: Bentuk Aljabar, Aritmetika Sosial, Kesebangunan, dan Statistika."], sems:[[
      ["Bilangan Bulat","Konsep bilangan bulat, operasi hitung, bilangan berpangkat, bilangan prima, FPB, dan KPK.","🔢","mtk kls 7/matb-bab1.html",1,5],
      ["Bilangan Rasional","Pecahan, bilangan pecahan negatif, persentase, bilangan desimal, dan notasi ilmiah (bentuk baku).","🍕","mtk kls 7/matb-bab2.html",1,4],
      ["Rasio","Perbandingan senilai dan berbalik nilai, skala dan peta, laju perubahan, serta grafik perbandingan.","⚖️","mtk kls 7/matb-bab3.html",1,4]],[
      ["Bentuk Aljabar","Menyajikan bentuk aljabar, operasi hitung, FPB dan KPK bentuk aljabar, serta pecahan aljabar.","🧮","mtk kls 7/matb-bab4.html",1,4],
      ["Aritmetika Sosial","Persentase dan uang dalam perdagangan, untung/rugi, potongan harga, bruto-tara-neto, bunga bank, dan pajak.","💰","mtk kls 7/matb-bab5.html",1,4],
      ["Kesebangunan","Sudut dan hubungan antarsudut, garis sejajar, gambar berskala, serta kesebangunan bangun, segitiga, dan segi empat.","📐","mtk kls 7/matb-bab6.html",1,7],
      ["Statistika","Investigasi statistika, jenis data, serta penyajian dan interpretasi data tunggal.","📊","mtk kls 7/matb-bab7.html",1,2]]]},
    "matematika-8": {s:"matematika", g:8, u:"JP", names:["Semester 1","Semester 2"], game:["mtk kls 8/game copy/index.html","Tantang kemampuanmu melalui permainan matematika interaktif."], sems:[[
      ["Bilangan Berpangkat","Bilangan berpangkat bulat, bentuk akar, dan bentuk baku (notasi ilmiah).","🔢","mtk kls 8/matb-bab1.html",1,16],
      ["Teorema Pythagoras","Pembuktian, tripel Pythagoras, dan penerapannya pada masalah kontekstual.","📐","mtk kls 8/matb-bab2.html",1,16],
      ["Persamaan Linear dan Pertidaksamaan Linear","SPLDV serta persamaan & pertidaksamaan linear satu variabel.","➗","mtk kls 8/matb-bab3.html",1,16]],[
      ["Relasi dan Fungsi","Konsep relasi, representasi fungsi, nilai fungsi & korespondensi satu-satu.","🔗","mtk kls 8/matb-bab4.html",1,16],
      ["Persamaan Garis Lurus","Grafik, gradien, dan menentukan persamaan garis lurus.","📈","mtk kls 8/matb-bab5.html",1,18],
      ["Statistika","Ukuran pemusatan, penyebaran, dan interpretasi data sederhana.","📊","mtk kls 8/matb-bab6.html",1,20]]]},
    "matematika-9": {s:"matematika", g:9, u:"JP", game:["mtk kls 9/game/index.html","Tantang kemampuanmu melalui permainan matematika interaktif."], sems:[[
      ["Sistem Persamaan Linear Dua Variabel","Menyusun & menyelesaikan SPLDV, termasuk masalah kontekstual.","➕","mtk kls 9/bab1.html",1,20],
      ["Lingkaran","Unsur-unsur lingkaran, keliling, luas, dan sudut pusat/keliling.","⭕","mtk kls 9/bab2.html",1,24],
      ["Bangun Ruang","Luas permukaan dan volume bangun ruang sisi datar & lengkung.","🧊","mtk kls 9/bab3.html",1,28]],[
      ["Transformasi Geometri","Translasi, refleksi, rotasi, dan dilatasi bangun datar.","🔺","mtk kls 9/bab4.html",1,28],
      ["Kekongruenan pada Bangun Datar","Syarat kongruen, kesebangunan, dan penerapannya.","📐","mtk kls 9/bab5.html",1,20],
      ["Teori Peluang","Ruang sampel, kejadian, dan peluang suatu kejadian.","🎲","mtk kls 9/bab6.html",1,20]]]},
    "informatika-8": {s:"informatika", g:8, u:"JP", sems:[[
      ["Bekerja dengan Data Terstruktur","Menampilkan, mengolah, mengurutkan, dan menyaring data secara sistematis.","🗂️","infor kls 8/infob-bab1.html",1,20],
      ["Menerapkan Berpikir Komputasional","Menyelesaikan masalah di berbagai bidang, termasuk sains dan matematika.","🧩","infor kls 8/infob-bab2.html",1,18],
      ["Membuat dan Mendesain Konten","Merancang & membuat konten digital secara kreatif, etis, dan bertanggung jawab.","🎨","infor kls 8/infob-bab3.html",1,24],
      ["Sistem Komputer","Memahami sistem bilangan dan pengkodean dalam cara kerja komputer.","🖥️","infor kls 8/infob-bab4.html",1,18]],[
      ["Analisis Data","Fungsi statistik & keuangan untuk mengolah, memprediksi, dan menafsirkan data.","📈","infor kls 8/infob-bab5.html",0,18],
      ["Komunikasi dan Keamanan Data","Cara kerja jaringan komputer serta ancaman dan langkah keamanan data.","📡","infor kls 8/infob-bab6.html",0,18],
      ["Membagikan Informasi dan Perlindungan Data Pribadi","Etika berbagi informasi digital dan aspek legal perlindungan data pribadi.","🛡️","infor kls 8/infob-bab7.html",0,16],
      ["Menerapkan Algoritma Perulangan","Membangun dan menerapkan algoritma perulangan dalam program sederhana.","🔁","infor kls 8/infob-bab8.html",0,16]]]},
    "informatika-9": {s:"informatika", g:9, u:"JP", sems:[[
      ["Menerapkan Berpikir Komputasional","Memecahkan masalah secara sistematis dengan pola pikir komputasional.","🧩","Infor Kls 9/info-bab1.html",1,18],
      ["Membuat Laporan dan Presentasi","Menyusun laporan digital dan presentasi yang informatif & menarik.","📝","Infor Kls 9/info-bab2.html",1,20],
      ["Sistem Pengolahan dan Pengubahan Citra","Mengenal dan mempraktikkan pengolahan citra digital.","🖼️","Infor Kls 9/info-bab3.html",1,16],
      ["Manajemen Keamanan Data dan Perlindungan Privasi","Menjaga keamanan data dan privasi dalam aktivitas digital.","🔒","Infor Kls 9/info-bab4.html",1,18]],[
      ["Mengolah dan Menginterpretasikan Data","Mengolah, menyajikan, dan menafsirkan data untuk pengambilan keputusan.","📊","Infor Kls 9/info-bab5.html",0,20],
      ["Translasi Pemrograman Visual & Tekstual","Memahami pemrograman visual, tekstual, dan translasinya.","🔤","Infor Kls 9/info-bab6.html",0,16],
      ["Kecerdasan Digital","Menggunakan teknologi secara bijak, aman, dan bertanggung jawab.","🧠","Infor Kls 9/info-bab7.html",0,14],
      ["Praktik Lintas Bidang","Merancang dan membangun proyek komputasional lintas bidang.","🚀","Infor Kls 9/info-bab8.html",0,18]]]}
  };
  const cfg = P[document.body.dataset.page];
  if (!cfg) return;
  const $ = id => document.getElementById(id);
  const names = cfg.names || ["Semester Ganjil", "Semester Genap"];
  const emo = ["📗", "📘"];
  const sub = ["Materi awal tahun ajaran.", "Materi lanjutan setelah semester pertama selesai."];
  const unit = n => cfg.u === "JP" ? `⏱ ${n} JP` : `📝 ${n} pertemuan`;

  function card(b, no) {
    const [t, d, ic, h, ok, v] = b;
    const open = ok ? `<a class="babcard" href="${encodeURI(h)}">` : '<div class="babcard off" role="button" tabindex="0" aria-disabled="true" data-soon>';
    return `${open}
      <div class="rowtop"><span class="pill">Bab ${no}</span><span class="status">${ok ? "Tersedia" : "Segera Hadir"}</span></div>
      <div class="body"><span class="icon" aria-hidden="true">${ic}</span><div><h3>${t}</h3><p class="desc">${d}</p></div></div>
      <div class="rowtop"><span class="pill v">${unit(v)}</span><span class="cta">${ok ? "Buka dasbor bab →" : "Belum tersedia"}</span></div>
    ${ok ? "</a>" : "</div>"}`;
  }

  let no = 0, all = [];
  let html = cfg.sems.map((list, si) => {
    const first = no + 1;
    const cards = list.map(b => { no++; all.push(b); return card(b, no); }).join("");
    const total = list.reduce((s, b) => s + b[5], 0);
    return `<section class="sem"><div class="sem-head"><h2>${emo[si]} ${names[si]}</h2><span class="count">Bab ${first} – ${no} · ${total} ${cfg.u}</span></div>
      <p class="sem-sub">${sub[si]}</p><div class="babgrid">${cards}</div></section>`;
  }).join("");

  if (cfg.game) html += `<section class="sem"><div class="sem-head"><h2>🎮 Arena Game</h2><span class="count">Game Matematika</span></div>
    <p class="sem-sub">Uji kemampuanmu melalui permainan matematika interaktif.</p>
    <div class="babgrid"><a class="babcard" href="${encodeURI(cfg.game[0])}">
      <div class="rowtop"><span class="pill">Arena Game</span><span class="status">Tersedia</span></div>
      <div class="body"><span class="icon" aria-hidden="true">🎮</span><div><h3>Arena Game Matematika</h3><p class="desc">${cfg.game[1]}</p></div></div>
      <div class="rowtop"><span class="pill v">🎮 Game</span><span class="cta">Mainkan →</span></div></a></div></section>`;
  $("sems").innerHTML = html;

  const avail = all.filter(b => b[4]).length;
  $("statAvail").textContent = avail;
  $("statBab").textContent = all.length;
  $("statTotal").textContent = all.reduce((s, b) => s + b[5], 0);
  $("statUnit").textContent = (cfg.u === "JP" ? "JP" : "pertemuan") + " · 1 tahun ajaran";
  $("barFill").style.width = (avail / all.length * 100) + "%";

  let timer;
  const toast = () => {
    const t = $("toast");
    t.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove("show"), 2400);
  };
  $("sems").addEventListener("click", e => { if (e.target.closest("[data-soon]")) toast(); });
  $("sems").addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute("data-soon")) { e.preventDefault(); toast(); }
  });
})();