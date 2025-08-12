
async function fetchCreators(){ const r = await fetch('./assets/creators.json'); return r.json(); }
function tagChip(t){ return `<span class="badge">${t}</span>` }

function card(c){
  const tags = (c.tags||[]).slice(0,4).map(tagChip).join('');
  return `<article class="card">
    <img src="${c.cover_media}" alt="${c.name} cover">
    <div class="pad">
      <div class="meta">${c.type} • ${c.price_tier||''}</div>
      <h3>${c.name}</h3>
      <div class="meta">${c.micro_location}</div>
      <div class="badges">${tags}</div>
      <div style="margin-top:.6rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn" href="creator.html?slug=${encodeURIComponent(c.slug)}">Learn More</a>
        <a class="btn outline" href="${(c.contact||{}).website_url||'#'}" target="_blank" rel="noopener">Visit Site</a>
      </div>
    </div>
  </article>`;
}

async function initHome(){
  const list = document.getElementById('featured');
  if(!list) return;
  const data = await fetchCreators();
  list.innerHTML = data.map(card).join('');
}

async function initDiscover(){
  const listEl = document.getElementById('result');
  if(!listEl) return;
  const creators = await fetchCreators();
  const q = document.getElementById('q');
  const state = document.getElementById('state');
  const typ = document.getElementById('type');
  const habitat = document.getElementById('habitat');
  const tag = document.getElementById('tag');

  function unique(arr){return [...new Set(arr)];}
  unique(creators.map(c=>c.state)).sort().forEach(s=>state.innerHTML += `<option>${s}</option>`);
  unique(creators.map(c=>c.habitat)).sort().forEach(h=>habitat.innerHTML += `<option>${h}</option>`);
  unique(creators.map(c=>c.type)).sort().forEach(t=>typ.innerHTML += `<option>${t}</option>`);
  unique(creators.flatMap(c=>c.tags||[])).sort().forEach(t=>tag.innerHTML += `<option>${t}</option>`);

  function apply(){
    let v = creators.slice();
    const sq = q.value.trim().toLowerCase();
    if(sq) v = v.filter(c=> (c.name + c.micro_location + (c.tags||[]).join(' ')).toLowerCase().includes(sq));
    if(state.value) v = v.filter(c=> c.state===state.value);
    if(typ.value) v = v.filter(c=> c.type===typ.value);
    if(habitat.value) v = v.filter(c=> c.habitat===habitat.value);
    if(tag.value) v = v.filter(c=> (c.tags||[]).includes(tag.value));
    listEl.innerHTML = v.map(card).join('') || '<p>No results. Try clearing filters.</p>';
  }
  [q,state,typ,habitat,tag].forEach(el=>el.addEventListener('input', apply));
  apply();
}

async function initCreator(){
  const root = document.getElementById('creator');
  if(!root) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const data = await fetchCreators();
  const c = data.find(x=>x.slug===slug) || data[0];
  document.title = c.name + " — Creator";
  const sust = (c.sustainability||[]).map(tagChip).join('');
  const tags = (c.tags||[]).map(tagChip).join('');
  const exps = (c.experiences||[]).map(e=>`<li><strong>${e.title}</strong> — ${e.desc} <a href="${e.ext_url}" target="_blank" rel="noopener">Learn more</a></li>`).join('');
  root.innerHTML = `
  <section class="hero">
    <div class="panel">
      <h1>${c.name}</h1>
      <div class="meta">${c.type} • ${c.price_tier||''} • ${c.micro_location}</div>
      <div class="pills">${tags}</div>
      <p style="margin-top:.6rem">${c.story||''}</p>
      <div class="pills">${sust}</div>
      <div style="margin-top:.6rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn" href="${(c.contact||{}).booking_url||'#'}" target="_blank" rel="noopener">Book on creator’s site</a>
        <a class="btn outline" href="${(c.contact||{}).website_url||'#'}" target="_blank" rel="noopener">Website</a>
      </div>
    </div>
    <div class="img">
      <img src="${c.cover_media}" alt="${c.name}">
    </div>
  </section>
  <section class="container" style="padding-bottom:1rem">
    <h2>Experiences Offered</h2>
    <ul>${exps}</ul>
    <h2>Getting There</h2>
    <p>Nearest town and travel tips (placeholder). Consider train/bus where possible.</p>
    <h2>Community Notes</h2>
    <p>Static preview of reviews coming in Phase 2. Forum integration to follow.</p>
  </section>
  `;
}

window.addEventListener('DOMContentLoaded', ()=>{
  initHome(); initDiscover(); initCreator();
});
