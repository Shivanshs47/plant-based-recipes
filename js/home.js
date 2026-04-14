/**
 * GreenPlate — home.js
 * Logic for index.html:
 *   - Animated counter for stats
 *   - Featured recipes grid (latest 3)
 */

(function () {
  "use strict";

  document.addEventListener("gpDbReady", init);

  function init() {
    renderFeaturedRecipes();
    animateCounters();
  }

  /* ---- Featured Recipes (latest 3 from DB) ---- */
  function renderFeaturedRecipes() {
    const grid = document.getElementById("featuredGrid");
    if (!grid) return;

    const recipes = DB.getAllRecipes().slice(0, 3);

    grid.innerHTML = "";

    if (recipes.length === 0) {
      grid.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">🌱</div>
        <h3>No recipes yet</h3>
        <p>Be the first to share one!</p>
      </div>`;
      return;
    }

    recipes.forEach((recipe, i) => {
      const card = buildRecipeCard(recipe, openRecipeModal);
      card.style.animationDelay = `${i * 0.1}s`;
      card.style.animation = "fadeSlideUp 0.6s ease forwards";
      card.style.opacity = "0";
      grid.appendChild(card);
    });
  }

  /* ---- Animated Number Counter ---- */
  function animateCounters() {
    const recipeCountEl = document.getElementById("statRecipes");
    if (!recipeCountEl) return;

    const total = DB.countRecipes();
    animateNumber(recipeCountEl, 0, total, 800);
  }

  function animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.floor(eased * (end - start) + start);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

})();
