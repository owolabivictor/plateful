# Plateful
HTML5, CSS Flexbox/Modals, Vanilla JS (Fetch API / Recipe JSON, LocalStorage).

**Recipes:** 36 local recipes in `recipes.json` (always loaded, work offline) plus about 150 more fetched
from the free TheMealDB API (no key or sign-up). The online recipes are cached in LocalStorage for 24 hours.
If the API is unreachable, the local recipes are used.

Open `index.html` with VS Code **Live Server** (or `python -m http.server 8000`).
Data from TheMealDB: https://www.themealdb.com/api.php
