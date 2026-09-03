/* =========================================================
   V47 — COVER GUEST NAME FIX
   Chạy ở index.html (trang cha), sau đó chỉnh trực tiếp
   phần tên khách bên trong iframe #wedding-cover-frame.

   Mục tiêu:
   - đổi font chữ tên khách;
   - tên dài tự xuống tối đa 2 dòng;
   - không phụ thuộc class/id cũ của cover.html;
   - hỗ trợ ?guest=, ?khach=, ?to=.
   ========================================================= */

(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  function clean(value) {
    return String(value || "")
      .replace(/\+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const guestName = clean(
    params.get("guest") ||
    params.get("khach") ||
    params.get("to") ||
    ""
  );

  if (!guestName) return;

  function norm(value) {
    return clean(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function splitBalanced(name) {
    const words = clean(name).split(" ").filter(Boolean);

    // Tên ngắn: giữ 1 dòng.
    if (words.length <= 3 && name.length <= 20) {
      return [name];
    }

    if (words.length < 2) return [name];

    let best = null;

    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(" ");
      const line2 = words.slice(i).join(" ");

      const diff = Math.abs(line1.length - line2.length);

      // Không muốn một dòng chỉ có 1–2 ký tự.
      const shortPenalty =
        (line1.length < 5 ? 20 : 0) +
        (line2.length < 5 ? 20 : 0);

      const score = diff + shortPenalty;

      if (!best || score < best.score) {
        best = { line1, line2, score };
      }
    }

    return best ? [best.line1, best.line2] : [name];
  }

  function injectFontAndStyle(doc) {
    if (!doc || !doc.head) return;

    if (!doc.getElementById("guest-font-v47")) {
      const font = doc.createElement("link");
      font.id = "guest-font-v47";
      font.rel = "stylesheet";
      font.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap";
      doc.head.appendChild(font);
    }

    if (!doc.getElementById("guest-style-v47")) {
      const style = doc.createElement("style");
      style.id = "guest-style-v47";
      style.textContent = `
        /*
         Tên khách trong ô "TRÂN TRỌNG KÍNH MỜI".
         Dùng selector class do JS V47 gắn trực tiếp vào đúng element.
        */
        .cover-guest-v47,
        .cover-guest-v47 * {
          font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif !important;
          font-style: normal !important;
          text-transform: none !important;
        }

        .cover-guest-v47 {
          box-sizing: border-box !important;
          display: block !important;

          width: 180px !important;
          max-width: 180px !important;
          min-height: 22px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding: 0 3px !important;

          font-size: 22px !important;
          font-weight: 600 !important;
          line-height: 0.98 !important;
          letter-spacing: 0.15px !important;

          text-align: center !important;
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
        }

        .cover-guest-v47 .cover-guest-line-v47 {
          display: block !important;
          width: 100% !important;
          min-height: 21px !important;
          white-space: nowrap !important;
          text-align: center !important;
        }

        .cover-guest-v47.cover-guest-long-v47 {
          font-size: 20px !important;
          line-height: 0.96 !important;
        }

        @media (max-width: 380px) {
          .cover-guest-v47 {
            width: 174px !important;
            max-width: 174px !important;
            font-size: 21px !important;
          }

          .cover-guest-v47.cover-guest-long-v47 {
            font-size: 19px !important;
          }
        }
      `;
      doc.head.appendChild(style);
    }
  }

  function findGuestElement(doc) {
    if (!doc || !doc.body) return null;

    const wanted = norm(guestName);

    // 1) Các id/class có thể có.
    const selectors = [
      "#guestName",
      "#guest-name",
      "#coverGuestName",
      "#cover-guest-name",
      ".guest-name",
      ".cover-guest-name",
      "[data-guest-name]"
    ];

    for (const selector of selectors) {
      const el = doc.querySelector(selector);
      if (el) return el;
    }

    // 2) Tìm element lá có text đúng bằng tên khách.
    const all = Array.from(
      doc.querySelectorAll(
        "div,span,p,h1,h2,h3,h4,strong,em,i"
      )
    );

    for (const el of all) {
      if (el.children.length > 0) continue;

      const text = norm(el.textContent);

      if (text === wanted) {
        return el;
      }
    }

    // 3) Nếu code cover đang cắt/biến đổi text, tìm element
    // có phần lớn nội dung trùng với tên khách.
    const guestWords = wanted.split(" ").filter(Boolean);

    let best = null;

    for (const el of all) {
      if (el.children.length > 0) continue;

      const text = norm(el.textContent);
      if (!text || text.length < 3) continue;

      let hits = 0;
      guestWords.forEach((word) => {
        if (text.includes(word)) hits++;
      });

      if (hits >= Math.min(2, guestWords.length)) {
        if (!best || hits > best.hits) {
          best = { el, hits };
        }
      }
    }

    return best ? best.el : null;
  }

  function renderGuest(el) {
    if (!el) return false;

    const lines = splitBalanced(guestName);
    const signature = lines.join("|");

    // Element đúng nhưng cover script có thể render lại text;
    // chỉ bỏ qua nếu DOM V47 vẫn còn nguyên.
    if (
      el.dataset.coverGuestV47 === signature &&
      el.querySelector(".cover-guest-line-v47")
    ) {
      return true;
    }

    el.classList.add("cover-guest-v47");
    el.classList.toggle(
      "cover-guest-long-v47",
      guestName.length > 24
    );

    el.dataset.coverGuestV47 = signature;

    el.replaceChildren();

    lines.forEach((line) => {
      const span = el.ownerDocument.createElement("span");
      span.className = "cover-guest-line-v47";
      span.textContent = line;
      el.appendChild(span);
    });

    return true;
  }

  function patchFrame(frame) {
    if (!frame) return;

    let doc;

    try {
      doc = frame.contentDocument || frame.contentWindow.document;
    } catch (e) {
      console.warn("[Cover Guest V47] Không truy cập được iframe:", e);
      return;
    }

    if (!doc || !doc.body) return;

    injectFontAndStyle(doc);

    function apply() {
      const el = findGuestElement(doc);
      if (el) {
        renderGuest(el);
        return true;
      }
      return false;
    }

    // Cover có thể gán tên khách sau khi tải.
    apply();
    setTimeout(apply, 80);
    setTimeout(apply, 250);
    setTimeout(apply, 600);
    setTimeout(apply, 1200);

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(apply).catch(() => {});
    }

    // Nếu code cover render lại tên, tự áp lại V47.
    const observer = new MutationObserver(() => {
      requestAnimationFrame(apply);
    });

    observer.observe(doc.body, {
      subtree: true,
      childList: true,
      characterData: true
    });
  }

  function init() {
    const frame = document.getElementById("wedding-cover-frame");

    if (!frame) {
      console.warn("[Cover Guest V47] Không tìm thấy #wedding-cover-frame");
      return;
    }

    frame.addEventListener("load", () => patchFrame(frame));

    // Nếu iframe đã load trước script V47.
    try {
      if (
        frame.contentDocument &&
        frame.contentDocument.readyState !== "loading"
      ) {
        patchFrame(frame);
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();