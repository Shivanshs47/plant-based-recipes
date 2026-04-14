/**
 * GreenPlate — explore.js
 * Logic for pages/explore.html:
 *   - Live search (DOM input events)
 *   - Category & difficulty filter
 *   - URL param pre-filter (e.g., ?cat=breakfast)
 *   - Infinite scroll / load-more pagination
 *   - Recipe count display
 */

(function () {
  "use strict";

  const PER_PAGE = 6;
  let currentPage = 1;
  let currentResults = [];

  document.addEventListener("gpDbReady", init);

  function init() {
    setupFilters();
    loadFromUrlParams();
    runSearch();
  }

  /* ---- Read URL query params ---- */
  function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    if (cat) {
      const catSelect = document.getElementById("catFilter");
      if (catSelect) catSelect.value = cat;
    }
  }

  /* ---- Wire up search & filter controls ---- */
  function setupFilters() {
    const searchInput = document.getElementById("searchInput");
    const catFilter   = document.getElementById("catFilter");
    const diffFilter  = document.getElementById("diffFilter");
    const clearBtn    = document.getElementById("clearFilters");

    // Debounced live search
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { currentPage = 1; runSearch(); }, 300);
      });
    }

    if (catFilter)  catFilter.addEventListener("change",  () => { currentPage = 1; runSearch(); });
    if (diffFilter) diffFilter.addEventListener("change", () => { currentPage = 1; runSearch(); });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (catFilter)   catFilter.value   = "";
        if (diffFilter)  diffFilter.value  = "";
        currentPage = 1;
        runSearch();
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      });
    }

    // Load More button
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderPage(currentPage, false);
      });
    }
  }

  /* ---- Execute search query against DB ---- */
  function runSearch() {
    const query = (document.getElementById("searchInput")?.value || "").trim();
    const cat   =  document.getElementById("catFilter")?.value   || "";
    const diff  =  document.getElementById("diffFilter")?.value  || "";

    // Log equivalent SQL to console (educational)
    DB.logSQL(
      `SELECT * FROM recipes WHERE title LIKE '%${query}%' AND category LIKE '%${cat}%' AND difficulty LIKE '%${diff}%' ORDER BY id DESC`,
      { query, category: cat, difficulty: diff }
    );

    currentResults = DB.searchRecipes(query, cat, diff);
    currentPage = 1;

    updateResultCount(currentResults.length);
    renderPage(1, true);
  }

  /* ---- Render a page of results ---- */
  function renderPage(page, replace) {
    const grid = document.getElementById("recipeGrid");
    if (!grid) return;

    const start = (page - 1) * PER_PAGE;
    const end   = start + PER_PAGE;
    const slice = currentResults.slice(start, end);

    if (replace) {
      grid.innerHTML = "";
      // Show empty state
      if (currentResults.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>No recipes found</h3>
            <p>Try a different search or clear your filters.</p>
          </div>`;
        toggleLoadMore(false);
        return;
      }
    }

    slice.forEach((recipe, i) => {
      const card = buildRecipeCard(recipe, openRecipeModal);
      card.style.opacity = "0";
      card.style.animation = `fadeSlideUp 0.5s ease ${i * 0.07}s forwards`;
      grid.appendChild(card);
    });

    toggleLoadMore(end < currentResults.length);
  }

  /* ---- Show/hide Load More button ---- */
  function toggleLoadMore(show) {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = show ? "block" : "none";
    }
  }

  /* ---- Update the result count label ---- */
  function updateResultCount(count) {
    const label = document.getElementById("resultCount");
    if (label) {
      label.textContent = count === 0
        ? "No recipes found"
        : `${count} recipe${count !== 1 ? "s" : ""} found`;
    }
  }

})();
