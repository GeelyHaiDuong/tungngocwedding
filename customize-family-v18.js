(function () {
  "use strict";
  const C = window.WEDDING_CONFIG || {};

  const $ = id => document.getElementById(id);
  const upper = s => String(s || "").toLocaleUpperCase("vi-VN");
  const pad2 = n => String(n).padStart(2, "0");

  function setHtml(id, value) {
    const el = $(id);
    if (!el) return;
    const target = el.querySelector(".ladi-headline") || el;
    target.innerHTML = value;
  }

  function resolveImage(src) {
    if (!src) return "";
    try {
      const u = new URL(String(src), document.baseURI);
      if (u.origin === location.origin) {
        u.searchParams.set("v", "20260810-family-v18");
      }
      return u.href;
    } catch (e) {
      return String(src);
    }
  }

  function setBg(id, src) {
    if (!src) return;
    const url = resolveImage(src);
    const selector = `#${id} .ladi-image-background`;

    document.querySelectorAll(selector).forEach(bg => {
      bg.style.setProperty(
        "background-image",
        `url("${url.replace(/"/g, '\"')}")`,
        "important"
      );
    });
  }

  function setGallery(id, images) {
    const root = $(id);
    if (!root || !Array.isArray(images)) return;
    images.forEach((src, i) => {
      if (!src) return;
      const view = root.querySelector(`.ladi-gallery-view-item[data-index="${i}"]`);
      const thumb = root.querySelector(`.ladi-gallery-control-item[data-index="${i}"]`);
      const value = `url("${String(src).replace(/"/g, '\\"')}")`;
      if (view) view.style.backgroundImage = value;
      if (thumb) thumb.style.backgroundImage = value;
    });
  }

  function localDate(dateString) {
    return new Date(`${dateString}T12:00:00+07:00`);
  }

  const dayVi = ["CHỦ NHẬT","THỨ HAI","THỨ BA","THỨ TƯ","THỨ NĂM","THỨ SÁU","THỨ BẢY"];
  const monthEn = ["january","february","march","april","may","june","july","august","september","october","november","december"];

  function dateDot(d) {
    return `${pad2(d.getUTCDate())}.${pad2(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`;
  }

  function dateSpace(d) {
    return `${pad2(d.getUTCDate())} . ${pad2(d.getUTCMonth()+1)} . ${d.getUTCFullYear()}`;
  }

  function familyBlock(side, parents, role, name) {
    const middle = parents && String(parents).trim()
      ? String(parents).trim()
      : `Gia đình ${role.toLowerCase()}`;
    return `${side}<br>${middle}<br>${upper(name)}<br>`;
  }

  function applyInfo() {
    const cp = C.couple || {};
    const ev = C.event || {};
    const fm = C.family || {};
    const inv = C.invitation || {};
    const groom = cp.groom || "Chú rể";
    const bride = cp.bride || "Cô dâu";
    const gi = cp.groomInitials || "";
    const bi = cp.brideInitials || "";

    ["HEADLINE87","HEADLINE4"].forEach(id => setHtml(id, `${upper(bride)}<br>`));
    ["HEADLINE88","HEADLINE7"].forEach(id => setHtml(id, `${upper(groom)}<br>`));
    setHtml("HEADLINE115", upper(bride));
    setHtml("HEADLINE117", upper(groom));

    setHtml("HEADLINE9", inv.intro || "");
    setHtml("HEADLINE12", `${ev.venueName || ""}<br>`);
    setHtml("HEADLINE13", `TIỆC CƯỚI ${upper(groom)} &amp; ${upper(bride)}<br>`);
    setHtml("HEADLINE14", `${ev.address || ""}<br>`);
    setHtml("HEADLINE18", inv.welcome || "");
    setHtml("HEADLINE19", familyBlock("NHÀ TRAI", fm.groomParents, "chú rể", groom));
    setHtml("HEADLINE20", familyBlock("NHÀ GÁI", fm.brideParents, "cô dâu", bride));

    setHtml("HEADLINE40", `${gi} &amp; ${bi}`);
    setHtml("HEADLINE109", gi);
    setHtml("HEADLINE111", bi);

    if (ev.date) {
      const d = localDate(ev.date);
      setHtml("HEADLINE15", `${dayVi[d.getUTCDay()]}<br>`);
      setHtml("HEADLINE16", `${dateSpace(d)}<br>`);
      setHtml("HEADLINE41", dateDot(d));
      setHtml("HEADLINE45", monthEn[d.getUTCMonth()]);

      // Visual order of the existing calendar: Mon -> Sun
      const ids = ["HEADLINE71","HEADLINE72","HEADLINE73","HEADLINE74","HEADLINE77","HEADLINE75","HEADLINE76"];
      const offset = (d.getUTCDay() + 6) % 7;
      const monday = new Date(d.getTime() - offset * 86400000);
      ids.forEach((id, i) => {
        const day = new Date(monday.getTime() + i * 86400000);
        setHtml(id, String(day.getUTCDate()));
      });

      const endMs = Date.parse(`${ev.date}T${ev.ceremonyTime || "11:00"}:00+07:00`);
      const cd = $("COUNTDOWN2");
      if (cd && Number.isFinite(endMs)) {
        cd.setAttribute("data-endtime", String(endMs));
        cd.setAttribute("data-date-end", String(endMs));
      }

      document.title = `${groom} & ${bride} | Wedding Invitation ${dateDot(d)}`;
      const desc = `Thiệp cưới ${groom} & ${bride} - ${dateDot(d)}`;
      const md = document.querySelector('meta[name="description"]');
      const ot = document.querySelector('meta[property="og:title"]');
      const od = document.querySelector('meta[property="og:description"]');
      if (md) md.content = desc;
      if (ot) ot.content = document.title;
      if (od) od.content = desc;
    }

    setHtml("HEADLINE17", `${ev.ceremonyTime || ""}<br>`);
    setHtml("HEADLINE101", ev.receptionTime || "");
    setHtml("HEADLINE106", "Đón khách");
    setHtml("HEADLINE107", ev.ceremonyTime || "");
    setHtml("HEADLINE108", "Khai tiệc");

    const q = ev.mapQuery || [ev.venueName, ev.address].filter(Boolean).join(", ");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    const map = $("GROUP7");
    if (map) {
      map.href = mapUrl;
      map.setAttribute("data-replace-href", mapUrl);
      map.target = "_blank";
      map.rel = "noopener noreferrer";
    }

    if (Array.isArray(C.story)) {
      ["HEADLINE42","HEADLINE43","HEADLINE44"].forEach((id, i) => {
        const item = C.story[i];
        if (item) setHtml(id, `<strong>${item.title || ""}</strong><br>${item.text || ""}<br>`);
      });
    }

    if (C.albumCaption) setHtml("HEADLINE125", C.albumCaption);
  }

  function applyImages() {
    const I = C.images || {};
    setGallery("GALLERY1", I.hero);
    setGallery("GALLERY6", I.album);

    (I.invitation || []).forEach((src, i) => {
      const ids = ["IMAGE24","IMAGE32","IMAGE33"];
      if (ids[i]) setBg(ids[i], src);
    });

    setBg("IMAGE47", I.story);
    setBg("IMAGE56", I.familyMain);

    (I.familyFilm || []).forEach((src, i) => {
      const ids = ["IMAGE61","IMAGE77","IMAGE79","IMAGE81","IMAGE83","IMAGE85","IMAGE87"];
      if (ids[i]) setBg(ids[i], src);
    });

    setBg("IMAGE135", I.groomPortrait);
    setBg("IMAGE136", I.bridePortrait);

    (I.flight || []).forEach((src, i) => {
      const ids = ["IMAGE99","IMAGE98"];
      if (ids[i]) setBg(ids[i], src);
    });

    (I.albumCover || []).forEach((src, i) => {
      const ids = ["IMAGE126","IMAGE127","IMAGE128"];
      if (ids[i]) setBg(ids[i], src);
    });

    setBg("IMAGE102", I.footer);
    setBg("IMAGE140", I.footer);
  }

  applyInfo();
  applyImages();

  // FAMILY FIX V18:
  // LadiPage tạo clone của GROUP126 sau khi trang sẵn sàng.
  // Gán lại ảnh nhiều lần để original và clone đều nhận đúng ảnh mới.
  function reapplyFamilyImages() {
    applyImages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      reapplyFamilyImages();
      setTimeout(reapplyFamilyImages, 150);
      setTimeout(reapplyFamilyImages, 500);
      setTimeout(reapplyFamilyImages, 1200);
    }, { once: true });
  } else {
    setTimeout(reapplyFamilyImages, 150);
    setTimeout(reapplyFamilyImages, 500);
    setTimeout(reapplyFamilyImages, 1200);
  }

  window.addEventListener("load", function () {
    reapplyFamilyImages();
    setTimeout(reapplyFamilyImages, 300);
  }, { once: true });

  const familyLoopRoot = document.getElementById("GROUP126");
  if (familyLoopRoot && "MutationObserver" in window) {
    const familyObserver = new MutationObserver(function () {
      reapplyFamilyImages();
    });
    familyObserver.observe(familyLoopRoot, { childList: true, subtree: true });
    setTimeout(function () {
      familyObserver.disconnect();
    }, 5000);
  }

})();



