(() => {
  "use strict";

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const initFooterYear = () => {
    const yearEl = document.querySelector("[data-year]");
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  };

  /* ---------- Sticky header state ---------- */
  const initHeader = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  };

  /* ---------- Mobile navigation ---------- */
  const initMobileNav = () => {
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__menu");
    if (!toggle || !menu) return;

    const menuLinks = menu.querySelectorAll("a");

    const setMenuOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };

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
  };

  /* ---------- Founding Member CTA → reveal email ---------- */
  const initFocusEmail = () => {
    const focusEmailBtn = document.querySelector("[data-focus-email]");
    const waitlistForm = document.querySelector(".waitlist");
    const emailInput = document.querySelector("#email");
    if (!focusEmailBtn || !emailInput || !waitlistForm) return;

    const revealWaitlist = () => {
      waitlistForm.hidden = false;
      waitlistForm.classList.add("is-visible");
      emailInput.focus({ preventScroll: false });
      emailInput.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    };

    focusEmailBtn.addEventListener("click", revealWaitlist);

    const maybeRevealFromHash = () => {
      if (window.location.hash === "#founding") revealWaitlist();
    };

    maybeRevealFromHash();
    window.addEventListener("hashchange", maybeRevealFromHash);

    document.querySelectorAll('a[href="#founding"]').forEach((link) => {
      link.addEventListener("click", () => {
        // Allow scroll to settle, then reveal.
        window.setTimeout(revealWaitlist, prefersReducedMotion() ? 0 : 280);
      });
    });
  };

  /* ---------- Waitlist form ---------- */
  const initWaitlist = () => {
    const waitlistForm = document.querySelector(".waitlist");
    const waitlistMessage = document.querySelector(".waitlist__message");
    if (!waitlistForm) return;

    const showMessage = (text, isError = false) => {
      if (!waitlistMessage) return;

      waitlistMessage.hidden = false;
      waitlistMessage.textContent = text;
      waitlistMessage.classList.toggle("is-error", isError);
      waitlistMessage.classList.add("is-visible");
    };

    const isValidEmail = (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

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
  };

  /* ---------- Story section reveal ---------- */
  const initRevealSections = () => {
    const sections = document.querySelectorAll("[data-reveal]");
    if (!sections.length) return;

    if (prefersReducedMotion()) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  initFooterYear();
  initHeader();
  initMobileNav();
  initFocusEmail();
  initWaitlist();
  initRevealSections();
})();
