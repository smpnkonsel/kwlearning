/* =========================================================
   DASHBOARD BELAJAR — Matematika & Informatika
   ========================================================= */

(() => {
  "use strict";

  const data = {
    matematika: [
      {
        grade: 7,
        available: true,
        topics: [
          "Bilangan Bulat",
          "Bilangan Rasional",
          "Rasio",
          "Bentuk Aljabar",
          "Aritmetika Sosial",
          "Kesebangunan",
          "Statistika"
        ]
      },
      {
        grade: 8,
        available: true,
        topics: [
          "Bilangan berpangkat",
          "Teorema Pythagoras",
          "Persamaan Linear dan Pertidaksamaan Linear",
          "Relasi dan Fungsi",
          "Persamaan Garis Lurus",
          "Statistika"
        ]
      },
      {
        grade: 9,
        available: true,
        topics: [
          "Sistem Persamaan Linear Dua Variabel",
          "Lingkaran",
          "Bangun Ruang",
          "Transformasi geometri",
          "Kekongruenan & kesebangunan",
          "Teori Peluang"
        ]
      }
    ],

    informatika: [
      {
        grade: 7,
        available: false,
        topics: [
          "Berpikir komputasional",
          "Pengenalan sistem komputer",
          "Jaringan komputer & internet",
          "Analisis data dasar",
          "Algoritma & pemrograman visual",
          "Dampak sosial informatika"
        ]
      },
      {
        grade: 8,
        available: true,
        topics: [
          "Bekerja dengan Data Terstruktur",
          "Menerapkan Berpikir Komputasional",
          "Membuat dan Mendesain Konten",
          "Sistem komputer & perangkat",
          "Analisis Data",
          "Komunikasi dan Keamanan Data",
          "Membagikan Informasi dan Perlindungan Data Pribadi",
          "Menerapkan Algoritma Perulangan"
        ]
      },
      {
        grade: 9,
        available: true,
        topics: [
          "Menerapkan Berpikir Komputasional",
          "Membuat Laporan dan Presentasi",
          "Sistem Pengolahan dan Pengubahan Citra",
          "Manajemen Keamanan Data dan Perlindungan Privasi",
          "Mengolah dan Menginterpretasikan Data",
          "Translasi Konsep Pemrograman Visual dan Konsep Pemrograman Tekstual",
          "Kecerdasan Digital",
          "Praktik Lintas Bidang"
        ]
      }
    ]
  };

  const subjectLabel = {
    matematika: "Matematika",
    informatika: "Informatika"
  };

  const morphPairs = [
    { tag: "math", txt: "x² + y² = r²" },
    { tag: "code", txt: "for (i = 0; i < n; i++)" },
    { tag: "math", txt: "P(A ∩ B) = P(A) · P(B)" },
    { tag: "code", txt: "if (n % 2 === 0) return true;" },
    { tag: "math", txt: "a² = b² + c² − 2bc·cos(A)" },
    { tag: "code", txt: "array.sort((a,b) => a - b)" }
  ];

  let morphIdx = 0;

  function $(id) {
    return document.getElementById(id);
  }

  /* =========================================================
     LOCAL STORAGE
     ========================================================= */

  function getViewedSet() {
    try {
      const data = JSON.parse(
        localStorage.getItem("viewed_chapters") || "[]"
      );

      return new Set(Array.isArray(data) ? data : []);
    } catch (error) {
      return new Set();
    }
  }

  function addViewed(id) {
    const viewed = getViewedSet();

    viewed.add(String(id));

    try {
      localStorage.setItem(
        "viewed_chapters",
        JSON.stringify([...viewed])
      );
    } catch (error) {
      console.warn("LocalStorage tidak tersedia.");
    }

    renderGreeting();
  }

  /* =========================================================
     SAPAAN
     ========================================================= */

  function renderGreeting() {
    const el = $("greeting");

    if (!el) return;

    const hour = new Date().getHours();

    let greeting = "Selamat malam";

    if (hour >= 5 && hour < 11) {
      greeting = "Selamat pagi";
    } else if (hour >= 11 && hour < 15) {
      greeting = "Selamat siang";
    } else if (hour >= 15 && hour < 18) {
      greeting = "Selamat sore";
    }

    const viewed = getViewedSet();

    el.textContent = viewed.size
      ? `${greeting} 👋 Lanjutkan belajarmu!`
      : `${greeting} 👋`;
  }

  function renderTimeWelcome() {
    const hour = new Date().getHours();

    let greeting = "Selamat malam";
    let icon = "🌙";
    let message =
      "Waktunya tenang, fokus, dan tumbuh bersama ilmu.";

    if (hour >= 5 && hour < 11) {
      greeting = "Selamat pagi";
      icon = "🌅";
      message =
        "Mulai hari dengan satu langkah belajar terbaikmu.";
    } else if (hour >= 11 && hour < 15) {
      greeting = "Selamat siang";
      icon = "☀️";
      message =
        "Tetap semangat, sedikit demi sedikit pasti bertambah bisa.";
    } else if (hour >= 15 && hour < 18) {
      greeting = "Selamat sore";
      icon = "🌤️";
      message =
        "Saat yang tepat untuk melanjutkan progres belajarmu.";
    }

    const greetingEl = $("timeGreeting");
    const iconEl = $("timeIcon");
    const messageEl = $("timeMessage");

    if (greetingEl) {
      greetingEl.textContent = greeting;
    }

    if (iconEl) {
      iconEl.textContent = icon;
    }

    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  /* =========================================================
     MODAL
     ========================================================= */

  function openModal(title, description = "", content = "") {
    const modal = $("topicModal");
    const modalTitle = $("modalTitle");
    const topicList = $("topicList");

    if (!modal || !modalTitle || !topicList) {
      console.error("Elemen modal tidak ditemukan.");
      return;
    }

    modalTitle.textContent = title || "Materi";

    topicList.innerHTML = `
      ${
        description
          ? `<p class="modalDescription">${escapeHTML(description)}</p>`
          : ""
      }
      ${content}
    `;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const modal = $("topicModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
  }

  /* =========================================================
     TOPIK
     ========================================================= */

  function openTopics(subject, index, grade = null) {
    if (!data[subject]) return;

    let item;

    if (grade !== null) {
      item = data[subject].find(
        x => Number(x.grade) === Number(grade)
      );
    } else {
      item = data[subject][Number(index)];
    }

    if (!item) return;

    const topicsHTML = item.topics
      .map(
        (topic, i) => `
          <div class="topicItem">
            <b>Topik ${i + 1}</b>
            <span>${escapeHTML(topic)}</span>
          </div>
        `
      )
      .join("");

    openModal(
      `${subjectLabel[subject]} · Kelas ${item.grade}`,
      "Daftar materi yang tersedia.",
      topicsHTML
    );

    addViewed(`${subject}-${item.grade}`);

    try {
      localStorage.setItem(
        "last_chapter",
        JSON.stringify({
          subject: subject,
          grade: item.grade,
          index: index,
          timestamp: Date.now()
        })
      );
    } catch (error) {}
  }

  /* =========================================================
     PILIH MAPEL BERDASARKAN KELAS
     ========================================================= */

  function showSubjectChooser(grade) {
    grade = Number(grade);

    const matematika = data.matematika.find(
      item => item.grade === grade
    );

    const informatika = data.informatika.find(
      item => item.grade === grade
    );

    let html = `
      <div class="choiceGrid">
    `;

    if (matematika && matematika.available) {
      html += `
        <a
          class="choice"
          href="materi-kelas${grade}-matematika.html"
        >
          <span>
            <b>∑ Matematika</b>
            <small>Materi kelas ${grade}</small>
          </span>

          <span class="arrow">→</span>
        </a>
      `;
    }

    if (informatika && informatika.available) {
      html += `
        <a
          class="choice"
          href="materi-kelas${grade}-informatika.html"
        >
          <span>
            <b>&lt;/&gt; Informatika</b>
            <small>Materi tersedia</small>
          </span>

          <span class="arrow">→</span>
        </a>
      `;
    } else {
      html += `
        <div class="choice disabled">
          <span>
            <b>&lt;/&gt; Informatika</b>
            <small>Segera hadir</small>
          </span>

          <span class="arrow">🔒</span>
        </div>
      `;
    }

    html += `</div>`;

    openModal(
      `Kelas ${grade}`,
      "Pilih mata pelajaran untuk membuka halaman materi.",
      html
    );
  }

  /* =========================================================
     PILIH KELAS BERDASARKAN MAPEL
     ========================================================= */

  function showSubjectChooserByName(subject) {
    if (!data[subject]) return;

    let html = `<div class="choiceGrid">`;

    [7, 8, 9].forEach(grade => {
      const item = data[subject].find(
        x => x.grade === grade
      );

      if (item && item.available) {
        html += `
          <a
            class="choice"
            href="materi-kelas${grade}-${subject}.html"
          >
            <span>
              <b>Kelas ${grade}</b>
              <small>Buka halaman materi</small>
            </span>

            <span class="arrow">→</span>
          </a>
        `;
      } else {
        html += `
          <div class="choice disabled">
            <span>
              <b>Kelas ${grade}</b>
              <small>Segera hadir</small>
            </span>

            <span class="arrow">🔒</span>
          </div>
        `;
      }
    });

    html += `</div>`;

    openModal(
      subjectLabel[subject],
      "Pilih kelas yang ingin dipelajari.",
      html
    );
  }

  /* =========================================================
     MATERI TERBARU
     ========================================================= */

  function makeLatest() {
    const container = $("latestChapters");

    if (!container) return;

    const items = [
      {
        icon: "🔢",
        bab: "Bab 1",
        title: "Bilangan Bulat",
        desc: "Operasi bilangan bulat dan sifat-sifatnya.",
        subject: "matematika",
        grade: 7,
        index: 0
      },
      {
        icon: "x+y",
        bab: "Bab 2",
        title: "Bilangan Rasional",
        desc: "Bilangan rasional, pecahan, dan desimal.",
        subject: "matematika",
        grade: 7,
        index: 1
      },
      {
        icon: "⚖️",
        bab: "Bab 3",
        title: "Rasio",
        desc: "Memahami perbandingan dan penerapannya.",
        subject: "matematika",
        grade: 7,
        index: 2
      },
      {
        icon: "</>",
        bab: "Informatika",
        title: "Data Terstruktur",
        desc: "Materi Informatika kelas 8.",
        subject: "informatika",
        grade: 8,
        index: 0
      }
    ];

    container.innerHTML = items
      .map(
        (item, i) => `
          <article
            class="chapter"
            data-subject="${item.subject}"
            data-grade="${item.grade}"
            data-index="${item.index}"
            tabindex="0"
            role="button"
            style="animation-delay:${i * 90}ms"
          >

            <div class="chapterIcon">
              ${item.icon}
            </div>

            <small>${item.bab}</small>

            <h3>${item.title}</h3>

            <p>${item.desc}</p>

            <div class="miniProgress">
              <span style="width:${45 + i * 10}%"></span>
            </div>

            <div class="chapterFooter">
              <span>Buka topik</span>
              <span class="play">▶</span>
            </div>

          </article>
        `
      )
      .join("");
  }

  /* =========================================================
     ANIMASI MATH / CODE
     ========================================================= */

  function setupMorph() {
    const text = $("morphTxt");
    const tag = $("morphTag");

    if (!text || !tag) return;

    setInterval(() => {
      text.style.opacity = "0";
      text.style.filter = "blur(3px)";

      setTimeout(() => {
        morphIdx =
          (morphIdx + 1) % morphPairs.length;

        tag.textContent =
          morphPairs[morphIdx].tag;

        text.textContent =
          morphPairs[morphIdx].txt;

        text.style.opacity = "1";
        text.style.filter = "none";
      }, 260);
    }, 3000);
  }

  /* =========================================================
     EVENT NAVIGASI
     ========================================================= */

  function setupNavigation() {

    /* KELAS */
    document
      .querySelectorAll(".grade[data-grade]")
      .forEach(card => {

        card.addEventListener("click", () => {
          showSubjectChooser(card.dataset.grade);
        });

        card.addEventListener("keydown", event => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();

            showSubjectChooser(
              card.dataset.grade
            );
          }

        });
      });


    /* MAPEL */
    document
      .querySelectorAll(".subjectBtn[data-subject]")
      .forEach(button => {

        button.addEventListener("click", event => {

          event.preventDefault();

          showSubjectChooserByName(
            button.dataset.subject
          );

        });

      });


    /* KARTU MATERI */
    document.addEventListener("click", event => {

      const card =
        event.target.closest(".chapter");

      if (!card) return;

      openTopics(
        card.dataset.subject,
        card.dataset.index,
        card.dataset.grade
      );

    });


    /* KEYBOARD */
    document.addEventListener("keydown", event => {

      if (event.key === "Escape") {
        closeModal();
      }

      const card =
        event.target.closest?.(".chapter");

      if (
        card &&
        (
          event.key === "Enter" ||
          event.key === " "
        )
      ) {

        event.preventDefault();

        openTopics(
          card.dataset.subject,
          card.dataset.index,
          card.dataset.grade
        );
      }

    });


    /* TOMBOL CLOSE */
    const closeButton = $("closeModal");

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeModal
      );
    }


    /* KLIK DI LUAR MODAL */
    const modal = $("topicModal");

    if (modal) {

      modal.addEventListener("click", event => {

        if (event.target === modal) {
          closeModal();
        }

      });

    }

  }

  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================================
     INIT
     ========================================================= */

  function init() {

    makeLatest();

    setupNavigation();

    setupMorph();

    renderGreeting();

    renderTimeWelcome();

    setInterval(
      renderTimeWelcome,
      60000
    );

    /* Bisa dipanggil dari JS lain */
    window.dashboardBelajar = {

      data,

      openModal,

      closeModal,

      openTopics,

      showSubjectChooser,

      showSubjectChooserByName

    };

  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();

  }

})();