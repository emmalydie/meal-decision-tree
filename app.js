(function () {
  "use strict";

  var STORAGE_KEY = "mealAppUserData";
  var DATA_VERSION = 1;
  // Common staples ignored when matching recipes by shared ingredients,
  // so leftover suggestions stay meaningful.
  var STAPLES = [
    "olive oil", "oil", "salt", "pepper", "black pepper",
    "butter", "sugar", "water", "eggs", "herbs"
  ];

  // Ceramic tile images used as decorative card frames (images/tiles/).
  // To add tiles: drop t34.jpg, t35.jpg etc. into images/tiles/ and increase TILE_COUNT.
  // To remove tiles from the end: decrease TILE_COUNT.
  // Tiles must be named t1.jpg, t2.jpg ... tN.jpg with no gaps.
  var TILE_COUNT = 45;
  var TILE_FRAMES = (function () {
    var frames = [];
    for (var i = 1; i <= TILE_COUNT; i++) { frames.push("t" + i + ".jpg"); }
    return frames;
  }());

  // Simple string hash so a recipe always maps to the same tile.
  function tileIndexForRecipe(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) {
      h = (h * 31 + id.charCodeAt(i)) & 0xffff;
    }
    return h % TILE_FRAMES.length;
  }

  // Returns an array of tile indices for an ordered list of recipe IDs,
  // ensuring no two tiles within a window of 2 are the same (covers 2-column grids).
  function assignTilesNoAdjacent(ids) {
    var result = [];
    for (var i = 0; i < ids.length; i++) {
      var preferred = tileIndexForRecipe(ids[i]);
      var recent = result.slice(Math.max(0, result.length - 2));
      if (recent.indexOf(preferred) === -1) {
        result.push(preferred);
      } else {
        var chosen = preferred;
        for (var offset = 1; offset < TILE_FRAMES.length; offset++) {
          var candidate = (preferred + offset) % TILE_FRAMES.length;
          if (recent.indexOf(candidate) === -1) { chosen = candidate; break; }
        }
        result.push(chosen);
      }
    }
    return result;
  }

  var BUILTIN_RECIPES = [
  {
    "id": "nyt-chicken-florentine",
    "name": "Chicken Florentine",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["comforting", "impressive"],
    "time": 30,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["chicken", "spinach", "cream cheese", "white wine", "parmesan", "shallot", "heavy cream"],
    "pantryFriendly": false,
    "season": [],
    "description": "Golden pan-fried chicken breasts smothered in a buttery white-wine and cream cheese sauce with wilted spinach. Elegant enough to impress, easy enough for a weeknight.",
    "notes": "Crusty bread is a must for soaking up the sauce. Swap spinach for sun-dried tomatoes, mushrooms, or canned artichokes.",
    "ingredients": [
      "¼ cup all-purpose flour",
      "¼ cup grated Parmesan, plus more for serving",
      "Salt and black pepper",
      "4 thin-cut boneless skinless chicken breasts (about 1 pound)",
      "1 tablespoon olive oil",
      "4 tablespoons butter",
      "1 medium shallot, minced",
      "2 garlic cloves, minced",
      "½ cup dry white wine",
      "½ cup chicken broth",
      "1 teaspoon dried basil (or 1 tablespoon fresh)",
      "1 teaspoon dried oregano (or 1 teaspoon fresh)",
      "½ cup heavy cream",
      "2 ounces cream cheese, at room temperature",
      "2 cups packed baby spinach (about 3 ounces)"
    ],
    "method": [
      "Mix together the flour, Parmesan and 1 tsp each salt and pepper on a plate. Dredge each chicken breast in the mixture, coating evenly on both sides.",
      "Heat a large pan over medium. Add the olive oil and 2 tbsp butter and melt together. Add the chicken and cook until golden brown but not cooked through, about 4 minutes per side. Remove chicken and set aside.",
      "Add the remaining 2 tbsp butter to the pan and melt. Add the shallot, garlic and a pinch of salt and cook, stirring, until softened and aromatic, about 2 minutes.",
      "Add the wine, broth, basil and oregano. Stir, scraping up the browned bits, until the liquid has reduced by about half, 3–4 minutes. Add the heavy cream and cream cheese and stir until the cream cheese melts into a thick sauce, about 6 minutes. Add the spinach and stir until it wilts into the sauce, about 1 minute.",
      "Return the chicken to the pan and simmer until cooked through, 4–5 minutes. Serve immediately with freshly grated Parmesan on top."
    ],
    "servings": 4
  },
  {
    "id": "nyt-chicken-piccata-pasta",
    "name": "Chicken Piccata Pasta",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "medium",
    "mood": ["comforting", "quick-fix"],
    "time": 40,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["chicken", "farfalle pasta", "butter", "lemon", "capers", "shallot"],
    "pantryFriendly": false,
    "season": [],
    "description": "A quick, buttery weeknight pasta with bright lemon and briny capers, capitalizing on the flavors of Italian-American chicken piccata. Flour-tossed chicken is browned in butter, then folded through a silky lemon-caper sauce and bow tie pasta.",
    "notes": "Any short pasta works in place of farfalle. Tossing the chicken in flour deepens flavor and thickens the sauce. Stir in a handful of spinach or peas near the end for color. Good with dressed peppery greens on the side.",
    "ingredients": [
      "Salt and black pepper",
      "12 ounces bow tie (farfalle) or other short pasta",
      "1¼ to 1½ pounds boneless, skinless chicken breasts or thighs",
      "¼ cup all-purpose flour, plus more if necessary",
      "6 tablespoons unsalted butter, divided",
      "1 tablespoon extra-virgin olive oil",
      "1 large shallot, chopped",
      "4 garlic cloves, chopped",
      "1½ cups chicken stock",
      "¼ cup lemon juice (from 1 to 2 lemons)",
      "2 tablespoons drained capers",
      "Roughly chopped parsley, for serving"
    ],
    "method": [
      "In a large pot of salted boiling water, cook pasta according to package instructions until al dente. Reserve ½ cup cooking water, then drain pasta.",
      "Meanwhile, cut the chicken into ½-inch chunks and place in a bowl. Season with salt and pepper, then toss with the flour to coat, adding more flour if needed. (If pieces stick together, they can be separated while cooking.)",
      "In a large skillet, heat 2 tablespoons butter and the olive oil over high. Once the butter is melted and bubbling, add the chicken, working in batches if necessary to avoid crowding and promote browning. Cook, stirring occasionally to break apart any stuck pieces, until cooked through with some golden spots, transferring cooked pieces to a plate as they finish.",
      "Reduce heat to medium-high. Add the shallot and garlic and cook, stirring occasionally, until softened and fragrant, 1 to 2 minutes. Add the stock and simmer until reduced by half, 3 to 5 minutes. Lower the heat and stir in the remaining 4 tablespoons butter, the lemon juice and the capers.",
      "Season the sauce with salt and pepper to taste, then return the chicken to the skillet. Add the pasta and toss very well to coat (stir in splashes of reserved pasta water if more sauce is desired), then take the skillet off the heat. Serve topped with parsley and more black pepper."
    ],
    "servings": 4
  },
  {
    "id": "nyt-miso-mushroom-leek-pasta",
    "name": "Miso Mushroom and Leek Pasta",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 40,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["mushrooms", "leeks", "white miso", "parmesan", "short pasta", "sherry vinegar"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "An earthy, umami-rich pasta where miso and sherry vinegar amplify the savory notes of browned mushrooms and sautéed leeks. Miso whisked with starchy pasta water and Parmesan forms a quick, glossy sauce to coat the noodles in just over 30 minutes.",
    "notes": "Farro, spelt or whole-wheat pasta nicely complements the earthy flavors. Balsamic works in place of sherry vinegar. For crisper mushrooms, brown them without salt. Some cooks prefer ¾ pound pasta for a higher veg-to-pasta ratio.",
    "ingredients": [
      "Salt",
      "2 tablespoons olive oil, plus more as needed",
      "2 medium leeks, trimmed, white and light green parts thinly sliced (about 2 cups)",
      "1½ pounds mushrooms (such as cremini, shiitake and/or oyster), stemmed and sliced",
      "1 pound short pasta, such as ziti or cavatappi",
      "2 tablespoons white miso",
      "¾ cup grated Parmesan, plus more for garnishing",
      "1 tablespoon sherry or red wine vinegar, plus more to taste",
      "1 tablespoon chopped parsley leaves and tender stems"
    ],
    "method": [
      "Bring a large pot of salted water to a boil.",
      "Meanwhile, heat 2 tablespoons oil in a Dutch oven or deep 12-inch skillet over medium-high until shimmering. Add the leeks, season with salt and cook, stirring often, until softened, about 5 minutes. If they look dry, add a drizzle of oil.",
      "Add the mushrooms to the leeks, season lightly with salt, and cook, stirring every 2 minutes, until the mushrooms have browned, about 10 minutes. (If done before the pasta, adjust the heat to low.)",
      "When the water is ready, add the pasta and cook until al dente. Halfway through cooking, reserve 1 cup of water and let cool slightly. Drain the pasta and drizzle with olive oil if done before the mushrooms.",
      "When both the mushrooms and pasta are done, stir the miso into the reserved pasta water until mostly dissolved. Add it to the skillet over medium-high heat along with the pasta, cheese and vinegar, stirring vigorously until a cheesy sauce forms and coats the noodles, 1 to 2 minutes. Remove from heat and season to taste with more vinegar if needed.",
      "Garnish with the parsley and more cheese; serve with a final drizzle of oil."
    ],
    "servings": 4
  },
  {
    "id": "nyt-extra-green-pasta-salad",
    "name": "Extra-Green Pasta Salad",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["fresh"],
    "time": 30,
    "meal": "lunch",
    "dietary": ["vegetarian"],
    "keyIngredients": ["short pasta", "spinach", "basil", "sugar snap peas", "white miso", "parmesan", "lemon"],
    "pantryFriendly": false,
    "season": ["spring", "summer"],
    "description": "A vibrant pasta salad that gets its bright green color from a blended spinach-and-basil purée, with miso lending a salty, almost Parmesan-like depth. Tossed with snap peas and English peas, it can be eaten right away or chilled for a picnic.",
    "notes": "Swap spinach for arugula for a peppery finish, or mix in mint with the basil. If making a day ahead, hold the basil garnish and cheese until serving. Use chickpea pasta to make it gluten-free.",
    "ingredients": [
      "Salt and pepper",
      "1 pound short-cut pasta (such as rigatoni, campanelle or fusilli)",
      "3 cups/8 ounces sugar snap peas",
      "1 cup frozen English peas",
      "3 packed cups/3½ ounces baby spinach",
      "2 packed cups/1½ ounces basil leaves, plus more for serving",
      "½ cup extra-virgin olive oil",
      "2 tablespoons white miso",
      "1 garlic clove, crushed",
      "Zest and juice from 1 lemon",
      "4 ounces Parmesan (or other firm salty cheese, such as feta or aged Gouda), thinly sliced"
    ],
    "method": [
      "Bring a large pot of water to a boil, then throw in a handful of salt. Add the pasta, give it a stir and cook until al dente. Just before draining, add the snap peas and English peas to the boiling water to barely soften, 20 to 30 seconds. Drain the pasta and peas, and rinse lightly with cold water; set aside.",
      "While the pasta water comes to a boil, place the spinach, basil, oil, miso, garlic, and lemon zest and juice in a blender. Blend to a bright green purée. Taste and adjust seasoning with salt and a few grinds of pepper, then blend again.",
      "Transfer the purée to a large bowl big enough to toss all the pasta. Add the pasta and peas, and toss until coated. Season to taste with salt and pepper. Add the Parmesan and more basil leaves. Toss once more before serving."
    ],
    "servings": 6
  },
  {
    "id": "nyt-miso-honey-chicken-asparagus",
    "name": "Miso-Honey Chicken and Asparagus",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["quick-fix"],
    "time": 20,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["chicken thighs", "asparagus", "white miso", "honey", "soy sauce", "ginger", "scallions"],
    "pantryFriendly": false,
    "season": ["spring"],
    "description": "A fast sheet-pan dinner where chicken thighs are marinated in a punchy miso-honey glaze loaded with garlic, ginger and hot sauce, then broiled alongside asparagus until charred. The reserved marinade doubles as a sauce to spoon over everything.",
    "notes": "Use tamari to keep it gluten-free. Reduce the soy sauce if you're sensitive to salt — some find it too salty as written. Broccolini works in place of asparagus. Don't marinate longer than 30 minutes or the chicken may dry out. Serve over steamed rice.",
    "ingredients": [
      "3 tablespoons white miso",
      "3 tablespoons mild honey",
      "3 tablespoons soy sauce or tamari",
      "1 tablespoon rice vinegar",
      "2 teaspoons finely grated fresh ginger",
      "2 teaspoons finely grated garlic",
      "2 teaspoons chile-garlic sauce or other hot sauce",
      "1 tablespoon plus 2 teaspoons neutral oil",
      "1½ to 2 pounds boneless, skinless chicken thighs",
      "1 large bunch asparagus (about 1 pound), trimmed",
      "Salt and pepper",
      "2 scallions, thinly sliced",
      "Cooked rice (optional), for serving"
    ],
    "method": [
      "Make the marinade: In a bowl, whisk together the miso, honey, soy sauce, rice vinegar, ginger, garlic, chile-garlic sauce, 1 tablespoon oil and 1 tablespoon water. Refrigerate half the marinade for serving.",
      "Place the chicken in a shallow dish or zip-top bag and pour the remaining marinade over the top. Toss until coated and let marinate in the refrigerator for up to 30 minutes. (A longer marinade may dry out the chicken.)",
      "When ready to cook, heat the broiler with a rack set 6 inches below it. Line a large baking sheet with aluminum foil. Remove the chicken from the marinade, scraping off and discarding any excess. Place the chicken in a single layer on one side of the baking sheet, flatter side up. Place the asparagus on the other side, drizzle with remaining oil, season and toss to coat.",
      "Broil until the chicken is cooked through with some charred spots and the asparagus is browned, about 10 minutes.",
      "To serve, top the chicken with a drizzle of the reserved marinade and a sprinkle of scallions. Serve with rice, if desired."
    ],
    "servings": 4
  },
  {
    "id": "nyt-lemony-greek-chicken-spinach-potato-stew",
    "name": "Lemony Greek Chicken, Spinach and Potato Stew",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "fresh"],
    "time": 35,
    "meal": "dinner",
    "dietary": ["gluten-free"],
    "keyIngredients": ["ground chicken", "yukon gold potatoes", "spinach", "lemon", "dill", "garlic", "feta"],
    "pantryFriendly": false,
    "season": [],
    "description": "A brothy, one-pot meal-in-a-bowl stew brightened with lemon, garlic and lots of herbs. Ground chicken delivers big flavor fast, with potatoes and spinach simmered until tender and finished with crumbled feta and crushed pita chips.",
    "notes": "Ground turkey or pork work just as well. Mature or frozen spinach is better than baby spinach here (less tannic); kale is another option. Swap dill for parsley or mint if preferred. Some find 1 tsp red-pepper flakes too spicy — reduce to taste. Great leftovers. Skip the pita chips to keep it gluten-free.",
    "ingredients": [
      "¼ cup extra-virgin olive oil",
      "1 red or yellow onion, finely chopped",
      "8 large garlic cloves, smashed and finely chopped",
      "1½ teaspoons coarse kosher salt, plus more to taste",
      "1 pound ground chicken",
      "1 heaping tablespoon roughly chopped fresh rosemary (or 1½ teaspoons dried rosemary)",
      "1½ teaspoons dried oregano",
      "1 teaspoon red-pepper flakes",
      "Black pepper",
      "1½ pounds Yukon gold potatoes (about 3 medium), scrubbed and chopped into ½-inch chunks",
      "6 cups chicken broth",
      "Juice of 1 large lemon (about ¼ cup juice)",
      "1 (8-ounce) bunch mature spinach, stems included, chopped, or 1½ cups frozen leaf spinach",
      "¼ to ⅓ cup lightly packed roughly chopped dill",
      "Crumbled feta and crushed pita chips, for topping"
    ],
    "method": [
      "In a large pot or Dutch oven, warm the oil over high heat. Add the onion, garlic and salt and cook, stirring, until softened and just starting to brown, 5 minutes. (Decrease the heat to medium-high if necessary to prevent scorching.)",
      "Decrease the heat to medium-high and add the chicken, rosemary, oregano, red-pepper flakes and several generous grinds of black pepper. Cook, breaking up the chicken into crumbles, until it starts to lose its pink translucency, about 2 minutes. Add the potatoes and stir to combine. Add the chicken broth and half the lemon juice, scraping up any browned bits. Bring to a rolling boil, then lower the heat to maintain a very brisk simmer. Simmer until the potatoes are nearly tender, 15 minutes.",
      "Add the spinach and dill, to taste. Continue to simmer briskly until the potatoes are tender, about 5 minutes more. Taste and add some or all of the remaining lemon juice, plus more salt and pepper if desired. Serve in bowls topped with feta and crushed pita chips."
    ],
    "servings": 4
  },
  {
    "id": "nyt-lemony-chicken-feta-meatball-soup",
    "name": "Lemony Chicken-Feta Meatball Soup With Spinach",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "low",
    "mood": ["comforting", "fresh"],
    "time": 30,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["ground chicken", "feta", "rolled oats", "spinach", "dill", "lemon", "turmeric"],
    "pantryFriendly": false,
    "season": [],
    "description": "Light, tender chicken-feta-and-dill meatballs swim in a lemony, spinach-filled broth. Rolled oats stand in for breadcrumbs in the meatballs, and a little more simmered in the broth thickens it for a comforting yet bright one-pot meal.",
    "notes": "Ground turkey works too (dark meat is best for juiciness). Swap dill for another herb if you're not a fan. For extra brightness, squeeze fresh lemon over leftovers. Some cooks swap the broth oats for 1 cup orzo and bump the broth to 6 cups. Uses oats, so not gluten-free unless using certified GF oats.",
    "ingredients": [
      "1 pound ground chicken or turkey, preferably dark meat",
      "½ cup crumbled feta",
      "¾ cup old-fashioned rolled oats",
      "1 small red onion, halved (½ diced, and ½ grated, then squeezed to remove excess liquid)",
      "⅓ packed cup fresh dill leaves and fine stems, finely chopped",
      "1 tablespoon ground cumin",
      "½ teaspoon plus 1 tablespoon ground turmeric",
      "Kosher salt and black pepper",
      "3 tablespoons olive oil",
      "½ teaspoon red-pepper flakes, plus more for serving",
      "4 cups low-sodium chicken broth or water",
      "4 packed cups baby spinach (about 5 ounces)",
      "2 lemons (1 juiced and 1 cut into wedges for serving)"
    ],
    "method": [
      "In a medium bowl, combine the chicken, feta, ¼ cup oats, the grated onion, most of the dill (reserve about 2 tablespoons for garnish), the cumin, ½ teaspoon turmeric and 1 teaspoon salt. Gently combine without overworking the meat. With lightly wet palms, shape into small balls a little smaller than a golf ball, about 1½ inches. (You'll have about 25.)",
      "Heat the oil in a large Dutch oven or wide pot over medium until shimmering. Add the diced onion, season with salt, and cook until it begins to soften, about 2 minutes. Add the remaining 1 tablespoon turmeric and the red-pepper flakes, and stir until fragrant, about 30 seconds. Push the onions to the sides, then add the meatballs (they'll be close together, that's OK). Cook until browned on two sides, 5 to 7 minutes total.",
      "Pour in the broth and remaining ½ cup oats, then gently tilt the pot side to side to distribute the oats without disturbing the meatballs. Bring to a gentle boil, then reduce the heat to maintain an active simmer. Season with salt. Cook, gently stirring occasionally so nothing sticks, until the oats have softened and the meatballs are cooked through, about 4 minutes more.",
      "Stir in the spinach and lemon juice until the spinach is wilted, about 2 minutes more. Adjust the seasoning to taste. Spoon into bowls, top with pepper and the remaining dill. Serve with lemon wedges."
    ],
    "servings": 4
  },
  {
    "id": "nyt-spicy-turkey-stir-fry-garlic-ginger",
    "name": "Spicy Turkey Stir-Fry With Crisp Garlic and Ginger",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["quick-fix", "adventurous"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["ground turkey", "garlic", "ginger", "fish sauce", "lime", "scallions", "cilantro", "chile"],
    "pantryFriendly": false,
    "season": [],
    "description": "A fast, larb-inspired stir-fry packed with umami from fish sauce and soy, plus heat from red-pepper flakes and fresh chile. Crisp fried garlic and ginger crown deeply browned ground turkey, finished with lime and a shower of fresh herbs.",
    "notes": "Let the turkey get deeply brown — don't stir it too much. Ground pork works in place of turkey (dark meat turkey is juiciest). Serve over rice for a hearty meal or crisp lettuce for something lighter. Use tamari instead of soy sauce to keep it strictly gluten-free. Adjust lime, chile and soy to taste.",
    "ingredients": [
      "2 tablespoons neutral oil, such as safflower or grapeseed",
      "4 garlic cloves, thinly sliced",
      "1 (2-inch) knob ginger, cut into matchsticks",
      "Fine sea salt",
      "2 tablespoons coconut oil or more neutral oil",
      "3 scallions, white and green parts separated, thinly sliced",
      "¼ teaspoon red-pepper flakes, plus more to taste",
      "1 pound ground turkey, preferably dark meat (or use ground pork)",
      "2 tablespoons lime juice, plus more to taste",
      "1 tablespoon fish sauce",
      "½ teaspoon soy sauce, plus more to taste",
      "½ teaspoon sugar or honey (optional)",
      "Cooked sticky or white rice, for serving",
      "⅔ cup cilantro leaves and tender stems, for serving",
      "⅓ cup torn basil leaves (or use more cilantro), for serving",
      "1 fresh bird's-eye or serrano chile, thinly sliced, for serving"
    ],
    "method": [
      "In a cold 12-inch skillet, combine the neutral oil, garlic and ginger. Place over medium heat until sizzling, then continue to cook, stirring frequently, until the garlic and ginger are golden brown, 5 to 7 minutes. Transfer with a slotted spoon to a paper towel-lined plate and sprinkle lightly with salt.",
      "Add the coconut oil to the pan, then stir in the scallion whites and cook until starting to brown, about 2 minutes. Stir in the red-pepper flakes and cook for 1 minute.",
      "Stir in the turkey, raise the heat to medium-high, and cook, breaking up the meat with a spoon, until golden and crisp, about 7 minutes. Don't stir too much, so it can turn deep brown.",
      "Remove the pan from the heat and stir in the lime juice, fish sauce and soy sauce. Taste and add more lime juice, red-pepper flakes, soy sauce, and sugar or honey if you like.",
      "Gently mix about two-thirds of the fried garlic and ginger into the turkey. Serve over rice, topped with cilantro, basil, scallion greens and fresh chile, and garnished with the remaining fried ginger and garlic."
    ],
    "servings": 4
  },
  {
    "id": "nyt-thai-inspired-chicken-meatball-soup",
    "name": "Thai-Inspired Chicken Meatball Soup",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["ground chicken", "coconut milk", "ginger", "cilantro", "fish sauce", "spinach", "lime", "jalapeño"],
    "pantryFriendly": false,
    "season": [],
    "description": "A reviving, cozy one-pot soup of ginger-scented chicken-cilantro meatballs simmered in a fragrant coconut milk broth inspired by tom kha gai. A heap of spinach adds color and a squeeze of lime brings brightness. Serve over rice to make it a full meal.",
    "notes": "Emma's tweaks: double the broth, use ground pork instead of chicken, double the garlic, double the lime juice, and add lime zest to the meatballs. Brothy, so serve over rice or another grain. If meatballs are falling apart, mix in an egg and ½ cup panko (or bake them at 425°F for ~20 minutes). Double the jalapeño for more heat. Generously serves 6. Use gluten-free fish sauce to keep it strictly gluten-free. Great leftovers and kid-friendly.",
    "ingredients": [
      "1 (4-inch) piece fresh ginger, peeled",
      "6 garlic cloves, peeled",
      "1 jalapeño",
      "2 pounds ground chicken",
      "1 large bunch cilantro, leaves and stems finely chopped, a few whole leaves reserved for serving",
      "3 tablespoons fish sauce",
      "Kosher salt",
      "2 tablespoons vegetable or coconut oil, plus more as needed",
      "2 cups chicken broth",
      "1 (14-ounce) can full-fat coconut milk",
      "½ teaspoon granulated sugar",
      "5 ounces baby spinach",
      "1 tablespoon lime juice, plus lime wedges for serving",
      "Steamed white or brown rice, for serving"
    ],
    "method": [
      "Using the small holes of a box grater or a Microplane, grate the ginger, garlic and jalapeño (or finely chop by hand). Transfer half to a large bowl and set the rest aside. To the large bowl, add the chicken, finely chopped cilantro, 2 tablespoons fish sauce and 1 teaspoon salt. Combine with your hands or a fork but do not overmix.",
      "Form into 2-inch meatballs (about 2 ounces each). In a large Dutch oven or pot, heat the oil over medium-high. Working in batches, add the meatballs in a single layer and cook, flipping halfway, until golden brown on two sides, 5 to 8 minutes. Transfer to a plate and repeat, adding oil as needed.",
      "Once all the meatballs are out of the pot, if the oil is burned, wipe it out and add a bit more. Reduce the heat to medium, add the reserved ginger mixture and sauté until fragrant, about 1 minute. Add the chicken broth, coconut milk, sugar and the remaining 1 tablespoon fish sauce, and bring to a simmer. Add the meatballs and any juices, and simmer until the flavors come together and the meatballs are cooked through, 5 to 8 minutes.",
      "Remove from heat and stir in the spinach and lime juice. Divide rice among bowls, then top with meatballs, broth and cilantro. Serve with lime wedges."
    ],
    "servings": 6
  },
  {
    "id": "nyt-italian-wedding-soup",
    "name": "Italian Wedding Soup",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "high",
    "mood": ["comforting"],
    "time": 75,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["ground beef", "ground pork", "parmesan", "carrots", "celery", "spinach", "small pasta", "chicken broth"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "The Italian-American classic — mini beef-and-pork meatballs, small pasta and greens simmered in savory chicken broth and topped with Parmesan. The name comes from a mistranslation of 'minestra maritata,' a soup in which meat and vegetables are 'married' together.",
    "notes": "Emma's tweak: bake the meatballs in the oven instead of pan-frying (try 350°F for ~15 minutes). Cook the pasta separately and add per bowl so it doesn't go mushy in leftovers. Escarole works in place of spinach. Freezer-friendly for up to 3 months. The pasta keeps absorbing liquid as it sits, so add broth when reheating. Forming ~80 mini meatballs is the time sink — the 15-min prep estimate is optimistic.",
    "ingredients": [
      "For the meatballs:",
      "1 large egg",
      "½ pound ground beef",
      "½ pound ground pork",
      "½ cup Italian bread crumbs or panko",
      "⅓ cup grated Parmesan",
      "3 tablespoons chopped fresh parsley",
      "2 large garlic cloves, minced (about 1 tablespoon)",
      "1 teaspoon dried oregano",
      "1 teaspoon kosher salt (such as Diamond Crystal)",
      "½ teaspoon black pepper",
      "Olive oil, for forming the meatballs",
      "For the soup:",
      "3 tablespoons olive oil",
      "1 large yellow onion, chopped (about 2 cups)",
      "3 medium carrots, diced (about 2 cups)",
      "2 to 3 large celery ribs, diced (about 1½ cups)",
      "2 large garlic cloves, minced (about 1 tablespoon)",
      "Kosher salt (such as Diamond Crystal) and black pepper",
      "8 cups (2 quarts) chicken broth, plus more as needed",
      "½ cup acini di pepe, ditalini or orzo",
      "3 cups packed baby spinach",
      "Grated Parmesan, for serving"
    ],
    "method": [
      "Make the meatballs: Crack the egg into a large bowl and beat it lightly with a fork. Add the beef, pork, bread crumbs, Parmesan, parsley, garlic, oregano, salt and pepper. Mix gently but thoroughly until incorporated. Coat your hands with olive oil, then form small meatballs using 1 heaping teaspoon of mixture per meatball; transfer to a plate or sheet pan. You should have about 80 (1-inch) meatballs.",
      "Make the soup: In a large pot or Dutch oven, heat the olive oil over medium heat. When hot, fry the meatballs in 2 batches, turning occasionally, until mostly browned all over, 3 to 4 minutes. Transfer to a paper towel-lined plate.",
      "Add the onion, carrots and celery to the pot and cook, stirring occasionally, until crisp-tender, about 10 minutes. Add the garlic, 1 teaspoon salt (or 2 teaspoons if using low-sodium broth) and ½ teaspoon black pepper. Cook until the garlic is fragrant, about 1 minute.",
      "Return the meatballs to the pot, add the broth and bring to a simmer over medium-high heat. Stir in the pasta, lower the heat and simmer, stirring occasionally, until the pasta is tender, about 10 minutes.",
      "Turn off the heat and stir in the spinach until wilted. Taste and season with salt and pepper if needed (the broth should taste pleasantly salty). Serve hot, topped with Parmesan. The pasta keeps absorbing liquid as it sits, so add broth when reheating. Keeps up to 5 days refrigerated or 3 months frozen."
    ],
    "servings": 6
  },
  {
    "id": "nyt-coconut-fish-tomato-bake",
    "name": "Coconut Fish and Tomato Bake",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 20,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["white fish", "coconut milk", "cherry tomatoes", "ginger", "turmeric", "lime", "cilantro"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "A fast sheet-pan dinner where fish fillets are marinated in a coconut-milk dressing infused with garlic, ginger, turmeric and lime, then roasted and broiled with cherry tomatoes that turn jammy and lend their juices to a silky pan sauce. Inspired by a southern Thai way of cooking fish.",
    "notes": "Works with any fish that looks good — snapper, haddock, striped bass, fluke, sablefish or salmon. Halve the tomatoes so they don't burst in the oven. Add a handful of spinach at the broiling stage for an easy green side. Serve over rice or with crusty bread to sop up the sauce. Time excludes 15–30 min marinating.",
    "ingredients": [
      "¾ cup unsweetened coconut milk",
      "1 (1-inch) piece fresh ginger, scrubbed and finely grated",
      "1 garlic clove, finely grated",
      "½ teaspoon ground turmeric",
      "½ teaspoon red-pepper flakes",
      "1 tablespoon honey",
      "Kosher salt",
      "2 limes",
      "½ cup chopped cilantro",
      "4 (6-ounce) fish fillets, such as snapper, haddock, striped bass, fluke, sablefish or salmon, skin on or off",
      "2 pints cherry or grape tomatoes",
      "3 tablespoons olive oil"
    ],
    "method": [
      "In a large bowl, whisk together the coconut milk, ginger, garlic, turmeric, red-pepper flakes, honey and 1 teaspoon salt. Zest and juice 1 lime directly into the mixture. Stir in ¼ cup chopped cilantro.",
      "Add the fish fillets and turn to coat. Marinate in the refrigerator for 15 to 30 minutes.",
      "Meanwhile, adjust an oven rack to the lower-middle position and another to the position closest to the broiler. Heat oven to 425 degrees.",
      "Place the tomatoes on a large sheet pan. Drizzle with 2 tablespoons olive oil, season with salt and toss to coat. Nestle the marinated fish between the tomatoes and spoon all the marinade over the fish. Drizzle 1 tablespoon oil over the fish. Roast on the lower-middle rack until the surface of the fish is opaque but the center is not cooked through, 8 to 10 minutes. Remove the pan and heat the broiler to high.",
      "Move the pan to the broiler and finish cooking, rotating once, until the fish is tender and the tomatoes are just beginning to brown in spots, 5 to 6 minutes. Slice the remaining lime into wedges.",
      "Divide the tomatoes and fish among dishes and tip the pan juices over the fish. Garnish with the remaining ¼ cup cilantro and serve with lime wedges for squeezing."
    ],
    "servings": 4
  },
  {
    "id": "nyt-salmon-cherry-tomato-curry",
    "name": "Salmon and Cherry Tomato Curry",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["salmon", "cherry tomatoes", "coconut milk", "ginger", "chile", "spinach", "turmeric"],
    "pantryFriendly": false,
    "season": [],
    "description": "Salmon fillets gently poached in a rich, fragrant coconut-milk curry that's sweet with burst cherry tomatoes and spicy from chile and ginger. Poaching keeps the fish from overcooking; serve over rice to soak up the sauce.",
    "notes": "For wild salmon like sockeye, simmer over the lowest heat and stick to the lower end of the cooking time. Finish with a squeeze of lime. Frozen spinach works fine. A splash of fish sauce and a little brown sugar rounds out the flavor; curry powder can stand in for the coriander. Use coconut oil instead of ghee to keep it fully dairy-free.",
    "ingredients": [
      "4 (6-ounce) salmon fillets, skin removed",
      "Salt and freshly ground black pepper",
      "2 tablespoons ghee or coconut oil",
      "3 garlic cloves, minced",
      "1 tablespoon minced fresh ginger",
      "1 bird's-eye chile, or other small chile, sliced",
      "½ teaspoon cumin seeds",
      "1 pound cherry tomatoes",
      "½ teaspoon ground coriander",
      "½ teaspoon ground turmeric",
      "1 (14-ounce) can coconut milk",
      "5 ounces chopped fresh spinach or baby spinach",
      "Cooked rice, for serving",
      "¼ cup torn or chopped mint, basil or cilantro leaves"
    ],
    "method": [
      "Season the salmon fillets with salt and pepper on both sides. Set aside.",
      "In a large lidded skillet or saucepan, melt the ghee over medium heat. Add the garlic, ginger and chile, and cook for 2 to 3 minutes, stirring frequently, until golden brown and fragrant. Season with salt and pepper. Add the cumin seeds and toast for 15 seconds, then stir in the tomatoes, coriander and turmeric.",
      "Stir in the coconut milk and season with salt to taste. Cook for 6 to 8 minutes, uncovered, until the liquid is slightly reduced and the tomato skins are bursting.",
      "Stir in the spinach and gently nestle the salmon fillets into the curry, submerging as much as possible. Cover and simmer over medium-low until the salmon is cooked through, 4 to 7 minutes. Serve over rice and garnish with herbs."
    ],
    "servings": 4
  },
  {
    "id": "nyt-roasted-zucchini-pasta-salad",
    "name": "Roasted Zucchini Pasta Salad",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["fresh"],
    "time": 50,
    "meal": "lunch",
    "dietary": ["vegetarian"],
    "keyIngredients": ["zucchini", "short pasta", "tahini", "lemon", "sunflower seeds", "golden raisins", "parmesan"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "A make-ahead pasta salad loaded with two pounds of zucchini roasted until golden and caramelized, then tossed in a tangy garlic-tahini dressing. Roasted sunflower seeds add crunch and golden raisins bring pops of sweetness to balance the tart lemon.",
    "notes": "Pepitas, slivered almonds or chopped walnuts can replace the sunflower seeds; dried cranberries work for the raisins. Salt and drain the zucchini beforehand for a firmer, less soggy result. Roast the zucchini and make the salad a few hours (or a day) ahead; bring to room temperature and toss before serving. Also great served hot.",
    "ingredients": [
      "2 pounds zucchini, halved lengthwise and sliced ¼ inch thick (8 cups)",
      "1 cup chopped scallions",
      "½ cup plus 1 tablespoon extra-virgin olive oil",
      "Kosher salt (such as Diamond Crystal) and black pepper",
      "1 pound short pasta, such as medium shells or fusilli",
      "3 tablespoons lemon juice",
      "3 tablespoons tahini",
      "1 tablespoon minced garlic",
      "½ cup roasted sunflower seeds",
      "½ cup golden raisins",
      "½ cup freshly grated Parmesan",
      "½ cup chopped parsley"
    ],
    "method": [
      "Heat oven to 450 degrees. On a rimmed sheet pan, combine the zucchini, scallions and 3 tablespoons of the oil; season with salt and pepper. Toss to coat, then spread in an even layer (it's OK for slices to overlap). Roast until tender, stirring halfway, 20 to 25 minutes.",
      "When the zucchini is almost done, cook the pasta according to package directions until al dente; drain.",
      "In a large bowl, combine the lemon juice, tahini, garlic, the remaining 6 tablespoons oil and 3 tablespoons water; season with salt and pepper and whisk until well blended.",
      "Add the warm pasta, zucchini mixture, sunflower seeds and raisins to the dressing. Season with salt and pepper; toss to coat. Stir in the cheese and parsley.",
      "The pasta salad can be made a few hours ahead and kept refrigerated. Bring to room temperature and toss well before serving."
    ],
    "servings": 6
  },
  {
    "id": "nyt-weeknight-chicken-tagine",
    "name": "Weeknight Chicken Tagine",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 40,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["chicken", "preserved lemon", "olives", "onions", "cilantro", "turmeric", "ginger"],
    "pantryFriendly": false,
    "season": [],
    "description": "A fast, non-traditional take on m'qualli chicken tagine delivering all the classic Moroccan flavors — preserved lemon, olives, garlic, ginger and turmeric in a rich golden sauce — in under an hour. Chicken pieces marinate briefly, then simmer with sweet, slow-cooked onions.",
    "notes": "Preserved lemon is foundational — don't skip it (zest of 1 lemon is a weaker substitute). Adjust the sauce with a tablespoon of stock or water at a time if too dry, or simmer longer to thicken. Serve with flatbread or baguette traditionally, or rice or potatoes. A pinch of saffron, smoked paprika, or searing the chicken first adds depth.",
    "ingredients": [
      "For the chicken:",
      "2 tablespoons olive oil",
      "2 large yellow onions, thinly sliced",
      "1¼ pounds boneless, skinless chicken breasts or thighs, cut into 1- to 1½-inch pieces",
      "½ cup pitted Castelvetrano or Kalamata olives, for serving",
      "2 lemons, cut into wedges, for serving",
      "1 baguette, for serving",
      "For the marinade:",
      "½ cup vegetable or chicken stock",
      "2 tablespoons olive oil, plus more as needed",
      "1 cup finely chopped cilantro leaves and tender stems, plus more for garnishing",
      "1 to 2 tablespoons seeded and finely chopped preserved lemon or the zest of 1 lemon",
      "3 garlic cloves, minced or pressed",
      "1 teaspoon honey or granulated sugar",
      "1 teaspoon ground turmeric",
      "1 teaspoon ground ginger",
      "Fine sea salt and black pepper"
    ],
    "method": [
      "Start the chicken: Heat the oil in a large pan over medium-low. Add the onions, cover and cook, allowing them to start sweating, about 5 minutes.",
      "Meanwhile, make the marinade: In a medium bowl or measuring jug, combine the stock, oil, cilantro, 1 tablespoon preserved lemon, garlic, honey, turmeric, ginger, ¾ teaspoon salt and ¼ teaspoon pepper.",
      "Pour about half the marinade into the pan with the onions, stirring to combine. Cover and cook over low, stirring occasionally, until the onions are soft and translucent, 10 to 15 minutes.",
      "While the onions cook, add the chicken to the bowl with the remaining marinade. Cover and let marinate in the fridge while the onions finish.",
      "When the onions are soft, add the chicken and its marinade to the pan. Cover and simmer over medium-low for 15 to 20 minutes, stirring occasionally, until the meat is fully cooked.",
      "The sauce may have thickened slightly, but the pan should not be dry. If necessary, add 1 tablespoon stock or water at a time until the desired consistency. Taste and adjust seasoning with salt and preserved lemon.",
      "Garnish with olives and cilantro and serve with lemon wedges and torn pieces of baguette."
    ],
    "servings": 4
  },
  {
    "id": "nyt-skillet-meatballs-peaches-basil-lime",
    "name": "Skillet Meatballs With Peaches, Basil and Lime",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "other",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["ground pork", "peaches", "basil", "ginger", "lime", "garlic", "cumin"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Gingery, cumin-spiced meatballs seared in a skillet, then simmered with juicy ripe peaches that break down into a chunky sweet-savory sauce, finished with fresh basil and tangy lime. A light, summery one-pan supper.",
    "notes": "Use very ripe or overripe peaches (or nectarines) so they're soft and sweet — frozen diced peaches work in a pinch. Any ground meat or vegan meat works in place of pork. Don't overwork the meatball mix or they turn tough; a couple tablespoons of yogurt keeps the meat moist. Sweeter peaches need more lime; tart ones less. Serve over rice, rice noodles or salad greens. Made dairy-free with panko (use GF crumbs and skip wheat for other diets).",
    "ingredients": [
      "1½ tablespoons finely grated or minced fresh ginger",
      "3 garlic cloves, grated or minced",
      "1¼ teaspoon ground cumin, plus more for serving",
      "1¼ teaspoons kosher salt, plus more as needed",
      "1 pound ground pork (or turkey or chicken, or vegan meat)",
      "⅓ cup panko or other plain bread crumbs",
      "3 tablespoons finely chopped fresh basil, plus basil leaves for serving",
      "2 tablespoons extra-virgin olive oil",
      "2 tablespoons wine (dry white, rosé or red), or use broth, orange juice or water",
      "2 cups diced ripe peaches or nectarines (about 3)",
      "¼ cup thinly sliced white or red onion, or scallions",
      "1 lime, halved",
      "White rice or coconut rice, rice noodles, or crisp salad greens, for serving"
    ],
    "method": [
      "In a large bowl, mix together the ginger, garlic, cumin and salt. Add the pork, panko and basil. Using your hands, gently mix everything together without overworking the mixture (otherwise the meatballs get tough). Form into 1¼-inch balls.",
      "Heat a large skillet over medium-high, then add the oil and let it heat until it thins out. Add the meatballs in one layer. Cook, turning and shaking the pan, until browned all over, 5 to 7 minutes.",
      "Pour the wine into the skillet and move the meatballs to one side, scraping up the browned bits. Add the peaches, a pinch of salt and 2 tablespoons water to the empty side. When the peaches are simmering, cover the pan, lower the heat to medium and cook until the meatballs are no longer pink at their centers and the peaches are juicy and tender, 5 to 10 minutes longer.",
      "Uncover the pan. If the mixture seems too runny, let it cook down another minute or so — the peaches should break down into a chunky sauce. Hard or unripe peaches may take a few extra minutes.",
      "Add the onions and mix them in so they wilt slightly. Squeeze lime juice over everything, then taste and add salt and lime juice as needed (sweeter peaches need more lime, tart ones less).",
      "Serve the meatballs sprinkled with more cumin and garnished with torn basil leaves, over the rice or greens."
    ],
    "servings": 4
  },
  {
    "id": "nyt-chicken-stew-pelosi",
    "name": "Chicken Stew",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "american",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 60,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["chicken thighs", "baby potatoes", "carrots", "celery", "green beans", "heavy cream", "sweet paprika"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A creamy, cozy chicken stew that's quick enough for a weeknight yet satisfying enough for a long Sunday dinner. Juicy boneless thighs simmer with sweet paprika, apple cider vinegar, dried herbs and plenty of vegetables, all wrapped in a silky cream-enriched broth.",
    "notes": "Thighs stay juicier than breasts. Very versatile — add mushrooms or peppers, swap the heavy cream for coconut milk (to make it dairy-free), or leave the cream out. For more depth, sear the chicken first and deglaze with white wine. Freezer-friendly up to 3 months.",
    "ingredients": [
      "2 tablespoons butter",
      "2 tablespoons olive oil",
      "1 medium onion, diced (about 6 ounces)",
      "2 medium carrots, peeled and diced (about 5 ounces)",
      "3 stalks celery, diced (about 3 ounces)",
      "4 garlic cloves, minced",
      "½ teaspoon sweet paprika",
      "Salt and black pepper",
      "3 tablespoons all-purpose flour",
      "4 cups chicken broth",
      "1 tablespoon apple cider vinegar",
      "1½ pounds boneless, skinless chicken thighs (3 to 4 depending on size)",
      "1 pound baby potatoes, cut into quarters",
      "1 cup (1-inch pieces) green beans (about 4 ounces)",
      "½ cup heavy cream",
      "½ teaspoon dried sage",
      "½ teaspoon dried thyme",
      "½ teaspoon dried oregano",
      "Fresh parsley, for serving",
      "Lemon wedges, for serving"
    ],
    "method": [
      "Heat a large pot or Dutch oven over medium. Add the butter, olive oil, onion, carrots, celery, garlic, paprika and a big pinch of salt, and cook, stirring frequently, until the onion is translucent, 5 to 7 minutes.",
      "Add the flour and stir for 1 minute. Add the chicken broth and vinegar and stir until the flour is incorporated.",
      "Add the chicken thighs, potatoes, green beans, heavy cream, sage, thyme, oregano, and 1 teaspoon each of salt and black pepper. Bring to a gentle boil over medium-high, then reduce the heat to maintain a simmer. Simmer, with the lid partially covering the pot, until the chicken is cooked through, about 20 minutes.",
      "Transfer the chicken to a plate. Cover the pot completely and let the vegetables cook 5 to 10 minutes more, until tender. Meanwhile, shred the chicken into bite-size pieces with two forks, then return it to the pot. Season to taste with more salt and pepper. Serve warm, garnished with parsley, with lemon wedges on the side if desired."
    ],
    "servings": 6
  },
  {
    "id": "nyt-one-pot-chicken-and-lentils",
    "name": "One-Pot Chicken and Lentils",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "high",
    "mood": ["comforting"],
    "time": 80,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["chicken thighs", "green lentils", "carrots", "onion", "tomato paste", "cumin", "turmeric", "lime"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A comforting, budget-friendly throw-in-the-pot braise of well-spiced pantry staples — cumin, turmeric, tomato paste — simmered with bone-in chicken thighs and lentils. A finishing squeeze of lime adds a subtle Persian-style sourness to the rich braising liquid.",
    "notes": "The skin shields the chicken from drying out as it simmers and builds flavor — discard it before serving. Boneless, skinless thighs also work (no skin to remove). Add red-pepper flakes or chili paste for heat. Best with bread or basmati rice. Searing the chicken separately first is an option if you prefer.",
    "ingredients": [
      "2 tablespoons olive oil",
      "1 yellow or red onion, thinly sliced",
      "2 medium carrots, unpeeled and cut into thin rounds",
      "Salt and pepper",
      "4 to 6 bone-in, skin-on chicken thighs (1½ to 2 pounds), patted dry",
      "2 tablespoons tomato paste",
      "1 tablespoon ground cumin",
      "1 teaspoon ground turmeric",
      "2 garlic cloves, grated or minced",
      "1 cup green or brown lentils, rinsed",
      "1 lime, halved",
      "2 tablespoons chopped cilantro or parsley leaves and tender stems"
    ],
    "method": [
      "Heat the oil in a large Dutch oven or pot over medium-high until shimmering. Add the onion and carrots, season lightly with salt and cook, stirring occasionally, until the onions just start to soften, about 3 minutes.",
      "Push the carrots and onions to the sides of the pot, creating space in the center. Season the chicken thighs all over with salt and pepper, then add them skin-side down to the center. Cook until the skin easily releases from the pan, 7 to 9 minutes, pushing the vegetables occasionally. (Everything will be snug — that's OK.)",
      "Add the tomato paste, cumin, turmeric and garlic to the carrots and onions, stirring as best you can. Flip the chicken, stack the pieces to make room to stir, and cook until the tomato paste intensifies and darkens, about 2 minutes.",
      "Add the lentils and 4 cups water (or more, to fully submerge the lentils and most of the chicken). Bring to a boil and season with salt. Cover with the lid slightly ajar, adjust the heat to maintain a simmer, and cook, stirring occasionally, until the lentils are tender and the chicken is cooked through, 40 to 45 minutes.",
      "Remove and discard the skin from the chicken. Stir in half the lime juice, spoon some sauce over the chicken, then taste and season with more lime juice or salt. Finish with a few grinds of pepper and sprinkle with the cilantro before dividing among bowls."
    ],
    "servings": 4
  },
  {
    "id": "nyt-tomato-ginger-chicken-rice-soup",
    "name": "Tomato-Ginger Chicken and Rice Soup",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 55,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["chicken thighs", "rice", "cherry tomatoes", "ginger", "tomato paste", "fish sauce", "lime"],
    "pantryFriendly": false,
    "season": [],
    "description": "A gentle but lively chicken and rice soup, subtly spicy from fried ginger and sweet from tomatoes used twice — as a caramelized paste base and in fresh bursts. Fish sauce, lime and a drizzle of sesame or chile oil make it reminiscent of sizzling rice soup and tom yum.",
    "notes": "Dial the fish sauce, lime and chile/sesame oil up or down — less for a calming, mild soup, more for something pungent enough to clear your congestion. Use coconut or olive oil instead of butter to keep it dairy-free; use tamari or fish sauce to keep it gluten-free. A final squeeze of lime really brightens it.",
    "ingredients": [
      "2 tablespoons unsalted butter, extra-virgin olive oil or virgin coconut oil",
      "¼ cup tomato paste",
      "2 tablespoons grated fresh ginger",
      "Salt and pepper",
      "6 cups (1½ quarts) chicken broth",
      "1 to 1½ pounds boneless, skinless chicken thighs",
      "¾ cup long-grain white rice (unrinsed)",
      "1 pint (about 10 ounces) cherry or other small tomatoes",
      "2 tablespoons fish sauce or soy sauce, plus more to taste",
      "1 lime, cut into wedges, for squeezing",
      "Toasted sesame oil or chile oil, for serving (optional)"
    ],
    "method": [
      "In a large pot or Dutch oven, heat the butter over medium. Add the tomato paste and ginger, season with salt and pepper and stir until the tomato paste is a shade darker and sticking to the bottom of the pot, 2 to 4 minutes.",
      "Add the chicken broth, chicken thighs and rice. Season lightly with salt. Bring to a simmer over medium-high heat, then reduce the heat and simmer for 15 minutes.",
      "Meanwhile, chop the tomatoes until roughly quartered (a serrated knife helps). After the soup has simmered 15 minutes, add the tomatoes and simmer until the chicken is cooked through and the rice starts to break down, a further 10 to 15 minutes.",
      "Using tongs, remove the chicken and transfer to a bowl. Shred into pieces with two forks, then stir back into the soup. Stir in the fish sauce. Season to taste with more fish sauce (if flat) and pepper (if it needs heat). Serve with a squeeze of lime and a few drops of sesame or chile oil, if using."
    ],
    "servings": 6
  },
  {
    "id": "nyt-orzo-salad",
    "name": "Orzo Salad",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["fresh"],
    "time": 60,
    "meal": "lunch",
    "dietary": ["vegetarian"],
    "keyIngredients": ["orzo", "chickpeas", "cherry tomatoes", "kalamata olives", "feta", "cucumber", "red wine vinegar"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "A colorful, Greek-inspired orzo salad tossed with chickpeas, tomatoes, olives, cucumber and feta in an oregano red-wine vinaigrette. A crowd-pleasing picnic side or a vegetable-packed lunch that's good for meal prep.",
    "notes": "Cook the orzo just to al dente — overcooked, it turns mushy once dressed. Dress the pasta while hot so it soaks up flavor as it cools. Swap olives for roasted red peppers or marinated artichokes if you like; mozzarella and basil give it an Italian bend. Doubles easily and keeps well refrigerated.",
    "ingredients": [
      "Salt",
      "1½ cups orzo",
      "½ cup extra-virgin olive oil",
      "3 tablespoons red wine vinegar",
      "¼ cup finely chopped red onion",
      "1 medium garlic clove, grated or minced",
      "1 teaspoon dried oregano",
      "Black pepper",
      "1 pint cherry or grape tomatoes, halved",
      "1 (15-ounce) can chickpeas, rinsed",
      "½ cup pitted Kalamata olives",
      "6 ounces feta, crumbled or diced ½-inch (about 1½ cups)",
      "½ English cucumber, diced ½-inch (about 1½ cups)",
      "⅓ cup chopped fresh parsley, dill or mint (or a combination)"
    ],
    "method": [
      "Bring a pot of salted water to a boil. Add the orzo and cook, stirring occasionally, until tender (but al dente). Drain and transfer to a large serving bowl.",
      "While the orzo cooks, make the dressing: In a medium bowl, combine the olive oil, vinegar, red onion, garlic, oregano, ¾ teaspoon salt and ½ teaspoon pepper; whisk vigorously until smooth.",
      "Pour about half the dressing over the hot orzo, then add the tomatoes, chickpeas and olives; toss well. Set aside to come to room temperature, about 20 minutes. Add the feta, cucumbers and herbs along with the remaining dressing. Toss, taste for seasoning and serve."
    ],
    "servings": 4
  },
  {
    "id": "nyt-oven-roasted-chicken-shawarma",
    "name": "Oven-Roasted Chicken Shawarma",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 45,
    "meal": "dinner",
    "dietary": ["dairy-free", "gluten-free"],
    "keyIngredients": ["chicken thighs", "lemon", "garlic", "cumin", "paprika", "turmeric", "red onion"],
    "pantryFriendly": false,
    "season": [],
    "description": "An oven-roasted version of the street-side classic usually cooked on a rotisserie — chicken thighs marinated in lemon, garlic and warm spices (cumin, paprika, turmeric, cinnamon), then roasted until crisp at the edges. Perfect for a family-and-friends spread.",
    "notes": "Marinate 1 to 12 hours (overnight is great). For extra crisp, sauté the sliced chicken in a hot pan after roasting, or finish under the broiler 2–3 minutes. Serve with pita, chopped cucumber and tomato, olives, feta, fried eggplant, hummus or rice. White sauce: plain yogurt cut with mayo, lemon juice and garlic. Time excludes marinating. The dish itself is gluten-free; the pita served alongside is not.",
    "ingredients": [
      "2 lemons, juiced",
      "½ cup plus 1 tablespoon olive oil",
      "6 cloves garlic, peeled, smashed and minced",
      "1 teaspoon kosher salt",
      "2 teaspoons freshly ground black pepper",
      "2 teaspoons ground cumin",
      "2 teaspoons paprika",
      "½ teaspoon turmeric",
      "A pinch of ground cinnamon",
      "Crushed red pepper, to taste",
      "2 pounds boneless, skinless chicken thighs",
      "1 large red onion, peeled and quartered",
      "2 tablespoons chopped fresh parsley"
    ],
    "method": [
      "Prepare the marinade: Combine the lemon juice, ½ cup olive oil, garlic, salt, pepper, cumin, paprika, turmeric, cinnamon and crushed red pepper in a large bowl and whisk to combine. Add the chicken and toss well to coat. Cover and refrigerate at least 1 hour and up to 12 hours.",
      "When ready to cook, heat oven to 425 degrees. Use the remaining tablespoon of olive oil to grease a rimmed sheet pan. Add the quartered onion to the chicken and marinade, toss once to combine, then remove the chicken and onion from the marinade and spread evenly across the pan.",
      "Roast until the chicken is browned, crisp at the edges and cooked through, about 30 to 40 minutes. Remove, rest 2 minutes, then slice into bits. (For extra crisp, sauté the sliced chicken in a large pan over high heat with a tablespoon of oil until everything curls tight.)",
      "Scatter the parsley over the top and serve with tomatoes, cucumbers, pita, white sauce, hot sauce, olives, fried eggplant, feta or rice — anything you desire."
    ],
    "servings": 6
  },
  {
    "id": "nyt-sausage-ragu",
    "name": "Sausage Ragù",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "high",
    "mood": ["comforting"],
    "time": 120,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["italian sausage", "san marzano tomatoes", "onion", "carrot", "celery", "tomato paste", "tubular pasta"],
    "pantryFriendly": false,
    "season": [],
    "description": "A deeply flavored Tuscan-style meat sauce built on patient caramelization rather than shortcuts. Sweet Italian sausage and a soffritto of onion, carrot and celery slowly melt down, then simmer with San Marzano tomatoes into a velvety, dark-red ragù tossed with tubular pasta.",
    "notes": "Don't rush the browning — the long, low caramelization (step 2 can take 40 min or more) is essential to the flavor. Pork sausage beats beef; dried pasta and canned whole San Marzano tomatoes are best. If the sausage tastes timid, add garlic, chile flakes, fennel seed, oregano or sage as it browns. Mixing hot and sweet sausage adds complexity. Cooking times run long — be patient.",
    "ingredients": [
      "1 pound sweet Italian sausage or bulk sausage",
      "Extra-virgin olive oil",
      "1 onion, minced",
      "1 carrot, minced",
      "1 celery stalk, minced",
      "¼ cup minced flat-leaf parsley, plus extra for garnish",
      "1 (28-ounce) can whole tomatoes, preferably San Marzano, with its juice",
      "1 large sprig fresh thyme",
      "1 large sprig fresh rosemary",
      "3 tablespoons tomato paste",
      "Salt",
      "Ground black pepper",
      "1 pound tubular dried pasta such as mezzi rigatoni, paccheri or penne",
      "Freshly grated Parmesan cheese, for garnish, optional"
    ],
    "method": [
      "Slit open the sausage casings with the tip of a small sharp knife. Crumble the meat into a wide, heavy skillet or Dutch oven over medium-low heat. If it isn't rendering enough fat to coat the pan, add olive oil one tablespoon at a time until the meat fries gently (not steaming). Sauté, breaking up chunks, until all the meat is opaque (don't let it brown), about 5 minutes.",
      "Add the onion, carrot, celery and parsley and stir. Drizzle in more oil if the pan seems dry. Cook over very low heat, stirring often, until the vegetables have melted into the fat and are beginning to caramelize and the meat is toasty brown. This may take as long as 40 minutes — be patient, it's essential to the flavor.",
      "Add the tomatoes and their juice, breaking them up with your hands or a spoon. Bring to a simmer, add the thyme and rosemary, and simmer uncovered until thickened and the pan is almost dry, 20 to 25 minutes.",
      "Mix the tomato paste with 1 cup hot water and add to the pan. Reduce heat to very low and cook until the ragù is velvety and dark red and the top glistens with oil, about 10 minutes more. Remove the herb sprigs. Sprinkle with black pepper, stir and taste.",
      "Meanwhile, bring a large pot of salted water to a boil. Boil the pasta until just tender. Scoop out 2 cups cooking water, drain the pasta and return it to the pot over low heat. Add a ladleful of ragù and a splash of cooking water, stir and cook 1 minute. Repeat, adding more cooking water or ragù until the pasta is cooked through and seasoned to your liking.",
      "Pour hot pasta water into a large serving bowl to warm it, then pour it out and add the pasta. Top with the remaining ragù, sprinkle with parsley and serve immediately. Pass grated cheese at the table, if desired."
    ],
    "servings": 4
  },
  {
    "id": "nyt-coq-au-vin-blanc-meatballs",
    "name": "Coq au Vin Blanc Meatballs",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 60,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["ground chicken", "mushrooms", "bacon", "white wine", "heavy cream", "dijon mustard", "shallots", "thyme"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "An easy skillet riff on coq au vin blanc — the creamy white-wine cousin of the red-wine classic. Quick salt-and-pepper chicken meatballs simmer in a rich mushroom sauce spiked with bacon, white wine, thyme and Dijon mustard.",
    "notes": "Ground turkey works in place of chicken. To avoid curdling, keep the heat moderate when reducing the cream. Some find it intensely flavored — you can scale back the bacon/mustard/herbs for a more subtle sauce. For a bacon-free version, sauté diced portobello until meaty and chewy. Great leftovers.",
    "ingredients": [
      "1 pound ground chicken",
      "1 large egg, beaten",
      "⅓ cup panko bread crumbs",
      "Fine pink Himalayan salt and freshly ground black pepper",
      "1 tablespoon extra-virgin olive oil, plus more for your hands",
      "2 slices thick-cut bacon, chopped",
      "8 ounces shiitake (tough stems removed) or cremini mushrooms, sliced (about 3 packed cups)",
      "2 tablespoons salted butter",
      "2 shallots, chopped",
      "1 tablespoon fresh thyme leaves, plus more for serving",
      "1 pinch crushed red pepper",
      "3 garlic cloves, finely chopped or grated",
      "1½ cups dry white wine, such as pinot grigio or sauvignon blanc",
      "¾ cup heavy cream (or milk of your choice)",
      "1 tablespoon Dijon mustard"
    ],
    "method": [
      "In a medium bowl, combine the chicken, egg, bread crumbs and a pinch each of salt and pepper. Coat your hands with a bit of olive oil, then roll the mixture into 1-inch balls (15 to 20), placing them on a plate.",
      "Place the bacon in a large skillet over medium heat. Cook, stirring occasionally, until crispy and the fat has rendered, about 5 minutes. Using a slotted spoon, transfer the bacon to a plate, reserving the fat in the skillet.",
      "Add the meatballs to the same skillet over medium heat. Cook, turning every couple of minutes, until browned and crisp, 5 to 8 minutes. Transfer to the plate with the bacon.",
      "Add the 1 tablespoon olive oil to the skillet. When it shimmers, add the mushrooms and cook until slightly softened, about 3 minutes. Add the butter, shallots, thyme and a pinch each of salt, black pepper and crushed red pepper. Cook until the mushrooms are golden and the shallots have softened, 3 to 5 minutes. Add the garlic and stir until fragrant, 1 minute more. Transfer to the plate with the bacon and meatballs.",
      "Pour the wine and ½ cup water into the skillet. Cook, scraping up the browned bits, until reduced slightly, about 10 minutes. Whisk in the cream and mustard. Return the bacon, meatballs and mushroom mixture to the skillet and simmer over medium, stirring occasionally, until the sauce is slightly thickened and the meatballs are cooked through, 8 to 10 minutes, adding a few tablespoons of water if needed to keep it saucy.",
      "Transfer the meatballs to plates and spoon the sauce over them. Garnish with additional thyme."
    ],
    "servings": 4
  },
  {
    "id": "wok-of-life-taiwanese-braised-minced-pork-rice",
    "name": "Taiwanese Braised Minced Pork Over Rice (肉燥饭)",
    "source": "The Woks of Life",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "high",
    "mood": ["comforting"],
    "time": 170,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["ground pork", "shiitake mushrooms", "shallots", "soy sauce", "five spice powder", "star anise", "rice"],
    "pantryFriendly": false,
    "season": [],
    "description": "Rou Zao Fan — a savory Taiwanese braise of ground pork and shiitake mushrooms simmered with soy, five spice, star anise and shallots, ladled over rice. Same deep, comforting flavors as lu rou fan but made with mince instead of pork belly.",
    "notes": "Emma's tweaks: skip the eggs, use fresh portobello mushrooms instead of dried shiitake, and thicken the sauce with cornflour. Hand-chopping pork shoulder/butt gives the best texture, but store-bought ground pork is fine. Most of the time is hands-off mushroom soaking (2 hrs+). Contains soy and oyster sauce, so not gluten-free as written.",
    "ingredients": [
      "1½ ounces dried shiitake mushrooms",
      "1 pound ground pork (hand-chopped pork shoulder or pork butt is ideal)",
      "3 tablespoons neutral oil (such as vegetable or canola)",
      "1 tablespoon ginger, minced",
      "1 cup shallots, finely diced",
      "2 star anise",
      "3 tablespoons Shaoxing wine",
      "0.5 ounce rock sugar (or 1 tablespoon granulated sugar)",
      "2 tablespoons light soy sauce",
      "1 tablespoon dark soy sauce",
      "1 tablespoon oyster sauce",
      "½ teaspoon ground white pepper",
      "¼ teaspoon five spice powder",
      "2-3 cups water (including shiitake mushroom soaking water)",
      "5 eggs",
      "¼ cup scallions, chopped (white and green parts)",
      "Salt to taste (optional, likely not needed)"
    ],
    "method": [
      "Rehydrate the dried shiitake mushrooms: rinse off any dust and soak in hot water for at least 2 hours (or overnight). Squeeze out the liquid and dice into ¼-inch pieces. Set aside the soaking liquid for later.",
      "If desired, hand-chop a 1-pound piece of pork shoulder/butt for the best texture. Store-bought ground pork is also fine.",
      "Heat 2 tablespoons oil in a wok or large skillet over medium heat. Cook the ginger and shallots for 1-2 minutes, until the shallots turn translucent. Stir in the mushrooms and cook for 2 minutes.",
      "Increase the heat to high. Add 1 more tablespoon oil along with the ground pork and star anise. Cook until the meat is opaque.",
      "Stir in the Shaoxing wine to deglaze. Add the rock sugar, light soy sauce, dark soy sauce, oyster sauce, white pepper, five spice powder and 2 cups water (including the mushroom soaking water — leave behind any sediment). Bring to a boil, then cover, reduce the heat to medium/medium-low and simmer for 20 minutes.",
      "Meanwhile, hard-boil the eggs: bring a pot of water to a rolling boil, gently lower in the eggs, boil rapidly for 30 seconds, then reduce the heat to low, cover and simmer 10 minutes. Transfer to ice water, then peel and rinse.",
      "After the pork has simmered 20 minutes, add the eggs, submerging them in the sauce (add another ½ to 1 cup water if needed). Cover and simmer 10 minutes more.",
      "Uncover. If the sauce is too thin, raise the heat to medium-high and reduce, stirring carefully so as not to break the eggs.",
      "Stir in the scallions and salt to taste. Serve each person an egg (halved if desired) with the pork ladled over rice."
    ],
    "servings": 4
  },
  {
    "id": "personal-risotto-alla-pesto",
    "name": "Risotto alla Pesto",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["comforting"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["risotto rice", "pesto", "parmesan", "onion", "chicken broth", "butter"],
    "pantryFriendly": true,
    "season": [],
    "description": "A simple, creamy pesto risotto — onion softened in butter, arborio rice toasted, then slowly cooked with ladlefuls of broth and finished with pesto and Parmesan. A quick, comforting base risotto.",
    "notes": "Emma's note: this is a base risotto recipe — literally any ingredient can be added. Can also add 1 glass of white wine (stir in after toasting the rice, before the broth). Use vegetable broth and check the pesto to keep it fully vegetarian.",
    "ingredients": [
      "4 cups (950 ml) chicken broth",
      "4 tbsp butter",
      "1 tbsp olive oil",
      "1 cup onion, finely chopped",
      "1 cup risotto rice",
      "1 tbsp pesto (bought or homemade)",
      "½ cup parmesan",
      "Salt and pepper"
    ],
    "method": [
      "In a large pot, heat the olive oil over high heat until just shimmering.",
      "Add half the butter (2 tbsp) and reduce to medium heat.",
      "Add the onion and cook until just translucent.",
      "Add the rice and stir well to coat. Cook for one minute.",
      "Stirring constantly, add the broth one ladle at a time, letting each be absorbed before adding the next, until the rice is fully cooked.",
      "Stirring constantly, add the pesto, Parmesan, and the remaining butter if needed.",
      "Season with salt and pepper to taste and serve immediately."
    ],
    "servings": 4
  },
  {
    "id": "justonecookbook-mapo-tofu",
    "name": "Mapo Tofu (Mabo Dofu)",
    "source": "Just One Cookbook",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["silken tofu", "ground pork", "doubanjiang", "miso", "ginger", "garlic", "scallions"],
    "pantryFriendly": false,
    "season": [],
    "description": "A Japanese-style mapo tofu (mabo dofu) — milder than the original Sichuan version — with ground pork and silken tofu simmered in a savory doubanjiang, miso and mirin sauce. A family-friendly one-bowl meal ready in about 25 minutes.",
    "notes": "Emma's tweak: add ground Sichuan peppercorns. For less spice, use 1½ Tbsp non-spicy doubanjiang plus 1 Tbsp spicy la doubanjiang. Make it vegetarian/vegan by swapping the pork for mushrooms or veggies and using a vegetarian stir-fry sauce in place of oyster sauce. Use gluten-free doubanjiang and tamari for GF. Serve over steamed rice donburi-style, with optional sansho pepper.",
    "ingredients": [
      "For the sauce:",
      "2½ Tbsp doubanjiang (spicy chili bean paste)",
      "1 Tbsp oyster sauce (or vegetarian stir-fry sauce for veg/vegan)",
      "1 Tbsp miso",
      "½ Tbsp soy sauce",
      "2 Tbsp mirin",
      "1 tsp toasted sesame oil",
      "1 tsp potato starch or cornstarch",
      "4 Tbsp water",
      "For the mapo tofu:",
      "2 cloves garlic",
      "1 Tbsp ginger, minced",
      "2 green onions/scallions",
      "14 oz soft/silken tofu (kinugoshi dofu), drained 15–30 minutes",
      "1 Tbsp neutral oil",
      "½ lb ground pork (or mushrooms/veggies for vegetarian)",
      "Japanese sansho pepper, optional, for serving"
    ],
    "method": [
      "Combine the sauce ingredients in a small bowl: doubanjiang, oyster sauce, miso, soy sauce, mirin, sesame oil, potato starch and water. Whisk well.",
      "Finely mince the garlic. Peel and mince the ginger (measure 1 Tbsp). Slice the green onions into thin rounds, reserving some for garnish. Drain the tofu and cut into ¾-inch (2-cm) cubes.",
      "Heat a wok or large frying pan over medium heat. Add the neutral oil, then the garlic and ginger. Sauté until fragrant, making sure they don't burn.",
      "Add the ground pork and cook, breaking up the chunks, until no longer pink.",
      "Give the sauce a final stir, then add it to the wok. Stir thoroughly as you bring it to a simmer.",
      "Add the tofu and gently coat it with the sauce. Stir frequently, without mashing the tofu, until heated through.",
      "Add most of the green onions and stir to incorporate just before taking the pan off the heat. Serve immediately over steamed rice, garnished with the reserved green onions and optional sansho pepper."
    ],
    "servings": 4
  },
  {
    "id": "recipetineats-coq-au-vin",
    "name": "Coq au Vin",
    "source": "RecipeTin Eats",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "high",
    "mood": ["comforting", "impressive"],
    "time": 105,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["chicken", "red wine", "bacon", "white mushrooms", "pearl onions", "beef stock", "garlic"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "The French classic — bone-in chicken pieces marinated in red wine, then braised with bacon, mushrooms and pearl onions into a luscious, glossy sauce. Luxurious yet simple, much like beef bourguignon.",
    "notes": "Best started 2 days ahead: a 12–24 hour red-wine marinade is essential, and resting the finished stew overnight deepens the flavor (recommended). Don't skip the bacon — it's key for seasoning. Beef stock gives a deeper color than chicken stock (it won't taste beefy). No need for expensive wine; cheap dry red works. If using chicken breast, only add it for the last 20 minutes so it doesn't dry out. Time shown excludes marinating/resting. Serve over mashed potato or tagliatelle.",
    "ingredients": [
      "For the red wine chicken marinade:",
      "4 chicken thighs, bone-in, skin on (~220g/7oz each)",
      "4 chicken drumsticks",
      "16 pearl onions or pickling onions (or 2 brown/yellow onions, cut into wedges)",
      "1 bay leaf, fresh (dry also ok)",
      "3 thyme sprigs (or 1 tsp dried thyme)",
      "750 ml / 3 cups pinot noir or other dry red wine",
      "For browning the chicken:",
      "3–4 tbsp vegetable or canola oil",
      "¾ tsp salt",
      "½ tsp pepper",
      "For the stew:",
      "400g / 14oz white mushrooms, halved (quartered if large)",
      "150g / 5oz bacon piece (speck), cut into 1 x 2.5cm batons",
      "60g / 4 tbsp unsalted butter",
      "3 garlic cloves, finely minced",
      "2 tbsp tomato paste",
      "7 tbsp plain/all-purpose flour",
      "750 ml / 3 cups beef stock, low sodium, preferably homemade",
      "¼ tsp salt",
      "¼ tsp black pepper",
      "To garnish and serve:",
      "2 tbsp parsley, chopped",
      "Mashed potato (or tagliatelle)"
    ],
    "method": [
      "Marinate the chicken: place the marinade ingredients (chicken, onions, bay leaf, thyme, red wine) in a large glass or ceramic bowl. Marinate in the fridge for 12 to 24 hours.",
      "Strain, reserving the wine and herbs. Separate the chicken and onions. Spread the chicken on a paper-towel-lined tray and pat dry.",
      "Reduce the wine: pour it into a saucepan, bring to a boil over medium-high and simmer vigorously, skimming off impurities, until reduced by half. Set aside.",
      "Preheat the oven to 180°C / 350°F (160°C fan). Season the chicken with ¾ tsp salt and ½ tsp black pepper.",
      "Brown the chicken: heat 3 tbsp oil in a large, heavy oven-proof pot over medium-high. Cook the thighs skin-side down 2–3 minutes until browned (darker than usual from the wine), flip and cook 1 minute more; remove. Brown the drumsticks on 3–4 sides, ~5 minutes total; remove.",
      "Fry the bacon: remove any burnt bits, add a little oil if needed, and cook the bacon 3 minutes until golden. Add to the chicken tray.",
      "Sauté the mushrooms 5 minutes until golden; remove to a bowl. Sauté the onions 5 minutes until golden-patched.",
      "Add the butter to the pot. Once melted, add the garlic and cook 1 minute. Add the tomato paste and cook 2 minutes. Add the flour and cook 2 minutes.",
      "While stirring, slowly pour in the beef stock (this dissolves the flour lump-free), then add the reduced wine and mix until mostly smooth (a few lumps will dissolve during cooking).",
      "Add the chicken, bacon, mushrooms, thyme, bay leaf, salt and pepper back into the pot and stir. Bring to a simmer, then cover and transfer to the oven for 45 minutes, until the chicken is very tender but not falling apart.",
      "Taste the sauce and adjust salt. If time permits, cool and rest overnight before reheating gently (the flavor improves). Serve over mashed potato or tagliatelle, sprinkled with parsley."
    ],
    "servings": 4
  },
  {
    "id": "cookieandkate-baba-ganoush",
    "name": "Baba Ganoush",
    "source": "Cookie and Kate",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["fresh"],
    "time": 55,
    "meal": "snack",
    "dietary": ["vegetarian", "vegan", "gluten-free", "dairy-free"],
    "keyIngredients": ["eggplant", "tahini", "lemon", "garlic", "olive oil", "parsley", "cumin"],
    "pantryFriendly": false,
    "season": [],
    "description": "A creamy, smoky Middle Eastern eggplant dip — roasted eggplant flesh stirred (no food processor needed) with tahini, lemon, garlic and olive oil, finished with parsley and smoked paprika. Great with pita, crudités, or on sandwiches.",
    "notes": "Use 2 small-to-medium eggplants (~2 lbs total) rather than 1 large — big ones have more seeds and a bothersome texture. Choose shiny, smooth eggplants that feel heavy; use them promptly as overripe ones taste bitter. Draining as much moisture from the roasted flesh as possible is key to a creamy (not watery) dip. Add extra lemon for a more tart flavor.",
    "ingredients": [
      "2 pounds Italian eggplants (about 2 small-to-medium eggplants)",
      "2 medium cloves garlic, pressed or minced",
      "2 tablespoons lemon juice, more if necessary",
      "¼ cup tahini",
      "⅓ cup extra-virgin olive oil, plus more for brushing and garnish",
      "2 tablespoons chopped fresh flat-leaf parsley, plus extra for garnish",
      "¾ teaspoon salt, to taste",
      "¼ teaspoon ground cumin",
      "Pinch of smoked paprika, for garnish",
      "To serve: warmed pita wedges, carrot sticks, bell pepper strips, cucumber slices, etc."
    ],
    "method": [
      "Preheat the oven to 450°F with a rack in the upper third. Line a large rimmed baking sheet with parchment. Halve the eggplants lengthwise, brush the cut sides lightly with olive oil, and place them cut-side down on the pan.",
      "Roast until the interior is very tender and the skin is collapsing, about 35 to 40 minutes. Set aside to cool a few minutes, then flip and scoop out the flesh with a large spoon, leaving the skin behind.",
      "Place a mesh strainer over a mixing bowl and transfer the flesh to the strainer, discarding the skins and any stray bits. Let it rest a few minutes, shaking/stirring to release as much moisture as possible.",
      "Discard the drippings, wipe out the bowl, and add the drained eggplant. Add the garlic and lemon juice and stir vigorously with a fork until the eggplant breaks down. Stir in the tahini until incorporated, then slowly drizzle in the olive oil while stirring until pale and creamy, breaking up any long strings.",
      "Stir in the parsley, salt and cumin. Season to taste with more salt (about another ¼ tsp) and more lemon juice if you'd like it tarter.",
      "Transfer to a serving bowl, drizzle with olive oil, and sprinkle with parsley and smoked paprika. Serve with your chosen accompaniments — also great on sandwiches."
    ],
    "servings": 8
  },
  {
    "id": "nyt-asparagus-goat-cheese-tarragon-tart",
    "name": "Asparagus, Goat Cheese and Tarragon Tart",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "medium",
    "mood": ["impressive", "fresh"],
    "time": 60,
    "meal": "lunch",
    "dietary": ["vegetarian"],
    "keyIngredients": ["asparagus", "goat cheese", "puff pastry", "crème fraîche", "tarragon", "parmesan", "lemon"],
    "pantryFriendly": false,
    "season": ["spring"],
    "description": "A stunning, company-ready tart built on store-bought puff pastry — a tangy goat cheese and crème fraîche custard spread under neat stripes of asparagus, finished with shaved Parmesan and tarragon. Effortlessly chic for how simple it is.",
    "notes": "Emma's note: also great with slices of courgette or halved cherry tomatoes in place of (or with) the asparagus. Buy a good all-butter puff pastry — it makes a difference. Best served warm within an hour of baking, but fine a few hours later. Swap tarragon for chives, basil or mint. Can be assembled a day ahead (hold the salt and grated Parmesan until just before baking).",
    "ingredients": [
      "1 cup soft goat cheese, at room temperature (4 ounces)",
      "1 large egg, lightly beaten, at room temperature",
      "1 large garlic clove, finely grated or minced",
      "1½ tablespoons chopped fresh tarragon leaves, plus more for serving",
      "½ tablespoon finely grated lemon zest",
      "½ teaspoon fine sea salt, plus more for sprinkling",
      "Pinch of freshly grated nutmeg",
      "1 cup crème fraîche, at room temperature (8 ounces)",
      "All-purpose flour, for dusting",
      "1 sheet or square all-butter puff pastry, thawed if frozen (about 9 to 14 ounces)",
      "8 ounces thin asparagus, woody ends trimmed",
      "Extra-virgin olive oil",
      "2 tablespoons grated Parmesan",
      "Freshly ground black pepper",
      "Red-pepper flakes (optional)",
      "1½ ounces Parmesan, shaved with a vegetable peeler (about ½ cup)"
    ],
    "method": [
      "Heat the oven to 425°F. In a medium bowl, use a fork or wooden spoon to mash together the goat cheese, egg, garlic, tarragon, lemon zest, salt and nutmeg until smooth. Switch to a whisk and beat in the crème fraîche until smooth.",
      "On a lightly floured surface, roll out the puff pastry into a 13-by-11-inch rectangle about ⅛-inch thick. Transfer to a parchment-lined cookie sheet. With a sharp knife, lightly score a ½-inch border around the edges.",
      "Spread the crème fraîche mixture evenly inside the scored border. Line up the asparagus spears on top and brush them with olive oil. Sprinkle some salt and the grated Parmesan over the asparagus.",
      "Bake until the pastry is puffed and golden, 25 to 30 minutes. Let cool on the sheet for at least 15 minutes (or up to 4 hours). Sprinkle with black pepper, red-pepper flakes (if using), the shaved Parmesan and tarragon leaves, and drizzle with a little oil before serving."
    ],
    "servings": 6
  },
  {
    "id": "ali-slagle-sheet-pan-sausages-brussels-sprouts",
    "name": "Sheet-Pan Sausages and Brussels Sprouts With Honey Mustard",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "american",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["sausage", "brussels sprouts", "potatoes", "honey", "dijon mustard", "olive oil"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A hearty sheet-pan dinner of sticky honey mustard-glazed sausages roasted with brussels sprouts and potatoes. The sausages render their fat to season the caramelised vegetables as everything cooks together.",
    "notes": "Use any fresh sausage that pairs well with honey mustard. Optional mustard seeds and chopped almonds or walnuts add crunch. Swap in other veg like squash, cherry tomatoes, broccoli, or carrots.",
    "ingredients": [
      "1 pound fresh sausage, such as sweet or hot Italian, or bratwurst",
      "1 pound brussels sprouts, trimmed and halved lengthwise",
      "1 pound small potatoes, like baby Yukon gold or red potatoes, halved",
      "2 tablespoons extra-virgin olive oil, plus more as needed",
      "Kosher salt and black pepper",
      "4 teaspoons honey",
      "1 tablespoon Dijon mustard",
      "1 tablespoon yellow mustard seeds (optional)",
      "¼ cup almonds or walnuts, chopped (optional)"
    ],
    "method": [
      "Heat oven to 450°F and place a sheet pan in the oven to preheat. Score the sausages in a few places on both sides, making sure not to cut all the way through.",
      "Transfer sausages to a large bowl with the brussels sprouts, potatoes and 2 tablespoons olive oil; stir until coated (add a little more oil if the mixture seems dry). Season with salt and pepper.",
      "Spread the mixture in an even layer on the heated baking sheet and arrange the vegetables cut-sides down. Roast 15 minutes, until the brussels sprouts and potatoes start to soften.",
      "Meanwhile, stir together the honey, mustard and mustard seeds (if using) in a small bowl.",
      "Drizzle the honey mustard over the sausages and vegetables and toss or shake to coat. Flip the sausages. Sprinkle with almonds if using. Roast until the sausages are cooked through and the vegetables are golden and tender, about 10 minutes more. Season to taste."
    ],
    "servings": 4
  },
  {
    "id": "ali-slagle-sheet-pan-feta-chickpeas-tomatoes",
    "name": "Sheet-Pan Feta With Chickpeas and Tomatoes",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 40,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["feta", "chickpeas", "cherry tomatoes", "honey", "chile flakes", "shallot", "olive oil"],
    "pantryFriendly": true,
    "season": ["summer"],
    "description": "Blocks of feta roasted on a sheet pan with chickpeas, cherry tomatoes, honey and chile until the cheese is soft and creamy and the chickpeas are golden and sticky. Inspired by Greek meze, it's endlessly riffable.",
    "notes": "Use sheep's or goat's milk feta — cow's milk feta lacks the fat to withstand roasting. Serve with pita, grains, salad greens, hummus or yogurt. Swap tomatoes for mini peppers, olives or cauliflower; swap honey for harissa, anchovies or smoked paprika.",
    "ingredients": [
      "3 cups cooked chickpeas (homemade or two 15-ounce cans), drained, rinsed and shaken dry",
      "2 pints (16 to 20 ounces) cherry or Sungold tomatoes",
      "1 shallot, thinly sliced",
      "¼ cup extra-virgin olive oil",
      "2 tablespoons honey",
      "1 teaspoon mild chile flakes (like gochugaru) or ½ teaspoon red-pepper flakes",
      "Salt",
      "2 (6- to 8-ounce) blocks of feta, sliced 1-inch-thick"
    ],
    "method": [
      "Heat the oven to 400°F. On a sheet pan, stir together the chickpeas, tomatoes, shallot, olive oil, honey and chile flakes. Season with salt, then spread in an even layer. Arrange the feta blocks among the chickpeas.",
      "Roast until the feta and tomatoes are soft and the chickpeas are golden brown, 30 to 35 minutes (no need to stir). Eat right away — the feta will harden as it cools, but leftovers reheat well."
    ],
    "servings": 4
  },
  {
    "id": "melissa-clark-roasted-cabbage-parmesan-walnuts-anchovies",
    "name": "Roasted Cabbage With Parmesan, Walnuts and Anchovies",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 45,
    "meal": "dinner",
    "dietary": ["gluten-free"],
    "keyIngredients": ["cabbage", "parmesan", "anchovies", "walnuts", "garlic", "olive oil", "dill"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "Cabbage wedges roasted at high heat until caramelised, with a piquant anchovy, Parmesan and walnut paste massaged into every crevice. Crisp-edged and deeply savoury, it works as a light main or a hearty side.",
    "notes": "Serve with noodles, rice or crusty bread as a main, or alongside roast chicken or fish. Swap walnuts for almonds or hazelnuts; use dill or cilantro (or both).",
    "ingredients": [
      "1 medium head green cabbage (about 2½ pounds)",
      "½ cup extra-virgin olive oil, plus more as needed",
      "Salt, as needed",
      "¾ cup finely grated Parmesan, plus more for serving",
      "6 anchovy fillets, minced",
      "2 fat garlic cloves, finely grated or minced",
      "1 teaspoon fresh thyme leaves",
      "½ teaspoon freshly ground black pepper, plus more as needed",
      "⅔ cup chopped walnuts or other nuts, such as almonds or hazelnuts",
      "½ cup chopped fresh dill or cilantro"
    ],
    "method": [
      "Heat oven to 450°F. Cut the cabbage in quarters lengthwise through the core, then cut out the cores and stem. Slice the quarters lengthwise into 1½-inch-thick wedges.",
      "Place wedges on a rimmed sheet pan, flat sides down (it's OK if slightly crowded; try not to overlap). Lightly drizzle with oil and season with salt.",
      "In a small bowl, combine Parmesan, anchovies, garlic, thyme and black pepper. Stir in ½ cup oil to make a loose paste. Massage the paste into each cabbage wedge, stuffing it between the leaves.",
      "Drizzle cabbage with a little more oil. Roast until lightly browned in spots, 25 to 30 minutes.",
      "Remove from oven and sprinkle walnuts over the top. Roast for another 5 minutes, until cabbage is tender and caramelised and the walnuts are golden.",
      "Sprinkle with dill and more Parmesan and black pepper. Serve immediately."
    ],
    "servings": 4
  },
  {
    "id": "nisha-vora-grated-tofu-not-chicken",
    "name": "I Can't Believe It's Not Chicken (Super-Savory Grated Tofu)",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix", "adventurous"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["vegan", "vegetarian", "dairy-free"],
    "keyIngredients": ["tofu", "gochugaru", "sesame oil", "soy sauce", "black vinegar", "scallions", "garlic"],
    "pantryFriendly": false,
    "season": [],
    "description": "Super-firm tofu grated on a box grater, pan-fried until golden, then coated in a bold pan-Asian sauce of gochugaru, sesame oil, soy sauce and black vinegar. Shockingly meaty and deeply savoury — serve over rice.",
    "notes": "Must use super-firm or high-protein tofu; if using extra-firm, press 10 min first. No gochugaru? Sub 1–1½ tsp Sichuan chile flakes or sriracha. For gluten-free: use tamari and swap black vinegar for 2 parts rice vinegar + 1 part aged balsamic. Leftovers keep 4–5 days in the fridge.",
    "ingredients": [
      "1 to 1½ cups (190–285g) uncooked white or brown rice",
      "1 (280–340g) package super-firm tofu",
      "1½ tablespoons neutral-flavored oil",
      "4 scallions, sliced at an angle (reserve dark green tops for garnish)",
      "1 to 2 Thai chiles or 1 small serrano pepper, thinly sliced (optional)",
      "3 garlic cloves, thinly sliced",
      "1 tablespoon roasted black or white sesame seeds",
      "3 tablespoons tamari or soy sauce",
      "1 tablespoon Chinese black vinegar",
      "1 teaspoon cane sugar, maple syrup or agave",
      "1 tablespoon gochugaru (Korean chile flakes)",
      "1 tablespoon toasted sesame oil",
      "1 handful cilantro leaves and tender stems, roughly chopped"
    ],
    "method": [
      "Cook the rice using your preferred method, or use leftover cooked rice.",
      "Wrap the tofu in a thin dish towel and gently squeeze to remove some water. Using the large holes of a box grater, grate the tofu (thinly slice any small pieces that break off).",
      "Heat the oil in a large nonstick skillet over medium-high. Add the scallions, chiles (if using) and garlic. Cook, stirring frequently, until the garlic is slightly golden and scallions are softened, about 2 minutes.",
      "Add the grated tofu and toss to coat in the oil. Cook undisturbed for 2 minutes, then stir. Continue cooking, stirring every 2 minutes, until golden brown in spots, 10 to 14 minutes total.",
      "Meanwhile, whisk together the tamari, black vinegar, sugar, gochugaru and sesame oil in a small bowl.",
      "Pour the sauce into the pan — it will bubble rapidly. Stir to coat the tofu evenly and cook for 1 minute. Remove from heat and sprinkle with sesame seeds.",
      "Serve over rice, topped with the reserved scallion greens and cilantro."
    ],
    "servings": 2
  },
  {
    "id": "ottolenghi-tomato-pomegranate-salad",
    "name": "Yotam Ottolenghi's Tomato and Pomegranate Salad",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "low",
    "mood": ["fresh", "impressive"],
    "time": 30,
    "meal": "any",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["cherry tomatoes", "pomegranate", "feta", "za'atar", "mint", "basil", "red onion"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "A jewel-bright summer salad of cherry tomatoes and pomegranate seeds tossed with fresh herbs, lemon and red onion, dotted with feta and drizzled with a za'atar oil. Vibrant, fresh and impressive with almost no effort.",
    "notes": "Any good summer tomatoes work in place of cherry tomatoes. Manouri cheese is a softer, milder alternative to feta if you can find it. Serve alongside grilled meat.",
    "ingredients": [
      "2 pints mixed small or cherry tomatoes, of varying colors",
      "2 teaspoons za'atar",
      "3½ tablespoons extra-virgin olive oil",
      "Seeds from 1 pomegranate",
      "½ yellow bell pepper, seeds removed and very thinly sliced",
      "½ small red onion, peeled and very thinly sliced",
      "⅓ cup loosely packed fresh basil leaves, torn",
      "⅓ cup loosely packed fresh mint leaves, torn",
      "1½ teaspoons freshly squeezed lemon juice",
      "Flaky sea salt",
      "3½ ounces manouri or feta cheese, broken into small chunks"
    ],
    "method": [
      "Halve or quarter the tomatoes so they are all roughly the same size. Place in a large mixing bowl.",
      "Mix the za'atar with 1½ tablespoons of olive oil in a small bowl and set aside.",
      "Add the pomegranate seeds, sliced pepper, red onion, herbs, lemon juice, remaining 2 tablespoons of oil and 1 teaspoon of salt to the tomatoes. Gently mix, then transfer to a large shallow bowl or serving platter. Dot with the cheese, drizzle the za'atar oil over the top, and serve."
    ],
    "servings": 4
  },
  {
    "id": "ottolenghi-chicken-cardamom-rice",
    "name": "Chicken With Caramelized Onion and Cardamom Rice",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "high",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 100,
    "meal": "dinner",
    "dietary": ["gluten-free"],
    "keyIngredients": ["chicken thighs", "basmati rice", "cardamom", "caramelized onion", "cinnamon", "barberries", "dill"],
    "pantryFriendly": false,
    "season": [],
    "description": "A stunningly fragrant one-pot chicken and rice from Ottolenghi's Jerusalem, scented with cardamom, cinnamon and cloves, sweetened with caramelized onions and barberries, and finished with a shower of fresh herbs. Elegant dinner party food that is also deeply comforting.",
    "notes": "Searing the chicken before it goes into the rice is essential — don't skip it. Barberries can be swapped for currants (no soaking needed). Serve with the optional yogurt-oil mixture on the side. The tea-towel trick at the end helps absorb steam for fluffy rice.",
    "ingredients": [
      "3 tablespoons sugar (40g)",
      "2½ tablespoons barberries, or currants (25g)",
      "4 tablespoons olive oil",
      "2 medium onions, thinly sliced",
      "2¼ pounds (1kg) skin-on, bone-in chicken thighs, or 1 whole chicken quartered",
      "Salt and freshly ground black pepper",
      "10 cardamom pods",
      "Rounded ¼ teaspoon whole cloves",
      "2 long cinnamon sticks, broken in two",
      "1⅔ cups (300g) basmati rice",
      "2¼ cups (550ml) boiling water",
      "1½ tablespoons flat-leaf parsley leaves, chopped",
      "½ cup dill leaves, chopped",
      "¼ cup cilantro leaves, chopped",
      "⅓ cup (100g) Greek yogurt mixed with 2 tablespoons olive oil (optional, to serve)"
    ],
    "method": [
      "Dissolve the sugar in scant 3 tablespoons water in a small saucepan over heat. Remove from heat, add the barberries and set aside to soak. (If using currants, skip this step.)",
      "Heat half the olive oil in a large lidded sauté pan over medium heat. Add the onions and cook for 10–15 minutes, stirring occasionally, until deep golden brown. Transfer to a bowl and wipe the pan clean.",
      "Season the chicken with 1½ teaspoons each salt and black pepper. Add the remaining olive oil, cardamom, cloves and cinnamon and mix well with your hands. Heat the pan again and sear the chicken with the spices for 5 minutes each side, then remove. Remove most of the oil, leaving a thin film.",
      "Add the rice, caramelized onion, 1 teaspoon salt and plenty of pepper to the pan. Drain the barberries and add them too. Stir well. Return the seared chicken to the pan, pushing it into the rice.",
      "Pour the boiling water over the rice and chicken, cover, and cook over very low heat for 30 minutes.",
      "Take the pan off the heat. Remove the lid, place a clean tea towel over the pan, and seal again with the lid. Leave undisturbed for 10 minutes.",
      "Add the herbs and use a fork to stir them in and fluff up the rice. Taste, adjust seasoning, and serve hot or warm with the yogurt mixture alongside if you like."
    ]
  },
  {
    "id": "ottolenghi-chermoula-eggplant-bulgur",
    "name": "Yotam Ottolenghi's Chermoula Eggplant With Bulgur and Yogurt",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "high",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 90,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["eggplant", "bulgur", "preserved lemon", "chermoula", "almonds", "green olives", "raisins"],
    "pantryFriendly": false,
    "season": [],
    "description": "Roasted eggplant halves slathered in chermoula — a North African spice paste of cumin, coriander, paprika and preserved lemon — served on a tabbouleh-like bulgur salad with olives, raisins and toasted almonds. From Ottolenghi's Jerusalem.",
    "notes": "Preserved lemon peel is widely available in jars; it's essential to the flavour. Serve at room temperature if making ahead. The yogurt is optional but recommended. Can be served as a vegetarian main or a generous side.",
    "ingredients": [
      "2 cloves garlic, crushed",
      "2 teaspoons ground cumin",
      "2 teaspoons ground coriander",
      "1 teaspoon chili flakes",
      "1 teaspoon sweet paprika",
      "2 tablespoons finely chopped preserved lemon peel",
      "⅔ cup olive oil, plus extra to finish",
      "2 medium eggplants",
      "1 cup fine bulgur",
      "⅔ cup boiling water",
      "⅓ cup golden raisins",
      "3½ tablespoons warm water",
      "2 teaspoons cilantro, chopped, plus extra to finish",
      "2 teaspoons mint, chopped",
      "⅓ cup pitted green olives, halved",
      "⅓ cup sliced almonds, toasted",
      "3 green onions, chopped",
      "1½ tablespoons freshly squeezed lemon juice",
      "Salt",
      "½ cup Greek yogurt (optional, to serve)"
    ],
    "method": [
      "Preheat oven to 400°F.",
      "Make the chermoula: mix together the garlic, cumin, coriander, chili flakes, paprika, preserved lemon, two-thirds of the olive oil and ½ teaspoon salt in a small bowl.",
      "Cut the eggplants in half lengthwise. Score the flesh deeply in a diagonal crisscross pattern, being careful not to pierce the skin. Spoon the chermoula over each half, spreading it evenly. Place cut-side up on a baking sheet and roast for 40 minutes, or until completely soft.",
      "Meanwhile, place the bulgur in a large bowl and cover with the boiling water. Set aside.",
      "Soak the raisins in the warm water for 10 minutes, then drain. Add the raisins to the bulgur along with the remaining olive oil, herbs, olives, almonds, green onions, lemon juice and a pinch of salt. Stir to combine and taste for seasoning.",
      "Serve the eggplants warm or at room temperature. Place half an eggplant cut-side up on each plate, spoon the bulgur generously on top (letting some spill to the sides), add a dollop of yogurt if using, scatter extra cilantro and finish with a drizzle of oil."
    ]
  },
  {
    "id": "ottolenghi-baked-rice-slow-roasted-tomatoes",
    "name": "Baked Rice With Slow-Roasted Tomatoes and Garlic",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "high",
    "mood": ["comforting", "impressive"],
    "time": 105,
    "meal": "dinner",
    "dietary": ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    "keyIngredients": ["cherry tomatoes", "basmati rice", "garlic", "shallots", "cinnamon", "thyme", "cilantro"],
    "pantryFriendly": false,
    "season": ["summer", "fall"],
    "description": "Basmati rice baked directly on a casserole of slowly roasted cherry tomatoes, garlic, shallots and cinnamon until fragrant and tender. From Ottolenghi Simple — mostly hands-off and virtually foolproof.",
    "notes": "Don't stir when adding the rice — just scatter it over the vegetables. Crumbled feta and pine nuts on top make it a more substantial vegetarian main. Also works as a side to pan-seared meat or fish.",
    "ingredients": [
      "1¾ pounds cherry tomatoes",
      "12 large garlic cloves",
      "4 large shallots, cut into 1¼-inch pieces",
      "1¼ cup cilantro stems, cut into 1½-inch pieces",
      "3 tablespoons fresh thyme leaves",
      "4 small cinnamon sticks",
      "1 teaspoon fine sea salt, plus more as needed",
      "Black pepper, as needed",
      "7 tablespoons extra-virgin olive oil",
      "1½ cups basmati rice",
      "2½ cups boiling water",
      "½ cup cilantro leaves, roughly chopped"
    ],
    "method": [
      "Heat oven to 350°F.",
      "In an 8-by-12-inch casserole dish, toss together the tomatoes, garlic, shallots, cilantro stems, thyme, cinnamon sticks, ½ teaspoon salt and pepper to taste. Pour the oil over everything. Bake until the vegetables are soft, about 1 hour. Remove from oven and increase temperature to 450°F.",
      "Without stirring, sprinkle the rice evenly over the vegetables. Top with the remaining ½ teaspoon salt and plenty of black pepper.",
      "Carefully pour the boiling water over the rice. Cover the dish tightly with foil and bake for 25 minutes, until the rice is cooked.",
      "Remove from oven and leave to rest, still covered, for 10 minutes. Remove the foil, gently stir in the cilantro leaves, taste for salt, and serve."
    ]
  },
  {
    "id": "ottolenghi-hummus-jerusalem",
    "name": "Hummus from 'Jerusalem'",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 45,
    "meal": "snack",
    "dietary": ["vegan", "vegetarian", "gluten-free", "dairy-free"],
    "keyIngredients": ["chickpeas", "tahini", "lemon", "garlic"],
    "pantryFriendly": true,
    "season": [],
    "description": "Ottolenghi's legendary hummus from Jerusalem — dried chickpeas cooked with baking soda until ultra-soft, then blended with a generous amount of tahini, lemon and garlic until impossibly smooth and creamy. Worth every minute.",
    "notes": "Requires overnight soaking of chickpeas — plan ahead. Baking soda is key: it softens the chickpeas faster and makes the hummus silkier. If too stiff, loosen with a little water. Rest for at least 30 minutes before serving; remove from fridge 30 min before eating. Keeps refrigerated for 2 days.",
    "ingredients": [
      "1¼ cups (250g) dried chickpeas",
      "1 teaspoon baking soda",
      "1 cup plus 2 tablespoons (270g) light tahini paste",
      "4 tablespoons freshly squeezed lemon juice",
      "4 cloves garlic, crushed",
      "Salt",
      "6½ tablespoons (100ml) ice-cold water"
    ],
    "method": [
      "Put the chickpeas in a large bowl and cover with cold water at least twice their volume. Leave to soak overnight.",
      "The next day, drain the chickpeas. In a medium saucepan, combine with the baking soda over high heat and cook for 3 minutes, stirring constantly. Add 6½ cups water, bring to a boil, then simmer for 20–40 minutes, skimming off foam and any skins. They're ready when very tender and almost — but not quite — mushy.",
      "Drain the chickpeas (you should have about 3 cups/600g). Process in a food processor until a stiff paste forms. With the machine running, add the tahini, lemon juice, garlic and 1½ teaspoons salt. Slowly drizzle in the ice water and process for 5 minutes until very smooth and creamy.",
      "Transfer to a bowl, press plastic wrap directly onto the surface, and rest for at least 30 minutes before serving. Refrigerate if making ahead (up to 2 days); bring to room temperature before serving."
    ]
  },
  {
    "id": "ottolenghi-caramelized-peaches-rum-cream",
    "name": "Caramelized Peaches With Rum and Cream",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "other",
    "effort": "medium",
    "mood": ["comforting", "impressive", "fresh"],
    "time": 35,
    "meal": "dessert",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["peaches", "rum", "mascarpone", "muscovado sugar", "greek yogurt", "butter", "sesame seeds"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Pan-caramelized peach wedges finished with dark rum and muscovado sugar, served with a cloud of mascarpone and yogurt cream, a sprinkle of toasted sesame and flaked salt. A simple, sultry summer dessert.",
    "notes": "Use firm, just-ripe peaches — overripe ones will turn to mush. To make ahead: prepare all elements separately, then warm the peaches over medium heat for 5 minutes before assembling and serving.",
    "ingredients": [
      "3 tablespoons unsalted butter",
      "4 tablespoons dark muscovado sugar, divided",
      "4 firm, just-ripe peaches, cut into 6 wedges each",
      "¼ cup plus 1 teaspoon dark rum, divided",
      "⅔ cup plain Greek yogurt",
      "½ cup mascarpone",
      "2 teaspoons sesame seeds, lightly toasted and lightly ground",
      "Flaked sea salt"
    ],
    "method": [
      "Add the butter and 3 tablespoons of sugar to a large skillet over medium-high heat, stirring occasionally. Once melted, add the peaches flesh-side down and cook for 10 minutes, turning halfway, until both sides are golden brown.",
      "Add the ¼ cup rum and 1 tablespoon water and cook for 2 minutes, swirling the pan, until the caramel coats the peaches. Remove from heat and leave to cool slightly for 5 minutes.",
      "Mix the yogurt and mascarpone together in a medium bowl.",
      "Mix the remaining 1 teaspoon rum and 1 tablespoon sugar together in a small bowl.",
      "To serve, dollop the yogurt mixture into the pan with the peaches. Sprinkle with the rum-sugar mixture, the sesame seeds and a pinch of flaked salt."
    ]
  },
  {
    "id": "ottolenghi-lamb-meatball-semolina-dumpling-soup",
    "name": "Lamb Meatball and Semolina Dumpling Soup With Collard Greens",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 50,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["lamb", "semolina", "collard greens", "chicken stock", "tomato paste", "lemon", "buttermilk"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A hearty, sour-broth soup inspired by Iraqi kubba hamuth, with spiced lamb meatballs and fluffy semolina dumplings simmered in a tomato, lemon and collard green broth. A deeply comforting meal in a bowl.",
    "notes": "Inspired by Iraqi kubba hamuth — 'hamuth' means sour, referring to the tomato-lemon broth. Swap collard greens for Tuscan kale if needed. Don't stir after adding the dumplings. Fresh bread crumbs are best: blitz crustless white bread in a food processor.",
    "ingredients": [
      "10 ounces ground lamb",
      "⅓ cup (30g) fresh bread crumbs",
      "¼ cup coarsely grated onion",
      "Scant ¼ cup finely chopped fresh parsley",
      "1½ teaspoons ground allspice",
      "1 teaspoon ground cumin",
      "¾ teaspoon fine sea salt",
      "1 tablespoon olive oil, plus more for hands",
      "1 small onion, roughly chopped",
      "5 garlic cloves, roughly chopped",
      "2 jalapeños, halved, seeded and roughly chopped",
      "¼ cup olive oil",
      "6 tablespoons (90g) tomato paste",
      "½ cup finely chopped fresh cilantro, plus more to garnish",
      "1½ teaspoons ground cumin",
      "1½ teaspoons ground coriander",
      "½ teaspoon ground turmeric",
      "1 small (10-ounce) bunch collard greens, stems removed, leaves finely shredded",
      "1 tablespoon fine semolina",
      "¾ teaspoon granulated sugar",
      "1 quart chicken stock",
      "Fine sea salt and black pepper",
      "¼ cup fresh lemon juice",
      "¼ cup buttermilk, plus ¼ cup extra for serving",
      "3 tablespoons unsalted butter, melted",
      "1 large egg",
      "½ teaspoon baking powder",
      "½ cup (50g) fresh bread crumbs",
      "½ cup fine semolina"
    ],
    "method": [
      "Make the meatballs: combine all meatball ingredients except the oil in a bowl and knead well. With oiled hands, roll into 18 small balls.",
      "Heat 1 tablespoon oil in a large nonstick pan over medium-high. Brown the meatballs for 3–4 minutes, turning, until browned but not cooked through. Transfer to a bowl with any juices and set aside.",
      "Make the broth: blitz the onion, garlic and jalapeños in a food processor to a rough paste. Heat the oil in a deep lidded saucepan over medium-high. Cook the paste for 6 minutes until softened and browned. Add tomato paste, cilantro, cumin, coriander and turmeric and cook for 2 minutes, stirring, until deeply red. Add the collard greens in handfuls, stirring to wilt. Stir in the semolina and sugar, then add the stock, 1 cup water, 1½ teaspoons salt and pepper. Bring to a boil, then simmer on medium for 15 minutes.",
      "Make the dumplings: whisk buttermilk, butter, egg, baking powder, ½ teaspoon salt and pepper until just combined. Add bread crumbs and semolina and mix until just combined — don't overwork. Rest for 5 minutes, then shape into 18 compact balls.",
      "Reduce the broth to medium-low and stir in the meatballs. Gently lower in the dumplings one by one without stirring. Cover and cook for 10 minutes until the dumplings are puffed and cooked through. Stir in the lemon juice.",
      "Divide among bowls, drizzle with extra buttermilk, scatter cilantro and serve warm."
    ]
  },
  {
    "id": "ottolenghi-winter-minestrone-cabbage-pesto",
    "name": "Winter Minestrone With Cabbage Pesto",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "high",
    "mood": ["comforting", "impressive", "adventurous"],
    "time": 70,
    "meal": "dinner",
    "dietary": ["vegetarian", "vegan", "dairy-free"],
    "keyIngredients": ["savoy cabbage", "black beans", "orzo", "spinach", "celery", "carrot", "parsley", "pine nuts"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A deeply flavourful winter minestrone of slowly caramelized vegetables, black beans and orzo, crowned with a vibrant cabbage and parsley pesto. Ottolenghi's vegetable-forward take on a classic — flexible and forgiving.",
    "notes": "Use vegetable stock to keep it vegan. Swap spinach for chard, orzo for rice, or black beans for chickpeas (adjust cook times). Remove from heat while orzo still has a little bite — it finishes cooking off the heat.",
    "ingredients": [
      "½ cup plus ⅓ cup extra-virgin olive oil",
      "4 celery stalks, diced",
      "2 medium carrots, peeled and diced",
      "1 large yellow onion, peeled and diced",
      "1 tablespoon minced fresh rosemary",
      "Fine sea salt and freshly ground black pepper",
      "5 garlic cloves, minced, plus 1 extra for the pesto",
      "1 (14-ounce) can diced tomatoes, drained",
      "½ savoy cabbage, quartered, cored and thinly sliced (reserve some for pesto)",
      "2¼ cups chicken or vegetable stock",
      "½ cup orzo (or similar small pasta)",
      "5 cups baby spinach",
      "1 (14-ounce) can black beans, rinsed",
      "1 lightly packed cup fresh parsley leaves",
      "3 tablespoons pine nuts"
    ],
    "method": [
      "Add ½ cup olive oil, celery, carrots, onion, rosemary, 1½ teaspoons salt and a good grind of pepper to a large casserole or saucepan. Cook over medium-high heat, stirring occasionally, for 25 minutes until the vegetables have softened and slightly caramelized.",
      "Add the 5 minced garlic cloves and stir for 2 minutes. Add the tomatoes and cook for 2 minutes more, stirring, until they start to break down.",
      "Add 4 cups of the sliced cabbage and cook for 4 minutes, stirring, until softened. Add the stock and 3¼ cups water, stir to combine, and simmer on medium for 20 minutes.",
      "Add the orzo and cook for 5 minutes, stirring occasionally to prevent sticking.",
      "Remove from heat while the orzo still has a little bite. Stir in the spinach and black beans. Set aside for 5 minutes to let the orzo finish cooking.",
      "Make the pesto: pulse the parsley, pine nuts, remaining sliced cabbage, extra garlic clove and ½ teaspoon salt in a food processor to a coarse paste. Stir in the remaining ⅓ cup oil and a crack of pepper.",
      "Ladle the minestrone into bowls and top each with a spoonful of cabbage pesto."
    ]
  }
];

  var BUILTIN_TREE = {"questions":[{"id":"meal","text":"What are we eating?","subtitle":"Pick one to get started.","field":"meal","type":"single","options":[{"value":"breakfast","label":"Breakfast"},{"value":"lunch","label":"Lunch"},{"value":"dinner","label":"Dinner"},{"value":"snack","label":"Snack"},{"value":"dessert","label":"Dessert"},{"value":"drinks","label":"Drinks"},{"value":"any","label":"No preference"}],"allowSkip":false,"filterLogic":"match-or-any"},{"id":"mood","text":"What's the vibe?","subtitle":"Pick as many as feel right.","field":"mood","type":"multi","options":[{"value":"comforting","label":"Something cozy & comforting"},{"value":"fresh","label":"Something fresh & light"},{"value":"impressive","label":"Something to show off"},{"value":"quick-fix","label":"Just feed me, fast"},{"value":"adventurous","label":"Something new & different"}],"allowSkip":true,"filterLogic":"overlap"},{"id":"effort","text":"How much energy do you have?","subtitle":"Be honest with yourself.","field":"effort","type":"single","options":[{"value":"low","label":"Minimal — under 30 min, easy"},{"value":"medium","label":"Some — 30 to 60 min"},{"value":"high","label":"I want a project — 60+ min"}],"allowSkip":true,"filterLogic":"match-or-below"},{"id":"cuisine","text":"Any cuisine calling to you?","subtitle":"Pick as many as you like, or choose No preference.","field":"cuisine","type":"multi","options":[{"value":"mediterranean","label":"Mediterranean"},{"value":"east-asian","label":"East Asian"},{"value":"south-asian","label":"South Asian"},{"value":"mexican","label":"Mexican"},{"value":"italian","label":"Italian"},{"value":"middle-eastern","label":"Middle Eastern"},{"value":"american","label":"American"},{"value":"french","label":"French"}],"allowSkip":true,"filterLogic":"overlap"},{"id":"dietary","text":"Any dietary needs today?","subtitle":"Select all that apply, or choose No preference.","field":"dietary","type":"multi","options":[{"value":"vegetarian","label":"Vegetarian"},{"value":"vegan","label":"Vegan"},{"value":"gluten-free","label":"Gluten-free"},{"value":"dairy-free","label":"Dairy-free"}],"allowSkip":true,"filterLogic":"subset"},{"id":"pantry","text":"Working with what's on hand?","subtitle":"Only show recipes you can make from pantry staples.","field":"pantryFriendly","type":"single","options":[{"value":"yes","label":"Yes, pantry raid mode"},{"value":"no","label":"I can shop"}],"allowSkip":true,"filterLogic":"boolean-filter-if-true"}]};

  var allRecipes = [];
  var tree = null;
  var userData = null;
  var webRecipeCache = {}; // temporary store for current Spoonacular results
  var shoppingUnitMode = "metric"; // "metric" | "imperial" — display preference, not persisted
  var recipeUnitMode = "metric";   // same for the recipe detail screen
  var recipeCurrentServings = null; // absolute serving count being displayed; null = not scalable

  var state = {
    screen: "landing",
    questionIndex: 0,
    answers: {},
    multiSelections: [],
    resultsMode: "tree", // "tree" or "surprise"
    editingId: null,
    detailFromScreen: null,
    currentDetailId: null,
  };

  // ---- Data loading ----

  function init() {
    tree = BUILTIN_TREE;
    loadUserData();
    rebuildAllRecipes();
    console.log("Loaded " + BUILTIN_RECIPES.length + " built-in + " +
      (userData.customRecipes.length) + " custom recipes");
    setupEventListeners();
    renderForYou();
  }

  // ---- User data layer (localStorage) ----

  function defaultUserData() {
    return {
      version: DATA_VERSION,
      ratings: {},
      notes: {},
      removed: [],
      plan: {},
      shortlist: [],
      customRecipes: [],
      apiKey: "",
      ingredientOverrides: {},
      shopping: { checked: {}, extras: [] },
      history: {},  // { [id]: { count: number, lastCooked: "YYYY-MM-DD" } }
      dinnerParties: [],     // array of party objects (newest first)
      currentPartyId: null,  // id of the party currently being edited
    };
  }

  function loadUserData() {
    userData = defaultUserData();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          userData = Object.assign(defaultUserData(), parsed);
          // Ensure all containers exist with the right type
          if (!userData.ratings) userData.ratings = {};
          if (!userData.notes) userData.notes = {};
          if (!Array.isArray(userData.removed)) userData.removed = [];
          if (!userData.plan) userData.plan = {};
          if (!Array.isArray(userData.shortlist)) userData.shortlist = [];
          if (!Array.isArray(userData.customRecipes)) userData.customRecipes = [];
          if (typeof userData.apiKey !== "string") userData.apiKey = "";
          if (!userData.ingredientOverrides || typeof userData.ingredientOverrides !== "object") userData.ingredientOverrides = {};
          if (!userData.shopping || typeof userData.shopping !== "object") userData.shopping = { checked: {}, extras: [] };
          if (!userData.shopping.checked || typeof userData.shopping.checked !== "object") userData.shopping.checked = {};
          if (!Array.isArray(userData.shopping.extras)) userData.shopping.extras = [];
          if (!userData.history || typeof userData.history !== "object") userData.history = {};
          if (!Array.isArray(userData.dinnerParties)) userData.dinnerParties = [];
          if (typeof userData.currentPartyId !== "string") userData.currentPartyId = null;
        }
      }
    } catch (e) {
      console.warn("Could not read saved data, starting fresh:", e);
      userData = defaultUserData();
    }
  }

  function saveUserData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.warn("Could not save data:", e);
    }
  }

  function rebuildAllRecipes() {
    allRecipes = BUILTIN_RECIPES.concat(userData.customRecipes);
    populateBrowseFilters();
  }

  function getRating(id) { return userData.ratings[id] || 0; }
  function setRating(id, n) {
    if (n) userData.ratings[id] = n;
    else delete userData.ratings[id];
    saveUserData();
  }
  function ratingForSort(id) {
    var r = getRating(id);
    return r === 0 ? 3 : r; // unrated treated as neutral
  }

  function getNote(id) { return userData.notes[id] || ""; }
  function setNote(id, text) {
    text = (text || "").trim();
    if (text) userData.notes[id] = text;
    else delete userData.notes[id];
    saveUserData();
  }

  function isRemoved(id) { return userData.removed.indexOf(id) !== -1; }
  function removeRecipe(id) {
    if (!isRemoved(id)) userData.removed.push(id);
    saveUserData();
  }
  function restoreRecipe(id) {
    var i = userData.removed.indexOf(id);
    if (i !== -1) userData.removed.splice(i, 1);
    saveUserData();
  }

  function recipeById(id) {
    for (var i = 0; i < allRecipes.length; i++) {
      if (allRecipes[i].id === id) return allRecipes[i];
    }
    return webRecipeCache[id] || null;
  }
  function isCustom(recipe) { return !!recipe.custom; }

  // Pools
  function visibleRecipes() {
    return allRecipes.filter(function (r) { return !isRemoved(r.id); });
  }
  function eligibleForSuggestions() {
    return allRecipes.filter(function (r) {
      return !isRemoved(r.id) && getRating(r.id) !== 1;
    });
  }

  // ---- Screen management ----

  function showScreen(name) {
    state.screen = name;
    var current = document.querySelector(".screen.active");
    var target = document.getElementById("screen-" + name);
    var gear = document.getElementById("btn-settings");
    gear.style.display = name === "landing" ? "" : "none";
    document.getElementById("btn-home").style.display = name === "landing" ? "none" : "";

    function doSwitch() {
      document.querySelectorAll(".screen").forEach(function (el) {
        el.classList.remove("active", "screen-exiting");
      });
      if (target) {
        target.classList.add("active");
        target.style.animation = "none";
        target.offsetHeight;
        target.style.animation = "";
      }
      window.scrollTo(0, 0);
    }

    if (current && current !== target) {
      current.classList.add("screen-exiting");
      setTimeout(doSwitch, 150);
    } else {
      doSwitch();
    }
  }

  function showError(msg) {
    document.getElementById("error-message").textContent = msg;
    showScreen("error");
  }

  function startOver() { showScreen("landing"); }

  function rerenderScreen() {
    if (state.screen === "results") {
      if (state.resultsMode === "surprise") surpriseMe();
      else showResults();
    } else if (state.screen === "browse") {
      filterBrowse();
    } else if (state.screen === "planner") {
      renderPlanner();
    }
  }

  // ---- Event listeners ----

  function setupEventListeners() {
    document.getElementById("btn-decide").addEventListener("click", startTree);
    document.getElementById("btn-surprise").addEventListener("click", surpriseMe);
    document.getElementById("btn-browse").addEventListener("click", showBrowse);
    document.getElementById("btn-planner").addEventListener("click", openPlanner);
    document.getElementById("btn-add").addEventListener("click", function () { openAddRecipe(null); });
    document.getElementById("btn-settings").addEventListener("click", showSettings);
    document.getElementById("btn-home").addEventListener("click", startOver);

    document.getElementById("btn-back").addEventListener("click", goBack);
    document.getElementById("btn-start-over").addEventListener("click", startOver);
    document.getElementById("btn-skip").addEventListener("click", skipQuestion);
    document.getElementById("btn-next").addEventListener("click", submitMulti);

    document.getElementById("btn-pick-one").addEventListener("click", pickOneForMe);
    document.getElementById("btn-results-start-over").addEventListener("click", startOver);
    document.getElementById("btn-more-toggle").addEventListener("click", toggleMore);

    document.getElementById("btn-browse-back").addEventListener("click", startOver);
    document.getElementById("btn-browse-add").addEventListener("click", function () { openAddRecipe(null); });
    document.getElementById("search-input").addEventListener("input", filterBrowse);
    document.querySelectorAll(".filter-select").forEach(function (sel) {
      sel.addEventListener("change", filterBrowse);
    });

    document.getElementById("btn-planner-back").addEventListener("click", startOver);
    document.getElementById("planner-search").addEventListener("input", renderPlannerSearch);
    document.getElementById("btn-make-shopping").addEventListener("click", openShoppingList);

    document.getElementById("btn-dinner-party").addEventListener("click", openParties);
    document.getElementById("btn-parties-back").addEventListener("click", startOver);
    document.getElementById("btn-new-party").addEventListener("click", createParty);
    document.getElementById("parties-search").addEventListener("input", function () {
      renderPartiesList(this.value);
    });
    document.getElementById("btn-party-back").addEventListener("click", openParties);
    document.getElementById("btn-print-menu").addEventListener("click", printMenu);
    document.getElementById("btn-add-guest").addEventListener("click", addGuest);
    document.getElementById("guest-name-input").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); addGuest(); }
    });
    document.getElementById("party-name").addEventListener("input", function () {
      var p = currentParty();
      if (p) { p.name = this.value; saveUserData(); }
      resizePartyNameInput(this);
    });
    document.getElementById("party-date").addEventListener("change", function () {
      var p = currentParty();
      if (p) { p.date = this.value; saveUserData(); }
    });
    document.getElementById("btn-seat-inc").addEventListener("click", function () { setSeatCount(1); });
    document.getElementById("btn-seat-dec").addEventListener("click", function () { setSeatCount(-1); });

    document.getElementById("btn-shopping-back").addEventListener("click", function () { openPlanner(); });
    document.getElementById("btn-shopping-copy").addEventListener("click", copyShoppingList);
    document.getElementById("btn-shopping-clear").addEventListener("click", function () {
      userData.shopping.checked = {};
      saveUserData();
      buildShoppingList();
    });
    document.getElementById("toggle-recipe-units").addEventListener("change", function () {
      recipeUnitMode = this.checked ? "imperial" : "metric";
      document.getElementById("recipe-units-toggle-label").textContent = this.checked ? "Imperial" : "Metric";
      if (state.currentDetailId) {
        var r = recipeById(state.currentDetailId);
        if (r) {
          var scale = (recipeCurrentServings && r.servings) ? recipeCurrentServings / r.servings : 1;
          renderDetailIngredients(getRecipeIngredients(r), scale);
        }
      }
    });

    document.getElementById("btn-servings-dec").addEventListener("click", function () {
      if (recipeCurrentServings == null || recipeCurrentServings <= 1) return;
      recipeCurrentServings--;
      var r = recipeById(state.currentDetailId);
      if (!r) return;
      document.getElementById("servings-display").textContent = "Serves " + recipeCurrentServings;
      renderDetailIngredients(getRecipeIngredients(r), recipeCurrentServings / r.servings);
    });

    document.getElementById("btn-servings-inc").addEventListener("click", function () {
      if (recipeCurrentServings == null) return;
      recipeCurrentServings++;
      var r = recipeById(state.currentDetailId);
      if (!r) return;
      document.getElementById("servings-display").textContent = "Serves " + recipeCurrentServings;
      renderDetailIngredients(getRecipeIngredients(r), recipeCurrentServings / r.servings);
    });
    document.getElementById("toggle-shopping-units").addEventListener("change", function () {
      shoppingUnitMode = this.checked ? "imperial" : "metric";
      document.getElementById("units-toggle-label").textContent = this.checked ? "Imperial" : "Metric";
      buildShoppingList();
    });
    document.getElementById("btn-shopping-add-extra").addEventListener("click", addShoppingExtra);
    document.getElementById("shopping-extra-input").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); addShoppingExtra(); }
    });

    document.getElementById("btn-add-back").addEventListener("click", cancelForm);
    document.getElementById("form-cancel").addEventListener("click", cancelForm);
    document.getElementById("recipe-form").addEventListener("submit", saveForm);
    document.getElementById("form-delete").addEventListener("click", deleteCustomRecipe);

    document.getElementById("btn-recipe-back").addEventListener("click", function () {
      showScreen(state.detailFromScreen || "landing");
    });
    document.getElementById("btn-settings-back").addEventListener("click", startOver);
    document.getElementById("btn-export").addEventListener("click", exportBackup);
    document.getElementById("btn-import").addEventListener("click", function () {
      document.getElementById("import-file").click();
    });
    document.getElementById("import-file").addEventListener("change", importBackup);
    document.getElementById("btn-save-key").addEventListener("click", saveApiKey);
  }

  // ---- Decision tree ----

  function startTree() {
    state.questionIndex = 0;
    state.answers = {};
    state.multiSelections = [];
    renderQuestion();
    showScreen("question");
  }

  function renderQuestion() {
    var q = tree.questions[state.questionIndex];
    if (!q) {
      state.resultsMode = "tree";
      showResults();
      return;
    }

    document.getElementById("question-text").textContent = q.text;
    document.getElementById("question-subtitle").textContent = q.subtitle;

    var dotsContainer = document.getElementById("progress-dots");
    dotsContainer.innerHTML = "";
    tree.questions.forEach(function (_, i) {
      var dot = document.createElement("span");
      dot.className = "dot";
      if (i < state.questionIndex) {
        dot.classList.add("done");
        if (i === state.questionIndex - 1) dot.classList.add("just-done");
      }
      if (i === state.questionIndex) dot.classList.add("active");
      dotsContainer.appendChild(dot);
    });

    var grid = document.getElementById("options-grid");
    grid.innerHTML = "";
    state.multiSelections = [];

    var isMulti = q.type === "multi";

    q.options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt.label;
      btn.dataset.value = typeof opt.value === "boolean" ? opt.value.toString() : opt.value;

      if (isMulti) {
        btn.addEventListener("click", function () { toggleMultiOption(btn, opt.value); });
      } else {
        btn.addEventListener("click", function () { selectSingle(q, opt.value); });
      }
      grid.appendChild(btn);
    });

    document.getElementById("btn-skip").style.display = q.allowSkip ? "" : "none";
    document.getElementById("btn-next").style.display = isMulti ? "" : "none";
    document.getElementById("btn-back").style.visibility = state.questionIndex > 0 ? "visible" : "hidden";

    updateMatchCount();
  }

  function toggleMultiOption(btn, value) {
    var idx = state.multiSelections.indexOf(value);
    if (idx === -1) {
      state.multiSelections.push(value);
      btn.classList.add("selected");
    } else {
      state.multiSelections.splice(idx, 1);
      btn.classList.remove("selected");
    }
    updateMatchCount();
  }

  function selectSingle(question, value) {
    state.answers[question.id] = value;
    state.questionIndex++;
    renderQuestion();
  }

  function submitMulti() {
    var q = tree.questions[state.questionIndex];
    if (state.multiSelections.length > 0) {
      state.answers[q.id] = state.multiSelections.slice();
    }
    state.questionIndex++;
    renderQuestion();
  }

  function skipQuestion() {
    state.questionIndex++;
    renderQuestion();
  }

  function goBack() {
    if (state.questionIndex > 0) {
      state.questionIndex--;
      var q = tree.questions[state.questionIndex];
      delete state.answers[q.id];
      renderQuestion();
    }
  }

  function updateMatchCount() {
    var tempAnswers = Object.assign({}, state.answers);
    var q = tree.questions[state.questionIndex];
    if (q && q.type === "multi" && state.multiSelections.length > 0) {
      tempAnswers[q.id] = state.multiSelections.slice();
    }
    var count = filterRecipes(tempAnswers, false).length;
    document.getElementById("match-count").textContent =
      count + " recipe" + (count !== 1 ? "s" : "") + " match so far";
  }

  // ---- Filtering ----

  function filterRecipes(answers, allowRelax) {
    var result = eligibleForSuggestions();

    tree.questions.forEach(function (q) {
      var answer = answers[q.id];
      if (answer === undefined || answer === null) return;
      result = result.filter(function (recipe) { return applyFilter(q, answer, recipe); });
    });

    if (allowRelax && result.length < 3) {
      return relaxFilters(answers);
    }
    return result;
  }

  function applyFilter(question, answer, recipe) {
    var field = question.field;
    var logic = question.filterLogic;
    var val = recipe[field];

    switch (logic) {
      case "match-or-any":
        return val === answer || val === "any" || answer === "any";
      case "overlap":
        if (!Array.isArray(answer)) answer = [answer];
        if (!Array.isArray(val)) val = [val];
        return answer.some(function (a) { return val.indexOf(a) !== -1; });
      case "match":
        return val === answer;
      case "match-or-below":
        var levels = ["low", "medium", "high"];
        return levels.indexOf(val) <= levels.indexOf(answer);
      case "subset":
        if (!Array.isArray(answer)) answer = [answer];
        var dietaryArr = Array.isArray(val) ? val : [];
        return answer.every(function (a) { return dietaryArr.indexOf(a) !== -1; });
      case "boolean-filter-if-true":
        if (answer === "yes" || answer === true) return recipe[field] === true;
        return true;
      default:
        return true;
    }
  }

  function relaxFilters(answers) {
    var relaxOrder = ["pantry", "dietary", "cuisine", "effort", "mood"];
    var relaxed = Object.assign({}, answers);
    var relaxedFields = [];

    for (var i = 0; i < relaxOrder.length; i++) {
      var key = relaxOrder[i];
      if (relaxed[key] !== undefined) {
        delete relaxed[key];
        relaxedFields.push(key);
        var result = filterRecipes(relaxed, false);
        if (result.length >= 3) {
          result._relaxedFields = relaxedFields;
          return result;
        }
      }
    }
    var all = eligibleForSuggestions();
    all._relaxedFields = relaxedFields;
    return all;
  }

  // Order a pool so higher-rated float up, with randomness within equal ratings.
  function renderForYou() {
    var section = document.getElementById("landing-foryou");
    if (!section) return;
    var profile = buildAffinityProfile();
    if (!profile.active) { section.style.display = "none"; return; }

    // Score and pick top 3, excluding recently cooked (< 5 days)
    var picks = eligibleForSuggestions()
      .map(function (r) {
        var h = userData.history && userData.history[r.id];
        var daysSince = h && h.lastCooked
          ? (Date.now() - new Date(h.lastCooked).getTime()) / 86400000
          : 999;
        return { r: r, score: scoreRecipe(r.id, profile), daysSince: daysSince };
      })
      .filter(function (x) { return x.daysSince >= 5; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (x) { return x.r; });

    if (!picks.length) { section.style.display = "none"; return; }

    // Label: surface the top affinity ingredient for context
    var topIngredients = Object.keys(profile.ingredients).slice(0, 2).join(" & ");
    var labelEl = document.getElementById("foryou-label");
    if (labelEl) labelEl.textContent = topIngredients
      ? "Because you love " + topIngredients
      : "For you";

    var container = document.getElementById("foryou-cards");
    container.innerHTML = "";
    picks.forEach(function (recipe) {
      var card = document.createElement("button");
      card.className = "foryou-card tile-" + tileIndexForRecipe(recipe.id);
      card.setAttribute("aria-label", recipe.name);
      card.addEventListener("click", function () { showRecipeDetail(recipe.id); });

      var inner = document.createElement("div");
      inner.className = "foryou-card-inner";

      var name = document.createElement("span");
      name.className = "foryou-card-name";
      name.textContent = recipe.name;
      inner.appendChild(name);

      // Find top shared ingredient for the "why" tag
      var sharedIngs = (recipe.keyIngredients || []).filter(function (ing) {
        return profile.ingredients[ing.toLowerCase().trim()];
      });
      if (sharedIngs.length) {
        var why = document.createElement("span");
        why.className = "foryou-why";
        why.textContent = sharedIngs[0];
        inner.appendChild(why);
      }

      card.appendChild(inner);
      container.appendChild(card);
    });

    section.style.display = "";
  }

  // Build a set of non-staple ingredients from highly-rated and recently cooked recipes.
  // Returns { ingredients: {norm: true}, active: bool } — active only with enough data.
  function buildAffinityProfile() {
    var highRated = allRecipes.filter(function (r) { return getRating(r.id) >= 4; });
    var historyCount = Object.keys(userData.history || {}).length;
    if (highRated.length < 2 && historyCount < 3) {
      return { ingredients: {}, active: false };
    }
    var ingredients = {};
    highRated.forEach(function (r) {
      (r.keyIngredients || []).forEach(function (ing) {
        var norm = ing.toLowerCase().trim();
        if (STAPLES.indexOf(norm) === -1) ingredients[norm] = true;
      });
    });
    Object.keys(userData.history || {}).forEach(function (hid) {
      var h = userData.history[hid];
      if (!h || !h.lastCooked) return;
      var days = (Date.now() - new Date(h.lastCooked).getTime()) / 86400000;
      if (days <= 30) {
        var r = recipeById(hid);
        if (r) {
          (r.keyIngredients || []).forEach(function (ing) {
            var norm = ing.toLowerCase().trim();
            if (STAPLES.indexOf(norm) === -1) ingredients[norm] = true;
          });
        }
      }
    });
    return { ingredients: ingredients, active: true };
  }

  // Composite score: rating + ingredient affinity + cook frequency/recency + small random.
  // Cold-start: when data is sparse, collapses to rating-only (same as before).
  function scoreRecipe(id, affinityProfile) {
    var ratingPart = ratingForSort(id); // 1-5, unrated → 3

    var historyPart = 0;
    var h = userData.history && userData.history[id];
    if (h && h.lastCooked) {
      var daysSince = (Date.now() - new Date(h.lastCooked).getTime()) / 86400000;
      if (daysSince < 5) {
        historyPart = -1.5; // just cooked — nudge away from it
      } else {
        var count = Math.min(h.count || 1, 6);
        historyPart = count * Math.max(0, 1 - daysSince / 60) * 0.5;
      }
    }

    var affinityPart = 0;
    if (affinityProfile && affinityProfile.active) {
      var r = recipeById(id);
      if (r) {
        var shared = 0;
        (r.keyIngredients || []).forEach(function (ing) {
          if (affinityProfile.ingredients[ing.toLowerCase().trim()]) shared++;
        });
        affinityPart = Math.min(shared, 3) * 0.4; // up to 1.2 bonus
      }
    }

    return ratingPart + historyPart + affinityPart + (Math.random() * 0.3);
  }

  function orderForSuggestions(arr) {
    var profile = buildAffinityProfile();
    return arr
      .map(function (r) { return { r: r, score: scoreRecipe(r.id, profile) }; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (o) { return o.r; });
  }

  // ---- Web recipe discovery (Spoonacular) ----

  var CUISINE_TO_SPOON = {
    "mediterranean": "Mediterranean",
    "east-asian": "Asian",
    "south-asian": "Indian",
    "mexican": "Mexican",
    "italian": "Italian",
    "middle-eastern": "Middle Eastern",
    "american": "American",
    "french": "French",
  };
  var SPOON_TO_CUISINE = {
    "mediterranean": "mediterranean", "greek": "mediterranean", "spanish": "mediterranean",
    "asian": "east-asian", "chinese": "east-asian", "japanese": "east-asian",
    "korean": "east-asian", "thai": "east-asian", "vietnamese": "east-asian",
    "indian": "south-asian",
    "mexican": "mexican",
    "italian": "italian",
    "middle eastern": "middle-eastern",
    "american": "american", "southern": "american", "cajun": "american",
    "french": "french",
  };

  // Translate the decision-tree answers into Spoonacular complexSearch params.
  function buildWebQuery(answers) {
    var params = {};

    if (answers.meal === "breakfast") params.type = "breakfast";
    else if (answers.meal === "lunch" || answers.meal === "dinner") params.type = "main course";
    else if (answers.meal === "snack") params.type = "snack";
    else if (answers.meal === "dessert") params.type = "dessert";
    else if (answers.meal === "drinks") params.type = "beverage";

    var maxTime = null;
    if (answers.effort === "low") maxTime = 30;
    else if (answers.effort === "medium") maxTime = 60;
    // "quick-fix" mood tightens the time cap; other moods are left to local filtering.
    if (answers.mood && answers.mood.indexOf("quick-fix") !== -1) {
      maxTime = Math.min(maxTime || 30, 30);
    }
    if (maxTime) params.maxReadyTime = maxTime;

    if (answers.cuisine && CUISINE_TO_SPOON[answers.cuisine]) {
      params.cuisine = CUISINE_TO_SPOON[answers.cuisine];
    }

    if (answers.dietary && answers.dietary.length) {
      var diets = [];
      var intolerances = [];
      answers.dietary.forEach(function (d) {
        if (d === "vegetarian") diets.push("vegetarian");
        else if (d === "vegan") diets.push("vegan");
        else if (d === "gluten-free") intolerances.push("gluten");
        else if (d === "dairy-free") intolerances.push("dairy");
      });
      if (diets.length) params.diet = diets.join(",");
      if (intolerances.length) params.intolerances = intolerances.join(",");
    }
    // "pantry" has no sensible web mapping and is left to local filtering.
    return params;
  }

  // Fetch matching recipes from Spoonacular. Never throws: on any failure it
  // calls cb({ recipes: [], error: true }) so local results are unaffected.
  function fetchWebRecipes(answers, cb) {
    var key = (userData.apiKey || "").trim();
    if (!key) { cb({ recipes: [], error: false, noKey: true }); return; }

    var params = buildWebQuery(answers);
    params.addRecipeInformation = "true";
    params.number = "9";
    params.apiKey = key;

    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    }).join("&");
    var url = "https://api.spoonacular.com/recipes/complexSearch?" + qs;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var results = (data && data.results) || [];
        cb({ recipes: results.map(function (r) { return normalizeSpoonacular(r, answers); }), error: false });
      })
      .catch(function (err) {
        console.warn("Web recipe fetch failed:", err);
        cb({ recipes: [], error: true });
      });
  }

  function normalizeSpoonacular(r, answers) {
    var time = r.readyInMinutes || 0;
    var effort = time && time < 30 ? "low" : (time && time <= 60 ? "medium" : "high");

    var cuisine = "other";
    if (r.cuisines && r.cuisines.length && SPOON_TO_CUISINE[String(r.cuisines[0]).toLowerCase()]) {
      cuisine = SPOON_TO_CUISINE[String(r.cuisines[0]).toLowerCase()];
    } else if (answers.cuisine) {
      cuisine = answers.cuisine;
    }

    var meal = "any";
    var dishTypes = (r.dishTypes || []).map(function (d) { return String(d).toLowerCase(); });
    if (dishTypes.indexOf("breakfast") !== -1) meal = "breakfast";
    else if (dishTypes.indexOf("dessert") !== -1) meal = "dessert";
    else if (dishTypes.indexOf("beverage") !== -1 || dishTypes.indexOf("drink") !== -1) meal = "drinks";
    else if (dishTypes.indexOf("snack") !== -1 || dishTypes.indexOf("appetizer") !== -1) meal = "snack";
    else if (dishTypes.indexOf("lunch") !== -1) meal = "lunch";
    else if (dishTypes.indexOf("main course") !== -1 || dishTypes.indexOf("dinner") !== -1) meal = "dinner";
    else if (answers.meal && answers.meal !== "any") meal = answers.meal;

    var dietary = [];
    var diets = (r.diets || []).map(function (d) { return String(d).toLowerCase(); });
    if (r.vegan || diets.indexOf("vegan") !== -1) dietary.push("vegan");
    else if (r.vegetarian || diets.indexOf("vegetarian") !== -1) dietary.push("vegetarian");
    if (r.glutenFree || diets.indexOf("gluten free") !== -1) dietary.push("gluten-free");
    if (r.dairyFree || diets.indexOf("dairy free") !== -1) dietary.push("dairy-free");

    var keyIngredients = [];
    if (r.extendedIngredients && r.extendedIngredients.length) {
      keyIngredients = r.extendedIngredients.map(function (ing) {
        return String(ing.nameClean || ing.name || "").toLowerCase();
      }).filter(Boolean).slice(0, 8);
    }

    return {
      id: "spoon-" + r.id,
      name: r.title || "Untitled recipe",
      source: r.sourceName || "Web",
      sourceUrl: r.sourceUrl || r.spoonacularSourceUrl || "",
      cuisine: cuisine,
      effort: effort,
      mood: [],
      time: time,
      meal: meal,
      dietary: dietary,
      keyIngredients: keyIngredients,
      pantryFriendly: false,
      season: [],
      description: stripHtml(r.summary || ""),
      notes: "",
      servings: r.servings || null,
      web: true,
    };
  }

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    var text = (div.textContent || "").trim();
    if (text.length > 180) text = text.slice(0, 177).replace(/\s+\S*$/, "") + "…";
    return text;
  }

  // Render the "New ideas from the web" section for the decision-tree results.
  function renderWebIdeas(answers) {
    var section = document.getElementById("web-ideas-section");
    var grid = document.getElementById("web-ideas-grid");
    var status = document.getElementById("web-ideas-status");
    grid.innerHTML = "";

    if (!(userData.apiKey || "").trim()) {
      section.style.display = "";
      status.textContent = "Add your free Spoonacular key in Settings ⚙️ to discover new recipes.";
      return;
    }

    section.style.display = "";
    status.textContent = "Finding new ideas…";

    fetchWebRecipes(answers, function (res) {
      if (res.error) {
        status.textContent = "Couldn't reach the recipe service. Check your connection or key and try again.";
        return;
      }
      var fresh = res.recipes.filter(function (r) {
        if (recipeById(r.id)) return false;
        if (isRemoved(r.id)) return false;
        var nameLower = r.name.toLowerCase();
        return !allRecipes.some(function (e) { return e.name.toLowerCase() === nameLower; });
      }).slice(0, 4);

      if (!fresh.length) {
        status.textContent = "No new ideas this time — your collection already covers it.";
        return;
      }
      status.textContent = "";
      webRecipeCache = {}; // clear previous results
      fresh.forEach(function (r) {
        webRecipeCache[r.id] = r; // cache so detail screen can look it up
        grid.appendChild(renderRecipeCard(r, { web: true }));
      });
    });
  }

  // ---- Recipe Detail ----

  function renderDetailIngredients(ingredients, scale) {
    scale = scale || 1;
    var ingList = document.getElementById("recipe-detail-ingredients-list");
    ingList.innerHTML = "";
    ingredients.forEach(function (ing) {
      var parsed = parseIngredient(ing);
      var li = document.createElement("li");
      if (parsed && parsed.qty != null) {
        var scaledParsed = { qty: parsed.qty * scale, unit: parsed.unit, name: parsed.name };
        var converted = applyUnitMode(scaledParsed, recipeUnitMode);
        var qtyStr = KEEP_UNITS[converted.unit] ? formatQty(converted.qty) : formatConvertedQty(converted.qty, converted.unit);
        var display = (qtyStr + (converted.unit ? " " + converted.unit : "") + " " + converted.name).trim();
        li.textContent = convertInlineUnits(display, recipeUnitMode);
      } else {
        li.textContent = convertInlineUnits(ing, recipeUnitMode);
      }
      ingList.appendChild(li);
    });
  }


  function showRecipeDetail(id) {
    var recipe = recipeById(id);
    if (!recipe) return;

    state.detailFromScreen = state.screen;
    state.currentDetailId = id;

    // Tile header band — same tile as the recipe's card
    var tileHeader = document.getElementById("recipe-detail-tile-header");
    tileHeader.className = "recipe-detail-tile-header tile-" + tileIndexForRecipe(id);

    // Name
    document.getElementById("recipe-detail-name").textContent = recipe.name;

    // Pills: time, cuisine, effort, meal, mood, dietary
    var pillsEl = document.getElementById("recipe-detail-pills");
    pillsEl.innerHTML = "";
    var pillTexts = [];
    pillTexts.push(recipe.time + " min");
    pillTexts.push(capitalize(String(recipe.cuisine).replace(/-/g, " ")));
    pillTexts.push(capitalize(recipe.effort) + " effort");
    if (recipe.meal && recipe.meal !== "any") pillTexts.push(capitalize(recipe.meal));
    if (recipe.mood && recipe.mood.length) {
      recipe.mood.forEach(function (m) { pillTexts.push(capitalize(m.replace(/-/g, " "))); });
    }
    pillTexts.forEach(function (p) {
      var span = document.createElement("span");
      span.className = "pill";
      span.textContent = p;
      pillsEl.appendChild(span);
    });
    if (recipe.dietary && recipe.dietary.length) {
      recipe.dietary.forEach(function (d) {
        var span = document.createElement("span");
        span.className = "pill dietary-pill";
        span.textContent = capitalize(d);
        pillsEl.appendChild(span);
      });
    }

    // Description
    var descEl = document.getElementById("recipe-detail-description");
    if (recipe.description) {
      descEl.textContent = recipe.description;
      descEl.style.display = "";
    } else {
      descEl.style.display = "none";
    }

    // Ingredients (uses pasted overrides if present)
    var detailIngredients = getRecipeIngredients(recipe);
    var hasIngredients = detailIngredients.length > 0;
    var ingSection = document.getElementById("recipe-detail-ingredients");
    if (hasIngredients) {
      renderDetailIngredients(detailIngredients);
      ingSection.style.display = "";
    } else {
      ingSection.style.display = "none";
    }

    // Method
    var hasMethod = recipe.method && recipe.method.length;
    var methodSection = document.getElementById("recipe-detail-method");
    var methodList = document.getElementById("recipe-detail-method-list");
    if (hasMethod) {
      methodList.innerHTML = "";
      recipe.method.forEach(function (step) {
        var li = document.createElement("li");
        li.textContent = step;
        methodList.appendChild(li);
      });
      methodSection.style.display = "";
    } else {
      methodSection.style.display = "none";
    }

    // External link: always show for attribution; label changes based on whether we have full content
    var linkEl = document.getElementById("recipe-detail-link");
    if (recipe.sourceUrl) {
      linkEl.href = recipe.sourceUrl;
      if (hasIngredients || hasMethod) {
        linkEl.textContent = "View on " + (recipe.source || "source") + " →";
        linkEl.className = "recipe-link detail-external-link";
      } else {
        // No stored content — make the link a proper button so it's obvious
        linkEl.textContent = "View full recipe on " + (recipe.source || "source") + " →";
        linkEl.className = "recipe-link detail-external-link detail-link-prominent";
      }
      linkEl.style.display = "";
    } else {
      linkEl.style.display = "none";
    }

    // Action row
    var actionsEl = document.getElementById("recipe-detail-actions");
    actionsEl.innerHTML = "";
    if (recipe.web) {
      actionsEl.appendChild(buildWebActionRow(recipe, null));
    } else {
      actionsEl.appendChild(buildActionRow(recipe));
    }

    recipeUnitMode = "metric";
    document.getElementById("toggle-recipe-units").checked = false;
    document.getElementById("recipe-units-toggle-label").textContent = "Metric";

    // Servings stepper
    var stepperEl = document.getElementById("recipe-servings-stepper");
    var servingsDisplay = document.getElementById("servings-display");
    if (recipe.servings) {
      recipeCurrentServings = recipe.servings;
      servingsDisplay.textContent = "Serves " + recipeCurrentServings;
      stepperEl.style.display = "";
    } else {
      recipeCurrentServings = null;
      stepperEl.style.display = "none";
    }

    showScreen("recipe");
  }

  // ---- Results ----

  function showResults() {
    var exactMatches = filterRecipes(state.answers, false);
    var allMatches = filterRecipes(state.answers, true);
    var relaxedFields = allMatches._relaxedFields || [];
    var wasRelaxed = relaxedFields.length > 0;

    var topPicks, moreOptions;

    if (exactMatches.length === 0) {
      var pool = orderForSuggestions(allMatches);
      topPicks = pool.slice(0, 3).map(function (r) { return { recipe: r, wildcard: true }; });
      moreOptions = pool.slice(3);
      document.getElementById("results-title").textContent = "Chef's choice";
      document.getElementById("results-subtitle").textContent =
        "Nothing matched perfectly, so here are some curated picks.";
    } else if (exactMatches.length <= 3) {
      topPicks = orderForSuggestions(exactMatches).map(function (r) { return { recipe: r, wildcard: false }; });
      if (wasRelaxed) {
        var extras = allMatches.filter(function (r) {
          return !exactMatches.some(function (e) { return e.id === r.id; });
        });
        extras = orderForSuggestions(extras);
        var needed = 3 - topPicks.length;
        for (var i = 0; i < needed && i < extras.length; i++) {
          topPicks.push({ recipe: extras[i], wildcard: true });
        }
        moreOptions = extras.slice(needed);
      } else {
        moreOptions = [];
      }
      document.getElementById("results-title").textContent = "Here's what I'd suggest";
      document.getElementById("results-subtitle").textContent = "";
    } else {
      var ordered = orderForSuggestions(exactMatches);
      topPicks = ordered.slice(0, 3).map(function (r) { return { recipe: r, wildcard: false }; });
      moreOptions = ordered.slice(3);
      document.getElementById("results-title").textContent = "Here's what I'd suggest";
      document.getElementById("results-subtitle").textContent =
        exactMatches.length + " recipes matched your choices.";
    }

    var topContainer = document.getElementById("top-picks");
    topContainer.innerHTML = "";
    // Assign tiles across top picks + more options together so no adjacent pair matches
    var allResultRecipes = topPicks.map(function (p) { return p.recipe; }).concat(moreOptions);
    var resultTiles = assignTilesNoAdjacent(allResultRecipes.map(function (r) { return r.id; }));
    topPicks.forEach(function (pick, i) {
      var card = renderRecipeCard(pick.recipe, { featured: true, wildcard: pick.wildcard, tileIndex: resultTiles[i] });
      card.style.setProperty("--card-index", i);
      topContainer.appendChild(card);
    });

    var moreSection = document.getElementById("more-options-section");
    var moreGrid = document.getElementById("more-options-grid");
    moreGrid.innerHTML = "";

    if (moreOptions.length > 0) {
      moreSection.style.display = "";
      moreGrid.style.display = "none";
      document.getElementById("btn-more-toggle").textContent =
        "See " + moreOptions.length + " more option" + (moreOptions.length !== 1 ? "s" : "");
      moreOptions.forEach(function (r, i) {
        var card = renderRecipeCard(r, { tileIndex: resultTiles[topPicks.length + i] });
        card.style.setProperty("--card-index", i);
        moreGrid.appendChild(card);
      });
    } else {
      moreSection.style.display = "none";
    }

    document.getElementById("btn-pick-one").textContent = "Pick one for me";
    document.getElementById("btn-pick-one").onclick = pickOneForMe;

    renderWebIdeas(state.answers);

    showScreen("results");
  }

  function toggleMore() {
    var grid = document.getElementById("more-options-grid");
    var btn = document.getElementById("btn-more-toggle");
    if (grid.style.display === "none") {
      grid.style.display = "";
      btn.textContent = "Hide extra options";
    } else {
      grid.style.display = "none";
      btn.textContent = btn.textContent.replace("Hide", "See");
    }
  }

  function pickOneForMe() {
    var cards = document.querySelectorAll("#top-picks .recipe-card");
    if (!cards.length) return;
    cards.forEach(function (c) { c.classList.remove("highlighted"); });
    var idx = Math.floor(Math.random() * cards.length);
    cards[idx].classList.add("highlighted");
    cards[idx].scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function surpriseMe() {
    state.resultsMode = "surprise";
    var pool = eligibleForSuggestions();
    if (pool.length === 0) {
      document.getElementById("top-picks").innerHTML =
        '<p class="browse-empty">No recipes available — try restoring or adding some.</p>';
      document.getElementById("results-title").textContent = "Nothing to suggest";
      document.getElementById("results-subtitle").textContent = "";
      document.getElementById("more-options-section").style.display = "none";
      document.getElementById("web-ideas-section").style.display = "none";
      showScreen("results");
      return;
    }
    var recipe = pool[Math.floor(Math.random() * pool.length)];

    var topContainer = document.getElementById("top-picks");
    topContainer.innerHTML = "";
    topContainer.appendChild(renderRecipeCard(recipe, { featured: true }));

    document.getElementById("results-title").textContent = "How about this?";
    document.getElementById("results-subtitle").textContent = "A random pick from your collection.";
    document.getElementById("more-options-section").style.display = "none";
    document.getElementById("web-ideas-section").style.display = "none";
    document.getElementById("btn-pick-one").textContent = "Surprise me again";
    document.getElementById("btn-pick-one").onclick = surpriseMe;

    showScreen("results");
  }

  // ---- Card rendering ----

  function renderRecipeCard(recipe, opts) {
    opts = opts || {};
    var card = document.createElement("div");
    card.className = "recipe-card" + (opts.featured ? " featured" : "");
    card.classList.add("tile-" + (opts.tileIndex !== undefined ? opts.tileIndex : tileIndexForRecipe(recipe.id)));
    card.dataset.id = recipe.id;

    if (opts.draggable) {
      card.setAttribute("draggable", "true");
      card.classList.add("draggable");
    }

    var html = "";
    if (recipe.web) html += '<span class="web-badge">From the web</span>';

    html += '<div class="card-top">';
    html += '<span class="recipe-name">' + escapeHtml(recipe.name) + "</span>";
    html += '<div class="card-badges">';
    html += '<span class="source-badge ' + sourceClass(recipe.source) + '">' + escapeHtml(recipe.source) + "</span>";
    if (opts.wildcard) html += '<span class="wildcard-badge">Wildcard</span>';
    html += "</div>";
    html += "</div>";

    html += '<div class="card-pills">';
    html += '<span class="pill time-pill">' + recipe.time + " min</span>";
    html += '<span class="pill">' + capitalize(String(recipe.cuisine).replace(/-/g, " ")) + "</span>";
    html += '<span class="pill">' + capitalize(recipe.effort) + " effort</span>";
    if (recipe.dietary && recipe.dietary.length) {
      recipe.dietary.forEach(function (d) { html += '<span class="pill">' + capitalize(d) + "</span>"; });
    }
    html += "</div>";

    html += '<p class="recipe-description">' + escapeHtml(recipe.description || "") + "</p>";

    // Clickable body — opens recipe detail screen
    var body = document.createElement("div");
    body.className = "card-body-clickable";
    body.innerHTML = html;
    body.addEventListener("click", function () { showRecipeDetail(recipe.id); });
    card.appendChild(body);

    if (recipe.web) {
      card.appendChild(buildWebActionRow(recipe, card));
    } else if (opts.showActions !== false) {
      card.appendChild(buildActionRow(recipe));
    }
    return card;
  }

  // Action row for web-discovered recipes: a single "Save to my recipes" button.
  function buildWebActionRow(recipe, card) {
    var row = document.createElement("div");
    row.className = "card-actions web-actions";

    var saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-small btn-secondary";
    saveBtn.textContent = "＋ Save to my recipes";
    saveBtn.addEventListener("click", function () {
      saveWebRecipe(recipe);
      saveBtn.textContent = "✓ Saved";
      saveBtn.disabled = true;
      saveBtn.classList.add("saved");
    });
    row.appendChild(saveBtn);
    return row;
  }

  function saveWebRecipe(recipe) {
    if (recipeById(recipe.id)) return; // already saved
    var copy = Object.assign({}, recipe);
    delete copy.web;
    copy.custom = true;
    userData.customRecipes.push(copy);
    saveUserData();
    rebuildAllRecipes();
    showToast("Saved to your recipes.", null, null);
  }

  function buildActionRow(recipe) {
    var row = document.createElement("div");
    row.className = "card-actions";

    // Star rating
    var stars = document.createElement("div");
    stars.className = "star-rating";
    stars.title = "Rate this recipe";
    renderStars(stars, recipe.id);
    row.appendChild(stars);

    var right = document.createElement("div");
    right.className = "card-action-buttons";

    // My notes toggle
    var noteBtn = document.createElement("button");
    noteBtn.type = "button";
    noteBtn.className = "card-action-btn";
    noteBtn.textContent = getNote(recipe.id) ? "✎ My note" : "✎ Add note";
    noteBtn.addEventListener("click", function () { toggleNoteEditor(recipe, card_of(row), noteBtn); });
    right.appendChild(noteBtn);

    if (isCustom(recipe)) {
      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "card-action-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () { openAddRecipe(recipe.id); });
      right.appendChild(editBtn);
    }

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "card-action-btn remove";
    removeBtn.textContent = "✕ Remove";
    removeBtn.addEventListener("click", function () { handleRemove(recipe); });
    right.appendChild(removeBtn);

    row.appendChild(right);

    // Existing note display
    var existing = getNote(recipe.id);
    if (existing) {
      var noteDisplay = document.createElement("p");
      noteDisplay.className = "my-note-display";
      noteDisplay.innerHTML = "<strong>My note:</strong> " + escapeHtml(existing);
      row.appendChild(noteDisplay);
    }

    return row;
  }

  function card_of(row) {
    var el = row;
    while (el && !el.classList.contains("recipe-card")) el = el.parentElement;
    return el || row.parentElement;
  }

  function renderStars(container, id) {
    container.innerHTML = "";
    var current = getRating(id);
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var star = document.createElement("span");
        star.className = "star" + (n <= current ? " filled" : "");
        star.textContent = "★";
        star.addEventListener("click", function () {
          var newVal = (getRating(id) === n) ? 0 : n; // click active rating to clear
          setRating(id, newVal);
          renderStars(container, id);
        });
        container.appendChild(star);
      })(i);
    }
  }

  function toggleNoteEditor(recipe, card, noteBtn) {
    if (!card) return;
    var existingEditor = card.querySelector(".note-editor");
    if (existingEditor) { existingEditor.remove(); return; }

    var editor = document.createElement("div");
    editor.className = "note-editor";
    var ta = document.createElement("textarea");
    ta.rows = 2;
    ta.placeholder = "e.g. swap ghee for olive oil, double the chilli...";
    ta.value = getNote(recipe.id);
    editor.appendChild(ta);

    var saveNote = document.createElement("button");
    saveNote.type = "button";
    saveNote.className = "btn btn-small btn-secondary";
    saveNote.textContent = "Save note";
    saveNote.addEventListener("click", function () {
      setNote(recipe.id, ta.value);
      editor.remove();
      // refresh the action row to show/update the note
      var row = card.querySelector(".card-actions");
      if (row) row.replaceWith(buildActionRow(recipe));
    });
    editor.appendChild(saveNote);

    card.querySelector(".card-actions").appendChild(editor);
    ta.focus();
  }

  function handleRemove(recipe) {
    removeRecipe(recipe.id);
    rerenderScreen();
    showToast("Removed “" + recipe.name + "”.", "Undo", function () {
      restoreRecipe(recipe.id);
      rerenderScreen();
    });
  }

  function sourceClass(source) {
    var s = String(source).toLowerCase();
    if (s === "ottolenghi") return "ottolenghi";
    if (s === "woks of life") return "woks-of-life";
    if (s === "nyt cooking") return "nyt-cooking";
    if (s === "personal") return "personal";
    return "default";
  }

  // ---- Browse ----

  function showBrowse() {
    document.getElementById("search-input").value = "";
    document.querySelectorAll(".filter-select").forEach(function (s) { s.value = ""; });
    renderBrowseGrid(visibleRecipes());
    showScreen("browse");
  }

  function populateBrowseFilters() {
    var cuisines = new Set(), efforts = new Set(), sources = new Set(), dietaries = new Set();
    allRecipes.forEach(function (r) {
      cuisines.add(r.cuisine);
      efforts.add(r.effort);
      sources.add(r.source);
      if (r.dietary) r.dietary.forEach(function (d) { dietaries.add(d); });
    });
    fillSelect("filter-cuisine", cuisines, "Any cuisine");
    fillSelect("filter-effort", efforts, "Any effort");
    fillSelect("filter-source", sources, "Any source");
    fillSelect("filter-dietary", dietaries, "Any dietary");
  }

  function fillSelect(id, values, defaultLabel) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">' + defaultLabel + "</option>";
    Array.from(values).sort().forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v;
      opt.textContent = capitalize(String(v).replace(/-/g, " "));
      sel.appendChild(opt);
    });
    sel.value = prev;
  }

  function filterBrowse() {
    var search = document.getElementById("search-input").value.toLowerCase();
    var cuisine = document.getElementById("filter-cuisine").value;
    var effort = document.getElementById("filter-effort").value;
    var source = document.getElementById("filter-source").value;
    var dietary = document.getElementById("filter-dietary").value;

    var filtered = visibleRecipes().filter(function (r) {
      if (cuisine && r.cuisine !== cuisine) return false;
      if (effort && r.effort !== effort) return false;
      if (source && r.source !== source) return false;
      if (dietary && (!r.dietary || r.dietary.indexOf(dietary) === -1)) return false;
      if (search) {
        var haystack = (r.name + " " + (r.description || "") + " " +
          (r.keyIngredients || []).join(" ") + " " + r.source).toLowerCase();
        if (haystack.indexOf(search) === -1) return false;
      }
      return true;
    });
    renderBrowseGrid(filtered);
  }

  function renderBrowseGrid(recipes) {
    var grid = document.getElementById("browse-grid");
    var countEl = document.getElementById("browse-count");
    var total = visibleRecipes().length;
    grid.innerHTML = "";
    if (recipes.length === 0) {
      grid.innerHTML = '<p class="browse-empty">No recipes match your filters.</p>';
      if (countEl) countEl.textContent = "0 of " + total + " recipes";
      return;
    }
    if (countEl) {
      countEl.textContent = recipes.length === total
        ? recipes.length + " recipe" + (recipes.length !== 1 ? "s" : "")
        : recipes.length + " of " + total + " recipes";
    }
    var sorted = recipes.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var tiles = assignTilesNoAdjacent(sorted.map(function (r) { return r.id; }));
    sorted.forEach(function (r, i) { grid.appendChild(renderRecipeCard(r, { tileIndex: tiles[i] })); });
  }

  // ---- Add / Edit recipe form ----

  function openAddRecipe(id) {
    state.editingId = id || null;
    var form = document.getElementById("recipe-form");
    form.reset();
    document.getElementById("form-error").style.display = "none";
    clearChecks("form-mood");
    clearChecks("form-dietary");

    var title = document.getElementById("add-recipe-title");
    var deleteBtn = document.getElementById("form-delete");

    if (id) {
      var r = recipeById(id);
      title.textContent = "Edit Recipe";
      deleteBtn.style.display = "";
      document.getElementById("form-name").value = r.name || "";
      document.getElementById("form-source").value = r.source || "";
      document.getElementById("form-url").value = r.sourceUrl || "";
      document.getElementById("form-cuisine").value = r.cuisine || "other";
      document.getElementById("form-effort").value = r.effort || "medium";
      document.getElementById("form-time").value = r.time || 30;
      document.getElementById("form-meal").value = r.meal || "dinner";
      document.getElementById("form-pantry").checked = !!r.pantryFriendly;
      document.getElementById("form-ingredients").value = (r.keyIngredients || []).join(", ");
      document.getElementById("form-description").value = r.description || "";
      document.getElementById("form-notes").value = r.notes || "";
      document.getElementById("form-servings").value = r.servings || "";
      setChecks("form-mood", r.mood || []);
      setChecks("form-dietary", r.dietary || []);
    } else {
      title.textContent = "Add a Recipe";
      deleteBtn.style.display = "none";
    }
    showScreen("add-recipe");
  }

  function clearChecks(groupId) {
    document.querySelectorAll("#" + groupId + " input").forEach(function (c) { c.checked = false; });
  }
  function setChecks(groupId, values) {
    document.querySelectorAll("#" + groupId + " input").forEach(function (c) {
      c.checked = values.indexOf(c.value) !== -1;
    });
  }
  function getChecks(groupId) {
    var out = [];
    document.querySelectorAll("#" + groupId + " input:checked").forEach(function (c) { out.push(c.value); });
    return out;
  }

  function saveForm(e) {
    e.preventDefault();
    var name = document.getElementById("form-name").value.trim();
    var ingredientsRaw = document.getElementById("form-ingredients").value.trim();
    var time = parseInt(document.getElementById("form-time").value, 10);
    var errEl = document.getElementById("form-error");

    if (!name) return showFormError("Please give your recipe a name.");
    if (!ingredientsRaw) return showFormError("Please list at least one key ingredient.");
    if (!time || time < 1) return showFormError("Please enter a valid time in minutes.");
    errEl.style.display = "none";

    var ingredients = ingredientsRaw.split(",").map(function (s) { return s.trim().toLowerCase(); })
      .filter(function (s) { return s; });

    var recipe = {
      name: name,
      source: document.getElementById("form-source").value.trim() || "Personal",
      sourceUrl: document.getElementById("form-url").value.trim(),
      cuisine: document.getElementById("form-cuisine").value,
      effort: document.getElementById("form-effort").value,
      time: time,
      meal: document.getElementById("form-meal").value,
      dietary: getChecks("form-dietary"),
      mood: getChecks("form-mood"),
      keyIngredients: ingredients,
      pantryFriendly: document.getElementById("form-pantry").checked,
      season: [],
      description: document.getElementById("form-description").value.trim(),
      notes: document.getElementById("form-notes").value.trim(),
      servings: parseInt(document.getElementById("form-servings").value, 10) || null,
      custom: true,
    };

    if (state.editingId) {
      recipe.id = state.editingId;
      var idx = findCustomIndex(state.editingId);
      if (idx !== -1) userData.customRecipes[idx] = recipe;
    } else {
      recipe.id = uniqueId(slugify(name));
      userData.customRecipes.push(recipe);
    }
    saveUserData();
    rebuildAllRecipes();
    showToast(state.editingId ? "Recipe updated." : "Recipe added.", null, null);
    state.editingId = null;
    showBrowse();
  }

  function showFormError(msg) {
    var errEl = document.getElementById("form-error");
    errEl.textContent = msg;
    errEl.style.display = "";
  }

  function findCustomIndex(id) {
    for (var i = 0; i < userData.customRecipes.length; i++) {
      if (userData.customRecipes[i].id === id) return i;
    }
    return -1;
  }

  function deleteCustomRecipe() {
    if (!state.editingId) return;
    var idx = findCustomIndex(state.editingId);
    if (idx !== -1) {
      var name = userData.customRecipes[idx].name;
      userData.customRecipes.splice(idx, 1);
      saveUserData();
      rebuildAllRecipes();
      showToast("Deleted “" + name + "”.", null, null);
    }
    state.editingId = null;
    showBrowse();
  }

  function cancelForm() {
    state.editingId = null;
    showBrowse();
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "recipe";
  }
  function uniqueId(base) {
    var id = base, n = 2;
    while (recipeById(id)) { id = base + "-" + n; n++; }
    return id;
  }

  // ---- Weekly Planner ----

  function openPlanner() {
    document.getElementById("planner-search").value = "";
    document.getElementById("planner-search-results").innerHTML = "";
    pruneOldPlan();
    renderPlanner();
    showScreen("planner");
  }

  // ---- Dinner party planner ----

  var PARTY_COURSES = [
    { key: "nibbles", label: "Nibbles" },
    { key: "starter", label: "Starter" },
    { key: "main", label: "Main" },
    { key: "dessert", label: "Dessert" },
    { key: "drinks", label: "Drinks" },
  ];
  var DIETARY_OPTIONS = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-free" },
    { value: "dairy-free", label: "Dairy-free" },
  ];

  function currentParty() {
    if (!userData.currentPartyId) return null;
    for (var i = 0; i < userData.dinnerParties.length; i++) {
      if (userData.dinnerParties[i].id === userData.currentPartyId) return userData.dinnerParties[i];
    }
    return null;
  }

  function openParties() {
    var searchEl = document.getElementById("parties-search");
    if (searchEl) searchEl.value = "";
    renderPartiesList("");
    showScreen("parties");
  }

  function formatPartyDate(iso) {
    var parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function renderPartiesList(query) {
    var list = document.getElementById("parties-list");
    list.innerHTML = "";
    var q = (query || "").toLowerCase().trim();
    var parties = userData.dinnerParties.filter(function (p) {
      if (!q) return true;
      if ((p.name || "").toLowerCase().indexOf(q) !== -1) return true;
      return (p.guests || []).some(function (g) { return g.toLowerCase().indexOf(q) !== -1; });
    });
    if (!userData.dinnerParties.length) {
      list.innerHTML = '<p class="planner-hint">No parties yet — create one to start planning.</p>';
      return;
    }
    if (!parties.length) {
      list.innerHTML = '<p class="planner-hint">No parties match that search.</p>';
      return;
    }
    parties.forEach(function (p) {
      var card = document.createElement("div");
      card.className = "party-card";

      var seated = (p.seats || []).filter(function (s) { return s; }).length;
      var dishes = PARTY_COURSES.reduce(function (n, c) {
        return n + (((p.menu || {})[c.key]) || []).length;
      }, 0);
      var meta = [];
      if (p.date) meta.push(formatPartyDate(p.date));
      meta.push((p.seats || []).length + " seats");
      if (seated) meta.push(seated + " seated");
      meta.push(dishes + " dish" + (dishes === 1 ? "" : "es"));

      var info = document.createElement("button");
      info.type = "button";
      info.className = "party-card-body";
      info.innerHTML = '<span class="party-card-name">' + escapeHtml(p.name || "Dinner party") + "</span>" +
        '<span class="party-card-meta">' + escapeHtml(meta.join(" · ")) + "</span>";
      info.addEventListener("click", function () { openParty(p.id); });
      card.appendChild(info);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "party-card-delete";
      del.textContent = "✕";
      del.title = "Delete this party";
      del.addEventListener("click", function (ev) {
        ev.stopPropagation();
        deleteParty(p.id);
      });
      card.appendChild(del);

      list.appendChild(card);
    });
  }

  function resizePartyNameInput(input) {
    var sizer = document.getElementById("party-name-sizer");
    if (!sizer) {
      sizer = document.createElement("span");
      sizer.id = "party-name-sizer";
      sizer.style.cssText = "position:absolute;visibility:hidden;white-space:pre;pointer-events:none;top:-9999px;left:-9999px;";
      document.body.appendChild(sizer);
    }
    var cs = getComputedStyle(input);
    sizer.style.font = cs.font;
    sizer.style.letterSpacing = cs.letterSpacing;
    sizer.textContent = input.value || input.placeholder || "";
    input.style.width = Math.max(sizer.offsetWidth + 6, 80) + "px";
  }

  function createParty() {
    var party = {
      id: "party-" + Date.now(),
      name: "Dinner party",
      date: "",
      guests: [],
      seats: ["", "", "", ""],
      shape: "round",   // "round" | "rect"
      dietary: [],
      menu: { nibbles: [], starter: [], main: [], dessert: [], drinks: [] },
    };
    userData.dinnerParties.unshift(party);
    userData.currentPartyId = party.id;
    saveUserData();
    openParty(party.id);
  }

  function openParty(id) {
    userData.currentPartyId = id;
    saveUserData();
    renderPartyEditor();
    showScreen("dinner-party");
    document.fonts.ready.then(function () {
      var input = document.getElementById("party-name");
      if (input) resizePartyNameInput(input);
    });
  }

  function deleteParty(id) {
    var idx = -1;
    userData.dinnerParties.forEach(function (p, i) { if (p.id === id) idx = i; });
    if (idx === -1) return;
    var removed = userData.dinnerParties.splice(idx, 1)[0];
    if (userData.currentPartyId === id) userData.currentPartyId = null;
    saveUserData();
    renderPartiesList();
    showToast("Party deleted.", "Undo", function () {
      userData.dinnerParties.splice(Math.min(idx, userData.dinnerParties.length), 0, removed);
      saveUserData();
      renderPartiesList();
    });
  }

  function renderPartyEditor() {
    var p = currentParty();
    if (!p) { openParties(); return; }
    // Defensive shape fixes for older saved data
    if (!Array.isArray(p.guests)) p.guests = [];
    if (!Array.isArray(p.seats)) p.seats = ["", "", "", ""];
    if (p.shape !== "round" && p.shape !== "rect") p.shape = "round";
    if (!Array.isArray(p.dietary)) p.dietary = [];
    if (!p.menu || typeof p.menu !== "object") p.menu = {};
    PARTY_COURSES.forEach(function (c) { if (!Array.isArray(p.menu[c.key])) p.menu[c.key] = []; });

    var nameInput = document.getElementById("party-name");
    nameInput.value = p.name || "";
    resizePartyNameInput(nameInput);
    document.getElementById("party-date").value = p.date || "";

    renderDietaryBox();
    renderGuestPool();
    renderShapeToggle();
    renderGuestTable();
    renderPartyMenu();
    renderPartyWebIdeas();
  }

  function renderDietaryBox() {
    var p = currentParty();
    var box = document.getElementById("party-dietary");
    box.innerHTML = "";
    DIETARY_OPTIONS.forEach(function (opt) {
      var active = p.dietary.indexOf(opt.value) !== -1;
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "dietary-chip" + (active ? " active" : "");
      chip.textContent = opt.label;
      chip.addEventListener("click", function () {
        var i = p.dietary.indexOf(opt.value);
        if (i === -1) p.dietary.push(opt.value);
        else p.dietary.splice(i, 1);
        saveUserData();
        renderDietaryBox();
        renderPartyMenu();      // clears in-progress searches so they re-filter
        renderPartyWebIdeas();
      });
      box.appendChild(chip);
    });
  }

  // --- Guest pool + draggable name chips ---

  function renderGuestPool() {
    var p = currentParty();
    var pool = document.getElementById("guest-pool");
    pool.innerHTML = "";
    if (!p.guests.length) {
      pool.innerHTML = '<p class="planner-hint">Add the people you\'re inviting, then drag them onto seats.</p>';
      return;
    }
    p.guests.forEach(function (name) { pool.appendChild(makeGuestChip(name)); });
  }

  function makeGuestChip(name) {
    var p = currentParty();
    var seated = p.seats.indexOf(name) !== -1;
    var chip = document.createElement("div");
    chip.className = "guest-chip draggable" + (seated ? " seated" : "");
    chip.setAttribute("draggable", "true");
    chip.dataset.name = name;
    chip.innerHTML = '<span class="chip-name">' + escapeHtml(name) + "</span>";

    var x = document.createElement("button");
    x.type = "button";
    x.className = "chip-x";
    x.textContent = "✕";
    x.title = "Remove guest";
    x.addEventListener("click", function (ev) {
      ev.stopPropagation();
      removeGuest(name);
    });
    chip.appendChild(x);

    chip.addEventListener("dragstart", function (ev) {
      ev.dataTransfer.setData("text/plain", JSON.stringify({ name: name }));
      ev.dataTransfer.effectAllowed = "move";
      chip.classList.add("dragging");
    });
    chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });
    return chip;
  }

  function addGuest() {
    var p = currentParty();
    if (!p) return;
    var input = document.getElementById("guest-name-input");
    var name = (input.value || "").trim();
    if (!name) return;
    if (p.guests.indexOf(name) !== -1) {
      showToast("That guest is already on the list.", null, null);
      input.value = "";
      return;
    }
    p.guests.push(name);
    saveUserData();
    input.value = "";
    renderGuestPool();
  }

  function removeGuest(name) {
    var p = currentParty();
    var i = p.guests.indexOf(name);
    if (i !== -1) p.guests.splice(i, 1);
    for (var s = 0; s < p.seats.length; s++) {
      if (p.seats[s] === name) p.seats[s] = "";
    }
    saveUserData();
    renderGuestPool();
    renderGuestTable();
  }

  // --- Table shape toggle ---

  function renderShapeToggle() {
    var p = currentParty();
    var wrap = document.getElementById("table-shape-toggle");
    wrap.innerHTML = "";
    ["round", "rect"].forEach(function (shape) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shape-btn" + (p.shape === shape ? " active" : "");
      btn.textContent = shape === "round" ? "Round" : "Rectangle";
      btn.addEventListener("click", function () {
        p.shape = shape;
        saveUserData();
        renderShapeToggle();
        renderGuestTable();
      });
      wrap.appendChild(btn);
    });
    // Mirror shape class on the wrap itself so CSS can adjust tabletop style
    var tableWrap = document.getElementById("guest-table");
    tableWrap.className = "guest-table-wrap shape-" + p.shape;
  }

  // --- SVG table illustration ---

  // Hash a guest name to a stable tile index (0 … TILE_COUNT-1)
  function tileIndexForGuest(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
    return h % TILE_COUNT;
  }

  // Seat centre in SVG coordinates (420×420 viewBox, cx=cy=210).
  // Natural rectangle seat positions:
  //   Even n → 1 head at each short end; odd n → 1 head at left end only.
  //   Remaining seats fill both long sides, interleaved top/bottom.
  function rectSeatXYNatural(i, n) {
    var cx = 210, cy = 210;
    var tableW = 200, tableH = 124;
    var tableL = cx - tableW / 2, tableR = cx + tableW / 2;
    var headOff = 40; // chair centre distance beyond short edge
    var sideOff = tableH / 2 + 38; // chair centre distance below/above long edge
    var usesBothHeads = (n % 2 === 0);
    var headCount = usesBothHeads ? 2 : 1;

    if (i === 0) return { x: tableL - headOff, y: cy };
    if (usesBothHeads && i === 1) return { x: tableR + headOff, y: cy };

    var sIdx = i - headCount;
    var rem = n - headCount;
    var topCount = Math.ceil(rem / 2);
    var botCount = Math.floor(rem / 2);
    if (sIdx % 2 === 0) {
      var t = sIdx / 2;
      return { x: tableL + tableW / (topCount + 1) * (t + 1), y: cy - sideOff };
    } else {
      var b = (sIdx - 1) / 2;
      return { x: tableL + tableW / (botCount + 1) * (b + 1), y: cy + sideOff };
    }
  }

  // Seat position as CSS percentages (0-100) within the wrap.
  function seatPct(i, n, isRect) {
    if (isRect) {
      var pos = rectSeatXYNatural(i, n); // 420×420 space
      return { x: pos.x / 420 * 100, y: pos.y / 420 * 100 };
    }
    var angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: 50 + 44 * Math.cos(angle), y: 50 + 42 * Math.sin(angle) };
  }

  function renderGuestTable() {
    var p = currentParty();
    var wrap = document.getElementById("guest-table");
    wrap.innerHTML = "";
    wrap.className = "guest-table-wrap";
    document.getElementById("seat-count").textContent =
      p.seats.length + (p.seats.length === 1 ? " seat" : " seats");

    // Simple table shape
    var tabletop = document.createElement("div");
    tabletop.className = "tabletop" + (p.shape === "rect" ? " tabletop-rect" : "");
    wrap.appendChild(tabletop);

    var n = p.seats.length;
    var isRect = p.shape === "rect";

    p.seats.forEach(function (name, i) {
      var pos = seatPct(i, n, isRect);

      var seat = document.createElement("div");
      seat.className = "seat" + (name ? " named" : " empty");
      seat.style.left = pos.x + "%";
      seat.style.top  = pos.y + "%";

      // Ceramic tile square
      var tile = document.createElement("div");
      tile.className = "seat-tile";
      if (name) {
        tile.style.backgroundImage = 'url("images/tiles/t' + (tileIndexForGuest(name) + 1) + '.jpg")';
      }
      seat.appendChild(tile);

      // Name label
      var label = document.createElement("span");
      label.className = "seat-label";
      label.textContent = name || "drop";
      seat.appendChild(label);

      if (name) {
        seat.setAttribute("draggable", "true");
        seat.title = name + " — click to remove from seat";
        seat.addEventListener("dragstart", function (ev) {
          ev.dataTransfer.setData("text/plain", JSON.stringify({ name: name, fromSeat: i }));
          ev.dataTransfer.effectAllowed = "move";
          seat.classList.add("dragging");
        });
        seat.addEventListener("dragend", function () { seat.classList.remove("dragging"); });
        seat.addEventListener("click", function () {
          vacateSeat(i);
          showToast(name + " removed from seat.", "Undo", function () { assignSeat(i, name); });
        });
      }

      seat.addEventListener("dragover",  function (ev) { ev.preventDefault(); seat.classList.add("drag-over"); });
      seat.addEventListener("dragleave", function ()     { seat.classList.remove("drag-over"); });
      seat.addEventListener("drop", function (ev) {
        ev.preventDefault();
        seat.classList.remove("drag-over");
        var data;
        try { data = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (e) { return; }
        if (!data || !data.name) return;
        if (typeof data.fromSeat === "number") swapSeats(data.fromSeat, i);
        else assignSeat(i, data.name);
      });

      wrap.appendChild(seat);
    });
  }


  function assignSeat(i, name) {
    var p = currentParty();
    for (var s = 0; s < p.seats.length; s++) {
      if (p.seats[s] === name) p.seats[s] = "";
    }
    p.seats[i] = name;
    if (p.guests.indexOf(name) === -1) p.guests.push(name);
    saveUserData();
    renderGuestPool();
    renderGuestTable();
  }

  function swapSeats(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    var p = currentParty();
    var tmp = p.seats[fromIdx];
    p.seats[fromIdx] = p.seats[toIdx];
    p.seats[toIdx] = tmp;
    saveUserData();
    renderGuestPool();
    renderGuestTable();
  }

  function vacateSeat(i) {
    var p = currentParty();
    p.seats[i] = "";
    saveUserData();
    renderGuestPool();
    renderGuestTable();
  }

  function setSeatCount(delta) {
    var p = currentParty();
    if (!p) return;
    var n = p.seats.length + delta;
    if (n < 1 || n > 12) return;
    if (delta > 0) p.seats.push("");
    else p.seats.pop();
    saveUserData();
    renderGuestPool();
    renderGuestTable();
  }

  // --- Menu by course ---

  function recipeMatchesDietary(recipe, dietary) {
    if (!dietary || !dietary.length) return true;
    var arr = Array.isArray(recipe.dietary) ? recipe.dietary : [];
    return dietary.every(function (d) { return arr.indexOf(d) !== -1; });
  }

  function renderPartyMenu() {
    var container = document.getElementById("party-menu");
    container.innerHTML = "";
    PARTY_COURSES.forEach(function (course) {
      container.appendChild(renderMenuSection(course));
    });
  }

  function renderMenuSection(course) {
    var p = currentParty();
    var section = document.createElement("div");
    section.className = "course-section";

    var label = document.createElement("h4");
    label.className = "course-label";
    label.textContent = course.label;
    section.appendChild(label);

    var dishes = document.createElement("div");
    dishes.className = "course-dishes";
    var items = p.menu[course.key] || [];
    if (!items.length) {
      dishes.innerHTML = '<p class="planner-hint course-empty">Nothing here yet.</p>';
    } else {
      items.forEach(function (item) {
        if (typeof item === "string") {
          var r = recipeById(item);
          if (!r) return;
          var card = renderRecipeCard(r, { showActions: false });
          var rm = document.createElement("button");
          rm.type = "button";
          rm.className = "btn btn-small course-remove";
          rm.textContent = "✕ Remove from menu";
          rm.addEventListener("click", function () { removeDishFromCourse(course.key, item); });
          card.appendChild(rm);
          dishes.appendChild(card);
        } else if (item && item.custom) {
          dishes.appendChild(renderCustomDish(course.key, item));
        }
      });
    }
    section.appendChild(dishes);

    var searchWrap = document.createElement("div");
    searchWrap.className = "course-search-wrap";
    var input = document.createElement("input");
    input.type = "text";
    input.className = "search-input course-search";
    input.placeholder = "Add a dish to " + course.label.toLowerCase() + "…";
    var results = document.createElement("div");
    results.className = "planner-search-results";
    input.addEventListener("input", function () {
      renderCourseSearchResults(course.key, input.value, results, input);
    });
    // Dessert/Drinks courses suggest tagged recipes before any typing.
    input.addEventListener("focus", function () {
      renderCourseSearchResults(course.key, input.value, results, input);
    });
    searchWrap.appendChild(input);
    searchWrap.appendChild(results);
    section.appendChild(searchWrap);

    // "Type your own" row — for items not in the recipe folder (wine, shop-bought desserts, etc.)
    var customRow = document.createElement("div");
    customRow.className = "course-custom-row";
    var customInput = document.createElement("input");
    customInput.type = "text";
    customInput.className = "search-input course-custom-input";
    customInput.placeholder = "Or type your own…";
    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-small course-custom-add";
    addBtn.textContent = "Add";
    function submitCustom() {
      var val = customInput.value.trim();
      if (!val) return;
      addCustomToCourse(course.key, val);
      customInput.value = "";
    }
    addBtn.addEventListener("click", submitCustom);
    customInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submitCustom(); }
    });
    customRow.appendChild(customInput);
    customRow.appendChild(addBtn);
    section.appendChild(customRow);

    return section;
  }

  function renderCustomDish(courseKey, item) {
    var el = document.createElement("div");
    el.className = "course-custom-dish";
    var swatch = document.createElement("span");
    swatch.className = "course-custom-tile";
    swatch.style.backgroundImage = 'url("images/tiles/t' + (tileIndexForGuest(item.name) + 1) + '.jpg")';
    var name = document.createElement("span");
    name.className = "course-custom-name";
    name.textContent = item.name;
    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn btn-small course-remove";
    rm.textContent = "✕";
    rm.title = "Remove from menu";
    rm.addEventListener("click", function () { removeDishFromCourse(courseKey, item); });
    el.appendChild(swatch);
    el.appendChild(name);
    el.appendChild(rm);
    return el;
  }

  // Courses that suggest tagged recipes when their search box is empty.
  var COURSE_MEAL = { dessert: "dessert", drinks: "drinks" };

  function renderCourseSearchResults(courseKey, q, box, input) {
    var p = currentParty();
    box.innerHTML = "";
    q = (q || "").toLowerCase().trim();
    var existing = p.menu[courseKey] || [];
    var matches;
    if (!q) {
      var mealTag = COURSE_MEAL[courseKey];
      if (!mealTag) return; // other courses: no suggestions until the user types
      matches = visibleRecipes().filter(function (r) {
        if (existing.indexOf(r.id) !== -1) return false;
        if (!recipeMatchesDietary(r, p.dietary)) return false;
        return r.meal === mealTag;
      }).slice(0, 8);
    } else {
      matches = visibleRecipes().filter(function (r) {
        if (existing.indexOf(r.id) !== -1) return false;
        if (!recipeMatchesDietary(r, p.dietary)) return false;
        var haystack = (r.name + " " + (r.keyIngredients || []).join(" ")).toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 8);
    }

    if (!matches.length) {
      box.innerHTML = '<div class="search-result-empty">No matches</div>';
      return;
    }
    matches.forEach(function (r) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "search-result-item";
      item.innerHTML = "<span>" + escapeHtml(r.name) + "</span><span class='search-result-meta'>" +
        capitalize(String(r.cuisine).replace(/-/g, " ")) + " · " + r.time + " min</span>";
      item.addEventListener("click", function () {
        addDishToCourse(courseKey, r.id);
        input.value = "";
        box.innerHTML = "";
      });
      box.appendChild(item);
    });
  }

  function addDishToCourse(courseKey, id) {
    var p = currentParty();
    if (!p.menu[courseKey]) p.menu[courseKey] = [];
    if (p.menu[courseKey].indexOf(id) === -1) p.menu[courseKey].push(id);
    saveUserData();
    renderPartyMenu();
  }

  function addCustomToCourse(courseKey, name) {
    name = (name || "").trim();
    if (!name) return;
    var p = currentParty();
    if (!p.menu[courseKey]) p.menu[courseKey] = [];
    p.menu[courseKey].push({ custom: true, name: name });
    saveUserData();
    renderPartyMenu();
  }

  function removeDishFromCourse(courseKey, item) {
    var p = currentParty();
    var arr = p.menu[courseKey] || [];
    var i = arr.indexOf(item);
    if (i !== -1) arr.splice(i, 1);
    saveUserData();
    renderPartyMenu();
  }

  // --- Printable menu ---

  // Returns the dish blurb up to (and including) the first full stop, for the printed menu.
  function firstSentence(text) {
    text = (text || "").trim();
    if (!text) return "";
    var dot = text.indexOf(". ");
    if (dot !== -1) return text.slice(0, dot + 1);
    if (text.charAt(text.length - 1) === ".") return text;
    return text;
  }

  function printMenu() {
    var p = currentParty();
    if (!p) return;

    // Build or reuse the print container
    var el = document.getElementById("print-menu");
    if (!el) {
      el = document.createElement("div");
      el.id = "print-menu";
      document.body.appendChild(el);
    }

    var html = "";
    // Inner body
    html += '<div class="pm-body">';
    html += '<h1 class="pm-title">' + escapeHtml(p.name || "Dinner party") + "</h1>";
    if (p.date) html += '<p class="pm-date">' + escapeHtml(formatPartyDate(p.date)) + "</p>";
    // Guests
    var seated = (p.seats || []).filter(Boolean);
    if (seated.length) {
      html += '<p class="pm-guests">' + escapeHtml(seated.join("  ·  ")) + "</p>";
    }
    html += '<div class="pm-courses">';
    PARTY_COURSES.forEach(function (course) {
      var items = (p.menu[course.key] || []);
      if (!items.length) return;
      html += '<div class="pm-course">';
      html += '<h2 class="pm-course-label">' + escapeHtml(course.label) + "</h2>";
      html += "<ul class='pm-dish-list'>";
      items.forEach(function (item) {
        var dishName, dishTileIdx, dishDesc = "";
        if (typeof item === "string") {
          var r = recipeById(item);
          if (!r) return;
          dishName = r.name;
          dishTileIdx = tileIndexForRecipe(r.id);
          dishDesc = firstSentence(r.description);
        } else if (item && item.custom) {
          dishName = item.name;
          dishTileIdx = tileIndexForGuest(item.name);
        } else {
          return;
        }
        var dishTileUrl = "images/tiles/t" + (dishTileIdx + 1) + ".jpg";
        html += "<li>";
        html += '<img class="pm-dish-tile" src="' + escapeHtml(dishTileUrl) + '" alt="">';
        html += '<span class="pm-dish-text">';
        html += '<span class="pm-dish-name">' + escapeHtml(dishName) + "</span>";
        if (dishDesc) html += '<span class="pm-dish-desc">' + escapeHtml(dishDesc) + "</span>";
        html += "</span></li>";
      });
      html += "</ul></div>";
    });
    html += "</div>";
    html += "</div>";

    el.innerHTML = html;
    window.print();
  }

  // --- Web ideas (reuses Spoonacular discovery) ---

  function renderPartyWebIdeas() {
    var p = currentParty();
    var status = document.getElementById("party-web-status");
    var grid = document.getElementById("party-web-ideas");
    grid.innerHTML = "";

    if (!(userData.apiKey || "").trim()) {
      status.textContent = "Add your free Spoonacular key in Settings ⚙️ to discover impressive new dishes.";
      return;
    }
    status.textContent = "Finding impressive ideas…";

    var answers = { meal: "dinner", mood: ["impressive"], dietary: p.dietary };
    fetchWebRecipes(answers, function (res) {
      if (res.error) {
        status.textContent = "Couldn't reach the recipe service. Check your connection or key and try again.";
        return;
      }
      var fresh = res.recipes.filter(function (r) {
        if (recipeById(r.id)) return false;
        if (isRemoved(r.id)) return false;
        var nameLower = r.name.toLowerCase();
        return !allRecipes.some(function (e) { return e.name.toLowerCase() === nameLower; });
      }).slice(0, 3);

      if (!fresh.length) {
        status.textContent = "No new ideas this time — your collection already covers it.";
        return;
      }
      status.textContent = "";
      fresh.forEach(function (r) {
        webRecipeCache[r.id] = r; // cache so detail screen can look it up
        grid.appendChild(renderPartyWebCard(r));
      });
    });
  }

  function renderPartyWebCard(recipe) {
    // Render without the default "Save to my recipes" web row; we add a course picker instead.
    var displayCopy = Object.assign({}, recipe);
    delete displayCopy.web;
    var card = renderRecipeCard(displayCopy, { showActions: false });

    var row = document.createElement("div");
    row.className = "card-actions party-web-actions";
    var lbl = document.createElement("span");
    lbl.className = "party-web-add-label";
    lbl.textContent = "Add to:";
    row.appendChild(lbl);
    PARTY_COURSES.forEach(function (course) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-small course-add-web";
      b.textContent = course.label;
      b.addEventListener("click", function () { addWebIdeaToCourse(recipe, course.key); });
      row.appendChild(b);
    });
    card.appendChild(row);
    return card;
  }

  function addWebIdeaToCourse(recipe, courseKey) {
    saveWebRecipe(recipe);              // strips web flag, sets custom, gives it a stable id
    addDishToCourse(courseKey, recipe.id);
    renderPartyWebIdeas();              // recipe is now in the collection, so it drops off the web list
  }

  function getWeekDays() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var day = today.getDay(); // 0=Sun..6=Sat
    var diffToMonday = (day === 0 ? -6 : 1 - day);
    var monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function dateKey(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function pruneOldPlan() {
    var weekKeys = getWeekDays().map(dateKey);
    Object.keys(userData.plan).forEach(function (k) {
      if (weekKeys.indexOf(k) === -1) delete userData.plan[k];
    });
    saveUserData();
  }

  function renderPlanner() {
    renderShortlist();
    renderWeekGrid();
    renderLeftovers();
    renderPlannerSearch();
  }

  function renderShortlist() {
    var tray = document.getElementById("shortlist-tray");
    tray.innerHTML = "";
    var ids = userData.shortlist.filter(function (id) { return recipeById(id) && !isRemoved(id); });
    if (ids.length === 0) {
      tray.innerHTML = '<p class="planner-hint">Search above and click recipes to build your shortlist.</p>';
      return;
    }
    ids.forEach(function (id) {
      var r = recipeById(id);
      tray.appendChild(makeChip(r, "shortlist"));
    });
  }

  function makeChip(recipe, from) {
    var chip = document.createElement("div");
    chip.className = "recipe-chip draggable";
    chip.setAttribute("draggable", "true");
    chip.dataset.id = recipe.id;
    chip.dataset.from = from;
    chip.innerHTML = '<span class="chip-name">' + escapeHtml(recipe.name) + "</span>";

    var x = document.createElement("button");
    x.type = "button";
    x.className = "chip-x";
    x.textContent = "✕";
    x.title = from === "shortlist" ? "Remove from shortlist" : "Remove from this day";
    x.addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (from === "shortlist") {
        removeFromShortlist(recipe.id);
      } else {
        removeFromDay(from, recipe.id);
      }
    });
    chip.appendChild(x);

    chip.addEventListener("dragstart", function (ev) {
      ev.dataTransfer.setData("text/plain", JSON.stringify({ id: recipe.id, from: from }));
      ev.dataTransfer.effectAllowed = "move";
      chip.classList.add("dragging");
    });
    chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });
    return chip;
  }

  function renderWeekGrid() {
    var grid = document.getElementById("week-grid");
    grid.innerHTML = "";
    var dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var todayKey = dateKey(new Date());

    getWeekDays().forEach(function (d, i) {
      var key = dateKey(d);
      var col = document.createElement("div");
      col.className = "day-col";
      if (key === todayKey) col.classList.add("today");
      col.dataset.date = key;

      var header = document.createElement("div");
      header.className = "day-header";
      header.innerHTML = "<span class='day-name'>" + dayNames[i] + "</span>" +
        "<span class='day-date'>" + (d.getMonth() + 1) + "/" + d.getDate() + "</span>";
      col.appendChild(header);

      var drop = document.createElement("div");
      drop.className = "day-drop";
      (userData.plan[key] || []).forEach(function (id) {
        var r = recipeById(id);
        if (r && !isRemoved(id)) drop.appendChild(makeChip(r, key));
      });

      drop.addEventListener("dragover", function (ev) { ev.preventDefault(); col.classList.add("drag-over"); });
      drop.addEventListener("dragleave", function () { col.classList.remove("drag-over"); });
      drop.addEventListener("drop", function (ev) {
        ev.preventDefault();
        col.classList.remove("drag-over");
        var data;
        try { data = JSON.parse(ev.dataTransfer.getData("text/plain")); } catch (e) { return; }
        handleDropOnDay(key, data);
      });

      col.appendChild(drop);
      grid.appendChild(col);
    });
  }

  function handleDropOnDay(dateK, data) {
    if (data.from && data.from !== "shortlist" && data.from !== dateK) {
      removeFromDay(data.from, data.id, true);
    }
    if (data.from === "shortlist") {
      removeFromShortlist(data.id, true);
    }
    if (!userData.plan[dateK]) userData.plan[dateK] = [];
    if (userData.plan[dateK].indexOf(data.id) === -1) {
      userData.plan[dateK].push(data.id);
      // Record cook history — persists beyond the weekly plan window
      if (!userData.history[data.id]) userData.history[data.id] = { count: 0, lastCooked: null };
      userData.history[data.id].count++;
      userData.history[data.id].lastCooked = dateK;
    }
    saveUserData();
    renderPlanner();
  }

  function removeFromDay(dateK, id, skipRender) {
    if (userData.plan[dateK]) {
      var i = userData.plan[dateK].indexOf(id);
      if (i !== -1) userData.plan[dateK].splice(i, 1);
      if (userData.plan[dateK].length === 0) delete userData.plan[dateK];
      saveUserData();
    }
    if (!skipRender) renderPlanner();
  }

  function addToShortlist(id) {
    if (userData.shortlist.indexOf(id) === -1) userData.shortlist.push(id);
    saveUserData();
    renderPlanner();
  }
  function removeFromShortlist(id, skipRender) {
    var i = userData.shortlist.indexOf(id);
    if (i !== -1) userData.shortlist.splice(i, 1);
    saveUserData();
    if (!skipRender) renderPlanner();
  }

  function renderPlannerSearch() {
    var q = document.getElementById("planner-search").value.toLowerCase().trim();
    var box = document.getElementById("planner-search-results");
    box.innerHTML = "";
    if (!q) return;
    var matches = visibleRecipes().filter(function (r) {
      if (userData.shortlist.indexOf(r.id) !== -1) return false;
      var haystack = (r.name + " " + (r.keyIngredients || []).join(" ")).toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 8);

    if (matches.length === 0) {
      box.innerHTML = '<div class="search-result-empty">No matches</div>';
      return;
    }
    matches.forEach(function (r) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "search-result-item";
      item.innerHTML = "<span>" + escapeHtml(r.name) + "</span><span class='search-result-meta'>" +
        capitalize(String(r.cuisine).replace(/-/g, " ")) + " · " + r.time + " min</span>";
      item.addEventListener("click", function () {
        addToShortlist(r.id);
        document.getElementById("planner-search").value = "";
        document.getElementById("planner-search-results").innerHTML = "";
      });
      box.appendChild(item);
    });
  }

  function suggestByIngredientOverlap(selectedIds) {
    var selected = {};
    var ingredientSet = {};
    selectedIds.forEach(function (id) {
      var r = recipeById(id);
      if (!r) return;
      selected[id] = true;
      (r.keyIngredients || []).forEach(function (ing) {
        var norm = ing.toLowerCase().trim();
        if (STAPLES.indexOf(norm) === -1) ingredientSet[norm] = true;
      });
    });

    var scored = [];
    eligibleForSuggestions().forEach(function (r) {
      if (selected[r.id]) return;
      var shared = [];
      (r.keyIngredients || []).forEach(function (ing) {
        var norm = ing.toLowerCase().trim();
        if (ingredientSet[norm]) shared.push(norm);
      });
      if (shared.length > 0) scored.push({ recipe: r, shared: shared });
    });
    scored.sort(function (a, b) { return b.shared.length - a.shared.length; });
    return scored.slice(0, 5);
  }

  function renderLeftovers() {
    var panel = document.getElementById("leftover-panel");
    var container = document.getElementById("leftover-suggestions");
    container.innerHTML = "";

    var planned = [];
    Object.keys(userData.plan).forEach(function (k) {
      (userData.plan[k] || []).forEach(function (id) { planned.push(id); });
    });
    var selectedIds = userData.shortlist.concat(planned);

    if (selectedIds.length === 0) { panel.style.display = "none"; return; }

    var suggestions = suggestByIngredientOverlap(selectedIds);
    if (suggestions.length === 0) { panel.style.display = "none"; return; }

    panel.style.display = "";
    suggestions.forEach(function (s) {
      var item = document.createElement("div");
      item.className = "leftover-item";
      item.innerHTML = "<div class='leftover-name'>" + escapeHtml(s.recipe.name) + "</div>" +
        "<div class='leftover-shares'>Shares: " + s.shared.map(escapeHtml).join(", ") + "</div>";
      var add = document.createElement("button");
      add.type = "button";
      add.className = "btn btn-small btn-secondary";
      add.textContent = "+ Shortlist";
      add.addEventListener("click", function () { addToShortlist(s.recipe.id); });
      item.appendChild(add);
      container.appendChild(item);
    });
  }

  // ---- Shopping list ----

  // Where a recipe's full ingredient list comes from: user paste > stored > none.
  function getRecipeIngredients(recipe) {
    if (!recipe) return [];
    var ov = userData.ingredientOverrides[recipe.id];
    if (Array.isArray(ov) && ov.length) return ov;
    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length) return recipe.ingredients;
    return [];
  }

  var UNICODE_FRACTIONS = {
    "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3,
    "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875, "⅕": 0.2, "⅖": 0.4
  };

  // Known measurement units mapped to a canonical short form for combining.
  var UNIT_MAP = {
    g: "g", gram: "g", grams: "g", kg: "kg", ml: "ml", l: "l", litre: "l", litres: "l",
    tbsp: "tbsp", tbsps: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
    tsp: "tsp", tsps: "tsp", teaspoon: "tsp", teaspoons: "tsp",
    cup: "cup", cups: "cup", clove: "clove", cloves: "clove",
    tin: "tin", tins: "tin", can: "can", cans: "can",
    slice: "slice", slices: "slice", handful: "handful", handfuls: "handful",
    bunch: "bunch", bunches: "bunch", pinch: "pinch", pinches: "pinch",
    ounce: "oz", ounces: "oz", oz: "oz", pound: "lb", pounds: "lb", lb: "lb", lbs: "lb"
  };

  function parseIngredient(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (!s) return null;
    // Separate a unicode fraction stuck to a number, e.g. "1½" -> "1 ½"
    var normalized = s.replace(/(\d)([½¼¾⅓⅔⅛⅜⅝⅞⅕⅖])/g, "$1 $2");
    // Split a leading number glued to a unit, e.g. "400g" -> "400 g", "2tbsp" -> "2 tbsp"
    normalized = normalized.replace(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/, function (m, num, letters) {
      return UNIT_MAP[letters.toLowerCase()] ? num + " " + letters : m;
    });
    var tokens = normalized.split(/\s+/);
    var idx = 0;
    var total = 0;
    var matched = false;
    while (idx < tokens.length) {
      var t = tokens[idx];
      if (UNICODE_FRACTIONS[t] != null) { total += UNICODE_FRACTIONS[t]; matched = true; idx++; continue; }
      if (/^\d+\/\d+$/.test(t)) { var p = t.split("/"); total += parseInt(p[0], 10) / parseInt(p[1], 10); matched = true; idx++; continue; }
      if (/^\d+(\.\d+)?$/.test(t)) { total += parseFloat(t); matched = true; idx++; continue; }
      break;
    }
    // Skip a range like "1 to 2" / "1-2" — keep the first number only.
    if (tokens[idx] === "to" || tokens[idx] === "-" || tokens[idx] === "–" || tokens[idx] === "or") {
      idx++;
      while (idx < tokens.length &&
        (UNICODE_FRACTIONS[tokens[idx]] != null || /^\d+(\.\d+)?$/.test(tokens[idx]) || /^\d+\/\d+$/.test(tokens[idx]))) idx++;
    }
    var unit = "";
    if (idx < tokens.length) {
      var maybe = tokens[idx].toLowerCase().replace(/[.,]/g, "");
      if (UNIT_MAP[maybe]) { unit = UNIT_MAP[maybe]; idx++; }
    }
    var name = tokens.slice(idx).join(" ").trim();
    if (!name) name = s;
    // Normalise the key used for combining duplicates:
    var key = name.toLowerCase()
      .replace(/\(.*?\)/g, "")                        // strip parentheticals: (optional), (about 1lb)
      .replace(/\bfor serving\b.*|,?\s*to serve\b.*/i, "") // strip "for serving", "to serve"
      .replace(/\bfor garnish\b.*|,?\s*to garnish\b.*/i, "")
      .split(",")[0]                                   // drop prep notes after first comma
      .replace(/.*\bor\b\s*/i, "")                    // "sticky or white rice" → "white rice"
      .replace(/\b(cooked|raw|frozen|thawed|packed|heaping|sticky|optional|ripe|whole|boneless|skinless|extra-virgin|full-fat|low-fat|unsalted|salted|dried|drained|white|brown|jasmine|basmati|long-grain|short-grain|plain|regular)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!key) key = name.toLowerCase();
    return { qty: matched ? total : null, unit: unit, name: name, key: key, raw: s };
  }

  var FRACTION_GLYPHS = [
    [0.5, "½"], [0.25, "¼"], [0.75, "¾"], [1 / 3, "⅓"], [2 / 3, "⅔"],
    [0.125, "⅛"], [0.375, "⅜"], [0.625, "⅝"], [0.875, "⅞"]
  ];

  function formatQty(n) {
    if (Math.abs(n - Math.round(n)) < 0.001) return String(Math.round(n));
    var whole = Math.floor(n);
    var frac = n - whole;
    for (var i = 0; i < FRACTION_GLYPHS.length; i++) {
      if (Math.abs(frac - FRACTION_GLYPHS[i][0]) < 0.02) {
        return (whole > 0 ? whole : "") + FRACTION_GLYPHS[i][1];
      }
    }
    return String(Math.round(n * 100) / 100);
  }

  // Units that should NEVER be converted (user prefers cups/tbsp/tsp for herbs, sauces, citrus)
  var KEEP_UNITS = { tbsp: true, tsp: true, pinch: true, handful: true, bunch: true, slice: true, clove: true };

  // Convert a parsed ingredient's qty+unit for display.
  // mode defaults to shoppingUnitMode if not supplied.
  // Only converts weight (g/kg) and liquid volume (ml/l). Everything else stays as-is.
  function applyUnitMode(parsed, mode) {
    if (!parsed || parsed.qty == null || KEEP_UNITS[parsed.unit]) return parsed;
    if ((mode || shoppingUnitMode) === "imperial") {
      if (parsed.unit === "g") return { qty: parsed.qty * 0.035274, unit: "oz", name: parsed.name, key: parsed.key, raw: parsed.raw };
      if (parsed.unit === "kg") return { qty: parsed.qty * 2.20462, unit: "lb", name: parsed.name, key: parsed.key, raw: parsed.raw };
      if (parsed.unit === "ml") {
        var cups = parsed.qty / 240;
        if (cups >= 0.25) return { qty: cups, unit: "cup", name: parsed.name, key: parsed.key, raw: parsed.raw };
        return { qty: parsed.qty * 0.033814, unit: "fl oz", name: parsed.name, key: parsed.key, raw: parsed.raw };
      }
      if (parsed.unit === "l") return { qty: parsed.qty * 4.16667, unit: "cup", name: parsed.name, key: parsed.key, raw: parsed.raw };
    } else { // metric
      if (parsed.unit === "oz") return { qty: parsed.qty / 0.035274, unit: "g", name: parsed.name, key: parsed.key, raw: parsed.raw };
      if (parsed.unit === "lb") {
        var grams = parsed.qty * 453.592;
        return grams < 1000
          ? { qty: grams, unit: "g", name: parsed.name, key: parsed.key, raw: parsed.raw }
          : { qty: grams / 1000, unit: "kg", name: parsed.name, key: parsed.key, raw: parsed.raw };
      }
      if (parsed.unit === "fl oz") return { qty: parsed.qty / 0.033814, unit: "ml", name: parsed.name, key: parsed.key, raw: parsed.raw };
      if (parsed.unit === "cup") return { qty: parsed.qty * 240, unit: "ml", name: parsed.name, key: parsed.key, raw: parsed.raw };
    }
    return parsed;
  }

  function formatConvertedQty(n, unit) {
    // For metric weights, round to a sensible value
    if (unit === "g") return String(Math.round(n));
    if (unit === "kg") { var r = Math.round(n * 100) / 100; return String(r); }
    if (unit === "ml") return String(Math.round(n));
    if (unit === "oz") { var ro = Math.round(n * 10) / 10; return String(ro); }
    if (unit === "lb") { var rl = Math.round(n * 100) / 100; return String(rl); }
    if (unit === "fl oz") { var rf = Math.round(n * 10) / 10; return String(rf); }
    return formatQty(n);
  }

  // Convert unit amounts that appear inside parentheses in ingredient text,
  // e.g. "(about 1 pound)" → "(about 450 g)" in metric mode.
  function convertInlineUnits(text, mode) {
    return text.replace(
      /\(\s*(about\s+)?([\d½¼¾⅓⅔⅛⅜⅝⅞]+(?:\.\d+)?(?:\s+[\d\/]+)?)\s*(ounces?|oz|pounds?|lbs?|lb|grams?|g|kg|ml|litres?|liters?|l|cups?|fl\.?\s*oz)\s*\)/gi,
      function (match, about, numStr, unitStr) {
        var u = unitStr.toLowerCase().replace(/s$/, "").replace(/\.$/, "").replace(/\s+/g, "");
        var canonical = UNIT_MAP[u] || UNIT_MAP[u.replace(/s$/, "")] || null;
        if (!canonical || KEEP_UNITS[canonical]) return match;
        // Parse the number (handle unicode fractions)
        var qty = 0;
        var parts = numStr.trim().split(/\s+/);
        parts.forEach(function (p) {
          if (UNICODE_FRACTIONS[p] != null) { qty += UNICODE_FRACTIONS[p]; }
          else if (/^\d+\/\d+$/.test(p)) { var sp = p.split("/"); qty += parseInt(sp[0]) / parseInt(sp[1]); }
          else if (/^\d+(\.\d+)?$/.test(p)) { qty += parseFloat(p); }
        });
        if (!qty) return match;
        var fake = { qty: qty, unit: canonical, name: "", key: "", raw: "" };
        var converted = applyUnitMode(fake, mode);
        if (converted.unit === canonical) return match; // no conversion applied
        var qtyStr = KEEP_UNITS[converted.unit] ? formatQty(converted.qty) : formatConvertedQty(converted.qty, converted.unit);
        return "(" + (about || "") + qtyStr + " " + converted.unit + ")";
      }
    );
  }

  function isStapleName(key) {
    var k = String(key).toLowerCase().trim();
    // Strip common descriptors so "caster sugar"/"sea salt"/"ground black pepper" still match,
    // but multi-word ingredients like "sugar snap peas" or "bell pepper" do not.
    var ADJ = ["caster", "granulated", "brown", "white", "sea", "kosher", "table",
               "fine", "flaky", "ground", "unsalted", "salted", "fresh", "dried",
               "extra", "virgin"];
    function matchesStaple(s) {
      var stripped = s.split(/\s+/).filter(function (w) { return ADJ.indexOf(w) === -1; }).join(" ");
      return STAPLES.indexOf(stripped) !== -1 || STAPLES.indexOf(s) !== -1;
    }
    // A combined line like "salt and pepper" counts only if every part is itself a staple.
    var parts = k.split(/\s+(?:and|&)\s+/);
    return parts.every(function (p) { return matchesStaple(p.trim()); });
  }

  function combineIngredients(parsedList) {
    var groups = {};
    var order = [];
    parsedList.forEach(function (p) {
      if (!p) return;
      var gk = p.key + "|" + p.unit;
      if (!groups[gk]) { groups[gk] = { items: [], name: p.name, unit: p.unit, key: p.key }; order.push(gk); }
      groups[gk].items.push(p);
    });
    var result = [];
    order.forEach(function (gk) {
      var g = groups[gk];
      var allNumeric = g.items.every(function (it) { return it.qty != null; });
      var display;
      if (allNumeric) {
        var sum = g.items.reduce(function (a, it) { return a + it.qty; }, 0);
        // Apply unit conversion to the summed result
        var converted = applyUnitMode({ qty: sum, unit: g.unit, name: g.name, key: g.key, raw: "" });
        var qtyStr = KEEP_UNITS[converted.unit] ? formatQty(converted.qty) : formatConvertedQty(converted.qty, converted.unit);
        display = convertInlineUnits((qtyStr + (converted.unit ? " " + converted.unit : "") + " " + g.name).trim(), shoppingUnitMode);
      } else {
        // No numeric quantity — show the shortest (most generic) raw as the representative
        var raws = [];
        g.items.forEach(function (it) { if (raws.indexOf(it.raw) === -1) raws.push(it.raw); });
        if (raws.length > 1) {
          raws.sort(function (a, b) { return a.length - b.length; });
        }
        display = raws[0];
      }
      result.push({ display: display, key: g.key, isStaple: isStapleName(g.key) });
    });
    return result;
  }

  function openShoppingList() {
    shoppingUnitMode = "metric"; // reset to preferred default each time
    document.getElementById("toggle-shopping-units").checked = false;
    document.getElementById("units-toggle-label").textContent = "Metric";
    buildShoppingList();
    showScreen("shopping");
  }

  function buildShoppingList() {
    var plannedIds = [];
    Object.keys(userData.plan).forEach(function (k) {
      (userData.plan[k] || []).forEach(function (id) { plannedIds.push(id); });
    });

    var allParsed = [];
    var missing = [];
    var seenMissing = {};
    plannedIds.forEach(function (id) {
      var r = recipeById(id);
      if (!r || isRemoved(id)) return;
      var ings = getRecipeIngredients(r);
      if (ings.length === 0) {
        if (!seenMissing[id]) { seenMissing[id] = true; missing.push(r); }
        return;
      }
      ings.forEach(function (str) { allParsed.push(parseIngredient(str)); });
    });

    var combined = combineIngredients(allParsed);
    var mainItems = combined.filter(function (c) { return !c.isStaple; });
    var stapleItems = combined.filter(function (c) { return c.isStaple; });

    document.getElementById("shopping-empty").style.display = plannedIds.length === 0 ? "" : "none";

    renderMissingRecipes(missing);
    renderShoppingSection("shopping-main-section", "shopping-main-list", mainItems);
    renderShoppingSection("shopping-staples-section", "shopping-staples-list", stapleItems);
    renderShoppingExtras();
  }

  function renderShoppingSection(sectionId, listId, items) {
    var section = document.getElementById(sectionId);
    var list = document.getElementById(listId);
    list.innerHTML = "";
    if (!items.length) { section.style.display = "none"; return; }
    section.style.display = "";
    items.forEach(function (it) {
      list.appendChild(makeShoppingItem(it.display, it.display, null));
    });
  }

  function makeShoppingItem(label, checkedKey, onRemove) {
    var li = document.createElement("li");
    li.className = "shopping-item";
    var cb = document.createElement("input");
    cb.type = "checkbox";
    var cid = "shop-" + Math.random().toString(36).slice(2);
    cb.id = cid;
    cb.checked = !!userData.shopping.checked[checkedKey];
    if (cb.checked) li.classList.add("checked");
    var lab = document.createElement("label");
    lab.setAttribute("for", cid);
    lab.textContent = label;
    cb.addEventListener("change", function () {
      if (cb.checked) userData.shopping.checked[checkedKey] = true;
      else delete userData.shopping.checked[checkedKey];
      li.classList.toggle("checked", cb.checked);
      saveUserData();
    });
    li.appendChild(cb);
    li.appendChild(lab);
    if (onRemove) {
      var x = document.createElement("button");
      x.type = "button";
      x.className = "chip-x";
      x.textContent = "✕";
      x.title = "Remove";
      x.addEventListener("click", onRemove);
      li.appendChild(x);
    }
    return li;
  }

  function renderShoppingExtras() {
    var list = document.getElementById("shopping-extras-list");
    list.innerHTML = "";
    userData.shopping.extras.forEach(function (item, i) {
      list.appendChild(makeShoppingItem(item, "extra:" + item, function () {
        userData.shopping.extras.splice(i, 1);
        delete userData.shopping.checked["extra:" + item];
        saveUserData();
        renderShoppingExtras();
      }));
    });
  }

  function addShoppingExtra() {
    var input = document.getElementById("shopping-extra-input");
    var val = input.value.trim();
    if (!val) return;
    if (userData.shopping.extras.indexOf(val) === -1) userData.shopping.extras.push(val);
    input.value = "";
    saveUserData();
    renderShoppingExtras();
  }

  function renderMissingRecipes(missing) {
    var section = document.getElementById("shopping-missing");
    var list = document.getElementById("shopping-missing-list");
    list.innerHTML = "";
    if (!missing.length) { section.style.display = "none"; return; }
    section.style.display = "";
    missing.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "missing-recipe";

      var head = document.createElement("div");
      head.className = "missing-recipe-head";
      var nameSpan = document.createElement("span");
      nameSpan.className = "missing-recipe-name";
      nameSpan.textContent = r.name;
      head.appendChild(nameSpan);
      if (r.sourceUrl) {
        var link = document.createElement("a");
        link.href = r.sourceUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "missing-recipe-link";
        link.textContent = "View recipe ↗";
        head.appendChild(link);
      } else {
        var note = document.createElement("span");
        note.className = "planner-hint";
        note.textContent = "(no link saved)";
        head.appendChild(note);
      }
      row.appendChild(head);

      var ta = document.createElement("textarea");
      ta.className = "missing-recipe-textarea";
      ta.rows = 3;
      ta.placeholder = "Paste the ingredients here, one per line…";
      row.appendChild(ta);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-small btn-secondary";
      btn.textContent = "Add ingredients";
      btn.addEventListener("click", function () {
        var lines = ta.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        if (!lines.length) return;
        userData.ingredientOverrides[r.id] = lines;
        saveUserData();
        buildShoppingList();
        showToast("Ingredients saved for " + r.name + ".", null, null);
      });
      row.appendChild(btn);

      list.appendChild(row);
    });
  }

  function copyShoppingList() {
    var lines = [];
    function collect(listId, header) {
      var items = document.querySelectorAll("#" + listId + " .shopping-item");
      if (!items.length) return;
      lines.push(header);
      items.forEach(function (li) {
        var checked = li.classList.contains("checked");
        var text = li.querySelector("label").textContent;
        lines.push((checked ? "[x] " : "- ") + text);
      });
      lines.push("");
    }
    collect("shopping-main-list", "SHOPPING LIST");
    collect("shopping-staples-list", "STAPLES");
    collect("shopping-extras-list", "EXTRAS");
    var text = lines.join("\n").trim();
    if (!text) { showToast("Nothing to copy yet.", null, null); return; }
    copyTextToClipboard(text);
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { showToast("Copied to clipboard.", null, null); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(ok ? "Copied to clipboard." : "Couldn't copy — select and copy manually.", null, null);
    } catch (e) {
      showToast("Couldn't copy — select and copy manually.", null, null);
    }
  }

  // ---- Settings / backup ----

  function showSettings() {
    var custom = userData.customRecipes.length;
    var rated = Object.keys(userData.ratings).length;
    var noted = Object.keys(userData.notes).length;
    var removed = userData.removed.length;
    document.getElementById("settings-stat").textContent =
      custom + " recipe" + (custom !== 1 ? "s" : "") + " added · " +
      rated + " rated · " + noted + " noted · " + removed + " removed";
    document.getElementById("spoonacular-key").value = userData.apiKey || "";
    showScreen("settings");
  }

  function saveApiKey() {
    userData.apiKey = document.getElementById("spoonacular-key").value.trim();
    saveUserData();
    showToast(userData.apiKey ? "Key saved." : "Key cleared.", null, null);
  }

  function exportBackup() {
    var blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var d = new Date();
    a.href = url;
    a.download = "meal-app-backup-" + dateKey(d) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup downloaded.", null, null);
  }

  function importBackup(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== "object" || typeof parsed.version === "undefined") {
          throw new Error("not a valid backup");
        }
        userData = Object.assign(defaultUserData(), parsed);
        if (!userData.ratings) userData.ratings = {};
        if (!userData.notes) userData.notes = {};
        if (!Array.isArray(userData.removed)) userData.removed = [];
        if (!userData.plan) userData.plan = {};
        if (!Array.isArray(userData.shortlist)) userData.shortlist = [];
        if (!Array.isArray(userData.customRecipes)) userData.customRecipes = [];
        if (typeof userData.apiKey !== "string") userData.apiKey = "";
        saveUserData();
        rebuildAllRecipes();
        showSettings();
        showToast("Backup restored.", null, null);
      } catch (err) {
        showToast("That file doesn't look like a valid backup.", null, null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ---- Toast ----

  var toastTimer = null;
  function showToast(message, actionLabel, actionFn) {
    var container = document.getElementById("toast-container");
    container.innerHTML = "";
    var toast = document.createElement("div");
    toast.className = "toast";
    var span = document.createElement("span");
    span.textContent = message;
    toast.appendChild(span);

    if (actionLabel && actionFn) {
      var btn = document.createElement("button");
      btn.className = "toast-action";
      btn.textContent = actionLabel;
      btn.addEventListener("click", function () {
        clearTimeout(toastTimer);
        container.innerHTML = "";
        actionFn();
      });
      toast.appendChild(btn);
    }
    container.appendChild(toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { container.innerHTML = ""; }, 5000);
  }

  // ---- Utilities ----

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function capitalize(str) {
    str = String(str || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  init();
})();
