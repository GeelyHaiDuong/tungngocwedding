/*
========================================================
 RSVP FIREBASE + WISH POPUP — V37
========================================================
*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const SETTINGS = window.WEDDING_FIREBASE || {};
const SITE = window.WEDDING_CONFIG || {};
const URL_FLAGS_V39 = new URLSearchParams(window.location.search);
const WISH_DEBUG_V39 = URL_FLAGS_V39.get("wishdebug") === "1";
const WISH_DEMO_V39 = URL_FLAGS_V39.get("wishdemo") === "1";

function readyFirebaseConfig(cfg) {
  if (!cfg || typeof cfg !== "object") return false;
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  return required.every((key) => {
    const v = String(cfg[key] || "").trim();
    return v && !v.includes("YOUR_");
  });
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function eventId() {
  const couple = SITE.couple || {};
  const event = SITE.event || {};
  const base = [
    couple.groom || "groom",
    couple.bride || "bride",
    event.date || "wedding"
  ].join("-");
  return slugify(base) || "wedding";
}

function trimText(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function injectStyles() {
  if (document.getElementById("firebase-rsvp-style-v37")) return;

  const style = document.createElement("style");
  style.id = "firebase-rsvp-style-v37";
  style.textContent = `
    /* RSVP submit feedback */
    #rsvp-feedback-v37{
      position:fixed;
      z-index:2147482500;
      left:50%;
      bottom:max(18px,env(safe-area-inset-bottom));
      transform:translate(-50%,18px);
      width:min(350px,calc(100vw - 28px));
      padding:11px 15px;
      border-radius:14px;
      background:rgba(246,250,249,.97);
      border:1px solid rgba(95,126,126,.25);
      box-shadow:0 10px 35px rgba(30,48,50,.20);
      color:#355255;
      font:600 13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;
      text-align:center;
      opacity:0;
      pointer-events:none;
      transition:opacity .25s ease,transform .25s ease;
    }
    #rsvp-feedback-v37.is-visible{
      opacity:1;
      transform:translate(-50%,0);
    }
    #rsvp-feedback-v37.is-error{
      color:#8b3c3c;
      background:rgba(255,247,247,.98);
    }

    /* Approved wish popup at the top of the invitation */
    #wedding-wish-popup-v37{
      position:fixed;
      z-index:2147482000;
      top:max(14px,env(safe-area-inset-top));
      left:50%;
      width:min(360px,calc(100vw - 28px));
      transform:translate(-50%,-28px) scale(.97);
      opacity:0;
      pointer-events:none;
      transition:
        opacity .38s ease,
        transform .48s cubic-bezier(.2,.8,.2,1);
    }
    #wedding-wish-popup-v37.is-visible{
      opacity:1;
      transform:translate(-50%,0) scale(1);
    }
    .wish-card-v37{
      position:relative;
      padding:13px 42px 13px 48px;
      border:1px solid rgba(255,255,255,.72);
      border-radius:18px;
      background:rgba(246,250,249,.94);
      box-shadow:0 12px 38px rgba(27,48,51,.20);
      backdrop-filter:blur(10px);
      -webkit-backdrop-filter:blur(10px);
      color:#2f4d50;
      overflow:hidden;
    }
    .wish-heart-v37{
      position:absolute;
      left:15px;
      top:15px;
      width:25px;
      height:25px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#6c8888;
      color:#fff;
      font:700 16px/1 Georgia,serif;
    }
    .wish-name-v37{
      font:700 12px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;
      letter-spacing:.2px;
      color:#526f71;
    }
    .wish-message-v37{
      margin-top:3px;
      font:500 13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;
      color:#253f42;
      display:-webkit-box;
      -webkit-line-clamp:3;
      -webkit-box-orient:vertical;
      overflow:hidden;
    }
    .wish-close-v37{
      position:absolute;
      top:7px;
      right:8px;
      width:30px;
      height:30px;
      border:0;
      border-radius:50%;
      background:transparent;
      color:#718687;
      font-size:20px;
      line-height:30px;
      pointer-events:auto;
      cursor:pointer;
    }

    #BUTTON2.rsvp-saving-v37{
      opacity:.72 !important;
      pointer-events:none !important;
    }

    @media(prefers-reduced-motion:reduce){
      #wedding-wish-popup-v37,
      #rsvp-feedback-v37{
        transition:none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function makeFeedback() {
  let el = document.getElementById("rsvp-feedback-v37");
  if (el) return el;
  el = document.createElement("div");
  el.id = "rsvp-feedback-v37";
  document.body.appendChild(el);
  return el;
}

let feedbackTimer = 0;
function showFeedback(message, error = false) {
  const el = makeFeedback();
  el.textContent = message;
  el.classList.toggle("is-error", !!error);
  el.classList.add("is-visible");
  clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    el.classList.remove("is-visible");
  }, error ? 5200 : 3800);
}


function showWishDebugV39(message, error = false) {
  if (!WISH_DEBUG_V39) return;
  showFeedback("[Wish Debug] " + message, error);
  console[error ? "error" : "info"]("[Wish Debug]", message);
}

