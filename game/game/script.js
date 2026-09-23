/* ==========================================================================
   KW LEARNING — ARENA MATEMATIKA
   JavaScript Application Logic

   SISTEM WAKTU:
   1. Durasi Total Permainan
   2. Waktu Menjawab Tiap Tim
   ========================================================================== */


// ==========================================================================
// DAFTAR BAB / MATERI
// ==========================================================================

const CHAPTERS = [
    {
        id: "perkalian",
        file: "soal/bab-1-perkalian.html",
        label: "Perkalian Angka-Angka",
        icon: "✖️"
    },
];


// ==========================================================================
// KONSTANTA
// ==========================================================================

const TEAM_COLORS = [
    "#00f0ff",
    "#00e676",
    "#ff9100",
    "#9d4edd",
    "#ff007f",
    "#ffd700"
];

const MAX_TEAMS = 6;
const MIN_TEAMS = 2;

const STORAGE_KEY = "KW_ARENA_STATE";
const AUTO_NEXT_CORRECT_KEY = "KW_ARENA_AUTO_NEXT_CORRECT";


// ==========================================================================
// APLIKASI
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================================================
    // STATE UTAMA
    // ======================================================================

    let state = {

        setupComplete: false,

        chapterId: null,
        chapterMeta: null,

        categories: [],
        questionsData: [],

        currentQuestionIndex: 0,
        answeredQuestions: {},

        teams: [],
        activeTeamIndex: 0,

        selectedCategory: "all",

        // --------------------------------------------------------------
        // TIMER TOTAL PERMAINAN
        // --------------------------------------------------------------

        timerSeconds: 300,
        timerMaxSeconds: 300,

        // --------------------------------------------------------------
        // TIMER TIAP TIM
        // --------------------------------------------------------------

        playerTimeSeconds: 30,
        playerTimeMaxSeconds: 30,

        // Timer interval gabungan
        timerInterval: null,

        // Status timer
        isTimerRunning: false,

        // --------------------------------------------------------------

        soundEnabled: true,
        animationEnabled: true,
        confettiEnabled: true,

        autoNextCorrect: false,

        isSpinning: false,
        selectedOptionIndex: null,

        gameFinished: false
    };


    // ======================================================================
    // AUDIO
    // ======================================================================

    let audioCtx = null;

    function getAudioCtx() {

        if (!audioCtx) {
            audioCtx = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        return audioCtx;
    }


    function playSound(type) {

        if (!state.soundEnabled) return;

        try {

            const ctx = getAudioCtx();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;


            if (type === "click") {

                osc.type = "sine";

                osc.frequency.setValueAtTime(
                    600,
                    now
                );

                gain.gain.setValueAtTime(
                    0.1,
                    now
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    now + 0.05
                );

                osc.start(now);
                osc.stop(now + 0.05);

            }


            else if (type === "correct") {

                osc.type = "triangle";

                osc.frequency.setValueAtTime(
                    523.25,
                    now
                );

                osc.frequency.setValueAtTime(
                    659.25,
                    now + 0.1
                );

                osc.frequency.setValueAtTime(
                    783.99,
                    now + 0.2
                );

                gain.gain.setValueAtTime(
                    0.2,
                    now
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    now + 0.4
                );

                osc.start(now);
                osc.stop(now + 0.4);

            }


            else if (type === "wrong") {

                osc.type = "sawtooth";

                osc.frequency.setValueAtTime(
                    200,
                    now
                );

                osc.frequency.setValueAtTime(
                    150,
                    now + 0.15
                );

                gain.gain.setValueAtTime(
                    0.2,
                    now
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    now + 0.3
                );

                osc.start(now);
                osc.stop(now + 0.3);

            }


            else if (type === "spin") {

                osc.type = "sine";

                osc.frequency.setValueAtTime(
                    400,
                    now
                );

                gain.gain.setValueAtTime(
                    0.05,
                    now
                );

                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    now + 0.03
                );

                osc.start(now);
                osc.stop(now + 0.03);
            }

        } catch (e) {

            console.log(
                "Audio play error",
                e
            );

        }
    }


    // ======================================================================
    // TOAST
    // ======================================================================

    let toastTimeout = null;


    function showToast(
        message,
        type = "error",
        duration = 2800
    ) {

        const overlay =
            document.getElementById("toastOverlay");

        const card =
            document.getElementById("toastCard");


        if (!overlay || !card) {

            console.error(
                "Elemen toastOverlay atau toastCard tidak ditemukan."
            );

            return;
        }


        if (
            !card.querySelector("#toastIcon") ||
            !card.querySelector("#toastMessage")
        ) {

            card.innerHTML = `
                <span class="toast-icon" id="toastIcon">
                    ⚠️
                </span>

                <p class="toast-message" id="toastMessage">
                    Pesan...
                </p>
            `;
        }


        const icon =
            document.getElementById("toastIcon");

        const msg =
            document.getElementById("toastMessage");


        const icons = {
            error: "⚠️",
            warning: "❗",
            info: "ℹ️",
            success: "✅"
        };


        icon.textContent =
            icons[type] || icons.error;

        msg.textContent = message;


        card.className =
            `toast-card toast-${type}`;

        overlay.classList.remove("hidden");


        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }


        const hideToast = () => {

            card.classList.add(
                "toast-fade-out"
            );

            setTimeout(() => {

                overlay.classList.add(
                    "hidden"
                );

                card.classList.remove(
                    "toast-fade-out"
                );

            }, 280);
        };


        card.onclick = () => {

            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }

            hideToast();
        };


        toastTimeout =
            setTimeout(
                hideToast,
                duration
            );
    }


    // ======================================================================
    // SETUP
    // ======================================================================

    let setupSelectedChapterId = null;
    let setupTeamCount = 2;


    function initSetupScreen() {

        const grid =
            document.getElementById(
                "chapterGrid"
            );

        if (!grid) return;


        grid.innerHTML = "";


        // --------------------------------------------------------------
        // SEMUA BAB
        // --------------------------------------------------------------

        const allCard =
            document.createElement("button");

        allCard.type = "button";

        allCard.className =
            "chapter-card all-chapter-card";

        allCard.dataset.chapterId =
            "all";


        allCard.innerHTML = `
            <span class="chapter-icon">
                🎲
            </span>

            <span class="chapter-name">
                Semua Bab — Random
            </span>

            <span class="chapter-sub">
                Menggabungkan soal dari seluruh bab
            </span>
        `;


        allCard.onclick = () => {

            setupSelectedChapterId =
                "all";

            document
                .querySelectorAll(".chapter-card")
                .forEach(card => {
                    card.classList.remove(
                        "selected"
                    );
                });


            allCard.classList.add(
                "selected"
            );


            const error =
                document.getElementById(
                    "setupError"
                );

            if (error) {
                error.textContent = "";
            }
        };


        grid.appendChild(allCard);


        // --------------------------------------------------------------
        // BAB BIASA
        // --------------------------------------------------------------

        CHAPTERS.forEach(
            (ch, idx) => {

                const card =
                    document.createElement(
                        "button"
                    );

                card.type = "button";

                card.className =
                    "chapter-card";

                card.dataset.chapterId =
                    ch.id;


                card.innerHTML = `
                    <span class="chapter-icon">
                        ${ch.icon}
                    </span>

                    <span class="chapter-name">
                        ${ch.label}
                    </span>

                    <span class="chapter-sub">
                        Klik untuk memilih materi ini
                    </span>
                `;


                card.onclick = () => {

                    setupSelectedChapterId =
                        ch.id;


                    document
                        .querySelectorAll(
                            ".chapter-card"
                        )
                        .forEach(c => {
                            c.classList.remove(
                                "selected"
                            );
                        });


                    card.classList.add(
                        "selected"
                    );


                    const error =
                        document.getElementById(
                            "setupError"
                        );

                    if (error) {
                        error.textContent = "";
                    }
                };


                grid.appendChild(card);


                if (idx === 0) {
                    card.click();
                }
            }
        );


        renderTeamSetupRows();


        // --------------------------------------------------------------
        // TAMBAH TIM
        // --------------------------------------------------------------

        const addTeamBtn =
            document.getElementById(
                "addTeamBtn"
            );


        if (addTeamBtn) {

            addTeamBtn.onclick = () => {

                if (
                    setupTeamCount >=
                    MAX_TEAMS
                ) {
                    showToast(
                        `Maksimal ${MAX_TEAMS} tim.`,
                        "warning"
                    );

                    return;
                }


                setupTeamCount++;

                renderTeamSetupRows();
            };
        }


        // --------------------------------------------------------------
        // WAKTU TOTAL
        // --------------------------------------------------------------

        document
            .querySelectorAll(
                "#timeQuickPicks .time-chip"
            )
            .forEach(chip => {

                chip.onclick = () => {

                    const input =
                        document.getElementById(
                            "setupTimeInput"
                        );


                    if (input) {
                        input.value =
                            chip.dataset.min;
                    }


                    document
                        .querySelectorAll(
                            "#timeQuickPicks .time-chip"
                        )
                        .forEach(c => {
                            c.classList.remove(
                                "active"
                            );
                        });


                    chip.classList.add(
                        "active"
                    );
                };
            });


        // --------------------------------------------------------------
        // WAKTU TIAP TIM
        // --------------------------------------------------------------

        document
            .querySelectorAll(
                "#playerTimeQuickPicks .player-time-chip"
            )
            .forEach(chip => {

                chip.onclick = () => {

                    const input =
                        document.getElementById(
                            "setupPlayerTimeInput"
                        );


                    if (input) {
                        input.value =
                            chip.dataset.sec;
                    }


                    document
                        .querySelectorAll(
                            "#playerTimeQuickPicks .player-time-chip"
                        )
                        .forEach(c => {
                            c.classList.remove(
                                "active"
                            );
                        });


                    chip.classList.add(
                        "active"
                    );
                };
            });


        // --------------------------------------------------------------
        // MULAI
        // --------------------------------------------------------------

        const startBtn =
            document.getElementById(
                "startGameBtn"
            );


        if (startBtn) {
            startBtn.onclick =
                handleStartGame;
        }
    }


    // ======================================================================
    // RENDER NAMA TIM
    // ======================================================================

    function renderTeamSetupRows() {

        const list =
            document.getElementById(
                "teamSetupList"
            );


        if (!list) return;


        const existingValues =
            Array.from(
                list.querySelectorAll(
                    ".team-name-input"
                )
            ).map(input =>
                input.value
            );


        list.innerHTML = "";


        for (
            let i = 0;
            i < setupTeamCount;
            i++
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "team-setup-row";


            const savedVal =
                existingValues[i] || "";


            row.innerHTML = `
                <div
                    class="team-setup-swatch"
                    style="
                        background:
                        ${TEAM_COLORS[
                            i %
                            TEAM_COLORS.length
                        ]}
                    "
                ></div>

                <input
                    type="text"
                    class="input-field team-name-input"
                    placeholder="Nama Tim ${i + 1}"
                    value="${savedVal}"
                    maxlength="24"
                >

                <button
                    type="button"
                    class="team-remove-btn"
                    title="Hapus tim"
                >
                    ✕
                </button>
            `;


            const removeBtn =
                row.querySelector(
                    ".team-remove-btn"
                );


            removeBtn.disabled =
                setupTeamCount <= MIN_TEAMS;


            removeBtn.onclick = () => {

                if (
                    setupTeamCount <=
                    MIN_TEAMS
                ) {
                    return;
                }


                setupTeamCount--;

                renderTeamSetupRows();
            };


            list.appendChild(row);
        }
    }


    // ======================================================================
    // MULAI PERMAINAN
    // ======================================================================

    function handleStartGame() {

        playSound("click");


        const errorBox =
            document.getElementById(
                "setupError"
            );


        if (!setupSelectedChapterId) {

            showToast(
                "Silakan pilih bab/materi terlebih dahulu.",
                "warning"
            );

            return;
        }


        const nameInputs =
            Array.from(
                document.querySelectorAll(
                    ".team-name-input"
                )
            );


        const teamNames =
            nameInputs.map(
                (inp, idx) =>
                    inp.value.trim() ||
                    `Tim ${idx + 1}`
            );


        // --------------------------------------------------------------
        // DURASI TOTAL
        // --------------------------------------------------------------

        const minutes =
            parseInt(
                document.getElementById(
                    "setupTimeInput"
                ).value,
                10
            );


        if (
            !minutes ||
            minutes < 1 ||
            minutes > 90
        ) {

            showToast(
                "Masukkan durasi total permainan 1–90 menit.",
                "warning"
            );

            return;
        }


        // --------------------------------------------------------------
        // WAKTU TIAP TIM
        // --------------------------------------------------------------

        const playerSeconds =
            parseInt(
                document.getElementById(
                    "setupPlayerTimeInput"
                ).value,
                10
            );


        if (
            !playerSeconds ||
            playerSeconds < 5 ||
            playerSeconds > 300
        ) {

            showToast(
                "Waktu tiap tim harus antara 5–300 detik.",
                "warning"
            );

            return;
        }


        if (errorBox) {
            errorBox.textContent = "";
        }


        // --------------------------------------------------------------
        // BUAT TIM
        // --------------------------------------------------------------

        const teams =
            teamNames.map(
                (name, idx) => ({

                    id: idx,

                    name: name,

                    score: 0,

                    color:
                        TEAM_COLORS[
                            idx %
                            TEAM_COLORS.length
                        ]
                })
            );


        state.teams = teams;

        state.activeTeamIndex = 0;


        // Timer total
        state.timerMaxSeconds =
            minutes * 60;

        state.timerSeconds =
            minutes * 60;


        // Timer tiap tim
        state.playerTimeMaxSeconds =
            playerSeconds;

        state.playerTimeSeconds =
            playerSeconds;


        state.answeredQuestions = {};

        state.currentQuestionIndex = 0;

        state.selectedCategory = "all";

        state.selectedOptionIndex = null;

        state.gameFinished = false;


        // --------------------------------------------------------------

        if (
            setupSelectedChapterId ===
            "all"
        ) {

            loadAllChaptersAndStart();

        } else {

            loadChapterAndStart(
                setupSelectedChapterId
            );
        }
    }


    // ======================================================================
    // LOAD SEMUA BAB
    // ======================================================================

    function loadAllChaptersAndStart() {

        const startBtn =
            document.getElementById(
                "startGameBtn"
            );


        if (startBtn) {

            startBtn.disabled = true;

            startBtn.textContent =
                "MEMUAT SEMUA SOAL...";
        }


        const requests =
            CHAPTERS.map(
                chapterCfg => {

                    return fetch(
                        chapterCfg.file
                    )

                        .then(response => {

                            if (!response.ok) {

                                throw new Error(
                                    `${chapterCfg.file} — HTTP ${response.status}`
                                );
                            }

                            return response.text();
                        })


                        .then(html => {

                            const parser =
                                new DOMParser();

                            const doc =
                                parser.parseFromString(
                                    html,
                                    "text/html"
                                );


                            const scriptTag =
                                doc.getElementById(
                                    "quiz-bank"
                                );


                            if (!scriptTag) {

                                throw new Error(
                                    `#quiz-bank tidak ditemukan pada ${chapterCfg.file}`
                                );
                            }


                            let data;


                            try {

                                data =
                                    JSON.parse(
                                        scriptTag.textContent.trim()
                                    );

                            } catch (e) {

                                throw new Error(
                                    `JSON soal tidak valid pada ${chapterCfg.file}`
                                );
                            }


                            return {
                                chapterCfg,
                                data
                            };
                        });
                }
            );


        Promise.all(requests)

            .then(results => {

                const allQuestions = [];

                const categoryMap =
                    new Map();


                results.forEach(
                    ({
                        chapterCfg,
                        data
                    }) => {

                        const questions =
                            Array.isArray(
                                data.questions
                            )
                                ? data.questions
                                : [];


                        const categories =
                            Array.isArray(
                                data.categories
                            )
                                ? data.categories
                                : [];


                        categories.forEach(
                            cat => {

                                const key =
                                    typeof cat ===
                                    "object"
                                        ? (
                                            cat.key ??
                                            cat.name
                                        )
                                        : String(cat);


                                const name =
                                    typeof cat ===
                                    "object"
                                        ? (
                                            cat.name ??
                                            cat.key
                                        )
                                        : String(cat);


                                if (
                                    !key ||
                                    categoryMap.has(
                                        key
                                    )
                                ) {
                                    return;
                                }


                                categoryMap.set(
                                    key,
                                    {
                                        key,
                                        name,
                                        icon:
                                            typeof cat ===
                                            "object"
                                                ? (
                                                    cat.icon ||
                                                    "📌"
                                                )
                                                : "📌"
                                    }
                                );
                            }
                        );


                        questions.forEach(
                            (
                                question,
                                index
                            ) => {

                                const originalId =
                                    question.id ??
                                    (index + 1);


                                allQuestions.push({

                                    ...question,

                                    id:
                                        `${chapterCfg.id}-${originalId}`,

                                    originalId,

                                    sourceChapterId:
                                        chapterCfg.id,

                                    sourceChapterLabel:
                                        chapterCfg.label,

                                    sourceChapterIcon:
                                        chapterCfg.icon,

                                    sourceChapterFile:
                                        chapterCfg.file
                                });
                            }
                        );
                    }
                );


                if (!allQuestions.length) {

                    throw new Error(
                        "Tidak ada soal dari seluruh bab."
                    );
                }


                shuffleArray(
                    allQuestions
                );


                state.chapterId =
                    "all";


                state.chapterMeta = {

                    title:
                        "Semua Bab — Soal Random",

                    subtitle:
                        `${allQuestions.length} soal dari semua bab/materi`,

                    icon:
                        "🎲"
                };


                state.categories =
                    Array.from(
                        categoryMap.values()
                    );


                state.questionsData =
                    allQuestions;


                state.setupComplete =
                    true;


                state.currentQuestionIndex =
                    0;


                state.answeredQuestions =
                    {};


                state.selectedCategory =
                    "all";


                state.selectedOptionIndex =
                    null;


                startArena();
            })


            .catch(error => {

                console.error(
                    "DETAIL ERROR SEMUA BAB:",
                    error
                );


                showToast(
                    "Gagal memuat soal dari semua bab. Pastikan folder /soal berisi file soal dan jalankan melalui Live Server.",
                    "error",
                    9000
                );
            })


            .finally(() => {

                if (startBtn) {

                    startBtn.disabled =
                        false;

                    startBtn.textContent =
                        "🚀 MULAI PERMAINAN";
                }
            });
    }


    // ======================================================================
    // LOAD SATU BAB
    // ======================================================================

    function loadChapterAndStart(
        chapterId
    ) {

        const chapterCfg =
            CHAPTERS.find(
                c => c.id === chapterId
            );


        if (!chapterCfg) {

            showToast(
                "Bab tidak ditemukan.",
                "error"
            );

            return;
        }


        const startBtn =
            document.getElementById(
                "startGameBtn"
            );


        if (startBtn) {

            startBtn.disabled =
                true;

            startBtn.textContent =
                "MEMUAT SOAL...";
        }


        fetch(chapterCfg.file)

            .then(res => {

                if (!res.ok) {

                    throw new Error(
                        "HTTP " + res.status
                    );
                }

                return res.text();
            })


            .then(html => {

                const parser =
                    new DOMParser();

                const doc =
                    parser.parseFromString(
                        html,
                        "text/html"
                    );


                const scriptTag =
                    doc.getElementById(
                        "quiz-bank"
                    );


                if (!scriptTag) {

                    throw new Error(
                        "Format file soal tidak valid."
                    );
                }


                const data =
                    JSON.parse(
                        scriptTag.textContent
                    );


                state.chapterId =
                    chapterCfg.id;


                state.chapterMeta =
                    data.meta || {

                        title:
                            chapterCfg.label,

                        subtitle:
                            "",

                        icon:
                            chapterCfg.icon
                    };


                state.categories =
                    data.categories || [];


                state.questionsData =
                    data.questions || [];


                state.setupComplete =
                    true;


                startArena();
            })


            .catch(err => {

                console.error(err);


                showToast(
                    "Gagal memuat file soal (" +
                    chapterCfg.file +
                    "). Jalankan project melalui Live Server.",
                    "error",
                    9000
                );
            })


            .finally(() => {

                if (startBtn) {

                    startBtn.disabled =
                        false;

                    startBtn.textContent =
                        "🚀 MULAI PERMAINAN";
                }
            });
    }


    // ======================================================================
    // MULAI ARENA
    // ======================================================================

    function startArena() {

        state.gameFinished = false;


        document
            .getElementById("setupScreen")
            .classList.add("hidden");


        document.body.classList.remove(
            "setup-active"
        );


        document
            .getElementById("appContainer")
            .classList.remove("hidden");


        document.getElementById(
            "babIcon"
        ).textContent =
            state.chapterMeta.icon ||
            "📖";


        document.getElementById(
            "babTitle"
        ).textContent =
            state.chapterMeta.title ||
            "Bab";


        document.getElementById(
            "babSubtitle"
        ).textContent =
            state.chapterMeta.subtitle ||
            "Kuis Interaktif SMP";


        document.getElementById(
            "modeLabel"
        ).textContent =
            "Mode: Tim";


        document.getElementById(
            "modeSub"
        ).textContent =
            `${state.teams.length} Tim`;


        buildWheel();

        renderCategories();

        renderTeamScores();

        updateLeaderboard();

        renderQuestion(
            state.currentQuestionIndex
        );

        updateProgress();


        // Pastikan timer tim dimulai dari nilai maksimal
        if (
            !state.playerTimeSeconds ||
            state.playerTimeSeconds <= 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        updateTimerDisplay();

        setupEventListeners();

        saveLocalStorage();


        // Mulai timer
        startTimers();
    }


    // ======================================================================
    // SHUFFLE
    // ======================================================================

    function shuffleArray(array) {

        for (
            let i = array.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                array[i],
                array[j]
            ] = [
                array[j],
                array[i]
            ];
        }


        return array;
    }


    // ======================================================================
    // LOCAL STORAGE
    // ======================================================================

    function loadLocalStorage() {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) return;


        try {

            const parsed =
                JSON.parse(saved);


            state = {
                ...state,
                ...parsed
            };


            // ----------------------------------------------------------
            // Kompatibilitas dengan data lama
            // ----------------------------------------------------------

            if (
                !state.playerTimeMaxSeconds
            ) {

                state.playerTimeMaxSeconds =
                    30;
            }


            if (
                !state.playerTimeSeconds ||
                state.playerTimeSeconds <= 0
            ) {

                state.playerTimeSeconds =
                    state.playerTimeMaxSeconds;
            }


            if (
                typeof state.autoNextCorrect ===
                "boolean"
            ) {

                localStorage.setItem(
                    AUTO_NEXT_CORRECT_KEY,
                    state.autoNextCorrect
                        ? "true"
                        : "false"
                );
            }

        } catch (e) {

            console.error(
                "Failed to load state",
                e
            );
        }
    }


    function saveLocalStorage() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({

                setupComplete:
                    state.setupComplete,

                chapterId:
                    state.chapterId,

                chapterMeta:
                    state.chapterMeta,

                categories:
                    state.categories,

                questionsData:
                    state.questionsData,

                answeredQuestions:
                    state.answeredQuestions,

                teams:
                    state.teams,

                activeTeamIndex:
                    state.activeTeamIndex,

                currentQuestionIndex:
                    state.currentQuestionIndex,

                // TIMER TOTAL
                timerSeconds:
                    state.timerSeconds,

                timerMaxSeconds:
                    state.timerMaxSeconds,

                // TIMER TIAP TIM
                playerTimeSeconds:
                    state.playerTimeSeconds,

                playerTimeMaxSeconds:
                    state.playerTimeMaxSeconds,

                soundEnabled:
                    state.soundEnabled,

                animationEnabled:
                    state.animationEnabled,

                confettiEnabled:
                    state.confettiEnabled,

                autoNextCorrect:
                    localStorage.getItem(
                        AUTO_NEXT_CORRECT_KEY
                    ) === "true"
            })
        );
    }


    // ======================================================================
    // WHEEL
    // ======================================================================

    function buildWheel() {

        const wheelSvg =
            document.getElementById(
                "wheelSvg"
            );


        if (!wheelSvg) return;


        wheelSvg.innerHTML = "";


        const numSectors =
            Math.max(
                state.questionsData.length,
                1
            );


        const anglePerSector =
            360 / numSectors;


        const colors = [
            "#00f0ff",
            "#0088ff",
            "#9d4edd",
            "#ff007f",
            "#ff9100",
            "#00e676"
        ];


        for (
            let i = 0;
            i < numSectors;
            i++
        ) {

            const startAngle =
                i * anglePerSector;


            const endAngle =
                (i + 1) *
                anglePerSector;


            const color =
                colors[
                    i % colors.length
                ];


            const x1 =
                150 +
                140 *
                Math.cos(
                    Math.PI *
                    startAngle /
                    180
                );


            const y1 =
                150 +
                140 *
                Math.sin(
                    Math.PI *
                    startAngle /
                    180
                );


            const x2 =
                150 +
                140 *
                Math.cos(
                    Math.PI *
                    endAngle /
                    180
                );


            const y2 =
                150 +
                140 *
                Math.sin(
                    Math.PI *
                    endAngle /
                    180
                );


            const largeArc =
                anglePerSector > 180
                    ? 1
                    : 0;


            const pathData = `
                M 150 150
                L ${x1} ${y1}
                A 140 140 0
                ${largeArc}
                1
                ${x2} ${y2}
                Z
            `;


            const path =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );


            path.setAttribute(
                "d",
                pathData
            );


            path.setAttribute(
                "fill",
                color
            );


            path.setAttribute(
                "opacity",
                "0.7"
            );


            path.setAttribute(
                "stroke",
                "#020817"
            );


            path.setAttribute(
                "stroke-width",
                "2"
            );


            wheelSvg.appendChild(
                path
            );


            const midAngle =
                startAngle +
                anglePerSector / 2;


            const tx =
                150 +
                105 *
                Math.cos(
                    Math.PI *
                    midAngle /
                    180
                );


            const ty =
                150 +
                105 *
                Math.sin(
                    Math.PI *
                    midAngle /
                    180
                );


            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );


            text.setAttribute(
                "x",
                tx
            );


            text.setAttribute(
                "y",
                ty
            );


            text.setAttribute(
                "fill",
                "#ffffff"
            );


            text.setAttribute(
                "font-size",
                numSectors > 24
                    ? "9"
                    : "12"
            );


            text.setAttribute(
                "font-weight",
                "bold"
            );


            text.setAttribute(
                "text-anchor",
                "middle"
            );


            text.setAttribute(
                "dominant-baseline",
                "central"
            );


            text.setAttribute(
                "transform",
                `rotate(
                    ${midAngle + 90},
                    ${tx},
                    ${ty}
                )`
            );


            text.textContent =
                i + 1;


            wheelSvg.appendChild(
                text
            );
        }
    }


    // ======================================================================
    // SPIN WHEEL
    // ======================================================================

    function spinWheel() {

        if (
            state.isSpinning ||
            state.gameFinished
        ) {
            return;
        }


        if (
            state.questionsData.length === 0
        ) {
            return;
        }


        state.isSpinning = true;

        playSound("click");


        const spinBtn =
            document.getElementById(
                "spinBtn"
            );


        if (spinBtn) {
            spinBtn.disabled = true;
        }


        const wheelContainer =
            document.getElementById(
                "wheelContainer"
            );


        const total =
            state.questionsData.length;


        const unaskedIndices =
            state.questionsData

                .map(
                    (q, idx) => ({
                        q,
                        idx
                    })
                )

                .filter(
                    item =>
                        !state.answeredQuestions[
                            item.q.id
                        ]
                )

                .map(
                    item =>
                        item.idx
                );


        let targetIndex =
            Math.floor(
                Math.random() * total
            );


        if (
            unaskedIndices.length > 0
        ) {

            targetIndex =
                unaskedIndices[
                    Math.floor(
                        Math.random() *
                        unaskedIndices.length
                    )
                ];
        }


        const anglePerSector =
            360 / total;


        const targetSectorAngle =
            (
                targetIndex *
                anglePerSector
            ) +
            (
                anglePerSector / 2
            );


        const randomSpins =
            5 * 360;


        const totalRotation =
            randomSpins +
            (
                360 -
                targetSectorAngle
            );


        wheelContainer.style.transform =
            `rotate(${totalRotation}deg)`;


        let spinTicks = 0;


        const tickInterval =
            setInterval(() => {

                playSound("spin");

                spinTicks++;


                if (spinTicks > 20) {

                    clearInterval(
                        tickInterval
                    );
                }

            }, 150);


        setTimeout(() => {

            state.isSpinning =
                false;


            if (spinBtn) {
                spinBtn.disabled = false;
            }


            wheelContainer.style.transition =
                "none";


            wheelContainer.style.transform =
                `rotate(
                    ${360 - targetSectorAngle}deg
                )`;


            setTimeout(() => {

                wheelContainer.style.transition =
                    "transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)";

            }, 50);


            state.currentQuestionIndex =
                targetIndex;


            renderQuestion(
                targetIndex
            );


            saveLocalStorage();

        }, 4000);
    }


    // ======================================================================
    // RENDER QUESTION
    // ======================================================================

    function renderQuestion(index) {

        state.selectedOptionIndex =
            null;


        const q =
            state.questionsData[index];


        if (!q) return;


        document.getElementById(
            "currentNumberDisplay"
        ).textContent =
            q.originalId ??
            q.id;


        document.getElementById(
            "qNumHeader"
        ).textContent =
            q.originalId ??
            q.id;


        document.getElementById(
            "qDifficultyBadge"
        ).textContent =
            q.difficulty;


        document.getElementById(
            "qPointsBadge"
        ).textContent =
            `+${q.points} Pts`;


        document.getElementById(
            "questionText"
        ).textContent =
            q.question;


        const categoryBadge =
            document.getElementById(
                "qCategoryBadge"
            );


        const categoryName =
            typeof q.category ===
            "object"

                ? (
                    q.category?.name ||
                    q.category?.key ||
                    "Kategori"
                )

                : (
                    q.category ||
                    "Kategori"
                );


        categoryBadge.textContent =
            state.chapterId === "all" &&
            q.sourceChapterLabel

                ? `${q.sourceChapterLabel} • ${categoryName}`

                : categoryName;


        const stageStatus =
            document.getElementById(
                "stageStatusText"
            );


        stageStatus.textContent =
            state.answeredQuestions[q.id]

                ? "Soal ini telah dijawab!"

                : "Soal siap dijawab!";


        const optionsGrid =
            document.getElementById(
                "optionsGrid"
            );


        optionsGrid.innerHTML = "";


        const prefixes = [
            "A",
            "B",
            "C",
            "D"
        ];


        const optClasses = [
            "opt-a",
            "opt-b",
            "opt-c",
            "opt-d"
        ];


        const answeredData =
            state.answeredQuestions[
                q.id
            ];


        q.options.forEach(
            (
                optText,
                optIdx
            ) => {

                const optBtn =
                    document.createElement(
                        "button"
                    );


                optBtn.className =
                    `option-btn ${
                        optClasses[
                            optIdx %
                            optClasses.length
                        ]
                    }`;


                if (answeredData) {

                    if (
                        optIdx === q.answer
                    ) {

                        optBtn.classList.add(
                            "correct-ans"
                        );

                    }

                    else if (
                        optIdx ===
                        answeredData.selectedOption
                    ) {

                        optBtn.classList.add(
                            "wrong-ans"
                        );
                    }


                    optBtn.disabled =
                        true;

                }

                else {

                    optBtn.onclick =
                        () =>
                            selectOption(
                                optIdx
                            );
                }


                optBtn.innerHTML = `

                    <div class="opt-prefix">
                        ${
                            prefixes[
                                optIdx %
                                prefixes.length
                            ]
                        }
                    </div>

                    <div class="opt-text">
                        ${optText}
                    </div>

                `;


                optionsGrid.appendChild(
                    optBtn
                );
            }
        );


        const submitBtn =
            document.getElementById(
                "submitAnswerBtn"
            );


        const expBox =
            document.getElementById(
                "explanationBox"
            );


        if (answeredData) {

            submitBtn.disabled =
                true;


            expBox.classList.remove(
                "hidden"
            );


            const isCorr =
                answeredData.isCorrect;


            const fbHeader =
                document.getElementById(
                    "feedbackHeader"
                );


            fbHeader.className =
                `feedback-header ${
                    isCorr
                        ? "feedback-correct"
                        : "feedback-wrong"
                }`;


            document.getElementById(
                "feedbackIcon"
            ).textContent =
                isCorr
                    ? "✓"
                    : "✕";


            document.getElementById(
                "feedbackTitle"
            ).textContent =
                isCorr
                    ? "JAWABAN BENAR!"
                    : "JAWABAN KURANG TEPAT";


            document.getElementById(
                "feedbackPts"
            ).textContent =
                isCorr
                    ? `+${answeredData.points} POIN`
                    : "+0 POIN";


            document.getElementById(
                "explanationText"
            ).textContent =
                q.explanation || "";

        }

        else {

            submitBtn.disabled =
                false;

            expBox.classList.add(
                "hidden"
            );
        }
    }


    // ======================================================================
    // PILIH OPSI
    // ======================================================================

    function selectOption(optIdx) {

        if (state.gameFinished) {
            return;
        }


        playSound("click");


        state.selectedOptionIndex =
            optIdx;


        const buttons =
            document.querySelectorAll(
                ".option-btn"
            );


        buttons.forEach(
            (
                btn,
                idx
            ) => {

                if (idx === optIdx) {

                    btn.classList.add(
                        "selected"
                    );

                }

                else {

                    btn.classList.remove(
                        "selected"
                    );
                }
            }
        );
    }


    // ======================================================================
    // SUBMIT ANSWER
    // ======================================================================

    function submitAnswer() {

        if (state.gameFinished) {
            return;
        }


        const q =
            state.questionsData[
                state.currentQuestionIndex
            ];


        if (!q) return;


        if (
            state.answeredQuestions[
                q.id
            ]
        ) {
            return;
        }


        if (
            state.selectedOptionIndex ===
            null
        ) {

            showToast(
                "Pilih salah satu jawaban terlebih dahulu!",
                "warning"
            );

            return;
        }


        const currentTeam =
            state.teams[
                state.activeTeamIndex
            ];


        const isCorrect =
            state.selectedOptionIndex ===
            q.answer;


        const pointsAwarded =
            isCorrect
                ? (
                    Number(q.points) ||
                    0
                )
                : 0;


        const autoNext =
            localStorage.getItem(
                AUTO_NEXT_CORRECT_KEY
            ) === "true";


        // ==================================================================
        // BENAR
        // ==================================================================

        if (isCorrect) {

            state.answeredQuestions[
                q.id
            ] = {

                selectedOption:
                    state.selectedOptionIndex,

                isCorrect:
                    true,

                points:
                    pointsAwarded,

                teamId:
                    currentTeam
                        ? currentTeam.id
                        : null
            };


            playSound("correct");


            if (currentTeam) {

                currentTeam.score +=
                    pointsAwarded;
            }


            if (
                state.confettiEnabled
            ) {

                triggerConfetti();
            }


            renderQuestion(
                state.currentQuestionIndex
            );


            renderTeamScores();

            updateLeaderboard();

            updateProgress();


            // --------------------------------------------------------------
            // SEMUA SOAL SELESAI
            // --------------------------------------------------------------

            if (
                Object.keys(
                    state.answeredQuestions
                ).length >=
                state.questionsData.length
            ) {

                saveLocalStorage();

                setTimeout(
                    () =>
                        finishGame(),
                    900
                );

                return;
            }


            // --------------------------------------------------------------
            // GANTI TIM
            // --------------------------------------------------------------

            nextTeam();


            saveLocalStorage();


            // --------------------------------------------------------------
            // AUTO NEXT
            // --------------------------------------------------------------

            if (autoNext) {

                setTimeout(() => {

                    const nextIndex =
                        findNextUnansweredQuestion();


                    if (
                        nextIndex !== -1
                    ) {

                        state.currentQuestionIndex =
                            nextIndex;


                        renderQuestion(
                            nextIndex
                        );


                        updateProgress();

                        startPlayerTimer();

                        saveLocalStorage();
                    }

                }, 700);

            }

            else {

                // Tim berikutnya langsung mendapat waktu
                startPlayerTimer();

                saveLocalStorage();
            }

        }


        // ==================================================================
        // SALAH
        // ==================================================================

        else {

            playSound("wrong");


            // --------------------------------------------------------------
            // AUTO NEXT AKTIF
            // --------------------------------------------------------------

            if (autoNext) {

                state.selectedOptionIndex =
                    null;


                nextTeam();


                renderQuestion(
                    state.currentQuestionIndex
                );


                renderTeamScores();

                updateLeaderboard();

                updateProgress();


                // Tim baru mendapat waktu baru
                startPlayerTimer();


                saveLocalStorage();


                showToast(
                    "Jawaban salah. Roda akan diputar lagi!",
                    "error",
                    1200
                );


                setTimeout(() => {

                    if (
                        !state.isSpinning &&
                        !state.gameFinished
                    ) {

                        spinWheel();
                    }

                }, 1300);
            }


            // --------------------------------------------------------------
            // AUTO NEXT MATI
            // --------------------------------------------------------------

            else {

                state.answeredQuestions[
                    q.id
                ] = {

                    selectedOption:
                        state.selectedOptionIndex,

                    isCorrect:
                        false,

                    points:
                        0,

                    teamId:
                        currentTeam
                            ? currentTeam.id
                            : null
                };


                nextTeam();


                renderQuestion(
                    state.currentQuestionIndex
                );


                renderTeamScores();

                updateLeaderboard();

                updateProgress();


                if (
                    Object.keys(
                        state.answeredQuestions
                    ).length >=
                    state.questionsData.length
                ) {

                    saveLocalStorage();

                    setTimeout(
                        () =>
                            finishGame(),
                        1000
                    );

                    return;
                }


                // Timer tim berikutnya dimulai
                startPlayerTimer();


                saveLocalStorage();
            }
        }
    }


    // ======================================================================
    // PINDAH TIM
    // ======================================================================

    function nextTeam() {

        if (!state.teams.length) {
            return;
        }


        state.activeTeamIndex =
            (
                state.activeTeamIndex +
                1
            ) %
            state.teams.length;


        state.playerTimeSeconds =
            state.playerTimeMaxSeconds;


        renderTeamScores();

        updateTimerDisplay();
    }


    // ======================================================================
    // SOAL BERIKUTNYA YANG BELUM DIJAWAB
    // ======================================================================

    function findNextUnansweredQuestion() {

        const total =
            state.questionsData.length;


        if (!total) {
            return -1;
        }


        for (
            let offset = 1;
            offset <= total;
            offset++
        ) {

            const index =
                (
                    state.currentQuestionIndex +
                    offset
                ) %
                total;


            const question =
                state.questionsData[
                    index
                ];


            if (
                question &&
                !state.answeredQuestions[
                    question.id
                ]
            ) {

                return index;
            }
        }


        return -1;
    }


    // ======================================================================
    // TEAM SCORE
    // ======================================================================

    function renderTeamScores() {

        const activeTeam =
            state.teams[
                state.activeTeamIndex
            ];


        const nameEl =
            document.getElementById(
                "activeTeamName"
            );


        if (activeTeam) {

            nameEl.textContent =
                activeTeam.name;

            nameEl.title =
                activeTeam.name;
        }


        const activeTimeEl =
            document.getElementById(
                "activeTeamTime"
            );


        if (activeTimeEl) {

            activeTimeEl.textContent =
                formatTime(
                    state.playerTimeSeconds
                );
        }


        const container =
            document.getElementById(
                "teamListContainer"
            );


        container.innerHTML = "";


        state.teams.forEach(
            (
                t,
                idx
            ) => {

                const isTurn =
                    idx ===
                    state.activeTeamIndex;


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    `team-card ${
                        isTurn
                            ? "current-turn"
                            : ""
                    }`;


                div.innerHTML = `

                    <div class="team-card-info">

                        <div
                            class="team-avatar"
                            style="
                                background:
                                ${t.color};
                                color: #000;
                            "
                        >
                            ${idx + 1}
                        </div>

                        <span
                            class="team-name-text"
                            title="${t.name}"
                        >
                            ${t.name}
                        </span>

                    </div>

                    <div class="team-score-val">
                        ${t.score}
                    </div>

                `;


                container.appendChild(
                    div
                );
            }
        );
    }


    // ======================================================================
    // LEADERBOARD
    // ======================================================================

    function updateLeaderboard() {

        const sorted =
            [...state.teams].sort(
                (a, b) =>
                    b.score -
                    a.score
            );


        const tbody =
            document.getElementById(
                "leaderboardTbody"
            );


        tbody.innerHTML = "";


        sorted.forEach(
            (
                team,
                rank
            ) => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const crown =
                    rank === 0
                        ? '<span class="rank-crown">👑</span>'
                        : "";


                tr.innerHTML = `

                    <td>
                        <strong>
                            ${rank + 1}
                        </strong>
                    </td>

                    <td>
                        ${crown}${team.name}
                    </td>

                    <td
                        style="
                            text-align:right;
                            font-weight:bold;
                            color:var(--primary-cyan);
                        "
                    >
                        ${team.score}
                    </td>

                `;


                tbody.appendChild(
                    tr
                );
            }
        );
    }


    // ======================================================================
    // PROGRESS
    // ======================================================================

    function updateProgress() {

        const total =
            state.questionsData.length;


        const answeredCount =
            Object.keys(
                state.answeredQuestions
            ).length;


        const pct =
            total > 0

                ? Math.round(
                    (
                        answeredCount /
                        total
                    ) *
                    100
                )

                : 0;


        let correctCount = 0;

        let wrongCount = 0;


        Object.values(
            state.answeredQuestions
        ).forEach(ans => {

            if (ans.isCorrect) {

                correctCount++;

            }

            else {

                wrongCount++;
            }
        });


        document.getElementById(
            "progressTextSide"
        ).textContent =
            `${answeredCount} / ${total} Soal`;


        document.getElementById(
            "progressBarSide"
        ).style.width =
            `${pct}%`;


        document.getElementById(
            "fTotal"
        ).textContent =
            total;


        document.getElementById(
            "fAnswered"
        ).textContent =
            answeredCount;


        document.getElementById(
            "fCorrect"
        ).textContent =
            correctCount;


        document.getElementById(
            "fWrong"
        ).textContent =
            wrongCount;


        document.getElementById(
            "fProgressPct"
        ).textContent =
            `${pct}%`;


        document.getElementById(
            "progressBarFooter"
        ).style.width =
            `${pct}%`;
    }


    // ======================================================================
    // CATEGORY
    // ======================================================================

    function renderCategories() {

        const grid =
            document.getElementById(
                "categoryGrid"
            );


        grid.innerHTML = "";


        const allBtn =
            document.createElement(
                "button"
            );


        allBtn.type =
            "button";


        allBtn.className =
            "category-card active";


        allBtn.dataset.category =
            "all";


        allBtn.innerHTML = `
            <span class="cat-icon">
                🌐
            </span>

            <span class="cat-name">
                Semua Kategori
            </span>
        `;


        grid.appendChild(
            allBtn
        );


        state.categories.forEach(
            cat => {

                const btn =
                    document.createElement(
                        "button"
                    );


                btn.type =
                    "button";


                btn.className =
                    "category-card";


                const key =
                    typeof cat ===
                    "object"

                        ? (
                            cat.key ??
                            cat.name
                        )

                        : String(cat);


                const name =
                    typeof cat ===
                    "object"

                        ? (
                            cat.name ??
                            cat.key
                        )

                        : String(cat);


                const icon =
                    typeof cat ===
                    "object"

                        ? (
                            cat.icon ||
                            "📌"
                        )

                        : "📌";


                btn.dataset.category =
                    key;


                btn.innerHTML = `
                    <span class="cat-icon">
                        ${icon}
                    </span>

                    <span class="cat-name">
                        ${name}
                    </span>
                `;


                grid.appendChild(
                    btn
                );
            }
        );


        const cards =
            grid.querySelectorAll(
                ".category-card"
            );


        cards.forEach(
            card => {

                card.onclick = () => {

                    playSound(
                        "click"
                    );


                    cards.forEach(
                        c =>
                            c.classList.remove(
                                "active"
                            )
                    );


                    card.classList.add(
                        "active"
                    );


                    const cat =
                        card.getAttribute(
                            "data-category"
                        );


                    state.selectedCategory =
                        cat;


                    if (
                        cat !== "all"
                    ) {

                        const firstMatch =
                            state.questionsData.findIndex(
                                q => {

                                    const qCat =
                                        typeof q.category ===
                                        "object"

                                            ? (
                                                q.category?.key ??
                                                q.category?.name
                                            )

                                            : q.category;


                                    return (
                                        qCat ===
                                        cat
                                    );
                                }
                            );


                        if (
                            firstMatch !== -1
                        ) {

                            state.currentQuestionIndex =
                                firstMatch;


                            renderQuestion(
                                firstMatch
                            );
                        }
                    }
                };
            }
        );
    }


    // ======================================================================
    // FORMAT WAKTU
    // ======================================================================

    function formatTime(seconds) {

        seconds =
            Math.max(
                0,
                Number(seconds) || 0
            );


        const m =
            Math.floor(
                seconds / 60
            )
                .toString()
                .padStart(2, "0");


        const s =
            (
                seconds % 60
            )
                .toString()
                .padStart(2, "0");


        return `${m}:${s}`;
    }


    // ======================================================================
    // TIMER DISPLAY
    // ======================================================================

    function updateTimerDisplay() {

        // --------------------------------------------------------------
        // Yang ditampilkan di header adalah WAKTU TIM
        // --------------------------------------------------------------

        const teamTime =
            formatTime(
                state.playerTimeSeconds
            );


        const timerDisplay =
            document.getElementById(
                "timerDisplay"
            );


        const footerTimer =
            document.getElementById(
                "fTimer"
            );


        const activeTeamTime =
            document.getElementById(
                "activeTeamTime"
            );


        if (timerDisplay) {

            timerDisplay.textContent =
                teamTime;
        }


        if (footerTimer) {

            footerTimer.textContent =
                teamTime;
        }


        if (activeTeamTime) {

            activeTeamTime.textContent =
                teamTime;
        }


        // --------------------------------------------------------------
        // Visual peringatan waktu
        // --------------------------------------------------------------

        const timerElements = [
            timerDisplay,
            footerTimer,
            activeTeamTime
        ];


        timerElements.forEach(
            el => {

                if (!el) return;


                el.classList.remove(
                    "timer-warning",
                    "timer-danger"
                );


                if (
                    state.playerTimeSeconds <=
                    5
                ) {

                    el.classList.add(
                        "timer-danger"
                    );

                }

                else if (
                    state.playerTimeSeconds <=
                    10
                ) {

                    el.classList.add(
                        "timer-warning"
                    );
                }
            }
        );


        // --------------------------------------------------------------
        // Label
        // --------------------------------------------------------------

        const timerLabel =
            document.getElementById(
                "timerLabel"
            );


        if (timerLabel) {

            timerLabel.textContent =
                `WAKTU ${(
                    state.teams[
                        state.activeTeamIndex
                    ]?.name ||
                    "TIM"
                ).toUpperCase()}`;
        }
    }


    // ======================================================================
    // MULAI TIMER
    // ======================================================================

    function startTimers() {

        // Hapus timer lama
        stopTimers();


        if (state.gameFinished) {
            return;
        }


        state.isTimerRunning =
            true;


        // Pastikan waktu tim valid
        if (
            !state.playerTimeSeconds ||
            state.playerTimeSeconds <= 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        updateTimerDisplay();


        state.timerInterval =
            setInterval(() => {

                if (
                    state.gameFinished
                ) {

                    stopTimers();

                    return;
                }


                // ======================================================
                // TIMER TOTAL PERMAINAN
                // ======================================================

                if (
                    state.timerSeconds > 0
                ) {

                    state.timerSeconds--;

                }

                else {

                    stopTimers();

                    finishGame(
                        "timeup"
                    );

                    return;
                }


                // ======================================================
                // TIMER TIM AKTIF
                // ======================================================

                if (
                    state.playerTimeSeconds > 0
                ) {

                    state.playerTimeSeconds--;

                }


                updateTimerDisplay();


                // ------------------------------------------------------
                // WAKTU TIM HABIS
                // ------------------------------------------------------

                if (
                    state.playerTimeSeconds <=
                    0
                ) {

                    handlePlayerTimeUp();

                    return;
                }


                // Simpan berkala
                saveLocalStorage();

            }, 1000);
    }


    // ======================================================================
    // START / RESET TIMER TIM
    // ======================================================================

    function startPlayerTimer() {

        if (state.gameFinished) {
            return;
        }


        state.playerTimeSeconds =
            state.playerTimeMaxSeconds;


        updateTimerDisplay();


        // Jika interval sudah berjalan,
        // tidak perlu membuat interval kedua.
        if (!state.timerInterval) {

            startTimers();
        }


        saveLocalStorage();
    }


    // ======================================================================
    // STOP TIMER
    // ======================================================================

    function stopTimers() {

        if (state.timerInterval) {

            clearInterval(
                state.timerInterval
            );

            state.timerInterval =
                null;
        }


        state.isTimerRunning =
            false;
    }


    // ======================================================================
    // WAKTU TIM HABIS
    // ======================================================================

    function handlePlayerTimeUp() {

        if (state.gameFinished) {
            return;
        }


        playSound("wrong");


        state.playerTimeSeconds =
            0;


        updateTimerDisplay();


        showToast(
            `${
                state.teams[
                    state.activeTeamIndex
                ]?.name || "Tim"
            } kehabisan waktu! Giliran berpindah.`,
            "warning",
            1500
        );


        // --------------------------------------------------------------
        // Cari soal yang masih belum dijawab
        // --------------------------------------------------------------

        const nextIndex =
            findNextUnansweredQuestion();


        // Jika tidak ada soal lagi
        if (nextIndex === -1) {

            finishGame();

            return;
        }


        // --------------------------------------------------------------
        // Pindah tim
        // --------------------------------------------------------------

        nextTeam();


        // --------------------------------------------------------------
        // Tampilkan status
        // --------------------------------------------------------------

        renderTeamScores();


        renderQuestion(
            state.currentQuestionIndex
        );


        updateProgress();


        saveLocalStorage();


        // --------------------------------------------------------------
        // Tim berikutnya mendapat soal baru melalui roda
        // --------------------------------------------------------------

        setTimeout(() => {

            if (
                !state.gameFinished &&
                !state.isSpinning
            ) {

                spinWheel();
            }

        }, 1000);
    }


    // ======================================================================
    // MODAL KONFIRMASI
    // ======================================================================

    function showConfirmModal(
        message,
        onConfirm,
        options = {}
    ) {

        const overlay =
            document.getElementById(
                "toastOverlay"
            );


        const card =
            document.getElementById(
                "toastCard"
            );


        if (!overlay || !card) {

            console.error(
                "Elemen toastOverlay atau toastCard tidak ditemukan."
            );

            return;
        }


        if (toastTimeout) {
            clearTimeout(
                toastTimeout
            );
        }


        const icon =
            options.icon ||
            "❓";


        const confirmText =
            options.confirmText ||
            "Ya, Lanjutkan";


        card.className =
            "toast-card toast-warning toast-confirm-card";


        card.innerHTML = `

            <div class="toast-confirm-content">

                <div class="toast-confirm-icon">
                    ${icon}
                </div>

                <div class="toast-confirm-message">
                    ${message}
                </div>

                <div class="toast-confirm-actions">

                    <button
                        type="button"
                        class="toast-confirm-btn toast-cancel-btn"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        class="toast-confirm-btn toast-ok-btn"
                    >
                        ${confirmText}
                    </button>

                </div>

            </div>
        `;


        overlay.classList.remove(
            "hidden"
        );


        const cancelBtn =
            card.querySelector(
                ".toast-cancel-btn"
            );


        const okBtn =
            card.querySelector(
                ".toast-ok-btn"
            );


        if (cancelBtn) {

            cancelBtn.onclick =
                event => {

                    event.stopPropagation();

                    overlay.classList.add(
                        "hidden"
                    );

                    card.onclick =
                        null;
                };
        }


        if (okBtn) {

            okBtn.onclick =
                event => {

                    event.stopPropagation();

                    overlay.classList.add(
                        "hidden"
                    );

                    card.onclick =
                        null;


                    if (
                        typeof onConfirm ===
                        "function"
                    ) {

                        onConfirm();
                    }
                };
        }
    }


    // ======================================================================
    // EVENT LISTENERS
    // ======================================================================

    let listenersBound = false;


    function setupEventListeners() {

        if (listenersBound) {
            return;
        }


        listenersBound = true;


        // --------------------------------------------------------------
        // SPIN
        // --------------------------------------------------------------

        document.getElementById(
            "spinBtn"
        ).onclick =
            spinWheel;


        // --------------------------------------------------------------
        // SUBMIT
        // --------------------------------------------------------------

        document.getElementById(
            "submitAnswerBtn"
        ).onclick =
            submitAnswer;


        // --------------------------------------------------------------
        // PREVIOUS
        // --------------------------------------------------------------

        document.getElementById(
            "prevQuestionBtn"
        ).onclick =
            () => {

                playSound("click");


                const total =
                    state.questionsData.length;


                if (!total) return;


                state.currentQuestionIndex =
                    (
                        state.currentQuestionIndex -
                        1 +
                        total
                    ) %
                    total;


                renderQuestion(
                    state.currentQuestionIndex
                );
            };


        // --------------------------------------------------------------
        // NEXT
        // --------------------------------------------------------------

        document.getElementById(
            "nextQuestionBtn"
        ).onclick =
            () => {

                playSound("click");


                const total =
                    state.questionsData.length;


                if (!total) return;


                state.currentQuestionIndex =
                    (
                        state.currentQuestionIndex +
                        1
                    ) %
                    total;


                renderQuestion(
                    state.currentQuestionIndex
                );
            };


        // --------------------------------------------------------------
        // SOUND
        // --------------------------------------------------------------

        document.getElementById(
            "soundToggleBtn"
        ).onclick =
            () => {

                state.soundEnabled =
                    !state.soundEnabled;


                document.getElementById(
                    "soundIcon"
                ).textContent =
                    state.soundEnabled
                        ? "🔊"
                        : "🔇";


                playSound("click");

                saveLocalStorage();
            };


        // --------------------------------------------------------------
        // SETTINGS
        // --------------------------------------------------------------

        const settingsModal =
            document.getElementById(
                "settingsModal"
            );


        document.getElementById(
            "settingsBtn"
        ).onclick =
            () => {

                playSound("click");


                document.getElementById(
                    "setSound"
                ).checked =
                    state.soundEnabled;


                document.getElementById(
                    "setAnimation"
                ).checked =
                    state.animationEnabled;


                document.getElementById(
                    "setConfetti"
                ).checked =
                    state.confettiEnabled;


                const autoNextSetting =
                    document.getElementById(
                        "setAutoNextCorrect"
                    );


                if (
                    autoNextSetting
                ) {

                    autoNextSetting.checked =
                        localStorage.getItem(
                            AUTO_NEXT_CORRECT_KEY
                        ) ===
                        "true";
                }


                settingsModal.classList.remove(
                    "hidden"
                );
            };


        // --------------------------------------------------------------
        // CLOSE SETTINGS
        // --------------------------------------------------------------

        document.getElementById(
            "closeSettingsBtn"
        ).onclick =
            () => {

                settingsModal.classList.add(
                    "hidden"
                );
            };


        // --------------------------------------------------------------
        // SAVE SETTINGS
        // --------------------------------------------------------------

        document.getElementById(
            "saveSettingsBtn"
        ).onclick =
            () => {

                playSound("click");


                state.soundEnabled =
                    document.getElementById(
                        "setSound"
                    ).checked;


                state.animationEnabled =
                    document.getElementById(
                        "setAnimation"
                    ).checked;


                state.confettiEnabled =
                    document.getElementById(
                        "setConfetti"
                    ).checked;


                const autoNextSetting =
                    document.getElementById(
                        "setAutoNextCorrect"
                    );


                state.autoNextCorrect =
                    autoNextSetting
                        ? autoNextSetting.checked
                        : false;


                localStorage.setItem(
                    AUTO_NEXT_CORRECT_KEY,
                    state.autoNextCorrect
                        ? "true"
                        : "false"
                );


                saveLocalStorage();


                settingsModal.classList.add(
                    "hidden"
                );


                showToast(
                    state.autoNextCorrect
                        ? "Mode lanjut otomatis AKTIF."
                        : "Mode lanjut otomatis NONAKTIF.",
                    "success",
                    1800
                );
            };


        // --------------------------------------------------------------
        // RESET
        // --------------------------------------------------------------

        document.getElementById(
            "resetGameBtn"
        ).onclick =
            () => {

                showConfirmModal(

                    "Apakah Anda yakin ingin meriset seluruh permainan? Semua progres saat ini akan dihapus.",

                    () => {

                        stopTimers();

                        localStorage.removeItem(
                            STORAGE_KEY
                        );

                        location.reload();
                    },

                    {
                        icon: "⚠️",
                        confirmText: "Ya, Reset"
                    }
                );
            };


        // --------------------------------------------------------------
        // GANTI SETUP
        // --------------------------------------------------------------

        document.getElementById(
            "changeSetupBtn"
        ).onclick =
            () => {

                showConfirmModal(

                    "Ganti bab, tim, atau waktu? Progress kuis saat ini akan direset.",

                    () => {

                        stopTimers();

                        localStorage.removeItem(
                            STORAGE_KEY
                        );

                        location.reload();
                    },

                    {
                        icon: "🔄",
                        confirmText: "Ya, Ganti"
                    }
                );
            };


        // --------------------------------------------------------------
        // MAIN LAGI
        // --------------------------------------------------------------

        document.getElementById(
            "playAgainBtn"
        ).onclick =
            () => {

                stopTimers();

                localStorage.removeItem(
                    STORAGE_KEY
                );

                location.reload();
            };
    }


    // ======================================================================
    // FINISH GAME
    // ======================================================================

    function finishGame(
        reason = "completed"
    ) {

        if (state.gameFinished) {
            return;
        }


        state.gameFinished =
            true;


        stopTimers();


        const resultModal =
            document.getElementById(
                "resultModal"
            );


        document.getElementById(
            "resultModalTitle"
        ).textContent =
            reason === "timeup"

                ? "⏰ WAKTU HABIS!"

                : "🏆 KUIS SELESAI!";


        const sorted =
            [...state.teams].sort(
                (a, b) =>
                    b.score -
                    a.score
            );


        const winner =
            sorted[0];


        if (winner) {

            document.getElementById(
                "winnerTeamName"
            ).textContent =
                `${winner.name.toUpperCase()} JUARA!`;


            document.getElementById(
                "winnerScoreTag"
            ).textContent =
                `${winner.score} Poin`;
        }


        let totalCorrect = 0;

        let totalWrong = 0;


        Object.values(
            state.answeredQuestions
        ).forEach(a => {

            if (a.isCorrect) {

                totalCorrect++;

            }

            else {

                totalWrong++;
            }
        });


        const total =
            state.questionsData.length ||
            1;


        const accuracy =
            Math.round(
                (
                    totalCorrect /
                    total
                ) *
                100
            );


        document.getElementById(
            "finalCorrect"
        ).textContent =
            totalCorrect;


        document.getElementById(
            "finalWrong"
        ).textContent =
            totalWrong;


        document.getElementById(
            "finalAccuracy"
        ).textContent =
            `${accuracy}%`;


        const rankList =
            document.getElementById(
                "finalRankList"
            );


        rankList.innerHTML = "";


        sorted.forEach(
            (
                team,
                r
            ) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "final-rank-item";


                item.innerHTML = `

                    <span>
                        <strong>
                            #${r + 1}
                        </strong>

                        ${team.name}
                    </span>

                    <span
                        style="
                            color:var(--primary-cyan);
                            font-weight:bold;
                        "
                    >
                        ${team.score} Pts
                    </span>

                `;


                rankList.appendChild(
                    item
                );
            }
        );


        resultModal.classList.remove(
            "hidden"
        );


        if (
            state.confettiEnabled
        ) {

            triggerConfetti();
        }


        saveLocalStorage();
    }


    // ======================================================================
    // CONFETTI
    // ======================================================================

    function triggerConfetti() {

        const canvas =
            document.getElementById(
                "confettiCanvas"
            );


        if (!canvas) return;


        const ctx =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            window.innerWidth;


        canvas.height =
            window.innerHeight;


        const pieces = [];


        const colors = [
            "#00f0ff",
            "#ff007f",
            "#00e676",
            "#ffd700",
            "#9d4edd"
        ];


        for (
            let i = 0;
            i < 100;
            i++
        ) {

            pieces.push({

                x:
                    Math.random() *
                    canvas.width,

                y:
                    Math.random() *
                    canvas.height -
                    canvas.height,

                size:
                    Math.random() *
                    8 +
                    4,

                color:
                    colors[
                        Math.floor(
                            Math.random() *
                            colors.length
                        )
                    ],

                speedY:
                    Math.random() *
                    5 +
                    2,

                speedX:
                    Math.random() *
                    4 -
                    2
            });
        }


        let animationFrame;


        function update() {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            pieces.forEach(
                p => {

                    p.y +=
                        p.speedY;


                    p.x +=
                        p.speedX;


                    ctx.fillStyle =
                        p.color;


                    ctx.fillRect(
                        p.x,
                        p.y,
                        p.size,
                        p.size
                    );
                }
            );


            if (
                pieces.some(
                    p =>
                        p.y <
                        canvas.height
                )
            ) {

                animationFrame =
                    requestAnimationFrame(
                        update
                    );

            }

            else {

                cancelAnimationFrame(
                    animationFrame
                );
            }
        }


        update();
    }


    // ======================================================================
    // BOOT
    // ======================================================================

    function boot() {

        loadLocalStorage();


        if (
            state.setupComplete &&
            state.chapterId &&
            state.questionsData.length > 0 &&
            state.teams.length > 0
        ) {

            // ----------------------------------------------------------
            // LANJUTKAN SESI
            // ----------------------------------------------------------

            document
                .getElementById(
                    "setupScreen"
                )
                .classList.add(
                    "hidden"
                );


            document.body.classList.remove(
                "setup-active"
            );


            document
                .getElementById(
                    "appContainer"
                )
                .classList.remove(
                    "hidden"
                );


            document.getElementById(
                "babIcon"
            ).textContent =
                state.chapterMeta?.icon ||
                "📖";


            document.getElementById(
                "babTitle"
            ).textContent =
                state.chapterMeta?.title ||
                "Bab";


            document.getElementById(
                "babSubtitle"
            ).textContent =
                state.chapterMeta?.subtitle ||
                "Kuis Interaktif SMP";


            document.getElementById(
                "modeLabel"
            ).textContent =
                "Mode: Tim";


            document.getElementById(
                "modeSub"
            ).textContent =
                `${state.teams.length} Tim`;


            // Pastikan player timer valid
            if (
                !state.playerTimeMaxSeconds
            ) {

                state.playerTimeMaxSeconds =
                    30;
            }


            if (
                !state.playerTimeSeconds ||
                state.playerTimeSeconds < 0
            ) {

                state.playerTimeSeconds =
                    state.playerTimeMaxSeconds;
            }


            buildWheel();

            renderCategories();

            renderTeamScores();

            updateLeaderboard();

            renderQuestion(
                state.currentQuestionIndex
            );

            updateProgress();

            updateTimerDisplay();

            setupEventListeners();


            // Jika sesi sebelumnya belum selesai
            if (!state.gameFinished) {

                startTimers();
            }

        }

        else {

            document.body.classList.add(
                "setup-active"
            );


            initSetupScreen();
        }
    }


    // ======================================================================
    // JALANKAN
    // ======================================================================

    boot();

});