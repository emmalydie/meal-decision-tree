# What Should I Eat?

A simple decision tree that helps you figure out what to cook by asking a few questions and suggesting recipes.

## How to use

1. Open `index.html` in **Firefox** (just double-click the file)
2. From the home screen:
   - **Help me decide** — answer a few questions and get 2-3 suggestions
   - **Surprise me** — a random recipe
   - **Browse all recipes** — search and filter everything
   - **Plan my week** — drag recipes onto days of the week
   - **Add a recipe** — create your own (see below)

> **Note:** Chrome and Safari block local file loading. If you want to use Chrome, open Terminal, navigate to this folder, and run:
> ```
> python3 -m http.server
> ```
> Then open `http://localhost:8000` in your browser.

## Making it yours (ratings, notes, removing)

Every recipe card has a little toolbar at the bottom:

- **★ Stars** — rate a recipe. Higher-rated recipes show up first in suggestions; 1-star recipes stop being suggested (but you can still find them in Browse). Click a star to set the rating; click the same star again to clear it.
- **✎ Add note** — your personal tweaks ("swap ghee for olive oil", "double the chilli"). Kept separate from the recipe's own notes.
- **✕ Remove** — hide a recipe you dislike. A 5-second **Undo** appears if you change your mind; after that it's gone from suggestions, browse, and the planner.

All of this saves automatically in your browser.

## Adding your own recipes (the easy way)

Click **Add a recipe** on the home screen (or the **+ Add a recipe** button in Browse). Fill in the form — name, cuisine, effort, ingredients, etc. — and press **Save**. It appears everywhere immediately, and you can **Edit** or **Delete** it later from its card.

No file editing needed — recipes you add this way are saved in your browser and included in backups.

## Discovering new recipes from the web

When you finish the **Help me decide** questions, the app can also suggest brand-new recipes pulled from the internet that match your answers — shown in a "New ideas from the web" section beneath your own recipes. Each one has a **＋ Save to my recipes** button that adds it to your collection (where you can then rate, note, and browse it like any other recipe).

This uses [Spoonacular](https://spoonacular.com/food-api), a free recipe service. To turn it on:

1. Sign up for a free account at [spoonacular.com/food-api](https://spoonacular.com/food-api) and copy your **API key**.
2. In the app, open **Settings ⚙️** (top-right), paste the key into the **Discover new recipes** box, and press **Save key**.

That's it — the next time you run the decision tree, you'll see fresh ideas. The free tier allows ~150 lookups per day, which is plenty for personal use. Until you add a key, the app works exactly as before with just your own recipes.

> **Your key stays private.** It's saved only in your own browser, never in the code — so this project is safe to publish to GitHub. Anyone else who uses your published app simply enters their own free key. (Just don't commit your exported backup files, since those *do* contain your key — the included `.gitignore` already excludes them.)

## Backing up your data

Your ratings, notes, removed recipes, weekly plans, and added recipes live in your browser. To keep them safe (or move to another computer):

1. Click the **⚙ gear** in the top-right corner → **Settings & Backup**
2. **Export backup** downloads a `.json` file — keep it somewhere safe
3. **Import backup** restores everything from a file you previously exported

## Adding recipes by editing the file (optional / advanced)

You don't need this — the in-app form is easier. But if you ever want to bulk-add recipes:

1. Open `recipes.json` in a text editor (VS Code is great, or TextEdit in **plain text mode**: Format → Make Plain Text)

2. Scroll to the bottom of the file. You'll see the last recipe ends with `}` followed by `]`

3. Add a comma after the last `}`, then paste this template:

```json
  {
    "id": "your-recipe-name",
    "name": "Your Recipe Name",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 45,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["ingredient1", "ingredient2", "ingredient3"],
    "pantryFriendly": false,
    "season": [],
    "description": "A short description of the dish.",
    "notes": ""
  }
```

4. Fill in each field using the values below

5. Save the file and refresh the browser

### Field reference

| Field | What to put |
|-------|------------|
| `id` | A unique short name, lowercase with hyphens (e.g. `my-pasta-dish`) |
| `name` | The display name |
| `source` | `"Ottolenghi"`, `"Woks of Life"`, `"NYT Cooking"`, `"Personal"`, or anything |
| `sourceUrl` | Link to the recipe online, or `""` if you don't have one |
| `cuisine` | `"mediterranean"`, `"east-asian"`, `"south-asian"`, `"mexican"`, `"italian"`, `"middle-eastern"`, `"american"`, `"french"`, or `"other"` |
| `effort` | `"low"` (under 30 min), `"medium"` (30-60 min), or `"high"` (60+ min) |
| `mood` | One or more of: `"comforting"`, `"fresh"`, `"impressive"`, `"quick-fix"`, `"adventurous"` |
| `time` | Total minutes (number, no quotes) |
| `meal` | `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`, or `"any"` |
| `dietary` | Any of: `"vegetarian"`, `"vegan"`, `"gluten-free"`, `"dairy-free"` — or `[]` for none |
| `keyIngredients` | 3-8 main ingredients |
| `pantryFriendly` | `true` or `false` (no quotes) |
| `season` | `["spring", "summer", "fall", "winter"]` or `[]` for year-round |
| `description` | 1-2 sentences shown on the card |
| `notes` | Personal notes, or `""` |

### Common mistakes

- **Missing comma** between recipes — make sure there's a `,` after the `}` of every recipe except the very last one
- **Extra comma** after the last recipe before `]` — remove it
- **Curly quotes** — TextEdit sometimes converts `"` to `"`. Use plain text mode or VS Code
- **Wrong field name** — double-check spelling matches exactly

If something goes wrong, the app will show an error message telling you what's broken.

## How the decision tree works

The app asks you 6 questions in order. Each answer filters the recipe list. You can skip any question to keep more options open, or go back to change an answer.

After all questions, you get 2-3 "top picks" as featured cards. If your answers were very specific and fewer than 3 recipes match perfectly, the app relaxes your filters to include some "wildcard" suggestions. Higher-rated recipes are favoured, and ones you've removed or rated 1-star are left out.

## How the weekly planner works

1. Open **Plan my week**
2. Search for recipes and click them to build a **shortlist**
3. **Drag** a shortlisted recipe onto a day (Mon–Sun of the upcoming week). Drag between days to reschedule, or click the **✕** on a placed recipe to remove it
4. The **"Use up your ingredients"** panel suggests recipes that share ingredients with your picks — so if two recipes both use cauliflower, you can cook them the same week and nothing goes to waste

Your plan saves automatically and shows the current week each time you open it.

## Files

- `index.html` — the main page
- `style.css` — visual styling
- `app.js` — all the logic
- `recipes.json` — the built-in recipes (optional to edit)
- `tree.json` — the question definitions (you can tweak these too)

Your personal data (ratings, notes, removed recipes, weekly plans, and recipes you add) is stored in your browser, **not** in these files. Use **Settings → Export backup** to save it.
