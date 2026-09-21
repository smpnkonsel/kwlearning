document.addEventListener("DOMContentLoaded", async () => {
    const sidebar = document.getElementById("sidebar-container");

    if (!sidebar) {
        console.warn("Container #sidebar-container tidak ditemukan.");
        return;
    }

    try {
        // ==========================================
        // CARI LOKASI include.js
        // ==========================================

        const script = document.currentScript;

        // Jika document.currentScript kosong, cari script include.js
        const includeScript =
            script ||
            [...document.scripts].find(s =>
                s.src.includes("include.js")
            );

        if (!includeScript) {
            throw new Error("include.js tidak ditemukan.");
        }

        // ==========================================
        // LOKASI SIDEBAR BERDASARKAN include.js
        // aset/js/include.js
        //        ↓
        // ../../components/sidebar.html
        // ==========================================

        const sidebarUrl = new URL(
            "../../components/sidebar.html",
            includeScript.src
        ).href;

        console.log("Mencoba memuat sidebar:");
        console.log(sidebarUrl);

        // ==========================================
        // LOAD SIDEBAR
        // ==========================================

        const res = await fetch(sidebarUrl, {
            cache: "no-cache"
        });

        if (!res.ok) {
            throw new Error(
                `HTTP ${res.status}: ${res.statusText}`
            );
        }

        const html = await res.text();

        sidebar.innerHTML = html;

        // ==========================================
        // MENU AKTIF
        // ==========================================

        const currentPage =
            location.pathname.split("/").pop() || "index.html";

        const links = sidebar.querySelectorAll("a[href]");

        links.forEach(link => {
            const href = link.getAttribute("href");

            if (!href) return;

            const linkUrl = href
                .split("?")[0]
                .split("#")[0];

            const linkPage =
                linkUrl.split("/").pop() || "index.html";

            if (linkPage === currentPage) {
                link.classList.add("active");
            }
        });

        console.log("✅ Sidebar berhasil dimuat.");

    } catch (err) {
        console.error("❌ Error Sidebar:", err);

        sidebar.innerHTML = `
            <div class="sidebar-error">
                <p>Sidebar gagal dimuat.</p>
                <small>${err.message}</small>
            </div>
        `;
    }
});