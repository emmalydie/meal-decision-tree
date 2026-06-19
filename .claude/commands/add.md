The user wants to add a new recipe to the meal decision tree app. They will either paste raw recipe text or share a screenshot or photo of the recipe (from a website, cookbook, handwritten card, or anywhere else). If they share an image, read it carefully before extracting fields — zoom in mentally on ingredient lists and method steps, which are often small or dense. If part of the image is cut off or illegible, note what's missing rather than guessing.

Your job is to:

1. **Extract** all of the following fields from the pasted text:
   - `id` — a short kebab-case slug, e.g. `"nigella-chocolate-cake"` (source-name + dish-name, lowercase, hyphens)
   - `name` — the recipe title as written
   - `source` — the author, website, or book name (e.g. `"Nigella Lawson"`, `"NYT Cooking"`, `"Personal"`)
   - `sourceUrl` — the URL if one is present in the text, otherwise `""`
   - `cuisine` — one of: `mediterranean`, `east-asian`, `south-asian`, `mexican`, `italian`, `middle-eastern`, `american`, `french`, `other`
   - `effort` — `"low"` (under 30 min), `"medium"` (30–60 min), or `"high"` (60+ min), inferred from cooking time
   - `mood` — array of any that apply: `"comforting"`, `"fresh"`, `"impressive"`, `"quick-fix"`, `"adventurous"`
   - `time` — total time in minutes as a number
   - `meal` — one of: `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`, `"dessert"`, `"drinks"`, `"any"`
   - `dietary` — array of any that apply: `"vegetarian"`, `"vegan"`, `"gluten-free"`, `"dairy-free"`
   - `keyIngredients` — array of 4–8 main ingredient names (lowercase, no quantities), e.g. `["aubergine", "tahini", "lemon"]`
   - `pantryFriendly` — `true` if makeable from common storecupboard items, otherwise `false`
   - `season` — array of any that apply: `"spring"`, `"summer"`, `"fall"`, `"winter"` — leave `[]` if year-round
   - `description` — one or two sentences summarising the dish (write your own if none is given)
   - `notes` — any useful tips from the recipe text (e.g. "add chilli to taste"), or `""`
   - `ingredients` — full ingredients list as an array of strings, one per item, with quantities, e.g. `["400g tinned tomatoes", "2 cloves garlic", "1 tsp cumin"]`
   - `method` — step-by-step instructions as an array of strings, one step per item

2. **Add** the recipe object to the `BUILTIN_RECIPES` array in `app.js`, at the end of the array (just before the closing `];`).

3. **Confirm** by telling the user: the recipe name, the tags you assigned (cuisine, mood, dietary, effort), and that it's been added.

If any field genuinely cannot be determined from the text, use a sensible default (`[]` for arrays, `""` for strings, `false` for booleans) and mention it to the user so they can correct it.