function createWishPopup() {
  let root = document.getElementById("wedding-wish-popup-v37");
  if (root) return root;

  root = document.createElement("div");
  root.id = "wedding-wish-popup-v37";
  root.setAttribute("aria-live", "polite");
  root.innerHTML = `
    <div class="wish-card-v37">
      <div class="wish-heart-v37">♡</div>
      <div class="wish-name-v37"></div>
      <div class="wish-message-v37"></div>
      <button type="button" class="wish-close-v37" aria-label="Đóng">×</button>
    </div>
  `;
  document.body.appendChild(root);

  root.querySelector(".wish-close-v37").addEventListener("click", () => {
    root.classList.remove("is-visible");
  });

  return root;
}


function runWishDemoV39() {
  if (!WISH_DEMO_V39) return;

  const root = createWishPopup();
  const nameEl = root.querySelector(".wish-name-v37");
  const msgEl = root.querySelector(".wish-message-v37");

  function tryShow() {
    if (coverIsOpen()) {
      setTimeout(tryShow, 900);
      return;
    }
    nameEl.textContent = "Lời chúc từ Khách thử nghiệm";
    msgEl.textContent = "Chúc Hoàng Tùng & Bích Ngọc trăm năm hạnh phúc ♡";
    root.classList.add("is-visible");
    setTimeout(() => root.classList.remove("is-visible"), 7000);
  }

  setTimeout(tryShow, 900);
}

function coverIsOpen() {
  return !!document.getElementById("wedding-cover-shell");
}

function timestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function initWishRotator(db) {
  const popupSettings = SETTINGS.wishesPopup || {};
  if (popupSettings.enabled === false) return;

  const collectionName =
    (SETTINGS.collections && SETTINGS.collections.wishes) || "wedding_wishes";

  // Rules only allow reading approved wishes, so the query also restricts
  // itself to approved == true.
  const q = query(
    collection(db, collectionName),
    where("approved", "==", true),
    limit(Math.max(1, Math.min(100, Number(popupSettings.maxItems) || 40)))
  );

  let wishes = [];
  let cursor = 0;
  let activeTimer = 0;
  let gapTimer = 0;

  const root = createWishPopup();
  const nameEl = root.querySelector(".wish-name-v37");
  const msgEl = root.querySelector(".wish-message-v37");

  function scheduleNext(delay) {
    clearTimeout(gapTimer);
    gapTimer = window.setTimeout(showNext, delay);
  }

  function showNext() {
    if (!wishes.length) return;

    // Do not cover the passport cover. Wait until invitation has opened.
    if (coverIsOpen()) {
      scheduleNext(1200);
      return;
    }

    const wish = wishes[cursor % wishes.length];
    cursor += 1;

    nameEl.textContent = `Lời chúc từ ${wish.name}`;
    msgEl.textContent = wish.message;

    root.classList.add("is-visible");

    clearTimeout(activeTimer);
    activeTimer = window.setTimeout(() => {
      root.classList.remove("is-visible");
      scheduleNext(Math.max(1000, Number(popupSettings.gapMs) || 2600));
    }, Math.max(2500, Number(popupSettings.displayMs) || 6200));
  }

  onSnapshot(q, (snapshot) => {
    const approvedDocs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }));

    wishes = approvedDocs
      .filter((w) => w.eventId === eventId() && trimText(w.name, 80) && trimText(w.message, 500))
      .sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));

    cursor = 0;

    showWishDebugV39(
      `Firebase OK · approved query=${approvedDocs.length} · đúng eventId=${wishes.length} · eventId=${eventId()}`
    );

    if (!wishes.length && approvedDocs.length > 0) {
      showWishDebugV39(
        "Có lời chúc approved=true nhưng eventId không khớp với thiệp hiện tại.",
        true
      );
    } else if (!wishes.length) {
      showWishDebugV39(
        "Chưa có document wedding_wishes nào approved=true mà website đọc được.",
        true
      );
    }

    if (wishes.length && !activeTimer && !gapTimer) {
      scheduleNext(1200);
    }
  }, (error) => {
    console.warn("[Wedding RSVP] Không tải được lời chúc:", error);
    showWishDebugV39(
      `Firestore không đọc được wedding_wishes: ${error && error.code ? error.code : error}`,
      true
    );
  });
}

function prefillGuestName() {
  const input = document.querySelector('#FORM2 [name="name"]');
  if (!input || input.value.trim()) return;

  const params = new URLSearchParams(location.search);
  const guest = params.get("guest") || params.get("khach") || params.get("to");
  if (guest) input.value = guest;
}

