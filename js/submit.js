/**
 * GreenPlate — submit.js
 * Logic for pages/submit.html:
 *   - Form validation (client-side)
 *   - Emoji picker for recipe
 *   - INSERT INTO recipes via DB.addRecipe()
 *   - Live character counters
 *   - Success state display
 */

(function () {
  "use strict";

  const EMOJI_OPTIONS = ["🥗","🍲","🌮","🥙","🥘","🍜","🍛","🍝","🥞","🧇","🥑","🥦","🌽","🍅","🥕","🫐","🍓","🍌","🥝","🍎","🥤","🧃","☕","🍵","🍰","🍫","🧁","🫙","🌿","🌱"];

  document.addEventListener("gpDbReady", init);

  function init() {
    buildEmojiPicker();
    setupCharCounters();
    setupFormValidation();
  }

  /* ---- Emoji Picker ---- */
  function buildEmojiPicker() {
    const container = document.getElementById("emojiPicker");
    const hiddenInput = document.getElementById("recipeEmoji");
    if (!container || !hiddenInput) return;

    EMOJI_OPTIONS.forEach(emoji => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emoji-btn";
      btn.textContent = emoji;
      btn.setAttribute("title", emoji);
      btn.addEventListener("click", () => {
        container.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        hiddenInput.value = emoji;
        document.getElementById("emojiPreview").textContent = emoji;
      });
      container.appendChild(btn);
    });

    // Select first by default
    container.querySelector(".emoji-btn").classList.add("selected");
    hiddenInput.value = EMOJI_OPTIONS[0];
  }

  /* ---- Live character counters ---- */
  function setupCharCounters() {
    const fields = [
      { id: "recipeDescription", max: 200 },
      { id: "recipeIngredients", max: 1000 },
      { id: "recipeSteps", max: 2000 }
    ];
    fields.forEach(({ id, max }) => {
      const el = document.getElementById(id);
      const counter = document.getElementById(id + "Count");
      if (!el || !counter) return;
      counter.textContent = `0 / ${max}`;
      el.addEventListener("input", () => {
        const len = el.value.length;
        counter.textContent = `${len} / ${max}`;
        counter.style.color = len > max * 0.9 ? "#c0392b" : "var(--text-light)";
      });
    });
  }

  /* ---- Form Validation & Submit ---- */
  function setupFormValidation() {
    const form = document.getElementById("recipeForm");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);

    // Real-time field validation
    form.querySelectorAll("[required]").forEach(field => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => clearError(field));
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateForm(form)) return;

    const data = {
      title:       form.querySelector("#recipeTitle").value.trim(),
      category:    form.querySelector("#recipeCategory").value,
      difficulty:  form.querySelector("#recipeDifficulty").value,
      prep_time:   form.querySelector("#recipePrepTime").value,
      cook_time:   form.querySelector("#recipeCookTime").value,
      servings:    form.querySelector("#recipeServings").value,
      emoji:       form.querySelector("#recipeEmoji").value || "🌿",
      description: form.querySelector("#recipeDescription").value.trim(),
      ingredients: form.querySelector("#recipeIngredients").value.trim(),
      steps:       form.querySelector("#recipeSteps").value.trim(),
      tags:        form.querySelector("#recipeTags").value.trim(),
      author:      form.querySelector("#recipeAuthor").value.trim() || "Anonymous"
    };

    // INSERT via DB layer
    const newId = DB.addRecipe(data);

    showSuccessState(data.title, newId);
    showToast(`🎉 "${data.title}" added successfully!`, "success");
  }

  /* ---- Form-level validation ---- */
  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("[required]").forEach(field => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  function validateField(field) {
    const value = field.value.trim();
    let error = "";

    if (field.hasAttribute("required") && !value) {
      error = "This field is required.";
    } else if (field.id === "recipeTitle" && value.length < 3) {
      error = "Title must be at least 3 characters.";
    } else if (field.id === "recipeIngredients" && value.split("\n").length < 2) {
      error = "Please list at least 2 ingredients (one per line).";
    } else if (field.id === "recipeSteps" && value.length < 30) {
      error = "Please provide more detailed steps.";
    }

    const group = field.closest(".form-group");
    let errEl = group?.querySelector(".form-error");

    if (error) {
      if (!errEl) {
        errEl = document.createElement("span");
        errEl.className = "form-error";
        errEl.style.cssText = "color:#c0392b;font-size:.78rem;margin-top:.2rem;";
        group.appendChild(errEl);
      }
      errEl.textContent = error;
      field.style.borderColor = "#e07070";
      return false;
    } else {
      if (errEl) errEl.remove();
      field.style.borderColor = "var(--green-light)";
      return true;
    }
  }

  function clearError(field) {
    const group = field.closest(".form-group");
    const errEl = group?.querySelector(".form-error");
    if (errEl) errEl.remove();
    field.style.borderColor = "";
  }

  /* ---- Success State ---- */
  function showSuccessState(title, id) {
    const formSection = document.getElementById("formSection");
    const successSection = document.getElementById("successSection");
    const successTitle = document.getElementById("successTitle");

    if (formSection) formSection.style.display = "none";
    if (successSection) {
      successSection.style.display = "block";
      if (successTitle) successTitle.textContent = `"${title}" is now live!`;
    }
  }

})();
