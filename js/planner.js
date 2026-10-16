document.getElementById("nav").innerHTML = NAV("planner");
ready.then(() => {
  const $ = (id) => document.getElementById(id),
    KEY = planKey();
  const DAYS = [
    ["mon", "Mon", "Monday"],
    ["tue", "Tue", "Tuesday"],
    ["wed", "Wed", "Wednesday"],
    ["thu", "Thu", "Thursday"],
    ["fri", "Fri", "Friday"],
    ["sat", "Sat", "Saturday"],
    ["sun", "Sun", "Sunday"],
  ];
  const MEALS = ["breakfast", "lunch", "dinner"],
    TONE = { breakfast: "mint", lunch: "orange", dinner: "green" };
  const now = new Date(),
    mon = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - ((now.getDay() + 6) % 7),
    ),
    todayIdx = (now.getDay() + 6) % 7;
  $("weekTitle").textContent =
    `Week of ${mon.getDate()} ${mon.toLocaleString("en", { month: "short" })}`;
  let plan = store.get(KEY, {}),
    selected = null;
  const save = () => store.set(KEY, plan),
    toast = $("toast");
  function showToast(m) {
    toast.textContent = m;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("show"), 1800);
  }
  function render() {
    $("days").innerHTML = DAYS.map(
      ([, s], i) => `<div class="${i === todayIdx ? "today" : ""}">${s}</div>`,
    ).join("");
    $("grid").innerHTML = MEALS.map((m) =>
      DAYS.map(([d, , full]) => {
        const k = d + "-" + m,
          r = byId(plan[k]);
        return r
          ? `<button class="meal-slot filled ${TONE[m]}" data-slot="${k}" aria-label="${r.title}, ${full} ${m}. Click to remove.">${r.title}</button>`
          : `<button class="meal-slot" data-slot="${k}" aria-label="${full} ${m} empty" title="${full} ${m}">+</button>`;
      }).join(""),
    ).join("");
    const favs = Favs.list().map(byId).filter(Boolean);
    $("saved").innerHTML = favs.length
      ? favs
          .map(
            (r) =>
              `<button class="saved-card ${selected == r.id ? "selected" : ""}" draggable="true" data-id="${r.id}"><span class="recipe-thumb" style="background:${r.img}"></span><span>${r.title}</span></button>`,
          )
          .join("")
      : `<p class="no-saved">No saved recipes yet. <a href="search.html">Find a recipe</a> and tap the heart to save it here.</p>`;
  }
  function assign(slot, id) {
    plan[slot] = +id;
    save();
    selected = null;
    render();
    showToast(byId(id).title + " added");
  }
  $("grid").onclick = (e) => {
    const s = e.target.closest(".meal-slot");
    if (!s) return;
    const k = s.dataset.slot;
    if (selected) return assign(k, selected);
    if (!plan[k])
      return showToast("Pick a saved recipe below, then tap this slot");
    delete plan[k];
    save();
    render();
    showToast("Meal removed");
  };
  $("grid").ondragover = (e) => {
    const s = e.target.closest(".meal-slot");
    if (s) {
      e.preventDefault();
      s.classList.add("drop-target");
    }
  };
  $("grid").ondragleave = (e) =>
    e.target.closest(".meal-slot")?.classList.remove("drop-target");
  $("grid").ondrop = (e) => {
    const s = e.target.closest(".meal-slot");
    if (!s) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id && byId(id)) assign(s.dataset.slot, id);
  };
  $("saved").ondragstart = (e) => {
    const c = e.target.closest(".saved-card");
    if (c) {
      e.dataTransfer.setData("text/plain", c.dataset.id);
      e.dataTransfer.effectAllowed = "copy";
      c.classList.add("dragging");
    }
  };
  $("saved").ondragend = (e) =>
    e.target.closest(".saved-card")?.classList.remove("dragging");
  $("saved").onclick = (e) => {
    const c = e.target.closest(".saved-card");
    if (!c) return;
    selected = selected == c.dataset.id ? null : c.dataset.id;
    render();
    if (selected) showToast("Now tap a day to add it, or drag it there");
  };
  $("clearWeek").onclick = () => {
    if (!confirm("Clear all meals from this week?")) return;
    plan = {};
    save();
    render();
    showToast("Week cleared");
  };
  render();
});