(function(){
  "use strict";

  function getCoverGuestName(){
    const C=window.WEDDING_CONFIG||{};
    const G=C.guest||{};
    const keys=Array.isArray(G.queryKeys)&&G.queryKeys.length ? G.queryKeys : ["guest","khach","to"];
    const params=new URLSearchParams(window.location.search);
    for(const key of keys){
      const v=params.get(key);
      if(v&&v.trim()) return v.trim();
    }
    return (G.defaultName||"Quý khách").trim();
  }

  function formatDotDate(dateString){
    if(!dateString) return "";
    const a=String(dateString).split("-");
    return a.length===3 ? `${a[2]}.${a[1]}.${a[0]}` : dateString;
  }

  function openWeddingFromCover(){
    const cover=document.getElementById("WEDDING_COVER");
    if(!cover) return;
    cover.classList.add("is-opening");

    // Click is a user gesture, so it also helps the existing music autoplay logic.
    try{
      document.dispatchEvent(new Event("touchstart",{bubbles:true}));
    }catch(e){}

    window.setTimeout(function(){
      document.documentElement.classList.remove("wedding-cover-lock");
      document.body.classList.remove("wedding-cover-lock");
      cover.remove();
      window.scrollTo({top:0,behavior:"instant"});
    },650);
  }

  function initGeminiCover(){
    const cover=document.getElementById("WEDDING_COVER");
    if(!cover) return;

    const C=window.WEDDING_CONFIG||{};
    const cp=C.couple||{};
    const ev=C.event||{};
    const cv=C.cover||{};
    const $=id=>document.getElementById(id);

    document.documentElement.classList.add("wedding-cover-lock");
    document.body.classList.add("wedding-cover-lock");

    const stage=$("cover-mobile-container");
    if(stage && cv.background) stage.style.backgroundImage=`url("${cv.background}")`;

    if($("cover-bride-name")) $("cover-bride-name").textContent=(cp.bride||"Cô dâu").toLocaleUpperCase("vi-VN");
    if($("cover-groom-name")) $("cover-groom-name").textContent=(cp.groom||"Chú rể").toLocaleUpperCase("vi-VN");
    if($("cover-guest-name")) $("cover-guest-name").textContent=getCoverGuestName();
    if($("cover-monogram")) $("cover-monogram").textContent=cv.monogram||"TN";
    if($("cover-wedding-date")) $("cover-wedding-date").textContent=formatDotDate(ev.date);

    if($("cover-and-image") && cv.andImage) $("cover-and-image").src=cv.andImage;
    if($("cover-plane-image") && cv.planeImage) $("cover-plane-image").src=cv.planeImage;
    if($("cover-stamp-image") && cv.stampImage) $("cover-stamp-image").src=cv.stampImage;
    if($("cover-passport") && cv.passportImage) $("cover-passport").style.backgroundImage=`url("${cv.passportImage}")`;

    const btn=$("cover-open-button");
    const passport=$("cover-passport");
    if(btn) btn.addEventListener("click",openWeddingFromCover,{once:true});
    if(passport) passport.addEventListener("click",openWeddingFromCover,{once:true});
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",initGeminiCover,{once:true});
  }else{
    initGeminiCover();
  }
})();
