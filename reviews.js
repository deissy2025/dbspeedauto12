// ---- Reviews (v9.1) ----
const ENDPOINT = "/.netlify/functions/get-reviews";
const MAPS_URL = "https://share.google/SA0bCmPymPQIwiloF";
const PLACE_ID = "REPLACE_WITH_YOUR_PLACE_ID";

async function loadReviews(){
  const track = document.getElementById("reviews-track");
  const dots  = document.getElementById("reviews-dots");
  const sum   = document.getElementById("g-summary");
  const link  = document.getElementById("g-link");
  const attrib= document.getElementById("attrib");
  const prev  = document.querySelector(".reviews-nav.prev");
  const next  = document.querySelector(".reviews-nav.next");

  function pageAmount(){ return Math.max(320, Math.floor(track.clientWidth * 0.9)); }

  function syncDots(){
    const cards = [...track.children];
    if (!cards.length) return;
    const left = track.scrollLeft;
    const w = cards[0].getBoundingClientRect().width + 16;
    const idx = Math.round(left / w);
    [...dots.children].forEach((d,i)=> d.classList.toggle("active", i===idx));
    prev.disabled = left <= 2;
    next.disabled = (left + track.clientWidth + 2) >= track.scrollWidth;
  }

  function wireNav(){
    prev.addEventListener("click", ()=> track.scrollBy({ left: -pageAmount(), behavior:"smooth" }));
    next.addEventListener("click", ()=> track.scrollBy({ left:  pageAmount(), behavior:"smooth" }));
    track.addEventListener("scroll", syncDots, { passive:true });
    new ResizeObserver(syncDots).observe(track);
  }

  function render(data){
    sum.textContent = `${data.name} · ${Number(data.rating||0).toFixed(1)}★ (${data.user_ratings_total||0})`;
    link.href = (data.url || MAPS_URL); 
    attrib.href = (data.url || MAPS_URL);

    const items = (data.reviews || []).slice(0,10);
    const src = items.length ? items : [
      {author_name:"Alex Kitanoski", rating:5, text:"Professional, honest and efficient.", author_url:MAPS_URL},
      {author_name:"Michael O'Leary", rating:5, text:"Knowledgeable and friendly — workmanship above and beyond.", author_url:MAPS_URL},
      {author_name:"Brylle Codina", rating:5, text:"Safety-first and great communication. Highly recommended!", author_url:MAPS_URL},
    ];
    const list = src.length < 6 ? [...src, ...src] : src;

    track.innerHTML = ""; 
    dots.innerHTML = "";

    list.forEach((r,i)=>{
      const card = document.createElement("div");
      card.className = "review-card";
      const stars = "★".repeat(Math.round(r.rating||5)) + "☆".repeat(5 - Math.round(r.rating||5));
      card.innerHTML = `
        <div class="stars">${stars}</div>
        <h4>${r.author_name || "Google user"}</h4>
        <p>${(r.text || "").slice(0,240)}</p>
        <a target="_blank" href="${r.author_url || data.url || MAPS_URL}">Read more</a>`;
      track.appendChild(card);

      if (i < src.length) {
        const dot = document.createElement("button");
        dot.className = "dot" + (i===0 ? " active": "");
        dot.addEventListener("click", ()=>{
          const w = card.getBoundingClientRect().width + 16;
          track.scrollTo({ left: i * w, behavior:"smooth" });
        });
        dots.appendChild(dot);
      }
    });

    wireNav();
    setTimeout(syncDots, 50);
  }

  try {
    const res = await fetch(`${ENDPOINT}?placeId=${encodeURIComponent(PLACE_ID)}`, { cache:"no-store" });
    if(!res.ok) throw 0;
    const data = await res.json();
    render(data);
  } catch {
    render({ name: "DB Speed Auto", url: MAPS_URL, rating: 4.9, user_ratings_total: 120, reviews: [] });
  }
}
document.addEventListener("DOMContentLoaded", loadReviews);
