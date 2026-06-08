# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A single-page meal decision tree app. The user answers up to 6 questions and gets recipe suggestions. There is no build step, no framework, no package manager — it's plain HTML, CSS, and vanilla JS.

## Running the app

Open `index.html` directly in a browser by double-clicking it — no server needed. The recipe and question data is embedded directly in `app.js` (not loaded via `fetch`), so it works as a plain `file://` page.

If a server is needed for testing: `python3 -m http.server 8000` then open `http://localhost:8000`.

## Architecture

Everything runs in a single IIFE in `app.js`. There is no module system.

**Data — two embedded sources:**
- `BUILTIN_RECIPES` — array of recipe objects defined at the top of `app.js`
- `BUILTIN_TREE` — the 6 decision-tree questions, also embedded in `app.js`
- `recipes.json` and `tree.json` still exist as reference files but are **not loaded at runtime** — the data lives in `app.js`

**User data** is persisted to `localStorage` under the key `mealAppUserData`. It holds ratings, notes, removed recipe IDs, the weekly plan, custom recipes, and the Spoonacular API key. The `userData` object is loaded on init and written back on every change via `saveUserData()`.

**Screen system:** All screens exist in the HTML simultaneously as `.screen` divs. `showScreen(name)` removes `active` from all and adds it to `#screen-{name}`. The active `state.screen` string tracks where the user is. Screens: `landing`, `question`, `results`, `browse`, `planner`, `add-recipe`, `recipe`, `shopping`, `settings`, `error`.

**Filtering pipeline (`filterRecipes`):**
1. Starts from `eligibleForSuggestions()` (all recipes minus removed and 1-star rated)
2. Applies each answered question's `filterLogic` against the recipe's corresponding field
3. If fewer than 3 results and `allowRelax` is true, calls `relaxFilters()` which drops filters one-by-one in a fixed priority order until ≥3 recipes remain

**Filter logic types** (defined per question in `BUILTIN_TREE`):
- `match-or-any` — exact match, or either side is `"any"`
- `overlap` — array intersection (used for multi-select questions like mood)
- `match` — strict equality
- `match-or-below` — for effort levels (`low` ≤ `medium` ≤ `high`)
- `subset` — all selected dietary tags must be present on the recipe
- `boolean-filter-if-true` — only filters if the answer is `"yes"`

## Recipe schema

Each recipe object (in `BUILTIN_RECIPES` or `userData.customRecipes`) has:

```
id, name, source, sourceUrl, cuisine, effort, mood[], time, meal,
dietary[], keyIngredients[], pantryFriendly, season[], description, notes,
ingredients[], method[]
```

- `ingredients[]` — full ingredient list with quantities, e.g. `["400g tinned tomatoes", "2 garlic cloves"]`. Empty array `[]` if not stored.
- `method[]` — step-by-step instructions, one string per step. Empty array `[]` if not stored.
- Custom recipes added via the form also have `custom: true`.
- Web recipes fetched from Spoonacular have `web: true` (temporary — stripped when saved to collection).

Valid enum values:
- `cuisine`: mediterranean, east-asian, south-asian, mexican, italian, middle-eastern, american, french, other
- `effort`: low, medium, high
- `mood`: comforting, fresh, impressive, quick-fix, adventurous
- `meal`: breakfast, lunch, dinner, snack, any
- `dietary`: vegetarian, vegan, gluten-free, dairy-free

## Adding recipes — `/add` command

The preferred way to add a built-in recipe is the `/add` slash command. The user pastes raw recipe text (from any source) and Claude extracts all fields — including `ingredients[]`, `method[]`, and all tags — and appends the object to `BUILTIN_RECIPES` in `app.js`.

The command definition lives at `.claude/commands/add.md`.

Recipes added this way appear immediately in the decision tree, browse, planner, and recipe detail screen.

## Recipe detail screen (`#screen-recipe`)

Tapping any recipe card opens a full-screen detail view (`showRecipeDetail(id)`). It shows:
- All metadata pills (time, cuisine, effort, meal, mood, dietary)
- Description
- Ingredients list (if `ingredients[]` is populated) with a metric/imperial toggle next to the heading
- Numbered method steps (if `method[]` is populated)
- External link (always shown when `sourceUrl` exists, labelled "View on [source]" if full content is stored, "View recipe →" if not)
- Action row (ratings, notes, edit/remove)

`state.detailFromScreen` tracks which screen opened the detail so the back button returns correctly. `state.currentDetailId` holds the id of the currently displayed recipe so the unit toggle can re-render ingredients without reopening the screen.

## Web recipe discovery (Spoonacular)

After the decision tree completes, the results screen automatically fetches matching recipes from the Spoonacular API and shows them in a "New ideas from the web" section.

- The API key is stored in `userData.apiKey` (entered in Settings, never hardcoded).
- `buildWebQuery(answers)` maps decision-tree answers to Spoonacular `complexSearch` params.
- `fetchWebRecipes(answers, cb)` fetches and calls back with normalised recipe objects.
- `normalizeSpoonacular(r, answers)` maps Spoonacular fields to the app's recipe schema.
- Web recipe cards show a "＋ Save to my recipes" button; `saveWebRecipe()` strips the `web` flag, sets `custom: true`, and pushes to `userData.customRecipes`.
- If no key is set, a prompt to add one in Settings is shown instead.

