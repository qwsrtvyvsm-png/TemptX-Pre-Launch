(() => {
  "use strict";

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trackEvent = (eventName, properties = {}) => {
    const detail = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);

    window.dispatchEvent(new CustomEvent("temptx:track", { detail }));
  };

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
      header.classList.toggle("is-scrolled", window.scrollY > 24);
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

  /* ---------- Smooth anchor scrolling ---------- */
  const initSmoothScroll = () => {
    if (prefersReducedMotion()) return;

    const getHeaderOffset = () => {
      const header = document.querySelector(".site-header");
      return header ? header.getBoundingClientRect().height : 0;
    };

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();

        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          getHeaderOffset() +
          1;

        document.documentElement.classList.add("is-scrolling");
        window.scrollTo({ top, behavior: "smooth" });

        window.setTimeout(() => {
          document.documentElement.classList.remove("is-scrolling");
          history.pushState(null, "", href);
        }, 900);
      });
    });
  };

  /* ---------- Founding Member CTA → reveal email ---------- */
  const initFocusEmail = () => {
    const closing = document.querySelector("#founding");
    const waitlistForm = closing?.querySelector(".waitlist");
    const emailInput = waitlistForm?.querySelector('input[type="email"]');
    const focusEmailBtns = document.querySelectorAll("[data-focus-email]");
    if (!closing || !waitlistForm || !emailInput) return;

    const revealWaitlist = () => {
      waitlistForm.hidden = false;
      waitlistForm.classList.add("is-visible");
      emailInput.focus({ preventScroll: false });
      emailInput.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    };

    focusEmailBtns.forEach((btn) => {
      btn.addEventListener("click", revealWaitlist);
    });

    const maybeRevealFromHash = () => {
      if (window.location.hash === "#founding") {
        window.setTimeout(revealWaitlist, prefersReducedMotion() ? 0 : 480);
      }
    };

    maybeRevealFromHash();
    window.addEventListener("hashchange", maybeRevealFromHash);

    document.querySelectorAll('a[href="#founding"]').forEach((link) => {
      link.addEventListener("click", () => {
        window.setTimeout(revealWaitlist, prefersReducedMotion() ? 0 : 700);
      });
    });
  };

  const isConfiguredEndpoint = (value) =>
    /^https?:\/\//i.test(value) && !value.includes("YOUR_MAILING_LIST_ENDPOINT");

  const submitToMailingList = async (waitlistForm, payload) => {
    const endpoint = (waitlistForm.dataset.mailingListEndpoint || "").trim();

    if (!isConfiguredEndpoint(endpoint)) {
      throw new Error("Mailing list is not configured yet. Add your provider endpoint to enable signups.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const message = result?.message || "Subscription failed. Please try again shortly.";
      throw new Error(message);
    }

    return result;
  };

  /* ---------- Waitlist form ---------- */
  const initWaitlist = () => {
    const waitlistForms = document.querySelectorAll(".waitlist");
    if (!waitlistForms.length) return;

    const isValidEmail = (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

    waitlistForms.forEach((waitlistForm) => {
      const container =
        waitlistForm.closest(".closing__actions, .hero__actions") ||
        waitlistForm.parentElement;
      const waitlistMessage = container?.querySelector(".waitlist__message");
      const submitBtn = waitlistForm.querySelector('button[type="submit"]');

      const showMessage = (text, isError = false) => {
        if (!waitlistMessage) return;

        waitlistMessage.hidden = false;
        waitlistMessage.textContent = text;
        waitlistMessage.classList.toggle("is-error", isError);
        waitlistMessage.classList.add("is-visible");
      };

      waitlistForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = waitlistForm.querySelector('input[type="email"]');
        const visitorTypeInput = waitlistForm.querySelector('select[name="visitorType"]');
        const interestInput = waitlistForm.querySelector('select[name="interestTag"]');
        const consentInput = waitlistForm.querySelector('input[name="consent"]');

        const email = emailInput ? emailInput.value.trim() : "";
        const visitorType = visitorTypeInput ? visitorTypeInput.value.trim() : "";
        const interestTag = interestInput ? interestInput.value.trim() : "";
        const hasConsent = Boolean(consentInput?.checked);

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

        if (!visitorType) {
          showMessage("Please choose who you are.", true);
          visitorTypeInput?.focus();
          return;
        }

        if (!interestTag) {
          showMessage("Please select what you want previews about.", true);
          interestInput?.focus();
          return;
        }

        if (!hasConsent) {
          showMessage("Please confirm email consent to join the mailing list.", true);
          consentInput?.focus();
          return;
        }

        const payload = {
          email,
          tags: [`visitor:${visitorType}`, `interest:${interestTag}`],
          source: waitlistForm.dataset.source || "prelaunch-site",
          provider: waitlistForm.dataset.mailingListProvider || "custom",
          doubleOptIn: waitlistForm.dataset.doubleOptIn === "true",
          consent: {
            granted: true,
            statement:
              "I agree to receive TemptX product updates and launch invites by email.",
            timestamp: new Date().toISOString(),
          },
          context: {
            page: window.location.href,
            referrer: document.referrer || "direct",
          },
        };

        submitBtn?.setAttribute("disabled", "disabled");

        try {
          await submitToMailingList(waitlistForm, payload);
          showMessage(
            "You're in. Check your inbox to confirm your double opt-in, then watch for early access updates and launch invites."
          );
          waitlistForm.reset();
          trackEvent("mailing_list_signup_success", {
            visitorType,
            interestTag,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Could not join right now. Please try again.";
          showMessage(message, true);
          trackEvent("mailing_list_signup_error", {
            reason: message,
          });
        } finally {
          submitBtn?.removeAttribute("disabled");
        }
      });
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
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const initClickTracking = () => {
    document.querySelectorAll("[data-track-click]").forEach((el) => {
      el.addEventListener("click", () => {
        trackEvent("cta_click", {
          target: el.getAttribute("data-track-click"),
        });
      });
    });
  };

  const initSectionTracking = () => {
    const sections = document.querySelectorAll("[data-track-section]");
    if (!sections.length) return;

    const seen = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("data-track-section");
          if (!id || seen.has(id)) return;
          seen.add(id);
          trackEvent("section_view", { section: id });
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /* ---------- Subtle parallax ---------- */
  const initParallax = () => {
    const layers = document.querySelectorAll("[data-parallax]");
    if (!layers.length || prefersReducedMotion()) return;

    let ticking = false;
    let active = false;

    const update = () => {
      if (!active) {
        ticking = false;
        return;
      }

      const viewportH = window.innerHeight;

      layers.forEach((layer) => {
        const speed = Number(layer.getAttribute("data-parallax")) || 0.08;
        const rect = layer.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - viewportH / 2;
        const translate = centerOffset * speed * -1;
        layer.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    // Let entrance animations settle before driving transforms.
    window.setTimeout(() => {
      active = true;
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }, 1200);
  };

  /* ---------- Hero ready state ---------- */
  const initHeroReady = () => {
    if (prefersReducedMotion()) {
      document.body.classList.add("is-ready");
      return;
    }

    window.requestAnimationFrame(() => {
      document.body.classList.add("is-ready");
    });
  };

  initFooterYear();
  initHeader();
  initMobileNav();
  initSmoothScroll();
  initFocusEmail();
  initWaitlist();
  initRevealSections();
  initClickTracking();
  initSectionTracking();
  initParallax();
  initHeroReady();
})();