function initRsvpForm(db) {
  const form = document.querySelector("#FORM2 form");
  const button = document.getElementById("BUTTON2");
  const buttonText = document.querySelector("#BUTTON_TEXT2 .ladi-headline");

  if (!form || !button) return;

  let saving = false;
  const originalButtonText = buttonText ? buttonText.textContent : "XÁC NHẬN";

  function readForm() {
    const data = new FormData(form);

    const name = trimText(data.get("name"), 80);
    const message = trimText(data.get("message"), 500);
    const attendance = trimText(data.get("attendance"), 10);
    const phone = trimText(data.get("phone"), 30);

    let guests = Number.parseInt(String(data.get("guests") || ""), 10);
    if (!Number.isFinite(guests)) guests = attendance === "yes" ? 1 : 0;
    if (attendance === "no") guests = 0;
    guests = Math.max(0, Math.min(20, guests));

    return { name, message, attendance, guests, phone };
  }

  function validate(payload) {
    if (!payload.name) return "Vui lòng nhập tên của bạn.";
    if (!["yes", "no"].includes(payload.attendance)) {
      return "Vui lòng chọn bạn có tham dự hay không.";
    }
    if (payload.attendance === "yes" && payload.guests < 1) {
      return "Vui lòng nhập số người tham dự.";
    }
    return "";
  }

  async function submitRsvp(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    if (saving) return;

    const payload = readForm();
    const validationError = validate(payload);
    if (validationError) {
      showFeedback(validationError, true);
      return;
    }

    saving = true;
    button.classList.add("rsvp-saving-v37");
    if (buttonText) buttonText.textContent = "ĐANG GỬI...";

    try {
      const rsvpCollection =
        (SETTINGS.collections && SETTINGS.collections.rsvp) || "wedding_rsvp";
      const wishesCollection =
        (SETTINGS.collections && SETTINGS.collections.wishes) || "wedding_wishes";

      const batch = writeBatch(db);

      const rsvpRef = doc(collection(db, rsvpCollection));
      batch.set(rsvpRef, {
        eventId: eventId(),
        name: payload.name,
        message: payload.message,
        attendance: payload.attendance,
        guests: payload.guests,
        phone: payload.phone,
        approved: false,
        createdAt: serverTimestamp()
      });

      // Public wishes are stored in a separate collection with NO phone number.
      // They remain invisible until approved=true is set in Firebase Console.
      if (payload.message) {
        const wishRef = doc(collection(db, wishesCollection));
        const autoApproveWish =
          !!(SETTINGS.wishesPopup && SETTINGS.wishesPopup.autoApprove === true);

        batch.set(wishRef, {
          eventId: eventId(),
          name: payload.name,
          message: payload.message,
          approved: autoApproveWish,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();

      if (buttonText) buttonText.textContent = "ĐÃ GỬI ✓";
      showFeedback(
        SETTINGS.wishesPopup && SETTINGS.wishesPopup.autoApprove === true && payload.message
          ? "Cảm ơn bạn! Lời chúc đã được ghi nhận và sẽ xuất hiện trên thiệp."
          : "Cảm ơn bạn! Xác nhận tham dự đã được ghi nhận."
      );

      // Keep guest name for convenience, clear the rest.
      const message = form.querySelector('[name="message"]');
      const guests = form.querySelector('[name="guests"]');
      const phone = form.querySelector('[name="phone"]');
      const attendance = form.querySelector('[name="attendance"]');

      if (message) message.value = "";
      if (guests) guests.value = "";
      if (phone) phone.value = "";
      if (attendance) {
        attendance.value = "";
        attendance.setAttribute("data-selected", "");
      }

      window.setTimeout(() => {
        if (buttonText) buttonText.textContent = originalButtonText;
      }, 2600);
    } catch (error) {
      console.error("[Wedding RSVP] Lỗi lưu Firebase:", error);
      if (buttonText) buttonText.textContent = "THỬ LẠI";
      showFeedback(
        "Chưa gửi được xác nhận. Hãy kiểm tra Firebase Config và Firestore Rules.",
        true
      );
    } finally {
      saving = false;
      button.classList.remove("rsvp-saving-v37");
    }
  }

  // Capture phase prevents the old LadiPage handler from sending elsewhere.
  button.addEventListener("click", submitRsvp, true);
  form.addEventListener("submit", submitRsvp, true);
}

function showFirebaseSetupWarning() {
  const formButton = document.querySelector("#BUTTON_TEXT2 .ladi-headline");
  if (formButton) formButton.textContent = "CHƯA CẤU HÌNH FIREBASE";
  console.warn(
    "[Wedding RSVP] Hãy điền Firebase Web Config trong firebase-config.js trước khi sử dụng."
  );
}

function boot() {
  injectStyles();
  prefillGuestName();

  if (SETTINGS.enabled === false || !readyFirebaseConfig(SETTINGS.firebaseConfig)) {
    showFirebaseSetupWarning();
    showWishDebugV39("firebase-config.js chưa hợp lệ hoặc chưa tải được.", true);
    return;
  }

  try {
    const app = initializeApp(SETTINGS.firebaseConfig);
    const db = getFirestore(app);

    initRsvpForm(db);
    initWishRotator(db);
    runWishDemoV39();

    console.info("[Wedding RSVP] Firebase V39 đã sẵn sàng:", eventId());
    showWishDebugV39(`Khởi tạo Firebase thành công · eventId=${eventId()}`);
  } catch (error) {
    console.error("[Wedding RSVP] Không khởi tạo được Firebase:", error);
    showFeedback("Không thể kết nối Firebase.", true);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
