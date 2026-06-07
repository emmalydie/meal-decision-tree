(function () {
  "use strict";

  var STORAGE_KEY = "mealAppUserData";
  var DATA_VERSION = 1;
  // Common staples ignored when matching recipes by shared ingredients,
  // so leftover suggestions stay meaningful.
  var STAPLES = [
    "olive oil", "oil", "garlic", "salt", "pepper", "black pepper",
    "onion", "onions", "butter", "sugar", "water", "eggs", "herbs"
  ];

  var BUILTIN_RECIPES = [
  {
    "id": "ottolenghi-cauliflower-cake",
    "name": "Cauliflower Cake",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/cauliflower-cake",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 75,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["cauliflower", "eggs", "cheese", "herbs"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "A showstopper vegetable cake with golden top and creamy center.",
    "notes": ""
  },
  {
    "id": "ottolenghi-roasted-aubergine",
    "name": "Roasted Aubergine with Anchovies and Oregano",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/roasted-aubergine-with-anchovies-and-oregano",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 50,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["aubergine", "anchovies", "oregano", "garlic", "tomatoes"],
    "pantryFriendly": false,
    "season": ["summer", "fall"],
    "description": "Silky roasted aubergine with a punchy anchovy and herb dressing.",
    "notes": ""
  },
  {
    "id": "ottolenghi-shakshuka",
    "name": "Shakshuka",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/shakshuka",
    "cuisine": "middle-eastern",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "any",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["eggs", "tomatoes", "peppers", "cumin", "feta"],
    "pantryFriendly": true,
    "season": [],
    "description": "Eggs poached in a spiced tomato sauce. The ultimate one-pan meal.",
    "notes": ""
  },
  {
    "id": "ottolenghi-mejadra",
    "name": "Mejadra",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/mejadra",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 60,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["lentils", "rice", "onions", "cumin", "cinnamon"],
    "pantryFriendly": true,
    "season": [],
    "description": "Spiced lentils and rice topped with deeply caramelised onions. Pure comfort.",
    "notes": ""
  },
  {
    "id": "ottolenghi-burnt-aubergine-with-tahini",
    "name": "Burnt Aubergine with Tahini",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/burnt-aubergine-with-tahini",
    "cuisine": "middle-eastern",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["aubergine", "tahini", "lemon", "pomegranate", "herbs"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Smoky charred aubergine with creamy tahini and jewel-like pomegranate seeds.",
    "notes": ""
  },
  {
    "id": "ottolenghi-green-pancakes",
    "name": "Green Pancakes with Lime Butter",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/green-pancakes-with-lime-butter",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["fresh", "impressive"],
    "time": 40,
    "meal": "breakfast",
    "dietary": ["vegetarian"],
    "keyIngredients": ["spinach", "herbs", "flour", "eggs", "lime", "butter"],
    "pantryFriendly": false,
    "season": ["spring", "summer"],
    "description": "Vibrant green herb pancakes with a zingy lime butter. Weekend brunch perfection.",
    "notes": ""
  },
  {
    "id": "ottolenghi-fattoush",
    "name": "Fattoush",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/fattoush",
    "cuisine": "middle-eastern",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 20,
    "meal": "lunch",
    "dietary": ["vegan"],
    "keyIngredients": ["pita", "tomatoes", "cucumber", "radish", "sumac", "herbs"],
    "pantryFriendly": false,
    "season": ["spring", "summer"],
    "description": "Crunchy pita salad with sumac dressing. Bright, tangy, and satisfying.",
    "notes": ""
  },
  {
    "id": "ottolenghi-roasted-butternut-squash",
    "name": "Roasted Butternut Squash with Lentils and Gorgonzola",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/roasted-butternut-squash-with-lentils-and-gorgonzola",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 55,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["butternut squash", "lentils", "gorgonzola", "pecans", "herbs"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "Sweet roasted squash with earthy lentils and salty gorgonzola. Autumn on a plate.",
    "notes": ""
  },
  {
    "id": "ottolenghi-stuffed-peppers",
    "name": "Stuffed Peppers with Ricotta and Mascarpone",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/romano-peppers-stuffed-with-ricotta-and-mascarpone",
    "cuisine": "mediterranean",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 50,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["romano peppers", "ricotta", "mascarpone", "herbs", "pine nuts"],
    "pantryFriendly": false,
    "season": ["summer", "fall"],
    "description": "Sweet peppers stuffed with creamy cheese and herbs. Elegant but easy.",
    "notes": ""
  },
  {
    "id": "ottolenghi-herb-crust-fish",
    "name": "Herb-Crusted Fish with Lemon",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/herb-crusted-fish",
    "cuisine": "mediterranean",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["gluten-free"],
    "keyIngredients": ["white fish", "herbs", "lemon", "capers", "olive oil"],
    "pantryFriendly": false,
    "season": [],
    "description": "Flaky white fish under a fragrant herb crust. Light, fast, and fresh.",
    "notes": ""
  },
  {
    "id": "ottolenghi-zaatar-roast-chicken",
    "name": "Za'atar Roast Chicken",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/zaatar-roast-chicken",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 75,
    "meal": "dinner",
    "dietary": ["gluten-free", "dairy-free"],
    "keyIngredients": ["chicken", "za'atar", "lemon", "onions", "sumac"],
    "pantryFriendly": false,
    "season": [],
    "description": "Aromatic roast chicken rubbed with za'atar and sumac. A crowd-pleaser.",
    "notes": ""
  },
  {
    "id": "ottolenghi-orzo-tomato",
    "name": "Orzo with Roasted Tomatoes and Feta",
    "source": "Ottolenghi",
    "sourceUrl": "https://ottolenghi.co.uk/recipes/orzo-with-roasted-tomatoes",
    "cuisine": "mediterranean",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["orzo", "tomatoes", "feta", "olives", "basil"],
    "pantryFriendly": true,
    "season": ["summer"],
    "description": "Creamy orzo with sweet roasted tomatoes and salty feta. One pot, big flavour.",
    "notes": ""
  },
  {
    "id": "wol-mapo-tofu",
    "name": "Mapo Tofu",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/ma-po-tofu-recipe/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["tofu", "doubanjiang", "sichuan peppercorn", "scallions"],
    "pantryFriendly": false,
    "season": [],
    "description": "Numbing, spicy, and deeply savory. A Sichuan classic that comes together fast.",
    "notes": ""
  },
  {
    "id": "wol-dan-dan-noodles",
    "name": "Dan Dan Noodles",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/dan-dan-noodles/",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["comforting", "adventurous"],
    "time": 35,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["noodles", "pork", "chilli oil", "sesame paste", "sichuan peppercorn"],
    "pantryFriendly": false,
    "season": [],
    "description": "Spicy, nutty, and complex. Street food noodles with a tingly sesame sauce.",
    "notes": ""
  },
  {
    "id": "wol-egg-fried-rice",
    "name": "Classic Egg Fried Rice",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/classic-chinese-fried-rice/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 15,
    "meal": "any",
    "dietary": ["vegetarian"],
    "keyIngredients": ["rice", "eggs", "scallions", "soy sauce", "sesame oil"],
    "pantryFriendly": true,
    "season": [],
    "description": "The ultimate fridge-clearing meal. Leftover rice + eggs = dinner in 15 minutes.",
    "notes": ""
  },
  {
    "id": "wol-kung-pao-tofu",
    "name": "Kung Pao Tofu",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/kung-pao-tofu/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["quick-fix", "comforting"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["tofu", "peanuts", "dried chillies", "soy sauce", "vinegar"],
    "pantryFriendly": false,
    "season": [],
    "description": "Crispy tofu in a sweet-sour-spicy sauce with crunchy peanuts.",
    "notes": ""
  },
  {
    "id": "wol-scallion-pancakes",
    "name": "Scallion Pancakes",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/chinese-scallion-pancakes/",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["comforting", "adventurous"],
    "time": 45,
    "meal": "snack",
    "dietary": ["vegan"],
    "keyIngredients": ["flour", "scallions", "sesame oil", "salt"],
    "pantryFriendly": true,
    "season": [],
    "description": "Flaky, crispy, and oniony. Addictive hand-pulled pancakes.",
    "notes": ""
  },
  {
    "id": "wol-hot-sour-soup",
    "name": "Hot and Sour Soup",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/hot-sour-soup/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 25,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["tofu", "mushrooms", "bamboo shoots", "vinegar", "white pepper"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "Warming, tangy broth with silky tofu and mushrooms. Better than takeout.",
    "notes": ""
  },
  {
    "id": "wol-congee",
    "name": "Rice Congee (Jook)",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/rice-congee-recipe-jook/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting"],
    "time": 60,
    "meal": "breakfast",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["rice", "ginger", "scallions", "sesame oil"],
    "pantryFriendly": true,
    "season": ["fall", "winter"],
    "description": "Silky slow-cooked rice porridge. The ultimate comfort food when you need a hug.",
    "notes": "Hands-off cooking time — mostly just simmering."
  },
  {
    "id": "wol-tomato-egg",
    "name": "Tomato and Egg Stir-Fry",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/chinese-tomato-egg-stir-fry/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 15,
    "meal": "any",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["tomatoes", "eggs", "sugar", "scallions"],
    "pantryFriendly": true,
    "season": [],
    "description": "Sweet, savoury, silky eggs with juicy tomatoes. Chinese home cooking at its purest.",
    "notes": ""
  },
  {
    "id": "wol-char-siu",
    "name": "Char Siu (BBQ Pork)",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/chinese-bbq-pork-cha-siu/",
    "cuisine": "east-asian",
    "effort": "high",
    "mood": ["impressive", "adventurous"],
    "time": 180,
    "meal": "dinner",
    "dietary": ["dairy-free"],
    "keyIngredients": ["pork shoulder", "hoisin", "honey", "five spice", "soy sauce"],
    "pantryFriendly": false,
    "season": [],
    "description": "Lacquered, sticky, and caramelised. A weekend project that makes everything better.",
    "notes": "Marinade overnight for best results."
  },
  {
    "id": "wol-thai-basil-tofu",
    "name": "Thai Basil Tofu",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/thai-basil-tofu/",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 20,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["tofu", "thai basil", "chillies", "garlic", "soy sauce"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Aromatic, spicy, and herbaceous. Fragrant basil meets crispy tofu.",
    "notes": ""
  },
  {
    "id": "wol-pad-thai",
    "name": "Pad Thai",
    "source": "Woks of Life",
    "sourceUrl": "https://thewoksoflife.com/pad-thai/",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 35,
    "meal": "dinner",
    "dietary": [],
    "keyIngredients": ["rice noodles", "shrimp", "tamarind", "peanuts", "bean sprouts", "lime"],
    "pantryFriendly": false,
    "season": [],
    "description": "Sweet, sour, salty, and crunchy. The Thai street food classic done right at home.",
    "notes": ""
  },
  {
    "id": "dal-tadka",
    "name": "Dal Tadka",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["red lentils", "cumin", "turmeric", "garlic", "tomatoes", "ghee"],
    "pantryFriendly": true,
    "season": [],
    "description": "Creamy spiced lentils finished with a sizzling garlic and cumin tadka. Soul food.",
    "notes": ""
  },
  {
    "id": "chana-masala",
    "name": "Chana Masala",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "low",
    "mood": ["comforting"],
    "time": 35,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["chickpeas", "tomatoes", "onion", "garam masala", "ginger"],
    "pantryFriendly": true,
    "season": [],
    "description": "Hearty, tangy chickpea curry. A staple that gets better every time you make it.",
    "notes": ""
  },
  {
    "id": "aloo-gobi",
    "name": "Aloo Gobi",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 30,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["potatoes", "cauliflower", "turmeric", "cumin", "tomatoes"],
    "pantryFriendly": true,
    "season": [],
    "description": "Golden potatoes and cauliflower with warm spices. Simple, satisfying, and cheap.",
    "notes": ""
  },
  {
    "id": "palak-paneer",
    "name": "Palak Paneer",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 40,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["spinach", "paneer", "cream", "garlic", "garam masala"],
    "pantryFriendly": false,
    "season": [],
    "description": "Velvety spinach sauce with cubes of golden paneer. Restaurant-quality at home.",
    "notes": ""
  },
  {
    "id": "vegetable-biryani",
    "name": "Vegetable Biryani",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "high",
    "mood": ["impressive", "comforting"],
    "time": 90,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["basmati rice", "mixed vegetables", "saffron", "yoghurt", "fried onions"],
    "pantryFriendly": false,
    "season": [],
    "description": "Layered, fragrant, and celebratory. A weekend rice project worth every minute.",
    "notes": ""
  },
  {
    "id": "saag-dal",
    "name": "Saag Dal",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "low",
    "mood": ["comforting"],
    "time": 35,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["spinach", "red lentils", "garlic", "cumin", "turmeric"],
    "pantryFriendly": true,
    "season": ["fall", "winter"],
    "description": "Earthy lentils melted with spinach and warm spices. Deeply nourishing.",
    "notes": ""
  },
  {
    "id": "masala-dosa",
    "name": "Masala Dosa",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "south-asian",
    "effort": "high",
    "mood": ["adventurous", "impressive"],
    "time": 120,
    "meal": "breakfast",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["rice", "urad dal", "potatoes", "mustard seeds", "curry leaves"],
    "pantryFriendly": true,
    "season": [],
    "description": "Crispy fermented crepes filled with spiced potatoes. Requires planning ahead but worth it.",
    "notes": "Batter needs to ferment overnight."
  },
  {
    "id": "cacio-e-pepe",
    "name": "Cacio e Pepe",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 20,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["spaghetti", "pecorino", "black pepper"],
    "pantryFriendly": true,
    "season": [],
    "description": "Three ingredients, infinite satisfaction. Technique is everything here.",
    "notes": ""
  },
  {
    "id": "ratatouille",
    "name": "Ratatouille",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "medium",
    "mood": ["fresh", "impressive"],
    "time": 60,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["aubergine", "courgette", "peppers", "tomatoes", "herbs de provence"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Layered summer vegetables, slow-roasted until meltingly tender. Provencal elegance.",
    "notes": ""
  },
  {
    "id": "mushroom-risotto",
    "name": "Mushroom Risotto",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 45,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["arborio rice", "mushrooms", "parmesan", "white wine", "butter"],
    "pantryFriendly": false,
    "season": ["fall", "winter"],
    "description": "Creamy, earthy, and deeply umami. Stirring is meditative, the result is luxurious.",
    "notes": ""
  },
  {
    "id": "ribollita",
    "name": "Ribollita",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 60,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["cannellini beans", "cavolo nero", "bread", "tomatoes", "olive oil"],
    "pantryFriendly": true,
    "season": ["fall", "winter"],
    "description": "Thick Tuscan bread soup. Rustic, thrifty, and impossibly good the next day.",
    "notes": ""
  },
  {
    "id": "spanakopita",
    "name": "Spanakopita",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "mediterranean",
    "effort": "high",
    "mood": ["impressive", "comforting"],
    "time": 75,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["spinach", "feta", "filo pastry", "dill", "eggs"],
    "pantryFriendly": false,
    "season": [],
    "description": "Flaky golden filo wrapped around a salty spinach and feta filling. Greek perfection.",
    "notes": ""
  },
  {
    "id": "pasta-aglio-olio",
    "name": "Pasta Aglio e Olio",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["quick-fix", "comforting"],
    "time": 15,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["spaghetti", "garlic", "chilli flakes", "olive oil", "parsley"],
    "pantryFriendly": true,
    "season": [],
    "description": "Garlic, oil, chilli, pasta. Done in the time it takes to boil water.",
    "notes": ""
  },
  {
    "id": "french-onion-soup",
    "name": "French Onion Soup",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "high",
    "mood": ["comforting", "impressive"],
    "time": 90,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["onions", "butter", "gruyere", "bread", "beef stock"],
    "pantryFriendly": true,
    "season": ["fall", "winter"],
    "description": "Deeply caramelised onion broth under a bubbling cheese crust. Worth the slow cook.",
    "notes": ""
  },
  {
    "id": "pesto-pasta",
    "name": "Pasta al Pesto",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 15,
    "meal": "dinner",
    "dietary": ["vegetarian"],
    "keyIngredients": ["pasta", "basil", "pine nuts", "parmesan", "garlic", "olive oil"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Bright, herby, and summery. Best with fresh basil and good olive oil.",
    "notes": ""
  },
  {
    "id": "niçoise-salad",
    "name": "Salade Niçoise",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "french",
    "effort": "medium",
    "mood": ["fresh", "impressive"],
    "time": 35,
    "meal": "lunch",
    "dietary": ["gluten-free", "dairy-free"],
    "keyIngredients": ["tuna", "green beans", "eggs", "olives", "potatoes", "anchovies"],
    "pantryFriendly": false,
    "season": ["spring", "summer"],
    "description": "A composed salad that's really a full meal. Elegant, fresh, and satisfying.",
    "notes": ""
  },
  {
    "id": "sheet-pan-roasted-veg",
    "name": "Sheet Pan Roasted Vegetables",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "american",
    "effort": "low",
    "mood": ["quick-fix", "comforting"],
    "time": 35,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["seasonal vegetables", "olive oil", "garlic", "herbs"],
    "pantryFriendly": false,
    "season": [],
    "description": "Whatever vegetables you have, tossed in olive oil and roasted until golden. Always works.",
    "notes": "Use high heat (220C) for best caramelisation."
  },
  {
    "id": "grain-bowl",
    "name": "Build-Your-Own Grain Bowl",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "american",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 20,
    "meal": "lunch",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["quinoa", "roasted vegetables", "avocado", "tahini", "greens"],
    "pantryFriendly": false,
    "season": [],
    "description": "Grains + veg + protein + dressing. Infinitely customisable lunch.",
    "notes": "Cook grains in batch on Sunday for easy weekday bowls."
  },
  {
    "id": "frittata",
    "name": "Vegetable Frittata",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "italian",
    "effort": "low",
    "mood": ["quick-fix", "comforting"],
    "time": 25,
    "meal": "any",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["eggs", "whatever vegetables", "cheese", "herbs"],
    "pantryFriendly": true,
    "season": [],
    "description": "The ultimate fridge-cleaner. Eggs + any veg + cheese = done.",
    "notes": ""
  },
  {
    "id": "black-bean-tacos",
    "name": "Black Bean Tacos",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "mexican",
    "effort": "low",
    "mood": ["quick-fix", "fresh"],
    "time": 20,
    "meal": "dinner",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["black beans", "corn tortillas", "avocado", "lime", "coriander", "salsa"],
    "pantryFriendly": true,
    "season": [],
    "description": "Spiced black beans, creamy avocado, sharp lime. Dinner in 20 minutes.",
    "notes": ""
  },
  {
    "id": "japanese-curry",
    "name": "Japanese Curry",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["comforting"],
    "time": 50,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["potatoes", "carrots", "onions", "curry roux", "rice"],
    "pantryFriendly": true,
    "season": ["fall", "winter"],
    "description": "Thick, sweet, and warming. Japanese comfort food at its finest.",
    "notes": ""
  },
  {
    "id": "miso-soup",
    "name": "Miso Soup with Tofu",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["comforting", "quick-fix"],
    "time": 10,
    "meal": "any",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["miso paste", "tofu", "wakame", "scallions", "dashi"],
    "pantryFriendly": true,
    "season": [],
    "description": "Warming, umami-rich broth in 10 minutes. The perfect side or light meal.",
    "notes": ""
  },
  {
    "id": "japchae",
    "name": "Japchae (Korean Glass Noodles)",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "medium",
    "mood": ["impressive", "adventurous"],
    "time": 40,
    "meal": "dinner",
    "dietary": ["vegan"],
    "keyIngredients": ["sweet potato noodles", "mushrooms", "spinach", "soy sauce", "sesame oil"],
    "pantryFriendly": false,
    "season": [],
    "description": "Bouncy glass noodles with colourful stir-fried vegetables. A Korean celebration dish.",
    "notes": ""
  },
  {
    "id": "enchiladas-verdes",
    "name": "Enchiladas Verdes",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "mexican",
    "effort": "medium",
    "mood": ["comforting", "impressive"],
    "time": 50,
    "meal": "dinner",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["tortillas", "tomatillos", "cheese", "sour cream", "jalapeños"],
    "pantryFriendly": false,
    "season": [],
    "description": "Corn tortillas rolled in tangy green salsa, smothered in cheese. Deeply satisfying.",
    "notes": ""
  },
  {
    "id": "granola",
    "name": "Homemade Granola",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "american",
    "effort": "low",
    "mood": ["comforting"],
    "time": 30,
    "meal": "breakfast",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["oats", "nuts", "maple syrup", "coconut oil", "dried fruit"],
    "pantryFriendly": true,
    "season": [],
    "description": "Crunchy, golden clusters. Make a batch on Sunday, eat all week.",
    "notes": ""
  },
  {
    "id": "shakshuka-green",
    "name": "Green Shakshuka",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 25,
    "meal": "any",
    "dietary": ["vegetarian", "gluten-free"],
    "keyIngredients": ["eggs", "spinach", "leeks", "feta", "herbs", "chilli"],
    "pantryFriendly": false,
    "season": ["spring", "summer"],
    "description": "A verdant twist on shakshuka — eggs nestled in garlicky greens with feta.",
    "notes": ""
  },
  {
    "id": "hummus",
    "name": "Hummus from Scratch",
    "source": "Personal",
    "sourceUrl": "",
    "cuisine": "middle-eastern",
    "effort": "medium",
    "mood": ["fresh", "impressive"],
    "time": 90,
    "meal": "snack",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["dried chickpeas", "tahini", "lemon", "garlic", "cumin"],
    "pantryFriendly": true,
    "season": [],
    "description": "Impossibly smooth hummus from dried chickpeas. Night-and-day better than shop-bought.",
    "notes": "Soak chickpeas overnight. Peel skins for extra smoothness."
  },
  {
    "id": "nyt-smashed-cucumber",
    "name": "Smashed Cucumber Salad",
    "source": "NYT Cooking",
    "sourceUrl": "",
    "cuisine": "east-asian",
    "effort": "low",
    "mood": ["fresh", "quick-fix"],
    "time": 10,
    "meal": "snack",
    "dietary": ["vegan", "gluten-free"],
    "keyIngredients": ["cucumber", "garlic", "chilli oil", "rice vinegar", "sesame"],
    "pantryFriendly": false,
    "season": ["summer"],
    "description": "Crunchy, garlicky, and addictive. Smash, dress, devour.",
    "notes": "Add your NYT Cooking link here."
  },
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

  var BUILTIN_TREE = {"questions":[{"id":"meal","text":"What are we eating?","subtitle":"Pick one to get started.","field":"meal","type":"single","options":[{"value":"breakfast","label":"Breakfast"},{"value":"lunch","label":"Lunch"},{"value":"dinner","label":"Dinner"},{"value":"snack","label":"Snack"},{"value":"any","label":"No preference"}],"allowSkip":false,"filterLogic":"match-or-any"},{"id":"mood","text":"What's the vibe?","subtitle":"Pick as many as feel right.","field":"mood","type":"multi","options":[{"value":"comforting","label":"Something cozy & comforting"},{"value":"fresh","label":"Something fresh & light"},{"value":"impressive","label":"Something to show off"},{"value":"quick-fix","label":"Just feed me, fast"},{"value":"adventurous","label":"Something new & different"}],"allowSkip":true,"filterLogic":"overlap"},{"id":"effort","text":"How much energy do you have?","subtitle":"Be honest with yourself.","field":"effort","type":"single","options":[{"value":"low","label":"Minimal — under 30 min, easy"},{"value":"medium","label":"Some — 30 to 60 min"},{"value":"high","label":"I want a project — 60+ min"}],"allowSkip":true,"filterLogic":"match-or-below"},{"id":"cuisine","text":"Any cuisine calling to you?","subtitle":"Pick one, or skip to keep options open.","field":"cuisine","type":"single","options":[{"value":"mediterranean","label":"Mediterranean"},{"value":"east-asian","label":"East Asian"},{"value":"south-asian","label":"South Asian"},{"value":"mexican","label":"Mexican"},{"value":"italian","label":"Italian"},{"value":"middle-eastern","label":"Middle Eastern"},{"value":"american","label":"American"},{"value":"french","label":"French"}],"allowSkip":true,"filterLogic":"match"},{"id":"dietary","text":"Any dietary needs today?","subtitle":"Select all that apply, or skip.","field":"dietary","type":"multi","options":[{"value":"vegetarian","label":"Vegetarian"},{"value":"vegan","label":"Vegan"},{"value":"gluten-free","label":"Gluten-free"},{"value":"dairy-free","label":"Dairy-free"}],"allowSkip":true,"filterLogic":"subset"},{"id":"pantry","text":"Working with what's on hand?","subtitle":"Only show recipes you can make from pantry staples.","field":"pantryFriendly","type":"single","options":[{"value":"yes","label":"Yes, pantry raid mode"},{"value":"no","label":"I can shop"}],"allowSkip":true,"filterLogic":"boolean-filter-if-true"}]};

  var allRecipes = [];
  var tree = null;
  var userData = null;

  var state = {
    screen: "landing",
    questionIndex: 0,
    answers: {},
    multiSelections: [],
    resultsMode: "tree", // "tree" or "surprise"
    editingId: null,
    detailFromScreen: null,
  };

  // ---- Data loading ----

  function init() {
    tree = BUILTIN_TREE;
    loadUserData();
    rebuildAllRecipes();
    console.log("Loaded " + BUILTIN_RECIPES.length + " built-in + " +
      (userData.customRecipes.length) + " custom recipes");
    setupEventListeners();
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
    return null;
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
    document.querySelectorAll(".screen").forEach(function (el) {
      el.classList.remove("active");
    });
    var target = document.getElementById("screen-" + name);
    if (target) {
      target.classList.add("active");
      target.style.animation = "none";
      target.offsetHeight;
      target.style.animation = "";
    }
    var gear = document.getElementById("btn-settings");
    gear.style.display = name === "landing" ? "" : "none";
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
      if (i < state.questionIndex) dot.classList.add("done");
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
  function orderForSuggestions(arr) {
    return arr
      .map(function (r) { return { r: r, key: ratingForSort(r.id), rand: Math.random() }; })
      .sort(function (a, b) { return b.key - a.key || a.rand - b.rand; })
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
      }).slice(0, 3);

      if (!fresh.length) {
        status.textContent = "No new ideas this time — your collection already covers it.";
        return;
      }
      status.textContent = "";
      fresh.forEach(function (r) {
        grid.appendChild(renderRecipeCard(r, { web: true }));
      });
    });
  }

  // ---- Recipe Detail ----

  function showRecipeDetail(id) {
    var recipe = recipeById(id);
    if (!recipe) return;

    state.detailFromScreen = state.screen;

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

    // Ingredients
    var hasIngredients = recipe.ingredients && recipe.ingredients.length;
    var ingSection = document.getElementById("recipe-detail-ingredients");
    var ingList = document.getElementById("recipe-detail-ingredients-list");
    if (hasIngredients) {
      ingList.innerHTML = "";
      recipe.ingredients.forEach(function (ing) {
        var li = document.createElement("li");
        li.textContent = ing;
        ingList.appendChild(li);
      });
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
      linkEl.textContent = (hasIngredients || hasMethod)
        ? "View on " + escapeHtml(recipe.source || "source") + " →"
        : "View recipe →";
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
    topPicks.forEach(function (pick) {
      topContainer.appendChild(renderRecipeCard(pick.recipe, { featured: true, wildcard: pick.wildcard }));
    });

    var moreSection = document.getElementById("more-options-section");
    var moreGrid = document.getElementById("more-options-grid");
    moreGrid.innerHTML = "";

    if (moreOptions.length > 0) {
      moreSection.style.display = "";
      moreGrid.style.display = "none";
      document.getElementById("btn-more-toggle").textContent =
        "See " + moreOptions.length + " more option" + (moreOptions.length !== 1 ? "s" : "");
      moreOptions.forEach(function (r) {
        moreGrid.appendChild(renderRecipeCard(r, {}));
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
    card.dataset.id = recipe.id;

    if (opts.draggable) {
      card.setAttribute("draggable", "true");
      card.classList.add("draggable");
    }

    var html = "";
    if (opts.wildcard) html += '<span class="wildcard-badge">Wildcard</span>';
    if (recipe.web) html += '<span class="web-badge">From the web</span>';

    html += '<div class="card-top">';
    html += '<span class="recipe-name">' + escapeHtml(recipe.name) + "</span>";
    html += '<span class="source-badge ' + sourceClass(recipe.source) + '">' + escapeHtml(recipe.source) + "</span>";
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
    return el;
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
    grid.innerHTML = "";
    if (recipes.length === 0) {
      grid.innerHTML = '<p class="browse-empty">No recipes match your filters.</p>';
      return;
    }
    recipes.slice()
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (r) { grid.appendChild(renderRecipeCard(r, {})); });
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
    if (userData.plan[dateK].indexOf(data.id) === -1) userData.plan[dateK].push(data.id);
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
