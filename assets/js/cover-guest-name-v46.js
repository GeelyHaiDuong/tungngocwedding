/* =========================================================
   V46 — SMART GUEST NAME WRAP
   Tìm phần tử tên khách trên Cover và tự chia 2 dòng cân đối.
   Hỗ trợ query:
   ?guest=...
   ?khach=...
   ?to=...
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

  const guestFromUrl = clean(
    params.get("guest") ||
    params.get("khach") ||
    params.get("to") ||
    ""
  );

  const DIRECT_SELECTORS = [
    "#coverGuest",
    "#coverGuestName",
    "#guestName",
    "#guest-name",
    ".cover-guest-name",
    ".guest-name",
    "[data-guest-name]"
  ];

  function norm(text) {
    return clean(text).toLocaleLowerCase("vi");
  }

  function findGuestElement() {
    // 1) Ưu tiên các selector thường dùng
    for (const selector of DIRECT_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    // 2) Nếu cover hiện tại không dùng selector trên,
    // tìm phần tử lá có text đúng bằng tên khách từ URL.
    if (guestFromUrl) {
      const wanted = norm(guestFromUrl);

      const nodes = Array.from(
        document.querySelectorAll(
          "div,span,p,h1,h2,h3,h4,strong,em"
        )
      );

      for (const el of nodes) {
        if (el.children.length > 0) continue;
        if (norm(el.textContent) === wanted) return el;
      }
    }

    return null;
  }

  function splitBalanced(name) {
    const words = clean(name).split(" ").filter(Boolean);

    if (words.length < 2) return [name];

    // Tên ngắn thì giữ 1 dòng.
    if (name.length <= 22) return [name];

    let best = null;

    for (let i = 1; i < words.length; i++) {
      const first = words.slice(0, i).join(" ");
      const second = words.slice(i).join(" ");

      // Ưu tiên 2 dòng có độ dài gần nhau.
      // Phạt mạnh nếu một dòng quá ngắn.
      const diff = Math.abs(first.length - second.length);
      const shortPenalty =
        (first.length < 7 ? 8 : 0) +
        (second.length < 7 ? 8 : 0);

      const score = diff + shortPenalty;

      if (!best || score < best.score) {
        best = { first, second, score };
      }
    }

    return best ? [best.first, best.second] : [name];
  }

  function renderGuestName(el, inputName) {
    if (!el) return;

    const name = clean(inputName || el.textContent);
    if (!name) return;

    el.classList.add("guest-name-v46");
    el.classList.toggle("guest-name-long-v46", name.length > 30);

    const lines = splitBalanced(name);

    // Không render lại nếu nội dung đã đúng.
    const signature = lines.join("|");
    if (el.dataset.guestV46 === signature) return;
    el.dataset.guestV46 = signature;

    el.replaceChildren();

    lines.forEach((line) => {
      const span = document.createElement("span");
      span.className = "guest-line-v46";
      span.textContent = line;
      el.appendChild(span);
    });
  }

  function apply() {
    const el = findGuestElement();
    if (!el) return false;

    renderGuestName(el, guestFromUrl || el.textContent);
    return true;
  }

  function init() {
    // Cover cũ có thể gán tên khách bằng JS sau DOMContentLoaded,
    // nên chạy nhiều nhịp ngắn để bắt đúng thời điểm.
    apply();

    setTimeout(apply, 100);
    setTimeout(apply, 350);
    setTimeout(apply, 800);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(apply).catch(() => {});
    }

    // Theo dõi nếu code cover cập nhật tên khách sau đó.
    const observer = new MutationObserver(() => {
      apply();
    });

    if (document.body) {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true
      });
    }
  }

  // Cho phép gọi thủ công nếu sau này cần:
  // window.updateCoverGuestV46("Nguyễn Văn A");
  window.updateCoverGuestV46 = function (name) {
    const el = findGuestElement();
    if (el) renderGuestName(el, name);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();