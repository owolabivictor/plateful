const $ = (id) => document.getElementById(id);
// Mobile menu (open/close + lock page scroll while open)
const button = $("button"),
  mobileNav = $("mobile-nav"),
  menuBtn = $("menu-btn"),
  closeBtn = $("close-btn"),
  overlay = $("overlay");
function toggleMenu() {
  const opening = mobileNav.classList.contains("hidden");
  mobileNav.classList.toggle("hidden");
  closeBtn.classList.toggle("hidden");
  menuBtn.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
  mobileNav.classList.toggle("translate-x-[100%]", !opening);
  mobileNav.classList.toggle("translate-x-0", opening);
  mobileNav.classList.toggle("pointer-events-none", !opening);
  mobileNav.classList.toggle("pointer-events-auto", opening);
  document.body.style.overflow = opening ? "hidden" : "";
}
button.addEventListener("click", toggleMenu);
overlay.addEventListener("click", () => {
  if (!mobileNav.classList.contains("hidden")) toggleMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mobileNav.classList.contains("hidden"))
    toggleMenu();
});
// Ingredient search -> Search page
function go() {
  const q = $("search-recipe").value.trim();
  location.href = "search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
}
$("find-btn").addEventListener("click", go);
$("search-recipe").addEventListener("keydown", (e) => {
  if (e.key === "Enter") go();
});
document.querySelectorAll("[data-open]").forEach((c) =>
  c.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openRecipe(c.dataset.open);
  }),
);
