(() => {
  const S = {
    matematika: {
      grid: [
        {g:7, ok:true, t:["Bilangan Bulat","Bilangan Rasional","Rasio","Bentuk Aljabar","Aritmetika Sosial","Kesebangunan","Statistika"]},
        {g:8, ok:true, t:["Bilangan berpangkat","Teorema Pythagoras","Persamaan Linear dan Pertidaksamaan Linear","Relasi dan Fungsi","Persamaan Garis Lurus","Statistika"]},
        {g:9, ok:true, t:["Sistem Persamaan Linear Dua Variabel","Lingkaran","Bangun Ruang","Transformasi geometri","Kekongruenan & kesebangunan","Teori Peluang"]}
      ],
      morph: [["math","x² + y² = r²"],["math","P(A ∩ B) = P(A) · P(B)"],["math","a² = b² + c² − 2bc·cos(A)"]],
      color: "var(--teal)",
      quiz: [
        {q:"Jika sisi-sisi segitiga siku-siku adalah 6 cm dan 8 cm, berapa panjang sisi miringnya?", a:"10 cm — dari teorema Pythagoras: √(6² + 8²) = √100 = 10."},
        {q:"Berapa hasil dari 2³ × 2⁴?", a:"2⁷ = 128 — pangkat dijumlahkan saat basis sama: 2³⁺⁴."},
        {q:"Sebuah data: 4, 8, 6, 5, 3. Berapa rata-ratanya?", a:"5,2 — jumlah semua data (26) dibagi banyak data (5)."}
      ]
    },
    informatika: {
      grid: [
        {g:7, ok:false, t:["Berpikir komputasional","Pengenalan sistem komputer","Jaringan komputer & internet","Analisis data dasar","Algoritma & pemrograman visual","Dampak sosial informatika"]},
        {g:8, ok:true, t:["Bekerja dengan Data Terstruktur","Menerapkan Berpikir Komputasional","Membuat dan Mendesain Konten","Sistem komputer & perangkat","Analisis Data","Komunikasi dan Keamanan Data","Membagikan Informasi dan Perlindungan Data Pribadi","Menerapkan Algoritma Perulangan"]},
        {g:9, ok:true, t:["Menerapkan Berpikir Komputasional","Membuat Laporan dan Presentasi","Sistem Pengolahan dan Pengubahan Citra","Manajemen Keamanan Data dan Perlindungan Privasi","Mengolah dan Menginterpretasikan Data","Translasi Konsep Pemrograman Visual dan Konsep Pemrograman Tekstual","Kecerdasan Digital","Praktik Lintas Bidang"]}
      ],
      morph: [["code","for (i = 0; i < n; i++)"],["code","if (n % 2 === 0) return true;"],["code","array.sort((a,b) => a - b)"]],
      color: "var(--purple)",
      quiz: [
        {q:"Apa perbedaan utama antara pencarian linear dan pencarian biner?", a:"Pencarian biner membutuhkan data yang sudah terurut dan jauh lebih cepat (O(log n)) dibanding pencarian linear (O(n))."},
        {q:"Apa fungsi perulangan (loop) dalam pemrograman?", a:"Menjalankan sekumpulan instruksi berulang kali tanpa menulis ulang kodenya, misalnya untuk memproses banyak data sekaligus."},
        {q:"Apa itu enkripsi data secara sederhana?", a:"Proses mengubah data menjadi bentuk yang tidak bisa dibaca sembarang orang, agar hanya pemegang kunci yang bisa membacanya kembali."}
      ]
    }
  };
  const LABEL = {matematika: "Matematika", informatika: "Informatika"};
  const key = document.body.dataset.subject, cfg = S[key];
  if (!cfg) return;
  const $ = id => document.getElementById(id);
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const svgRefresh = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 12V6"/><path d="M3 12h6"/></svg>';
  const svgStar = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.8H21l-5.6 4.1 2.2 6.8L12 15.6 6.4 19.7l2.2-6.8L3 8.8h6.8z"/></svg>';
  const label = (icon, text) => `<div class="widget-label"><span class="widget-icon">${icon}</span>${text}</div>`;

  // kartu kelas
  $("grid").innerHTML = cfg.grid.map((it, i) => `
    <div class="card${it.ok ? "" : " disabled"}" data-id="${key}-${i}" role="button" tabindex="${it.ok ? 0 : -1}" aria-expanded="false"${it.ok ? "" : ' aria-disabled="true"'}>
      <div class="card-top"><span class="grade-badge">Kelas ${it.g}</span><span class="status-badge">${it.ok ? "Tersedia" : "Segera hadir"}</span></div>
      <div class="title-row">
        <p class="card-title">Materi kelas ${it.g}</p>
        ${it.ok ? `<a class="materi-btn" href="materi-kelas${it.g}-${key}.html">Buka Materi →</a>` : '<span class="materi-btn disabled-btn">Belum tersedia</span>'}
      </div>
      <p class="card-count">${it.t.length} bab</p>
      <div class="topics"><div><ul>${it.t.map((t, n) => `<li><span class="bab-num">Bab ${n + 1}</span><span>${t}</span></li>`).join("")}</ul></div></div>
    </div>`).join("");

  // sapaan
  const tersedia = cfg.grid.filter(c => c.ok).length;
  function greet() {
    const h = new Date().getHours();
    const s = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
    const n = (store.get("viewed_chapters") || []).filter(id => id.startsWith(key + "-")).length;
    $("greeting").innerHTML = n
      ? `${s} 👋 — kamu sudah membuka <span class="prog">${n} dari ${tersedia}</span> kelas yang tersedia.`
      : `${s} 👋 — <b>ayo mulai</b> belajar hari ini.`;
  }

  // lanjutkan belajar
  function cont() {
    const last = store.get("last_chapter");
    $("continueWidget").innerHTML = label(svgRefresh, "Lanjutkan Belajar") + (last && LABEL[last.subject]
      ? `<p class="cw-title">${LABEL[last.subject]} · Kelas ${last.grade}</p><p class="cw-sub">Terakhir kamu buka materi ini</p><a class="cw-btn" href="materi-kelas${last.grade}-${last.subject}.html">Lanjutkan →</a>`
      : '<p class="cw-empty">Belum ada riwayat. Pilih kelas pertamamu di bawah.</p>');
  }

  // soal hari ini
  function quiz() {
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    const it = cfg.quiz[day % cfg.quiz.length];
    $("quizWidget").innerHTML = label(svgStar, "Soal Hari Ini") +
      `<span class="quiz-subject-tag ${key}">${LABEL[key]}</span><p class="quiz-q">${it.q}</p>
       <button class="quiz-reveal-btn" id="revealBtn" aria-expanded="false">Lihat jawaban</button>
       <div class="quiz-answer" id="quizAnswer">${it.a}</div>`;
    $("revealBtn").onclick = function () {
      const open = $("quizAnswer").classList.toggle("shown");
      this.setAttribute("aria-expanded", open);
      this.textContent = open ? "Sembunyikan jawaban" : "Lihat jawaban";
    };
  }

  // buka/tutup kartu
  function toggle(card) {
    if (!card || card.classList.contains("disabled")) return;
    const open = card.classList.toggle("open");
    card.setAttribute("aria-expanded", open);
    if (!open) return;
    const idx = +card.dataset.id.split("-")[1];
    const viewed = store.get("viewed_chapters") || [];
    if (!viewed.includes(card.dataset.id)) { viewed.push(card.dataset.id); store.set("viewed_chapters", viewed); }
    store.set("last_chapter", {subject: key, grade: cfg.grid[idx].g, idx, ts: Date.now()});
    greet(); cont();
  }
  $("grid").addEventListener("click", e => { if (!e.target.closest("a")) toggle(e.target.closest(".card")); });
  $("grid").addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) { e.preventDefault(); toggle(e.target); }
  });

  // teks berganti
  let m = 0;
  if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
    setInterval(() => {
      const t = $("morphTxt");
      t.classList.add("fading");
      setTimeout(() => {
        m = (m + 1) % cfg.morph.length;
        $("morphTag").textContent = cfg.morph[m][0];
        t.textContent = cfg.morph[m][1];
        t.classList.remove("fading");
      }, 300);
    }, 3200);
  }

  $("morphLine").style.setProperty("--mc", cfg.color);
  $("morphTag").textContent = cfg.morph[0][0];
  $("morphTxt").textContent = cfg.morph[0][1];
  greet(); cont(); quiz();
})();