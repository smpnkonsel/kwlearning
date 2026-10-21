(() => {
  const me = document.currentScript;
  document.addEventListener("DOMContentLoaded", async () => {
    const box = document.getElementById("sidebar-container");
    if (!box || !me) return;
    const root = new URL("../../", me.src); // folder utama situs
    try {
      const res = await fetch(new URL("components/sidebar.html", root), { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      box.innerHTML = await res.text();

      const page = location.pathname.split("/").pop() || "index.html";
      box.querySelectorAll("a[href],img[src]").forEach(el => {
        const attr = el.hasAttribute("href") ? "href" : "src";
        const v = el.getAttribute(attr);
        if (!v || v.startsWith("#") || /^(https?:|mailto:)/.test(v)) return;
        const url = new URL(v.replace(/^\.\//, ""), root);
        el.setAttribute(attr, url.href);
        if (el.tagName === "A" && (url.pathname.split("/").pop() || "index.html") === page) el.classList.add("active");
      });

      const btn = box.querySelector(".menu-toggle");
      const set = open => {
        document.body.classList.toggle("menu-open", open);
        btn.setAttribute("aria-expanded", open);
        btn.textContent = open ? "✕" : "☰";
      };
      btn.addEventListener("click", () => set(!document.body.classList.contains("menu-open")));
      box.querySelector(".menu-backdrop").addEventListener("click", () => set(false));
      box.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => set(false)));
      document.addEventListener("keydown", e => e.key === "Escape" && set(false));
      matchMedia("(min-width:901px)").addEventListener("change", e => e.matches && set(false));
    } catch (err) {
      console.error("Sidebar gagal dimuat:", err);
      const d = document.createElement("div");
      d.className = "sidebar-error";
      d.textContent = "Menu gagal dimuat. Buka situs lewat server, bukan file langsung.";
      box.appendChild(d);
    }
  });
})();