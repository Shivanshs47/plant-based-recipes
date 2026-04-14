# GreenPlate — Sustainable Plant-Based Recipe Hub

A fully client-side web application for discovering and sharing plant-based, sustainable recipes. Built as an intermediate-level web project using HTML, CSS, JavaScript (DOM), and SQL concepts.

---

Live Demo => https://shivanshs47.github.io/plant-based-recipes/ 

---

## Project Structure

```
greenplate/
│
├── index.html              ← Home page
├── css/
│   └── style.css           ← All styles (CSS Variables, Grid, Flexbox, Animations)
├── js/
│   ├── db.js               ← SQL database layer (localStorage-backed, SQL query simulation)
│   ├── app.js              ← Shared utilities: Navbar, Toast, Modal, Card Builder
│   ├── home.js             ← Home page logic (featured recipes, animated counter)
│   ├── explore.js          ← Explore page (search, filter, pagination)
│   └── submit.js           ← Submit form (validation, emoji picker, DB insert)
└── pages/
    ├── explore.html        ← Browse & search all recipes
    ├── submit.html         ← Share a new recipe form
    └── about.html          ← About page with SQL schema docs

```
---

## How to Run

1. *Download* all files, keeping the folder structure intact.
2. *Open* index.html in a modern browser (Chrome, Firefox, Edge, Safari).
3. No server, no installation, no npm — works completely offline after loading fonts.

> If fonts don't load offline, the app still works — it falls back to system serif/sans-serif fonts.

---

## Technologies Used

| Technology | How it's used |
|---|---|
| *HTML5* | Semantic structure, ARIA accessibility, forms |
| *CSS3* | CSS Variables, Grid, Flexbox, keyframe animations, responsive design |
| *JavaScript (DOM)* | Dynamic card rendering, event handling, live search, modal, toast |
| *SQL (Simulated)* | CRUD operations via db.js — mirrors real SQL syntax, stored in localStorage |
| *Google Fonts* | Playfair Display + DM Sans |

---

## SQL Database Layer (js/db.js)

The database is implemented as a *SQL simulation layer* that:
- Uses localStorage for persistence across browser sessions
- Mirrors real SQL operations (SELECT, INSERT, DELETE, WHERE/LIKE, ORDER BY)
- Logs every query to the *browser DevTools console* for educational transparency

### Schema
sql
CREATE TABLE recipes (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  title       TEXT     NOT NULL,
  category    TEXT     NOT NULL,   -- breakfast|lunch|dinner|snacks|desserts|drinks
  difficulty  TEXT     NOT NULL,   -- easy|medium|hard
  prep_time   INTEGER,             -- minutes
  cook_time   INTEGER,
  servings    INTEGER,
  emoji       TEXT,
  description TEXT,
  ingredients TEXT,
  steps       TEXT,
  tags        TEXT,
  author      TEXT,
  created_at  TEXT                 -- ISO date string
);


### Public DB API
javascript
DB.init()                          // Initialize and seed data
DB.getAllRecipes()                  // SELECT * FROM recipes ORDER BY id DESC
DB.searchRecipes(q, cat, diff)     // WHERE title LIKE ? AND category = ?
DB.getRecipeById(id)               // SELECT * WHERE id = ?
DB.addRecipe(data)                 // INSERT INTO recipes
DB.deleteRecipe(id)                // DELETE FROM recipes WHERE id = ?
DB.countRecipes()                  // SELECT COUNT(*) FROM recipes


---

## Features

- *Home Page* — Hero section, animated counters, featured recipe cards, category grid
- *Explore Page* — Live search, category filter, difficulty filter, load-more pagination
- *Submit Page* — Full form with validation, emoji picker, character counters, success state
- *About Page* — Tech stack docs, SQL schema with syntax highlighting
- *Recipe Modal* — Click any card to view full recipe details in a modal overlay
- *Toast Notifications* — Feedback on form submission and errors
- *Responsive Design* — Works on mobile, tablet, and desktop
- *Keyboard Accessible* — Tab navigation, Enter/Space to open cards, Escape to close modal
- *Data Persistence* — Recipes saved to localStorage survive page reloads

---

## Seed Data

7 sample recipes are pre-loaded on first run:
1. Golden Turmeric Buddha Bowl (Lunch, Easy)
2. Creamy Coconut Lentil Soup (Dinner, Easy)
3. Overnight Chia Pudding (Breakfast, Easy)
4. Smoky Black Bean Tacos (Dinner, Medium)
5. Matcha Avocado Smoothie (Drinks, Easy)
6. Roasted Veggie & Pesto Flatbread (Snacks, Medium)
7. Chocolate Mousse with Aquafaba (Desserts, Hard)

---

