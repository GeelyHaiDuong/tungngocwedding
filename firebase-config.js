/*
========================================================
 FIREBASE CONFIG — RSVP + LỜI CHÚC — FIX V38
========================================================

Lưu ý:
- Đây là Firebase Web Config, có thể dùng trên website public.
- KHÔNG đặt service-account/private key/Admin SDK key vào file này.
*/

window.WEDDING_FIREBASE = {
  enabled: true,

  firebaseConfig: {
    apiKey: "AIzaSyCuNEz1QKrdVndZWn4bh-apdE_pOA13syg",
    authDomain: "wedding-50b49.firebaseapp.com",
    projectId: "wedding-50b49",
    storageBucket: "wedding-50b49.firebasestorage.app",
    messagingSenderId: "1046998245989",
    appId: "1:1046998245989:web:41255a94662fbfa6809c8c"
  },

  collections: {
    rsvp: "wedding_rsvp",
    wishes: "wedding_wishes"
  },

  wishesPopup: {
    enabled: true,
    displayMs: 6200,
    gapMs: 2600,
    maxItems: 40
  }
};