## Visual design — ceramic tile frames

Each recipe card has a decorative ceramic tile frame (Mediterranean/Middle-Eastern style). The implementation uses CSS `::before`/`::after` pseudo-elements:

- `::before` — repeating mosaic tile background covers the whole card (`background-size: 52px 52px; background-position: center` for symmetry)
- `::after` — cream inner panel (`inset: 28px`) sits on top, leaving the tile ring visible
- Card children have `position: relative; z-index: 2` to float above both pseudo-elements

**Tile images** live in `images/tiles/` and are named `t1.jpg`, `t2.jpg` … `tN.jpg` in sequence.

**Managing the tile set:**
- `TILE_COUNT` near the top of `app.js` controls how many tiles are active.
- To add tiles: drop new files named `t(N+1).jpg` etc. into `images/tiles/`, increase `TILE_COUNT`, and add matching CSS rules at the bottom of `style.css` (one `::before { background-image }` rule per new tile index).
- To remove tiles from the end: delete the files and decrease `TILE_COUNT`. Remove the corresponding CSS rules too.
- Tiles must be named in sequence with no gaps.

**Per-tile CSS rules** at the bottom of `style.css` follow this pattern:
```css
.recipe-card.tile-0::before  { background-image: url("images/tiles/t1.jpg"); }
.recipe-card.tile-1::before  { background-image: url("images/tiles/t2.jpg"); }
/* ... one rule per tile index ... */
```

**Tile assignment** — `tileIndexForRecipe(id)` in `app.js` hashes the recipe ID so the same recipe always gets the same tile regardless of render order.

**Recipe title font** — `.recipe-name` uses *Lora italic* (Google Fonts), loaded via `<link>` in `index.html`. Requires an internet connection; falls back to serif if offline.

## Key things to keep in mind

**Adding/editing built-in recipes:** Use `/add` (paste recipe text) or edit `BUILTIN_RECIPES` directly in `app.js`. The `recipes.json` file is a now-unused reference copy — it has no effect on the running app.

**Adding/editing questions:** Edit `BUILTIN_TREE` in `app.js`. The `tree.json` file is likewise an unused reference copy.

**The `season` field** is stored on recipes but currently unused by any filter — there is no season question in the tree.

**Weekly planner** stores data keyed by ISO date string (`YYYY-MM-DD`) for the current Mon–Sun week. `pruneOldPlan()` removes any keys outside the current week on every planner open.

**Shopping list** (`#screen-shopping`, opened via "🛒 Make shopping list" on the planner) is generated from all recipes planned into the week. `buildShoppingList()` gathers each recipe's ingredients via `getRecipeIngredients()` (priority: `userData.ingredientOverrides[id]` → `recipe.ingredients` → none), then `parseIngredient()` + `combineIngredients()` sum amounts across recipes (best-effort: same units sum, mismatches list side-by-side; quantities render as fractions via `formatQty`). Items are split into a **main list** and a **Staples** section using the `STAPLES` array. Recipes with no stored ingredients appear in a "needs ingredients" section with a source link and a paste box; pasted lines are saved to `userData.ingredientOverrides` (which also enriches the recipe detail screen). Tick state (`userData.shopping.checked`) and user-added extras (`userData.shopping.extras`) persist in localStorage. "Copy list" uses `navigator.clipboard` with an `execCommand` fallback for `file://`.

**Metric/Imperial toggle** — an iOS-style toggle (app colour scheme, not Apple green) present in two places:
- **Shopping list header** — controls `shoppingUnitMode` (non-persisted, default `"metric"`), applied in `combineIngredients()` via `applyUnitMode()` after quantities are summed.
- **Recipe detail screen**, next to the "Ingredients" heading — controls `recipeUnitMode` (non-persisted, default `"metric"`), applied in `renderDetailIngredients()`.

Both toggles reset to metric each time the screen opens. `applyUnitMode(parsed, mode)` takes an explicit mode argument so both screens share the same conversion logic.

Conversions: g ↔ oz, kg ↔ lb (lb < 1 kg converts to g rather than kg for readability), ml ↔ fl oz, l/cup ↔ ml (1 cup = 240 ml). **Never converts** tbsp, tsp, pinch, handful, bunch, slice, clove. `convertInlineUnits(text, mode)` additionally converts unit amounts buried inside parentheses in ingredient text, e.g. `(about 1 pound)` → `(about 454 g)`.

**Ingredient key normalisation** (in `parseIngredient`) — when grouping duplicates, the key strips: parentheticals `(optional)`, trailing `for serving`/`to serve`, prep adjectives (`cooked`, `frozen`, `sticky`, etc.), variety adjectives (`white`, `brown`, `jasmine`, etc.), and `"A or B"` alternates (keeps the part after `or`). When multiple items with no numeric quantity share a key, the shortest raw string is shown as the representative.

**Leftover suggestions** (`suggestByIngredientOverlap`) scores recipes by how many non-staple `keyIngredients` they share with the shortlisted/planned recipes. `STAPLES` at the top of `app.js` defines which ingredients to ignore — currently: olive oil, oil, salt, pepper, black pepper, butter, sugar, water, eggs, herbs. Garlic and onion are intentionally **not** in STAPLES so they appear on the shopping list.

**GitHub / publishing:** The API key is never in source files — safe to push. Exported backup JSON files contain the key and are gitignored. See `.gitignore`.
