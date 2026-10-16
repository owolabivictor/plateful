const G = {
  orange: "linear-gradient(135deg,#F4B860,#E07B3F)",
  green: "linear-gradient(135deg,#9CCC65,#558B2F)",
  red: "linear-gradient(135deg,#EF9A9A,#C0504D)",
  yellow: "linear-gradient(135deg,#FFE082,#F0A83C)",
  teal: "linear-gradient(135deg,#A5D6A7,#2E7D32)",
  brown: "linear-gradient(135deg,#BCAAA4,#795548)",
};
const RECIPES = [],
  DETAIL = {};
const byId = (id) => RECIPES.find((r) => r.id == id);
const store = {
  get(k, d) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
const Favs = {
  list: () => store.get("rf_favorites", []),
  has: (id) => Favs.list().includes(+id),
  toggle(id) {
    id = +id;
    let l = Favs.list();
    l = l.includes(id) ? l.filter((x) => x !== id) : [...l, id];
    store.set("rf_favorites", l);
    return l.includes(id);
  },
};
const NAV = (cur) =>
  `<header class="nav"><a class="logo" href="index.html"><img src="logo.svg" alt="" width="30" height="30">${APP.name}</a><nav><ul>${[
    ["index", "Home"],
    ["search", "Search"],
    ["kitchen", "My Kitchen"],
    ["planner", "Planner"],
    ["shopping", "Shopping"],
    ["favorites", "Favorites"],
  ]
    .map(
      ([f, l]) =>
        `<li><a href="${f}.html" class="${f === cur ? "active" : ""}">${l}</a></li>`,
    )
    .join("")}</ul></nav></header>`;
const APP = {
  name: "Plateful",
  tagline: "Cook what you have. Plan your week.",
};
const Pantry = {
  list: () => store.get("rf_pantry", []),
  set: (l) => store.set("rf_pantry", l),
};
function planKey() {
  const n = new Date(),
    m = new Date(
      n.getFullYear(),
      n.getMonth(),
      n.getDate() - ((n.getDay() + 6) % 7),
    ),
    p = (x) => String(x).padStart(2, "0");
  return (
    "rf_plan_" +
    m.getFullYear() +
    "-" +
    p(m.getMonth() + 1) +
    "-" +
    p(m.getDate())
  );
}
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const ingMatch = (ing, t) => {
  t = String(t).trim().toLowerCase();
  if (t.length < 2) return false;
  const s = t.replace(/(es|s)$/, "");
  return (
    ing.includes(t) || (s.length > 1 && ing.includes(s)) || t.includes(ing)
  );
};
Pantry.has = (ing) => Pantry.list().some((p) => ingMatch(ing, p));
const FRAC = { 0.25: "¼", 0.5: "½", 0.75: "¾" };
function ingLine([q, t], mul = 1) {
  if (!q) return t.replace(/\|\w+/, "");
  const v = q * mul,
    x = v >= 100 ? Math.round(v / 5) * 5 : Math.round(v * 4) / 4 || 0.25,
    w = Math.floor(x);
  return (
    (w || "") +
    (FRAC[x - w] || "") +
    " " +
    t.replace(/\|(\w+)/, v <= 1 ? "" : "$1")
  );
}

// ---- Recipe data: loaded with the Fetch API from recipes.json
// ---- Online recipes: TheMealDB (free, no key) merged with the local recipes.json (always loaded, offline fallback)
const API = "https://www.themealdb.com/api/json/v1/1/",
  TERMS = [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "fish",
    "salmon",
    "pasta",
    "rice",
    "soup",
    "salad",
    "curry",
    "egg",
    "potato",
    "vegetable",
  ];
async function getJSON(u, ms = 6000) {
  const c = new AbortController(),
    t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(u, { signal: c.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
function fromMeal(m) {
  const ing = [],
    lines = [];
  for (let i = 1; i <= 20; i++) {
    const n = (m["strIngredient" + i] || "").trim();
    if (n) {
      ing.push(n.toLowerCase());
      lines.push([0, ((m["strMeasure" + i] || "").trim() + " " + n).trim()]);
    }
  }
  let steps = String(m.strInstructions || "")
    .split(/\r?\n+/)
    .map((x) =>
      x.trim().replace(/^(step\s*\d+\s*[:.\-–]?\s*|\d+\s*[.)]\s+)/i, ""),
    )
    .filter((x) => x && !/^(step\s*)?\d+\.?$/i.test(x));
  if (steps.length < 3) {
    const out = [];
    steps
      .join(" ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .forEach((x) => {
        if (out.length && out[out.length - 1].length < 40)
          out[out.length - 1] += " " + x;
        else out.push(x);
      });
    steps = out;
  }
  if (!steps.length) steps = ["Prepare the ingredients and cook until done."];
  const st = steps.map((t) => {
    const x = t.match(
        /(\d{1,3})(?:\s*(?:-|to)\s*\d{1,3})?\s*(?:minutes?|mins?)\b/i,
      ),
      mn = x ? +x[1] : 0;
    return mn && mn <= 120 ? [t, mn] : [t];
  });
  const cat = m.strCategory || "";
  return {
    id: +m.idMeal,
    title: m.strMeal,
    time: Math.min(90, Math.max(15, Math.round((steps.length * 6) / 5) * 5)),
    difficulty:
      ing.length <= 7 && steps.length <= 5
        ? "Easy"
        : ing.length > 12 || steps.length > 9
          ? "Hard"
          : "Medium",
    diet:
      cat === "Vegan"
        ? ["Vegetarian", "Vegan"]
        : cat === "Vegetarian"
          ? ["Vegetarian"]
          : [],
    cuisine: m.strArea && m.strArea !== "Unknown" ? m.strArea : "Other",
    ingredients: ing,
    img: "url('" + m.strMealThumb + "') center/cover",
    src: "TheMealDB",
    type: cat === "Breakfast" ? "Breakfast" : undefined,
    details: { s: 4, n: null, i: lines, st },
  };
}
async function loadOnline() {
  const rs = await Promise.allSettled(
      TERMS.map((t) => getJSON(API + "search.php?s=" + t)),
    ),
    seen = new Set(),
    out = [];
  rs.forEach((x) => {
    if (x.status === "fulfilled")
      (x.value.meals || []).slice(0, 12).forEach((m) => {
        if (!seen.has(m.idMeal)) {
          seen.add(m.idMeal);
          out.push(fromMeal(m));
        }
      });
  });
  return out;
}
const NUT = (n) => {
  const h = ["kcal", "protein", "carbs"]
    .map((l, i) =>
      (n || [])[i] == null
        ? ""
        : "<div><b>" +
          n[i] +
          (i ? "g" : "") +
          "</b><span>" +
          l +
          "</span></div>",
    )
    .join("");
  return (
    h ||
    '<p style="color:#757575;font-size:.9rem;margin:0">Not provided for this recipe.</p>'
  );
};
const ready = (async () => {
  const add = (r) => {
    DETAIL[r.id] = r.details;
    delete r.details;
    r.img = G[r.img] || r.img;
    r.type =
      r.type || (r.id === 8 ? "Breakfast" : r.time <= 15 ? "Lunch" : "Dinner");
    RECIPES.push(r);
  };
  try {
    (await getJSON("recipes.json")).recipes.forEach(add);
  } catch {}
  let c = store.get("rf_meal_cache", null);
  if (!c || Date.now() - c.t > 864e5) {
    try {
      const meals = await loadOnline();
      if (meals.length) {
        c = { t: Date.now(), meals };
        store.set("rf_meal_cache", c);
      }
    } catch {}
  }
  (c?.meals || []).forEach((r) => {
    if (!RECIPES.some((x) => x.id === r.id)) add(JSON.parse(JSON.stringify(r)));
  });
  if (!RECIPES.length) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="background:#FDECEA;color:#8a2c2c;padding:1rem;text-align:center;font:500 15px Inter,sans-serif">Recipes could not be loaded. Check your internet connection, or open the project through a local server (e.g. VS Code Live Server).</p>',
    );
    throw new Error("no recipes");
  }
})();
addEventListener("DOMContentLoaded", () =>
  document
    .querySelector(".nav a.active")
    ?.scrollIntoView({ inline: "center", block: "nearest" }),
);
