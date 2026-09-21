document.addEventListener("DOMContentLoaded", function () {

  const classCards = document.querySelectorAll(".class-card");
  const contentFrame = document.getElementById("content-frame");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");

  const searchInput = document.getElementById("search-materi");
  const searchButton = document.getElementById("btn-search");

  let kelasAktif = "7";

  // ==========================================
  // FILE MATERI SETIAP KELAS
  // ==========================================

  const materiKelas = {
    "7": "components/pages/matematika.html",
    "8": "components/pages/matematika.html",
    "9": "components/pages/matematika.html"
  };


  // ==========================================
  // MEMBUKA MATERI SESUAI KELAS
  // ==========================================

  function bukaKelas(kelas) {

    kelasAktif = kelas;

    const fileMateri = materiKelas[kelas];

    if (!fileMateri) {
      console.error("File materi kelas " + kelas + " tidak ditemukan.");
      return;
    }

    // Ganti isi iframe
    contentFrame.src = fileMateri;

    // Ganti judul
    pageTitle.textContent = "Materi Kelas " + kelas;

    pageSubtitle.textContent =
      "Materi pembelajaran SMP / MTs Kelas " + kelas;

    // Hapus status aktif semua kartu
    classCards.forEach(function (card) {
      card.classList.remove("active");
    });

    // Aktifkan kartu yang dipilih
    const kartuAktif = document.querySelector(
      '.class-card[data-kelas="' + kelas + '"]'
    );

    if (kartuAktif) {
      kartuAktif.classList.add("active");
    }

    // Kosongkan pencarian
    if (searchInput) {
      searchInput.value = "";
    }
  }


  // ==========================================
  // KLIK KELAS
  // ==========================================

  classCards.forEach(function (card) {

    card.addEventListener("click", function () {

      const kelas = card.getAttribute("data-kelas");

      bukaKelas(kelas);

    });

  });


  // ==========================================
  // PENCARIAN MATERI
  // ==========================================

  function cariMateri() {

    const keyword = searchInput.value.trim();

    if (keyword === "") {

      alert("Silakan masukkan materi yang ingin dicari.");

      searchInput.focus();

      return;
    }

    const fileMateri = materiKelas[kelasAktif];

    if (!fileMateri) {
      alert("File materi tidak ditemukan.");
      return;
    }

    // Kirim kata pencarian ke halaman iframe
    contentFrame.src =
      fileMateri +
      "?search=" +
      encodeURIComponent(keyword);

    pageTitle.textContent =
      'Hasil pencarian: "' + keyword + '"';

    pageSubtitle.textContent =
      "Pencarian materi Kelas " + kelasAktif;
  }


  // ==========================================
  // TOMBOL CARI
  // ==========================================

  if (searchButton) {

    searchButton.addEventListener("click", function () {

      cariMateri();

    });

  }


  // ==========================================
  // ENTER UNTUK MENCARI
  // ==========================================

  if (searchInput) {

    searchInput.addEventListener("keydown", function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        cariMateri();

      }

    });

  }


  // ==========================================
  // KELAS DEFAULT
  // ==========================================

  bukaKelas("7");

});