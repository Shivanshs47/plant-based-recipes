/**
 * GreenPlate — app.js
 * Shared utilities used across all pages:
 *   - Navbar scroll effect & mobile hamburger
 *   - Toast notifications
 *   - Recipe card builder (DOM)
 *   - Recipe detail modal
 *   - Active nav link highlighting
 */

(function () {
  "use strict";

  /* ======================================
   * 1. NAVBAR — Scroll & Mobile Hamburger
   * ====================================== */
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      const isOpen = navLinks.classList.contains("open");
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove("open");
      }
    });
  }

  // Highlight active nav link
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href").split("/").pop();
    link.classList.toggle("active", href === currentPage || (currentPage === "" && href === "index.html"));
  });


  /* ======================================
   * 2. TOAST NOTIFICATIONS
   * ====================================== */
  let toastTimeout;

  function showToast(message, type = "success") {
    let toast = document.getElementById("gp-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "gp-toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = `toast ${type}`;
    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add("show");
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 3500);
  }

  window.showToast = showToast;


  /* ======================================
   * 3. RECIPE CARD BUILDER (DOM)
   * ====================================== */

  /**
   * Creates a recipe card element.
   * @param {Object} recipe - Recipe data from DB
   * @param {Function} onClick - Click callback
   * @returns {HTMLElement}
   */
  function buildRecipeCard(recipe, onClick) {
    const card = document.createElement("article");
    card.className = "recipe-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `View recipe: ${recipe.title}`);

    const totalTime = recipe.prep_time + recipe.cook_time;
    const timeLabel = totalTime > 0 ? `${totalTime} min` : "Quick";

    card.innerHTML = `
      <div class="recipe-card-emoji">${recipe.emoji || "🌿"}</div>
      <div class="recipe-card-body">
        <span class="recipe-card-category">${capitalize(recipe.category)}</span>
        <h3 class="recipe-card-title">${escapeHtml(recipe.title)}</h3>
        <p class="recipe-card-desc">${escapeHtml(recipe.description)}</p>
        <div class="recipe-card-meta">
          <span class="meta-tag">⏱ ${timeLabel}</span>
          <span class="meta-tag">👤 ${recipe.servings} serv.</span>
          <span class="meta-tag">${difficultyLabel(recipe.difficulty)}</span>
        </div>
        <p class="recipe-card-author">By ${escapeHtml(recipe.author || "Anonymous")}</p>
      </div>
    `;

    function handleOpen() {
      if (typeof onClick === "function") onClick(recipe);
    }

    card.addEventListener("click", handleOpen);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen(); }
    });

    return card;
  }

  window.buildRecipeCard = buildRecipeCard;


  /* ======================================
   * 4. RECIPE DETAIL MODAL
   * ====================================== */
  let modalOverlay = null;

  function createModalIfNeeded() {
    if (document.getElementById("recipeModal")) return;

    modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "recipeModalOverlay";
    modalOverlay.setAttribute("role", "dialog");
    modalOverlay.setAttribute("aria-modal", "true");

    modalOverlay.innerHTML = `
      <div class="modal" id="recipeModal">
        <button class="modal-close" id="modalClose" aria-label="Close">✕</button>
        <div id="modalContent"></div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Close on overlay click
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.getElementById("modalClose").addEventListener("click", closeModal);

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function openRecipeModal(recipe) {
    createModalIfNeeded();
    const overlay = document.getElementById("recipeModalOverlay");
    const content = document.getElementById("modalContent");

    const totalTime = recipe.prep_time + recipe.cook_time;

    content.innerHTML = `
      <div class="modal-emoji">${recipe.emoji || "🌿"}</div>
      <div class="modal-category">${capitalize(recipe.category)}</div>
      <h2 class="modal-title">${escapeHtml(recipe.title)}</h2>
      <div class="modal-meta">
        <span class="meta-tag">⏱ Prep: ${recipe.prep_time} min</span>
        <span class="meta-tag">🔥 Cook: ${recipe.cook_time} min</span>
        <span class="meta-tag">👤 ${recipe.servings} servings</span>
        <span class="meta-tag">${difficultyLabel(recipe.difficulty)}</span>
      </div>
      <p style="color: var(--text-mid); line-height: 1.7; font-size:0.95rem;">${escapeHtml(recipe.description)}</p>
      
      <h3 class="modal-section-title">🛒 Ingredients</h3>
      <div class="modal-ingredients">${escapeHtml(recipe.ingredients)}</div>

      <h3 class="modal-section-title">📋 Instructions</h3>
      <div class="modal-steps">${escapeHtml(recipe.steps)}</div>

      ${recipe.tags ? `<div style="margin-top:1.2rem;">${recipe.tags.split(",").map(t => `<span class="meta-tag" style="margin-right:.4rem;">#${t.trim()}</span>`).join("")}</div>` : ""}

      <div class="modal-author-line">
        🌱 Shared by <strong>${escapeHtml(recipe.author || "Anonymous")}</strong> · ${recipe.created_at || ""}
      </div>
    `;

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    overlay.querySelector(".modal").focus();
  }

  function closeModal() {
    const overlay = document.getElementById("recipeModalOverlay");
    if (overlay) {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  window.openRecipeModal = openRecipeModal;
  window.closeModal = closeModal;


  /* ======================================
   * 5. UTILITY HELPERS
   * ====================================== */
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function difficultyLabel(diff) {
    const map = { easy: "🟢 Easy", medium: "🟡 Medium", hard: "🔴 Hard" };
    return map[(diff || "").toLowerCase()] || capitalize(diff);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.GPUtils = { capitalize, difficultyLabel, escapeHtml };


  /* ======================================
   * 6. INIT DB on every page
   * ====================================== */
  document.addEventListener("DOMContentLoaded", () => {
    DB.init().then(() => {
      // Fire custom event so page scripts can react
      document.dispatchEvent(new CustomEvent("gpDbReady"));
    });
  });

})();
