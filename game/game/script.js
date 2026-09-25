/* ==========================================================================
   KW LEARNING — ARENA MATEMATIKA
   JavaScript Application Logic

   SISTEM WAKTU:
   1. Durasi Total Permainan
   2. Waktu Menjawab Tiap Tim

   TIMER BENAR-BENAR TERPISAH:
   - timerSeconds       = waktu total permainan
   - playerTimeSeconds  = waktu menjawab tim aktif
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
        {
        id: "perkalian",
        file: "soal/bab-1-perkalian.html",
        label: "Penjumlahan Angka-Angka",
        icon: "+"
    }
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

const MIN_TEAMS = 1;

const STORAGE_KEY = "KW_ARENA_STATE";
const AUTO_NEXT_CORRECT_KEY = "KW_ARENA_AUTO_NEXT_CORRECT";

// Versi sistem timer.
// Digunakan agar data LocalStorage dari sistem timer lama
// dapat dimigrasikan ke sistem dua timer.
const TIMER_MODE_VERSION = 2;


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
        // TIMER MENJAWAB TIAP TIM
        // --------------------------------------------------------------

        playerTimeSeconds: 30,
        playerTimeMaxSeconds: 30,

        // Versi sistem timer
        timerModeVersion: TIMER_MODE_VERSION,

        // --------------------------------------------------------------
        // TIMER INTERVAL
        // --------------------------------------------------------------

        timerInterval: null,

        // --------------------------------------------------------------
        // STATUS TIMER
        // --------------------------------------------------------------

        isTimerRunning: false,

        // --------------------------------------------------------------

        soundEnabled: true,
        animationEnabled: true,
        confettiEnabled: true,

        autoNextCorrect: false,

        isSpinning: false,
        selectedOptionIndex: null,

        gameFinished: false,

        gameStarted: false
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

        if (!state.soundEnabled) {
            return;
        }

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
            document.getElementById(
                "toastIcon"
            );

        const msg =
            document.getElementById(
                "toastMessage"
            );


        const icons = {

            error: "⚠️",
            warning: "❗",
            info: "ℹ️",
            success: "✅"

        };


        icon.textContent =
            icons[type] || icons.error;

        msg.textContent =
            message;


        card.className =
            `toast-card toast-${type}`;

        overlay.classList.remove(
            "hidden"
        );


        if (toastTimeout) {

            clearTimeout(
                toastTimeout
            );
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

                clearTimeout(
                    toastTimeout
                );
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


        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        // --------------------------------------------------------------
        // SEMUA BAB
        // --------------------------------------------------------------

        const allCard =
            document.createElement(
                "button"
            );


        allCard.type =
            "button";


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
                .querySelectorAll(
                    ".chapter-card"
                )
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

                error.textContent =
                    "";
            }
        };


        grid.appendChild(
            allCard
        );


        // --------------------------------------------------------------
        // BAB BIASA
        // --------------------------------------------------------------

        CHAPTERS.forEach(
            (
                ch,
                idx
            ) => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


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

                        error.textContent =
                            "";
                    }
                };


                grid.appendChild(
                    card
                );


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


        if (!list) {
            return;
        }


        const existingValues =
            Array.from(
                list.querySelectorAll(
                    ".team-name-input"
                )
            ).map(
                input =>
                    input.value
            );


        list.innerHTML =
            "";


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
                existingValues[i] ||
                "";


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
                    placeholder="Nama Tim/Pemain ${i + 1}"
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
                setupTeamCount <=
                MIN_TEAMS;


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


            list.appendChild(
                row
            );
        }
    }


    // ======================================================================
    // MULAI PERMAINAN
    // ======================================================================

    function handleStartGame() {

        const timeInput =
            document.getElementById(
                "setupTimeInput"
            );


        const playerTimeInput =
            document.getElementById(
                "setupPlayerTimeInput"
            );


        const minutes =
            parseInt(
                timeInput?.value,
                10
            );


        const playerSeconds =
            parseInt(
                playerTimeInput?.value,
                10
            );


        // --------------------------------------------------------------
        // VALIDASI WAKTU TOTAL
        // --------------------------------------------------------------

        if (
            !Number.isFinite(minutes) ||
            minutes <= 0
        ) {

            showToast(
                "Masukkan durasi permainan yang valid.",
                "warning"
            );

            return;
        }


        // --------------------------------------------------------------
        // VALIDASI WAKTU TIM
        // --------------------------------------------------------------

        if (
            !Number.isFinite(playerSeconds) ||
            playerSeconds <= 0
        ) {

            showToast(
                "Masukkan waktu menjawab tim yang valid.",
                "warning"
            );

            return;
        }


        // --------------------------------------------------------------
        // NAMA TIM
        // --------------------------------------------------------------

        const teamInputs =
            document.querySelectorAll(
                ".team-name-input"
            );


        const teams = [];


        teamInputs.forEach(
            (
                input,
                index
            ) => {

                const name =
                    input.value.trim() ||
                    `Tim ${index + 1}`;


                teams.push({

                    id:
                        `team-${Date.now()}-${index}`,

                    name:
                        name,

                    score:
                        0,

                    correct:
                        0,

                    wrong:
                        0,

                    color:
                        TEAM_COLORS[
                            index %
                            TEAM_COLORS.length
                        ]
                });
            }
        );


        if (!teams.length) {

            showToast(
                "Minimal harus ada 1 tim.",
                "warning"
            );

            return;
        }


        // --------------------------------------------------------------
        // STOP TIMER LAMA
        // --------------------------------------------------------------

        stopTimers();


        // --------------------------------------------------------------
        // DATA TIM
        // --------------------------------------------------------------

        state.teams =
            teams;


        state.activeTeamIndex =
            0;


        // ==============================================================
        // TIMER 1 — TOTAL PERMAINAN
        // ==============================================================

        state.timerMaxSeconds =
            minutes * 60;


        state.timerSeconds =
            minutes * 60;


        // ==============================================================
        // TIMER 2 — WAKTU MENJAWAB TIM
        // ==============================================================

        state.playerTimeMaxSeconds =
            playerSeconds;


        state.playerTimeSeconds =
            playerSeconds;


        // ==============================================================
        // RESET GAME
        // ==============================================================

        state.currentQuestionIndex =
            -1;


        state.answeredQuestions =
            {};


        state.questionsData =
            [];


        state.gameFinished =
            false;


        state.isSpinning =
            false;


        state.selectedOptionIndex =
            null;


        state.timerInterval =
            null;


        state.isTimerRunning =
            false;


        state.gameStarted =
            true;


        state.timerModeVersion =
            TIMER_MODE_VERSION;


        saveLocalStorage();


        // --------------------------------------------------------------
        // LOAD SOAL
        // --------------------------------------------------------------

        if (
            setupSelectedChapterId ===
            "all"
        ) {

            loadAllChaptersAndStart();

        }

        else {

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

            startBtn.disabled =
                true;

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


        Promise.all(
            requests
        )

            .then(
                results => {

                    const allQuestions =
                        [];


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

                                            : String(
                                                cat
                                            );


                                    const name =
                                        typeof cat ===
                                        "object"

                                            ? (
                                                cat.name ??
                                                cat.key
                                            )

                                            : String(
                                                cat
                                            );


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
                                        (
                                            index + 1
                                        );


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


                    if (
                        !allQuestions.length
                    ) {

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
                }
            )


            .catch(
                error => {

                    console.error(
                        "DETAIL ERROR SEMUA BAB:",
                        error
                    );


                    showToast(
                        "Gagal memuat soal dari semua bab. Pastikan folder /soal berisi file soal dan jalankan melalui Live Server.",
                        "error",
                        9000
                    );
                }
            )


            .finally(
                () => {

                    if (startBtn) {

                        startBtn.disabled =
                            false;

                        startBtn.textContent =
                            "🚀 MULAI PERMAINAN";
                    }
                }
            );
    }


    // ======================================================================
    // LOAD SATU BAB
    // ======================================================================

    function loadChapterAndStart(
        chapterId
    ) {

        const chapterCfg =
            CHAPTERS.find(
                c =>
                    c.id ===
                    chapterId
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


        fetch(
            chapterCfg.file
        )

            .then(
                res => {

                    if (!res.ok) {

                        throw new Error(
                            "HTTP " +
                            res.status
                        );
                    }


                    return res.text();
                }
            )


            .then(
                html => {

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
                        data.meta ||
                        {

                            title:
                                chapterCfg.label,

                            subtitle:
                                "",

                            icon:
                                chapterCfg.icon
                        };


                    state.categories =
                        data.categories ||
                        [];


                    state.questionsData =
                        data.questions ||
                        [];


                    state.setupComplete =
                        true;


                    state.currentQuestionIndex =
                        0;


                    startArena();
                }
            )


            .catch(
                err => {

                    console.error(
                        err
                    );


                    showToast(
                        "Gagal memuat file soal (" +
                        chapterCfg.file +
                        "). Jalankan project melalui Live Server.",
                        "error",
                        9000
                    );
                }
            )


            .finally(
                () => {

                    if (startBtn) {

                        startBtn.disabled =
                            false;

                        startBtn.textContent =
                            "🚀 MULAI PERMAINAN";
                    }
                }
            );
    }


    // ======================================================================
    // MULAI ARENA
    // ======================================================================

    function startArena() {

        state.gameFinished =
            false;


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


        buildWheel();

        renderCategories();

        renderTeamScores();

        updateLeaderboard();

        renderQuestion(
            state.currentQuestionIndex
        );

        updateProgress();


        // ==============================================================
        // VALIDASI TIMER TOTAL
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.timerSeconds
                )
            ) ||
            Number(
                state.timerSeconds
            ) < 0
        ) {

            state.timerSeconds =
                Number(
                    state.timerMaxSeconds
                ) ||
                300;
        }


        // ==============================================================
        // VALIDASI TIMER TIM
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.playerTimeMaxSeconds
                )
            ) ||
            Number(
                state.playerTimeMaxSeconds
            ) <= 0
        ) {

            state.playerTimeMaxSeconds =
                30;
        }


        if (
            !Number.isFinite(
                Number(
                    state.playerTimeSeconds
                )
            ) ||
            Number(
                state.playerTimeSeconds
            ) < 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        // ==============================================================
        // JANGAN PERNAH ADA LAGI:
        //
        // state.playerTimeSeconds = state.timerSeconds;
        //
        // KEDUA TIMER SUDAH SEPENUHNYA TERPISAH.
        // ==============================================================


        state.timerModeVersion =
            TIMER_MODE_VERSION;


        updateTimerDisplay();

        setupEventListeners();

        saveLocalStorage();


        // ==============================================================
        // MULAI DUA TIMER
        // ==============================================================

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


        if (!saved) {
            return;
        }


        try {

            const parsed =
                JSON.parse(
                    saved
                );


            const savedTimerVersion =
                Number(
                    parsed.timerModeVersion
                ) || 1;


            state = {
                ...state,
                ...parsed
            };


            // ==========================================================
            // MIGRASI DARI SISTEM TIMER LAMA
            // ==========================================================

            if (
                savedTimerVersion <
                TIMER_MODE_VERSION
            ) {

                /*
                 * Sistem lama menggunakan:
                 *
                 * playerTimeSeconds = timerSeconds
                 * playerTimeMaxSeconds = timerMaxSeconds
                 *
                 * Nilai waktu menjawab asli sudah tidak dapat
                 * diketahui lagi dari LocalStorage lama.
                 *
                 * Karena itu gunakan default 30 detik.
                 */

                state.playerTimeMaxSeconds =
                    30;


                state.playerTimeSeconds =
                    30;


                state.timerModeVersion =
                    TIMER_MODE_VERSION;
            }


            // ==========================================================
            // VALIDASI TIMER TOTAL
            // ==========================================================

            if (
                !Number.isFinite(
                    Number(
                        state.timerMaxSeconds
                    )
                ) ||
                Number(
                    state.timerMaxSeconds
                ) <= 0
            ) {

                state.timerMaxSeconds =
                    300;
            }


            if (
                !Number.isFinite(
                    Number(
                        state.timerSeconds
                    )
                ) ||
                Number(
                    state.timerSeconds
                ) < 0
            ) {

                state.timerSeconds =
                    state.timerMaxSeconds;
            }


            // ==========================================================
            // VALIDASI TIMER TIM
            // ==============================================================

            if (
                !Number.isFinite(
                    Number(
                        state.playerTimeMaxSeconds
                    )
                ) ||
                Number(
                    state.playerTimeMaxSeconds
                ) <= 0
            ) {

                state.playerTimeMaxSeconds =
                    30;
            }


            if (
                !Number.isFinite(
                    Number(
                        state.playerTimeSeconds
                    )
                ) ||
                Number(
                    state.playerTimeSeconds
                ) < 0
            ) {

                state.playerTimeSeconds =
                    state.playerTimeMaxSeconds;
            }


            // ==========================================================
            // AUTO NEXT
            // ==========================================================

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


    // ======================================================================
    // SAVE LOCAL STORAGE
    // ======================================================================

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

                // ======================================================
                // TIMER TOTAL PERMAINAN
                // ======================================================

                timerSeconds:
                    state.timerSeconds,

                timerMaxSeconds:
                    state.timerMaxSeconds,

                // ======================================================
                // TIMER MENJAWAB TIM
                // ======================================================

                playerTimeSeconds:
                    state.playerTimeSeconds,

                playerTimeMaxSeconds:
                    state.playerTimeMaxSeconds,

                // ======================================================
                // VERSI TIMER
                // ======================================================

                timerModeVersion:
                    TIMER_MODE_VERSION,

                // ======================================================

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


        if (!wheelSvg) {
            return;
        }


        wheelSvg.innerHTML =
            "";


        const numSectors =
            Math.max(
                state.questionsData.length,
                1
            );


        const anglePerSector =
            360 /
            numSectors;


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
                i *
                anglePerSector;


            const endAngle =
                (i + 1) *
                anglePerSector;


            const color =
                colors[
                    i %
                    colors.length
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
                anglePerSector /
                2;


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


        state.isSpinning =
            true;


        playSound(
            "click"
        );


        const spinBtn =
            document.getElementById(
                "spinBtn"
            );


        if (spinBtn) {

            spinBtn.disabled =
                true;
        }


        const wheelContainer =
            document.getElementById(
                "wheelContainer"
            );


        if (!wheelContainer) {

            state.isSpinning =
                false;

            return;
        }


        const total =
            state.questionsData.length;


        const unaskedIndices =
            state.questionsData

                .map(
                    (
                        q,
                        idx
                    ) => ({
                        q,
                        idx
                    })
                )

                .filter(
                    item =>
                        !state
                            .answeredQuestions[
                                item.q.id
                            ]
                )

                .map(
                    item =>
                        item.idx
                );


        let targetIndex =
            Math.floor(
                Math.random() *
                total
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
            360 /
            total;


        const targetSectorAngle =
            (
                targetIndex *
                anglePerSector
            ) +
            (
                anglePerSector /
                2
            );


        const randomSpins =
            5 *
            360;


        const totalRotation =
            randomSpins +
            (
                360 -
                targetSectorAngle
            );


        wheelContainer.style.transform =
            `rotate(${totalRotation}deg)`;


        let spinTicks =
            0;


        const tickInterval =
            setInterval(
                () => {

                    playSound(
                        "spin"
                    );


                    spinTicks++;


                    if (
                        spinTicks >
                        20
                    ) {

                        clearInterval(
                            tickInterval
                        );
                    }

                },
                150
            );


        setTimeout(
            () => {

                state.isSpinning =
                    false;


                if (spinBtn) {

                    spinBtn.disabled =
                        false;
                }


                wheelContainer.style.transition =
                    "none";


                wheelContainer.style.transform =
                    `rotate(
                        ${360 - targetSectorAngle}deg
                    )`;


                setTimeout(
                    () => {

                        wheelContainer.style.transition =
                            "transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)";

                    },
                    50
                );


                state.currentQuestionIndex =
                    targetIndex;


                renderQuestion(
                    targetIndex
                );


                saveLocalStorage();

            },
            4000
        );
    }


    // ======================================================================
    // RENDER QUESTION
    // ======================================================================

    function renderQuestion(
        index
    ) {

        state.selectedOptionIndex =
            null;


        const q =
            state.questionsData[
                index
            ];


        if (!q) {
            return;
        }


        const currentNumberDisplay =
            document.getElementById(
                "currentNumberDisplay"
            );


        if (currentNumberDisplay) {

            currentNumberDisplay.textContent =
                q.originalId ??
                q.id;
        }


        const qNumHeader =
            document.getElementById(
                "qNumHeader"
            );


        if (qNumHeader) {

            qNumHeader.textContent =
                q.originalId ??
                q.id;
        }


        const qDifficultyBadge =
            document.getElementById(
                "qDifficultyBadge"
            );


        if (qDifficultyBadge) {

            qDifficultyBadge.textContent =
                q.difficulty;
        }


        const qPointsBadge =
            document.getElementById(
                "qPointsBadge"
            );


        if (qPointsBadge) {

            qPointsBadge.textContent =
                `+${q.points} Pts`;
        }


        const questionText =
            document.getElementById(
                "questionText"
            );


        if (questionText) {

            questionText.textContent =
                q.question;
        }


        const categoryBadge =
            document.getElementById(
                "qCategoryBadge"
            );


        if (categoryBadge) {

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
        }


        const stageStatus =
            document.getElementById(
                "stageStatusText"
            );


        if (stageStatus) {

            stageStatus.textContent =
                state.answeredQuestions[
                    q.id
                ]

                    ? "Soal ini telah dijawab!"

                    : "Soal siap dijawab!";
        }


        const optionsGrid =
            document.getElementById(
                "optionsGrid"
            );


        if (!optionsGrid) {
            return;
        }


        optionsGrid.innerHTML =
            "";


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
                        optIdx ===
                        q.answer
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


        if (
            !submitBtn ||
            !expBox
        ) {

            return;
        }


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


            if (fbHeader) {

                fbHeader.className =
                    `feedback-header ${
                        isCorr
                            ? "feedback-correct"
                            : "feedback-wrong"
                    }`;
            }


            const feedbackIcon =
                document.getElementById(
                    "feedbackIcon"
                );


            if (feedbackIcon) {

                feedbackIcon.textContent =
                    isCorr
                        ? "✓"
                        : "✕";
            }


            const feedbackTitle =
                document.getElementById(
                    "feedbackTitle"
                );


            if (feedbackTitle) {

                feedbackTitle.textContent =
                    isCorr
                        ? "JAWABAN BENAR!"
                        : "JAWABAN KURANG TEPAT";
            }


            const feedbackPts =
                document.getElementById(
                    "feedbackPts"
                );


            if (feedbackPts) {

                feedbackPts.textContent =
                    isCorr
                        ? `+${answeredData.points} POIN`
                        : "+0 POIN";
            }


            const explanationText =
                document.getElementById(
                    "explanationText"
                );


            if (explanationText) {

                explanationText.textContent =
                    q.explanation ||
                    "";
            }

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

    function selectOption(
        optIdx
    ) {

        if (state.gameFinished) {
            return;
        }


        playSound(
            "click"
        );


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

                if (
                    idx ===
                    optIdx
                ) {

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


        if (!q) {
            return;
        }


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


            playSound(
                "correct"
            );


            if (currentTeam) {

                currentTeam.score +=
                    pointsAwarded;

                currentTeam.correct =
                    (
                        Number(
                            currentTeam.correct
                        ) || 0
                    ) + 1;
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

                setTimeout(
                    () => {

                        if (
                            state.gameFinished
                        ) {

                            return;
                        }


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

                    },
                    700
                );

            }

            else {

                // Timer tim berikutnya sudah di-reset
                // oleh nextTeam().
                startPlayerTimer();

                saveLocalStorage();
            }
        }


        // ==================================================================
        // SALAH
        // ==================================================================

        else {

            playSound(
                "wrong"
            );


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


                // Tim baru mendapatkan timer baru.
                startPlayerTimer();


                saveLocalStorage();


                showToast(
                    "Jawaban salah. Roda akan diputar lagi!",
                    "error",
                    1200
                );


                setTimeout(
                    () => {

                        if (
                            !state.isSpinning &&
                            !state.gameFinished
                        ) {

                            spinWheel();
                        }

                    },
                    1300
                );
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


                if (currentTeam) {

                    currentTeam.wrong =
                        (
                            Number(
                                currentTeam.wrong
                            ) || 0
                        ) + 1;
                }


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


                // Timer tim berikutnya sudah di-reset
                // oleh nextTeam().
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


        // ==============================================================
        // PINDAH INDEX TIM
        // ==============================================================

        state.activeTeamIndex =
            (
                state.activeTeamIndex +
                1
            ) %
            state.teams.length;


        // ==============================================================
        // RESET TIMER MENJAWAB SAJA
        //
        // TIMER PERMAINAN TIDAK DISENTUH.
        // ==============================================================

        state.playerTimeSeconds =
            Number(
                state.playerTimeMaxSeconds
            ) || 30;


        renderTeamScores();

        updateTimerDisplay();

        saveLocalStorage();
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


        if (
            activeTeam &&
            nameEl
        ) {

            nameEl.textContent =
                activeTeam.name;

            nameEl.title =
                activeTeam.name;
        }


        // ==============================================================
        // TIMER TIM AKTIF
        // ==============================================================

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


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


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
                                ${
                                    t.color ||
                                    TEAM_COLORS[
                                        idx %
                                        TEAM_COLORS.length
                                    ]
                                };
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
                (
                    a,
                    b
                ) =>
                    b.score -
                    a.score
            );


        const tbody =
            document.getElementById(
                "leaderboardTbody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML =
            "";


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


        let correctCount =
            0;


        let wrongCount =
            0;


        Object.values(
            state.answeredQuestions
        ).forEach(
            ans => {

                if (ans.isCorrect) {

                    correctCount++;

                }

                else {

                    wrongCount++;
                }
            }
        );


        const progressTextSide =
            document.getElementById(
                "progressTextSide"
            );


        if (progressTextSide) {

            progressTextSide.textContent =
                `${answeredCount} / ${total} Soal`;
        }


        const progressBarSide =
            document.getElementById(
                "progressBarSide"
            );


        if (progressBarSide) {

            progressBarSide.style.width =
                `${pct}%`;
        }


        const fTotal =
            document.getElementById(
                "fTotal"
            );


        if (fTotal) {

            fTotal.textContent =
                total;
        }


        const fAnswered =
            document.getElementById(
                "fAnswered"
            );


        if (fAnswered) {

            fAnswered.textContent =
                answeredCount;
        }


        const fCorrect =
            document.getElementById(
                "fCorrect"
            );


        if (fCorrect) {

            fCorrect.textContent =
                correctCount;
        }


        const fWrong =
            document.getElementById(
                "fWrong"
            );


        if (fWrong) {

            fWrong.textContent =
                wrongCount;
        }


        const fProgressPct =
            document.getElementById(
                "fProgressPct"
            );


        if (fProgressPct) {

            fProgressPct.textContent =
                `${pct}%`;
        }


        const progressBarFooter =
            document.getElementById(
                "progressBarFooter"
            );


        if (progressBarFooter) {

            progressBarFooter.style.width =
                `${pct}%`;
        }
    }


    // ======================================================================
    // CATEGORY
    // ======================================================================

    function renderCategories() {

        const grid =
            document.getElementById(
                "categoryGrid"
            );


        if (!grid) {
            return;
        }


        grid.innerHTML =
            "";


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

                        : String(
                            cat
                        );


                const name =
                    typeof cat ===
                    "object"

                        ? (
                            cat.name ??
                            cat.key
                        )

                        : String(
                            cat
                        );


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
                        cat !==
                        "all"
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
                            firstMatch !==
                            -1
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

    function formatTime(
        seconds
    ) {

        seconds =
            Math.max(
                0,
                Number(seconds) || 0
            );


        const m =
            Math.floor(
                seconds /
                60
            )
                .toString()
                .padStart(
                    2,
                    "0"
                );


        const s =
            (
                seconds %
                60
            )
                .toString()
                .padStart(
                    2,
                    "0"
                );


        return `${m}:${s}`;
    }


    // ======================================================================
    // TIMER DISPLAY
    // ======================================================================

    function updateTimerDisplay() {

        // ==============================================================
        // TIMER 1
        // WAKTU TOTAL PERMAINAN
        // ==============================================================

        const gameTime =
            formatTime(
                state.timerSeconds
            );


        // ==============================================================
        // TIMER 2
        // WAKTU MENJAWAB TIM AKTIF
        // ==============================================================

        const teamTime =
            formatTime(
                state.playerTimeSeconds
            );


        // ==============================================================
        // DISPLAY TIMER TOTAL
        // ==============================================================

        const timerDisplay =
            document.getElementById(
                "timerDisplay"
            );


        const footerTimer =
            document.getElementById(
                "footerTimer"
            );


        if (timerDisplay) {

            timerDisplay.textContent =
                gameTime;
        }


        if (footerTimer) {

            footerTimer.textContent =
                gameTime;
        }


        // ==============================================================
        // DISPLAY TIMER TIM AKTIF
        // ==============================================================

        const activeTeamTime =
            document.getElementById(
                "activeTeamTime"
            );


        if (activeTeamTime) {

            activeTeamTime.textContent =
                teamTime;
        }


        // ==============================================================
        // LABEL TIMER PERMAINAN
        // ==============================================================

        const timerLabel =
            document.getElementById(
                "timerLabel"
            );


        if (timerLabel) {

            timerLabel.textContent =
                "WAKTU PERMAINAN";
        }


        // ==============================================================
        // WARNING TIMER PERMAINAN
        // ==============================================================

        if (timerDisplay) {

            timerDisplay.classList.remove(
                "warning",
                "danger"
            );


            if (
                state.timerSeconds <= 10 &&
                state.timerSeconds > 5
            ) {

                timerDisplay.classList.add(
                    "warning"
                );
            }


            if (
                state.timerSeconds <= 5
            ) {

                timerDisplay.classList.add(
                    "danger"
                );
            }
        }


        // ==============================================================
        // WARNING TIMER TIM
        // ==============================================================

        if (activeTeamTime) {

            activeTeamTime.classList.remove(
                "warning",
                "danger"
            );


            if (
                state.playerTimeSeconds <= 10 &&
                state.playerTimeSeconds > 5
            ) {

                activeTeamTime.classList.add(
                    "warning"
                );
            }


            if (
                state.playerTimeSeconds <= 5
            ) {

                activeTeamTime.classList.add(
                    "danger"
                );
            }
        }
    }


    // ======================================================================
    // DUA TIMER — BENAR-BENAR TERPISAH
    // ======================================================================

    function startTimers() {

        // ==============================================================
        // HENTIKAN INTERVAL LAMA
        // ==============================================================

        stopTimers();


        if (state.gameFinished) {
            return;
        }


        // ==============================================================
        // VALIDASI TIMER TOTAL
        // ==============================================================

        state.timerSeconds =
            Math.max(
                0,
                Number(
                    state.timerSeconds
                ) || 0
            );


        // ==============================================================
        // VALIDASI TIMER TIM
        // ==============================================================

        state.playerTimeMaxSeconds =
            Math.max(
                1,
                Number(
                    state.playerTimeMaxSeconds
                ) || 30
            );


        state.playerTimeSeconds =
            Math.max(
                0,
                Number(
                    state.playerTimeSeconds
                ) || 0
            );


        // ==============================================================
        // TIMER PERMAINAN SUDAH HABIS
        // ==============================================================

        if (
            state.timerSeconds <= 0
        ) {

            state.timerSeconds =
                0;


            state.playerTimeSeconds =
                0;


            updateTimerDisplay();


            finishGame(
                "timeup"
            );


            return;
        }


        // ==============================================================
        // TIMER TIM HABIS
        // ==============================================================

        if (
            state.playerTimeSeconds <= 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        state.isTimerRunning =
            true;


        updateTimerDisplay();


        // ==============================================================
        // INTERVAL DUA TIMER
        //
        // Keduanya berkurang bersama-sama,
        // tetapi masing-masing menggunakan variabel berbeda.
        // ==============================================================

        state.timerInterval =
            setInterval(
                () => {

                    if (
                        state.gameFinished
                    ) {

                        stopTimers();

                        return;
                    }


                    // ==================================================
                    // TIMER 1
                    // TOTAL WAKTU PERMAINAN
                    // ==================================================

                    if (
                        state.timerSeconds >
                        0
                    ) {

                        state.timerSeconds--;
                    }


                    // ==================================================
                    // TIMER 2
                    // WAKTU MENJAWAB TIM AKTIF
                    // ==================================================

                    if (
                        state.playerTimeSeconds >
                        0
                    ) {

                        state.playerTimeSeconds--;
                    }


                    // ==================================================
                    // UPDATE DISPLAY
                    // ==================================================

                    updateTimerDisplay();

                    renderTeamScores();

                    saveLocalStorage();


                    // ==================================================
                    // PRIORITAS 1
                    // WAKTU PERMAINAN HABIS
                    // ==================================================

                    if (
                        state.timerSeconds <=
                        0
                    ) {

                        state.timerSeconds =
                            0;


                        state.playerTimeSeconds =
                            0;


                        updateTimerDisplay();


                        stopTimers();


                        finishGame(
                            "timeup"
                        );


                        return;
                    }


                    // ==================================================
                    // PRIORITAS 2
                    // WAKTU MENJAWAB TIM HABIS
                    // ==================================================

                    if (
                        state.playerTimeSeconds <=
                        0
                    ) {

                        state.playerTimeSeconds =
                            0;


                        updateTimerDisplay();


                        // ------------------------------------------------
                        // PINDAH KE TIM BERIKUTNYA
                        // ------------------------------------------------

                        nextTeam();


                        // ------------------------------------------------
                        // PUTAR RODA OTOMATIS
                        // ------------------------------------------------

                        setTimeout(
                            () => {

                                if (
                                    state.gameFinished
                                ) {

                                    return;
                                }


                                if (
                                    state.isSpinning
                                ) {

                                    return;
                                }


                                const nextIndex =
                                    findNextUnansweredQuestion();


                                if (
                                    nextIndex ===
                                    -1
                                ) {

                                    finishGame();

                                    return;
                                }


                                state.currentQuestionIndex =
                                    nextIndex;


                                spinWheel();

                            },
                            300
                        );
                    }

                },
                1000
            );
    }


    // ======================================================================
    // START TIMER TIM
    // ======================================================================

    function startPlayerTimer() {

        if (state.gameFinished) {
            return;
        }


        // ==============================================================
        // PASTIKAN MAKSIMUM TIMER TIM VALID
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.playerTimeMaxSeconds
                )
            ) ||
            Number(
                state.playerTimeMaxSeconds
            ) <= 0
        ) {

            state.playerTimeMaxSeconds =
                30;
        }


        // ==============================================================
        // JIKA TIMER TIM TIDAK VALID
        // GUNAKAN WAKTU MAKSIMUM TIMER TIM
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.playerTimeSeconds
                )
            ) ||
            Number(
                state.playerTimeSeconds
            ) <= 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        // ==============================================================
        // JANGAN SENTUH TIMER PERMAINAN
        // ==============================================================

        updateTimerDisplay();


        // Timer utama belum berjalan.
        if (
            !state.timerInterval
        ) {

            startTimers();
        }


        saveLocalStorage();
    }


    // ======================================================================
    // STOP TIMER
    // ======================================================================

    function stopTimers() {

        if (
            state.timerInterval
        ) {

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


        // ==============================================================
        // TIMER TIM HABIS
        // ==============================================================

        state.playerTimeSeconds =
            0;


        updateTimerDisplay();


        // ==============================================================
        // PINDAH TIM
        // ==============================================================

        nextTeam();


        saveLocalStorage();
    }


    // ======================================================================
    // CONFIRM MODAL
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


        if (
            !overlay ||
            !card
        ) {

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

    let listenersBound =
        false;


    function setupEventListeners() {

        if (listenersBound) {
            return;
        }


        listenersBound =
            true;


        // --------------------------------------------------------------
        // SPIN
        // --------------------------------------------------------------

        const spinBtn =
            document.getElementById(
                "spinBtn"
            );


        if (spinBtn) {

            spinBtn.onclick =
                spinWheel;
        }


        // --------------------------------------------------------------
        // SUBMIT
        // --------------------------------------------------------------

        const submitBtn =
            document.getElementById(
                "submitAnswerBtn"
            );


        if (submitBtn) {

            submitBtn.onclick =
                submitAnswer;
        }


        // --------------------------------------------------------------
        // PREVIOUS
        // --------------------------------------------------------------

        const prevQuestionBtn =
            document.getElementById(
                "prevQuestionBtn"
            );


        if (prevQuestionBtn) {

            prevQuestionBtn.onclick =
                () => {

                    playSound(
                        "click"
                    );


                    const total =
                        state.questionsData.length;


                    if (!total) {
                        return;
                    }


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
        }


        // --------------------------------------------------------------
        // NEXT
        // --------------------------------------------------------------

        const nextQuestionBtn =
            document.getElementById(
                "nextQuestionBtn"
            );


        if (nextQuestionBtn) {

            nextQuestionBtn.onclick =
                () => {

                    playSound(
                        "click"
                    );


                    const total =
                        state.questionsData.length;


                    if (!total) {
                        return;
                    }


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
        }


        // --------------------------------------------------------------
        // SOUND
        // --------------------------------------------------------------

        const soundToggleBtn =
            document.getElementById(
                "soundToggleBtn"
            );


        if (soundToggleBtn) {

            soundToggleBtn.onclick =
                () => {

                    state.soundEnabled =
                        !state.soundEnabled;


                    const soundIcon =
                        document.getElementById(
                            "soundIcon"
                        );


                    if (soundIcon) {

                        soundIcon.textContent =
                            state.soundEnabled
                                ? "🔊"
                                : "🔇";
                    }


                    playSound(
                        "click"
                    );


                    saveLocalStorage();
                };
        }


        // --------------------------------------------------------------
        // SETTINGS
        // --------------------------------------------------------------

        const settingsModal =
            document.getElementById(
                "settingsModal"
            );


        const settingsBtn =
            document.getElementById(
                "settingsBtn"
            );


        if (
            settingsBtn &&
            settingsModal
        ) {

            settingsBtn.onclick =
                () => {

                    playSound(
                        "click"
                    );


                    const setSound =
                        document.getElementById(
                            "setSound"
                        );


                    const setAnimation =
                        document.getElementById(
                            "setAnimation"
                        );


                    const setConfetti =
                        document.getElementById(
                            "setConfetti"
                        );


                    if (setSound) {

                        setSound.checked =
                            state.soundEnabled;
                    }


                    if (setAnimation) {

                        setAnimation.checked =
                            state.animationEnabled;
                    }


                    if (setConfetti) {

                        setConfetti.checked =
                            state.confettiEnabled;
                    }


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
        }


        // --------------------------------------------------------------
        // CLOSE SETTINGS
        // --------------------------------------------------------------

        const closeSettingsBtn =
            document.getElementById(
                "closeSettingsBtn"
            );


        if (
            closeSettingsBtn &&
            settingsModal
        ) {

            closeSettingsBtn.onclick =
                () => {

                    settingsModal.classList.add(
                        "hidden"
                    );
                };
        }


        // --------------------------------------------------------------
        // SAVE SETTINGS
        // --------------------------------------------------------------

        const saveSettingsBtn =
            document.getElementById(
                "saveSettingsBtn"
            );


        if (saveSettingsBtn) {

            saveSettingsBtn.onclick =
                () => {

                    playSound(
                        "click"
                    );


                    const setSound =
                        document.getElementById(
                            "setSound"
                        );


                    const setAnimation =
                        document.getElementById(
                            "setAnimation"
                        );


                    const setConfetti =
                        document.getElementById(
                            "setConfetti"
                        );


                    state.soundEnabled =
                        setSound
                            ? setSound.checked
                            : true;


                    state.animationEnabled =
                        setAnimation
                            ? setAnimation.checked
                            : true;


                    state.confettiEnabled =
                        setConfetti
                            ? setConfetti.checked
                            : true;


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


                    if (settingsModal) {

                        settingsModal.classList.add(
                            "hidden"
                        );
                    }


                    showToast(
                        state.autoNextCorrect
                            ? "Mode lanjut otomatis AKTIF."
                            : "Mode lanjut otomatis NONAKTIF.",
                        "success",
                        1800
                    );
                };
        }


        // --------------------------------------------------------------
        // RESET
        // --------------------------------------------------------------

        const resetGameBtn =
            document.getElementById(
                "resetGameBtn"
            );


        if (resetGameBtn) {

            resetGameBtn.onclick =
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
                            icon:
                                "⚠️",

                            confirmText:
                                "Ya, Reset"
                        }
                    );
                };
        }


        // --------------------------------------------------------------
        // GANTI SETUP
        // --------------------------------------------------------------

        const changeSetupBtn =
            document.getElementById(
                "changeSetupBtn"
            );


        if (changeSetupBtn) {

            changeSetupBtn.onclick =
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
                            icon:
                                "🔄",

                            confirmText:
                                "Ya, Ganti"
                        }
                    );
                };
        }


        // --------------------------------------------------------------
        // MAIN LAGI
        // --------------------------------------------------------------

        const playAgainBtn =
            document.getElementById(
                "playAgainBtn"
            );


        if (playAgainBtn) {

            playAgainBtn.onclick =
                () => {

                    stopTimers();


                    localStorage.removeItem(
                        STORAGE_KEY
                    );


                    location.reload();
                };
        }
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


        const resultModalTitle =
            document.getElementById(
                "resultModalTitle"
            );


        if (resultModalTitle) {

            resultModalTitle.textContent =
                reason === "timeup"

                    ? "⏰ WAKTU HABIS!"

                    : "🏆 KUIS SELESAI!";
        }


        const sorted =
            [...state.teams].sort(
                (
                    a,
                    b
                ) =>
                    b.score -
                    a.score
            );


        const winner =
            sorted[0];


        if (winner) {

            const winnerTeamName =
                document.getElementById(
                    "winnerTeamName"
                );


            if (winnerTeamName) {

                winnerTeamName.textContent =
                    `${winner.name.toUpperCase()} JUARA!`;
            }


            const winnerScoreTag =
                document.getElementById(
                    "winnerScoreTag"
                );


            if (winnerScoreTag) {

                winnerScoreTag.textContent =
                    `${winner.score} Poin`;
            }
        }


        let totalCorrect =
            0;


        let totalWrong =
            0;


        Object.values(
            state.answeredQuestions
        ).forEach(
            a => {

                if (a.isCorrect) {

                    totalCorrect++;

                }

                else {

                    totalWrong++;
                }
            }
        );


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


        const finalCorrect =
            document.getElementById(
                "finalCorrect"
            );


        if (finalCorrect) {

            finalCorrect.textContent =
                totalCorrect;
        }


        const finalWrong =
            document.getElementById(
                "finalWrong"
            );


        if (finalWrong) {

            finalWrong.textContent =
                totalWrong;
        }


        const finalAccuracy =
            document.getElementById(
                "finalAccuracy"
            );


        if (finalAccuracy) {

            finalAccuracy.textContent =
                `${accuracy}%`;
        }


        const rankList =
            document.getElementById(
                "finalRankList"
            );


        if (rankList) {

            rankList.innerHTML =
                "";


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
        }


        if (resultModal) {

            resultModal.classList.remove(
                "hidden"
            );
        }


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


        if (!canvas) {
            return;
        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            window.innerWidth;


        canvas.height =
            window.innerHeight;


        const pieces =
            [];


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


        // ==============================================================
        // VALIDASI TIMER TOTAL
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.timerMaxSeconds
                )
            ) ||
            Number(
                state.timerMaxSeconds
            ) <= 0
        ) {

            state.timerMaxSeconds =
                300;
        }


        if (
            !Number.isFinite(
                Number(
                    state.timerSeconds
                )
            ) ||
            Number(
                state.timerSeconds
            ) < 0
        ) {

            state.timerSeconds =
                state.timerMaxSeconds;
        }


        // ==============================================================
        // VALIDASI TIMER TIM
        // ==============================================================

        if (
            !Number.isFinite(
                Number(
                    state.playerTimeMaxSeconds
                )
            ) ||
            Number(
                state.playerTimeMaxSeconds
            ) <= 0
        ) {

            state.playerTimeMaxSeconds =
                30;
        }


        if (
            !Number.isFinite(
                Number(
                    state.playerTimeSeconds
                )
            ) ||
            Number(
                state.playerTimeSeconds
            ) < 0
        ) {

            state.playerTimeSeconds =
                state.playerTimeMaxSeconds;
        }


        // ==============================================================
        // SESI LAMA / SESI TERSIMPAN
        // ==============================================================

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


            // ==========================================================
            // PENTING:
            //
            // Tidak ada:
            //
            // state.playerTimeSeconds =
            //     state.timerSeconds;
            //
            // Timer tim dipertahankan secara independen.
            // ==========================================================


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


            // ----------------------------------------------------------
            // LANJUTKAN DUA TIMER
            // ----------------------------------------------------------

            if (
                !state.gameFinished
            ) {

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