/* =====================================================
   RUANG BELAJAR
   SCRIPT.JS
===================================================== */


/* =====================================================
   SEARCH MATA PELAJARAN
===================================================== */

const searchInput =
    document.getElementById("searchInput");

const subjectCards =
    document.querySelectorAll(".subject-card");

const emptyState =
    document.getElementById("emptyState");


searchInput.addEventListener("input", function () {

    const keyword =
        this.value
            .toLowerCase()
            .trim();

    let visibleCards = 0;


    subjectCards.forEach(card => {

        const subject =
            card.dataset.subject.toLowerCase();

        const title =
            card
                .querySelector("h2")
                .textContent
                .toLowerCase();


        if (
            subject.includes(keyword) ||
            title.includes(keyword)
        ) {

            card.style.display = "";

            visibleCards++;

        } else {

            card.style.display = "none";
        }

    });


    if (visibleCards === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";
    }

});


/* =====================================================
   TOMBOL BUKA MATERI
===================================================== */

const openButtons =
    document.querySelectorAll(".open-button");


openButtons.forEach(button => {

    button.addEventListener("click", function () {

        const subject =
            this.dataset.subject;


        /*
         * Nanti bisa diganti dengan:
         *
         * window.location.href =
         * "materi.html?mapel=" +
         * encodeURIComponent(subject);
         *
         */


        console.log(
            "Membuka materi:",
            subject
        );


        // Contoh sementara
        alert(
            "Membuka kumpulan materi " +
            subject
        );

    });

});


/* =====================================================
   EFEK CARD
===================================================== */

subjectCards.forEach(card => {

    card.addEventListener("mousemove", function (event) {

        const rect =
            this.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;


        const rotateX =
            ((y / rect.height) - 0.5) * -2;

        const rotateY =
            ((x / rect.width) - 0.5) * 2;


        this.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-5px)`;

    });


    card.addEventListener("mouseleave", function () {

        this.style.transform = "";

    });

});


/* =====================================================
   FILTER BUTTON
===================================================== */

const filterButton =
    document.querySelector(".filter-btn");


filterButton.addEventListener("click", function () {

    alert(
        "Filter mata pelajaran dapat dikembangkan " +
        "menjadi filter kelas, semester, dan guru."
    );

});