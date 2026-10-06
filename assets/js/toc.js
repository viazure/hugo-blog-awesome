(() => {
    "use strict";

    const toc = document.getElementById("post-toc");
    const fab = document.getElementById("toc-fab");
    if (!toc || !fab) return;

    const closeBtn = toc.querySelector("[data-toc-close]");
    const links = [...toc.querySelectorAll("a[href^='#']")];

    const hrefId = (link) => {
        const raw = link.getAttribute("href") || "";
        if (!raw.startsWith("#") || raw.length < 2) return "";
        try {
            return decodeURIComponent(raw.slice(1));
        } catch {
            return raw.slice(1);
        }
    };

    const headings = links
        .map((link) => document.getElementById(hrefId(link)))
        .filter(Boolean);

    const open = () => {
        toc.classList.add("is-open");
        fab.setAttribute("aria-expanded", "true");
        document.body.classList.add("toc-open");
    };

    const close = () => {
        toc.classList.remove("is-open");
        fab.setAttribute("aria-expanded", "false");
        document.body.classList.remove("toc-open");
    };

    const toggle = () => {
        if (toc.classList.contains("is-open")) close();
        else open();
    };

    fab.addEventListener("click", toggle);
    closeBtn?.addEventListener("click", close);

    toc.addEventListener("click", (event) => {
        if (event.target === toc) close();
        if (event.target.closest("a[href^='#']")) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
    });

    const onScrollFab = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        const show = y > 300;
        fab.classList.toggle("is-visible", show);
        if (!show) close();
    };

    window.addEventListener("scroll", onScrollFab, { passive: true });
    onScrollFab();

    if (!headings.length) return;

    const scroller = () => toc.querySelector(".post-toc-panel") || toc;

    const keepInView = (link) => {
        const box = scroller();
        if (!box) return;
        const br = box.getBoundingClientRect();
        const lr = link.getBoundingClientRect();
        if (lr.top < br.top + 8) {
            box.scrollTop -= br.top + 8 - lr.top;
        } else if (lr.bottom > br.bottom - 8) {
            box.scrollTop += lr.bottom - (br.bottom - 8);
        }
    };

    let currentId = "";
    const setActive = (id) => {
        if (!id || id === currentId) return;
        currentId = id;
        links.forEach((link) => {
            const on = hrefId(link) === id;
            link.classList.toggle("is-active", on);
            if (on && toc.classList.contains("is-open")) keepInView(link);
        });
    };

    const sync = () => {
        const marker = window.scrollY + Math.min(160, window.innerHeight * 0.22);
        let current = headings[0];
        for (const heading of headings) {
            const top = heading.getBoundingClientRect().top + window.scrollY;
            if (top <= marker + 1) current = heading;
            else break;
        }
        setActive(current.id);
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
})();
