/*
========================================================
 FIREBASE CONFIG — RSVP + LỜI CHÚC
========================================================

1) Firebase Console → Project settings → Your apps → Web app
2) Copy firebaseConfig và thay 6 giá trị YOUR_... bên dưới.
3) Firestore Database → Rules → dán nội dung firestore.rules → Publish.

Firebase web config không phải private key. Tuy nhiên KHÔNG đặt service-account
hoặc Admin SDK private key vào file này.
*/

window.WEDDING_FIREBASE = {
  enabled: true,

  const firebaseConfig = {
  apiKey: "AIzaSyCuNEz1QKrdVndZWn4bh-apdE_pOA13syg",
  authDomain: "wedding-50b49.firebaseapp.com",
  projectId: "wedding-50b49",
  storageBucket: "wedding-50b49.firebasestorage.app",
  messagingSenderId: "1046998245989",
  appId: "1:1046998245989:web:41255a94662fbfa6809c8c"
};

  collections: {
    rsvp: "wedding_rsvp",
    wishes: "wedding_wishes"
  },

  wishesPopup: {
    enabled: true,

    // Một lời chúc nằm trên màn hình bao lâu.
    displayMs: 6200,

    // Khoảng nghỉ trước khi chuyển sang lời chúc tiếp theo.
    gapMs: 2600,

    // Số lời chúc approved tối đa tải về.
    maxItems: 40
  }
};
