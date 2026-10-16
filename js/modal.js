// Recipe detail modal: ingredient checklist (strikethrough, saved), step-by-step directions, nutrition, save.
(function () {
  const css = document.createElement("style");
  css.textContent = `
#rmodal{border:0;border-radius:20px;padding:0;width:min(760px,94vw);max-height:90vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.3);font-family:Inter,sans-serif;color:#212121}
#rmodal::backdrop{background:rgba(0,0,0,.5)}
.rm-head{height:150px;position:relative}.rm-x{position:sticky;float:right;top:10px;margin:10px;width:38px;height:38px;border:0;border-radius:50%;background:#fff;font-size:1.4rem;cursor:pointer}
.rm-body{padding:1.4rem 1.6rem 1.8rem}.rm-body h2{font:700 1.7rem Poppins,sans-serif;margin:0 0 .5rem}
.rm-meta{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;color:#757575;margin-bottom:1rem}
.rm-tag{font-size:.8rem;padding:.1rem .7rem;border-radius:999px;background:#E8F5E9;color:#2E7D32}
.rm-btns{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.2rem}
.rm-btns a,.rm-btns button{font:500 .8rem Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;border:2px solid #2E7D32;color:#2E7D32;background:#fff;border-radius:10px;padding:.6rem 1rem;cursor:pointer;text-decoration:none}
.rm-btns .on{background:#E8F5E9}
.rm-cols{display:flex;flex-wrap:wrap;gap:1.5rem}.rm-cols>section{flex:1 1 260px;min-width:0}
.rm-body h3{font:600 1.1rem Poppins,sans-serif;margin:0 0 .6rem}
.rm-ing{display:flex;gap:.7rem;align-items:center;padding:.6rem 0;border-bottom:1px solid #E0E0E0;cursor:pointer}
.rm-ing input{accent-color:#2E7D32;width:18px;height:18px}.rm-ing input:checked+span{text-decoration:line-through;color:#757575}
.rm-nut{display:flex;gap:.6rem;margin:0 0 1.2rem}.rm-nut div{flex:1;text-align:center;border:1px solid #E0E0E0;border-radius:12px;padding:.6rem .2rem}
.rm-nut b{display:block;font:700 1.2rem Poppins,sans-serif;color:#2E7D32}.rm-nut span{font-size:.8rem;color:#757575}
.rm-steps{list-style:none;margin:0;padding:0;counter-reset:s}.rm-steps li{display:flex;gap:.8rem;margin-bottom:1rem;counter-increment:s}
.rm-steps li:before{content:counter(s);flex:none;width:30px;height:30px;border-radius:50%;background:#2E7D32;color:#fff;display:flex;justify-content:center;align-items:center;font-weight:600}
.rm-steps small{display:block;color:#757575}`;
  document.head.appendChild(css);
  window.openRecipe = function (id) {
    ready.then(() => {
      const r = byId(id),
        d = DETAIL[id];
      if (!r || !d) return;
      let m = document.getElementById("rmodal");
      if (!m) {
        m = document.createElement("dialog");
        m.id = "rmodal";
        m.setAttribute("aria-label", "Recipe details");
        document.body.appendChild(m);
        m.addEventListener("click", (e) => {
          if (e.target === m || e.target.closest("[data-close]")) m.close();
        });
        m.addEventListener("close", () => dispatchEvent(new Event("rf:favs")));
        m.addEventListener("change", (e) => {
          const j = +e.target.dataset.j,
            k = "rf_checked_" + m.dataset.id,
            c = store.get(k, []);
          store.set(k, e.target.checked ? [...c, j] : c.filter((x) => x !== j));
        });
      }
      m.dataset.id = r.id;
      const ck = store.get("rf_checked_" + r.id, []),
        s = Favs.has(r.id);
      m.innerHTML = `<div class="rm-head" style="background:${r.img}"><button class="rm-x" data-close aria-label="Close">×</button></div><div class="rm-body"><h2>${r.title}</h2>
 <div class="rm-meta"><span>${r.time} min</span><span class="rm-tag">${r.difficulty}</span>${r.src ? `<span>via ${r.src}</span>` : `<span>Serves ${d.s}</span>`}${r.diet.map((x) => `<span class="rm-tag">${x}</span>`).join("")}</div>
 <div class="rm-btns"><button id="rmSave" class="${s ? "on" : ""}">${s ? "♥ Saved" : "♡ Save"}</button><a href="recipe.html?id=${r.id}">Full page &amp; cooking mode</a></div>
 <div class="rm-cols"><section><h3>Ingredients</h3>${d.i.map((x, j) => `<label class="rm-ing"><input type="checkbox" data-j="${j}" ${ck.includes(j) ? "checked" : ""}><span>${ingLine(x)}</span></label>`).join("")}</section>
 <section><h3>Nutrition <small style="font:400 .8rem Inter;color:#757575">per serving</small></h3><div class="rm-nut">${NUT(d.n)}</div>
 <h3>Directions</h3><ol class="rm-steps">${d.st.map(([t, mn]) => `<li><div>${t}${mn ? `<small>${mn} min</small>` : ""}</div></li>`).join("")}</ol></section></div></div>`;
      m.querySelector("#rmSave").onclick = (e) => {
        const on = Favs.toggle(r.id);
        e.target.textContent = on ? "♥ Saved" : "♡ Save";
        e.target.classList.toggle("on", on);
      };
      m.showModal();
      m.scrollTop = 0;
    });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-open]");
    if (a && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      openRecipe(a.dataset.open);
    }
  });
})();
