let overlayEl = null;
let counter = 0;

function ensureOverlay() {
    if (overlayEl) return overlayEl;

    overlayEl = document.getElementById("app-loader-overlay");
    if (overlayEl) return overlayEl;

    const el = document.createElement("div");
    el.id = "app-loader-overlay";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
    <div class="app-loader-box" role="status" aria-live="polite" aria-label="Carregando">
      <div class="app-spinner"></div>
      <div class="app-loader-text">Carregando...</div>
    </div>
  `;

    document.body.appendChild(el);
    overlayEl = el; // ✅ garante cache
    return el;
}

export function showLoading() {
    counter += 1;

    // Garante que o DOM está pronto
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => {
                if (counter <= 0) return; // ✅ evita aparecer atrasado
                const el = ensureOverlay();
                el.classList.add("is-visible");
                document.body.classList.add("app-no-scroll");
            },
            { once: true }
        );
        return;
    }

    const el = ensureOverlay();
    el.classList.add("is-visible");
    document.body.classList.add("app-no-scroll");
}

export function hideLoading() {
    counter = Math.max(0, counter - 1);
    if (counter > 0) return;

    // ✅ não depende do cache overlayEl
    const el = overlayEl || document.getElementById("app-loader-overlay");
    if (!el) return;

    el.classList.remove("is-visible");
    document.body.classList.remove("app-no-scroll");
}

export function resetLoading() {
    counter = 0;

    const el = overlayEl || document.getElementById("app-loader-overlay");
    if (!el) return;

    el.classList.remove("is-visible");
    document.body.classList.remove("app-no-scroll");
}