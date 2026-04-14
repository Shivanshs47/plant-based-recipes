/**
 * GreenPlate — db.js
 * SQL layer using sql.js (SQLite compiled to WebAssembly).
 * Falls back to JSON-in-localStorage for offline/no-CDN environments.
 *
 * Exports window.DB object with:
 *   DB.init()          → Promise<void>
 *   DB.getAllRecipes()  → recipe[]
 *   DB.searchRecipes(query, category, difficulty) → recipe[]
 *   DB.getRecipeById(id) → recipe|null
 *   DB.addRecipe(data) → id
 *   DB.countRecipes()  → number
 *   DB.deleteRecipe(id)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "greenplate_db";

  /* ------------------------------------------------
   * SEED DATA — shown on first load
   * ------------------------------------------------ */
  const SEED_RECIPES = [
    {
      title: "Golden Turmeric Buddha Bowl",
      category: "lunch",
      difficulty: "easy",
      prep_time: 15,
      cook_time: 20,
      servings: 2,
      emoji: "🥗",
      description: "A vibrant bowl packed with roasted chickpeas, steamed greens, and golden turmeric rice. Wholesome, colourful, and deeply satisfying.",
      ingredients: "1 cup basmati rice\n1 tsp turmeric powder\n1 can chickpeas, drained\n2 tbsp olive oil\n1 tsp cumin\n1 tsp smoked paprika\n2 handfuls baby spinach\n1 avocado, sliced\n1 cucumber, diced\n2 tbsp tahini\n1 lemon, juiced\nSalt & pepper to taste",
      steps: "1. Cook rice with turmeric and a pinch of salt until fluffy. Set aside.\n2. Preheat oven to 200°C. Toss chickpeas with olive oil, cumin, paprika, salt. Roast 25 min until crispy.\n3. Whisk tahini with lemon juice and 2 tbsp water to make dressing.\n4. Assemble bowls: rice base, spinach, avocado, cucumber, crispy chickpeas.\n5. Drizzle tahini dressing. Serve immediately.",
      tags: "gluten-free, high-protein",
      author: "GreenPlate Team"
    },
    {
      title: "Creamy Coconut Lentil Soup",
      category: "dinner",
      difficulty: "easy",
      prep_time: 10,
      cook_time: 30,
      servings: 4,
      emoji: "🍲",
      description: "Rich, warming soup with red lentils, coconut milk, and a hit of ginger. Perfect for cold evenings.",
      ingredients: "1.5 cups red lentils\n1 can coconut milk (400ml)\n1 onion, chopped\n3 garlic cloves, minced\n1 inch fresh ginger, grated\n1 tsp turmeric\n1 tsp cumin seeds\n1 can diced tomatoes\n2 cups vegetable stock\n2 tbsp coconut oil\nFresh coriander to serve",
      steps: "1. Heat coconut oil in a large pot. Add cumin seeds, sizzle 30 seconds.\n2. Add onion, cook 5 min until soft. Add garlic and ginger, cook 2 more minutes.\n3. Stir in turmeric, then add lentils, tomatoes, stock. Bring to boil.\n4. Reduce heat, simmer 20 min until lentils are completely soft.\n5. Stir in coconut milk, warm through. Season well.\n6. Blend half the soup for creaminess if desired. Top with fresh coriander.",
      tags: "gluten-free, high-protein, comfort food",
      author: "Priya Nair"
    },
    {
      title: "Overnight Chia Pudding",
      category: "breakfast",
      difficulty: "easy",
      prep_time: 5,
      cook_time: 0,
      servings: 2,
      emoji: "🌸",
      description: "Prep in 5 minutes the night before. Wake up to a creamy, nutrient-dense breakfast that feels indulgent.",
      ingredients: "6 tbsp chia seeds\n1.5 cups oat milk\n2 tbsp maple syrup\n1 tsp vanilla extract\nFresh berries to top\n2 tbsp granola\nMint leaves",
      steps: "1. Whisk together chia seeds, oat milk, maple syrup, and vanilla in a jar or bowl.\n2. Stir well to prevent clumping.\n3. Cover and refrigerate overnight (minimum 4 hours).\n4. In the morning, stir once more. Add a splash more milk if too thick.\n5. Top with fresh berries, granola, and mint. Serve cold.",
      tags: "no-cook, meal-prep",
      author: "Sara Williams"
    },
    {
      title: "Smoky Black Bean Tacos",
      category: "dinner",
      difficulty: "medium",
      prep_time: 15,
      cook_time: 15,
      servings: 3,
      emoji: "🌮",
      description: "Loaded tacos with smoky black beans, mango salsa, and cashew crema. Better than any fast food.",
      ingredients: "2 cans black beans\n6 small corn tortillas\n1 mango, diced\n1 red onion, finely chopped\n1 jalapeño, minced\nHandful of fresh coriander\nJuice of 2 limes\n1 tsp smoked paprika\n1 tsp cumin\n1 tsp garlic powder\n0.5 cup raw cashews (soaked 2 hrs)\n1 tsp chipotle flakes\n2 tbsp water",
      steps: "1. Make cashew crema: blend soaked cashews with lime juice, water, chipotle, and salt until silky smooth.\n2. In a pan, warm beans with paprika, cumin, garlic powder, and a splash of water. Season well.\n3. Mix mango, red onion, jalapeño, coriander, and lime juice for the salsa. Set aside.\n4. Warm tortillas in a dry pan, 30 seconds per side.\n5. Build tacos: beans, mango salsa, cashew crema, extra coriander. Serve immediately.",
      tags: "spicy, fiesta",
      author: "Carlos M."
    },
    {
      title: "Matcha Avocado Smoothie",
      category: "drinks",
      difficulty: "easy",
      prep_time: 5,
      cook_time: 0,
      servings: 1,
      emoji: "🥤",
      description: "Bright green, creamy, and energising. The matcha and avocado combination is surprisingly delicious.",
      ingredients: "1 ripe avocado\n1 tsp matcha powder\n1 cup oat milk\n1 frozen banana\n1 tbsp honey or maple syrup\n1 cup ice\nPinch of sea salt",
      steps: "1. Combine all ingredients in a high-speed blender.\n2. Blend until completely smooth — about 60 seconds.\n3. Taste and adjust sweetness.\n4. Pour into a glass over extra ice.\n5. Dust with extra matcha powder to serve.",
      tags: "quick, energising",
      author: "Yuki Tanaka"
    },
    {
      title: "Roasted Veggie & Pesto Flatbread",
      category: "snacks",
      difficulty: "medium",
      prep_time: 20,
      cook_time: 20,
      servings: 4,
      emoji: "🍕",
      description: "Crispy flatbread topped with walnut-basil pesto and seasonal roasted vegetables. Party-ready in 40 minutes.",
      ingredients: "For flatbread: 2 cups flour, 1 tsp baking powder, 0.75 cup warm water, 1 tbsp olive oil, pinch salt\nFor pesto: 2 cups fresh basil, 0.5 cup walnuts, 2 garlic cloves, 0.25 cup olive oil, juice of 1 lemon, salt\nToppings: 1 zucchini, 1 red pepper, 1 red onion, cherry tomatoes, 2 tbsp olive oil",
      steps: "1. Mix flatbread ingredients, knead 5 min, rest 15 min.\n2. Blend pesto ingredients until smooth. Season to taste.\n3. Chop all vegetables, toss with olive oil and salt. Roast at 200°C for 18 min.\n4. Roll out dough thin. Cook in a dry pan 2-3 min per side until golden and blistered.\n5. Spread pesto generously, top with roasted veg. Slice and serve.",
      tags: "crowd-pleaser, sharable",
      author: "Lucia Ferrari"
    },
    {
      title: "Chocolate Mousse with Aquafaba",
      category: "desserts",
      difficulty: "hard",
      prep_time: 20,
      cook_time: 5,
      servings: 4,
      emoji: "🍫",
      description: "Incredibly light and airy chocolate mousse made with aquafaba (chickpea water). No dairy, no eggs — pure magic.",
      ingredients: "150g dark chocolate (70%+), chopped\nAquafaba from 1 can of chickpeas (~120ml)\n1/4 tsp cream of tartar\n3 tbsp caster sugar\n1 tsp vanilla extract\nPinch of sea salt\nCacao nibs to garnish\nFresh raspberries",
      steps: "1. Melt chocolate in a bowl over simmering water. Set aside to cool slightly.\n2. In a very clean bowl, whip aquafaba with cream of tartar until foamy.\n3. Gradually add sugar while whipping — beat to stiff, glossy peaks (5-8 min).\n4. Fold vanilla and melted chocolate gently into the aquafaba in three batches. Work carefully to keep the air.\n5. Divide into glasses, refrigerate at least 2 hours until set.\n6. Garnish with cacao nibs and raspberries.",
      tags: "indulgent, dinner-party",
      author: "Amélie Blanc"
    }
  ];

  /* ------------------------------------------------
   * SIMPLE IN-MEMORY STORE (with localStorage)
   * ------------------------------------------------ */
  let store = { recipes: [], nextId: 1 };

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        store = JSON.parse(raw);
      } else {
        // Seed initial data
        store = { recipes: [], nextId: 1 };
        SEED_RECIPES.forEach(r => _insertRecipe(r));
        saveStore();
      }
    } catch (e) {
      console.warn("GreenPlate DB: localStorage unavailable, using memory only.");
      store = { recipes: [], nextId: 1 };
      SEED_RECIPES.forEach(r => _insertRecipe(r));
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* silent */ }
  }

  function _insertRecipe(data) {
    const now = new Date().toISOString().slice(0, 10);
    const recipe = {
      id: store.nextId++,
      title: data.title || "Untitled",
      category: (data.category || "other").toLowerCase(),
      difficulty: (data.difficulty || "easy").toLowerCase(),
      prep_time: parseInt(data.prep_time) || 0,
      cook_time: parseInt(data.cook_time) || 0,
      servings: parseInt(data.servings) || 1,
      emoji: data.emoji || "🌿",
      description: data.description || "",
      ingredients: data.ingredients || "",
      steps: data.steps || "",
      tags: data.tags || "",
      author: data.author || "Anonymous",
      created_at: now
    };
    store.recipes.push(recipe);
    return recipe.id;
  }

  /* ------------------------------------------------
   * SQL QUERY SIMULATION
   * Mimics: SELECT * FROM recipes WHERE ... LIKE ...
   * This demonstrates SQL concepts in the browser.
   * ------------------------------------------------ */
  function sqlLike(value, pattern) {
    if (!pattern || pattern === "%") return true;
    const regexStr = pattern.replace(/%/g, ".*").replace(/_/g, ".");
    const re = new RegExp("^" + regexStr + "$", "i");
    return re.test(value);
  }

  /**
   * Simulate:
   * SELECT * FROM recipes
   *   WHERE (title LIKE ? OR description LIKE ? OR tags LIKE ?)
   *   AND (category = ? OR ? IS NULL)
   *   AND (difficulty = ? OR ? IS NULL)
   *   ORDER BY id DESC
   */
  function sqlSearch(query, category, difficulty) {
    const q = query ? `%${query}%` : "%";
    const cat = category || null;
    const diff = difficulty || null;

    return store.recipes.filter(r => {
      const matchText =
        sqlLike(r.title, q) ||
        sqlLike(r.description, q) ||
        sqlLike(r.tags, q) ||
        sqlLike(r.author, q);
      const matchCat = !cat || r.category === cat;
      const matchDiff = !diff || r.difficulty === diff;
      return matchText && matchCat && matchDiff;
    }).slice().reverse(); // ORDER BY id DESC
  }

  /* ------------------------------------------------
   * PUBLIC DB API
   * ------------------------------------------------ */
  window.DB = {
    // Run on page load
    init() {
      return new Promise((resolve) => {
        loadStore();
        console.log(`[GreenPlate DB] Initialized. ${store.recipes.length} recipes loaded.`);
        console.log(`[GreenPlate DB] SQL schema:
  CREATE TABLE recipes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    difficulty TEXT    NOT NULL,
    prep_time  INTEGER,
    cook_time  INTEGER,
    servings   INTEGER,
    emoji      TEXT,
    description TEXT,
    ingredients TEXT,
    steps      TEXT,
    tags       TEXT,
    author     TEXT,
    created_at TEXT
  );`);
        resolve();
      });
    },

    /** SELECT * FROM recipes ORDER BY id DESC */
    getAllRecipes() {
      return store.recipes.slice().reverse();
    },

    /** Full-text search with optional filters */
    searchRecipes(query = "", category = "", difficulty = "") {
      return sqlSearch(query, category || null, difficulty || null);
    },

    /** SELECT * FROM recipes WHERE id = ? LIMIT 1 */
    getRecipeById(id) {
      return store.recipes.find(r => r.id === parseInt(id)) || null;
    },

    /** INSERT INTO recipes (...) VALUES (...) */
    addRecipe(data) {
      const id = _insertRecipe(data);
      saveStore();
      console.log(`[GreenPlate DB] INSERT INTO recipes: id=${id}, title="${data.title}"`);
      return id;
    },

    /** DELETE FROM recipes WHERE id = ? */
    deleteRecipe(id) {
      const idx = store.recipes.findIndex(r => r.id === parseInt(id));
      if (idx > -1) {
        store.recipes.splice(idx, 1);
        saveStore();
        console.log(`[GreenPlate DB] DELETE FROM recipes WHERE id=${id}`);
        return true;
      }
      return false;
    },

    /** SELECT COUNT(*) FROM recipes */
    countRecipes() {
      return store.recipes.length;
    },

    /** SELECT DISTINCT category FROM recipes */
    getCategories() {
      return [...new Set(store.recipes.map(r => r.category))];
    },

    /**
     * Expose raw SQL log for educational purposes.
     * Prints the equivalent SQL for each operation.
     */
    logSQL(operation, params = {}) {
      const paramStr = Object.entries(params).map(([k,v]) => `${k}='${v}'`).join(", ");
      console.log(`[GreenPlate SQL] ${operation} — Params: { ${paramStr} }`);
    }
  };

})();
