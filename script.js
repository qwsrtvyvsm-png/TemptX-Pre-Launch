(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  const menuLinks = menu ? menu.querySelectorAll("a") : [];
  const waitlistForm = document.querySelector(".waitlist");
  const waitlistMessage = document.querySelector(".waitlist__message");
  const yearEl = document.querySelector("[data-year]");

  /* ---------- Footer year ---------- */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Sticky header state ---------- */
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const setMenuOpen = (open) => {
    if (!toggle || !menu) return;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 860) setMenuOpen(false);
      },
      { passive: true }
    );
  }

  /* ---------- Founding Member CTA → email ---------- */
  const focusEmailBtn = document.querySelector("[data-focus-email]");
  const emailInput = document.querySelector("#email");

  if (focusEmailBtn && emailInput) {
    focusEmailBtn.addEventListener("click", () => {
      emailInput.focus({ preventScroll: false });
      emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- Waitlist form ---------- */
  const showMessage = (text, isError = false) => {
    if (!waitlistMessage) return;

    waitlistMessage.hidden = false;
    waitlistMessage.textContent = text;
    waitlistMessage.classList.toggle("is-error", isError);
    waitlistMessage.classList.add("is-visible");
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  if (waitlistForm) {
    waitlistForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const emailInput = waitlistForm.querySelector("#email");
      const email = emailInput ? emailInput.value.trim() : "";

      if (!email) {
        showMessage("Please enter your email address.", true);
        emailInput?.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.", true);
        emailInput?.focus();
        return;
      }

      // Frontend capture only — wire to your backend / ESP when ready.
      showMessage("You're on the list. We'll be in touch before launch.");
      waitlistForm.reset();
    });
  }
})();
