(function () {
  "use strict";

  const doc = document;
  const body = doc.body;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const query = new URLSearchParams(window.location.search);
  const skipIntro = query.has("skipIntro");
  const qaSection = query.get("qaSection");
  let hasGsap = typeof window.gsap !== "undefined";
  let hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

  const animationScripts = {
    gsap: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
    scrollTrigger:
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  };
  const frontendGalleryFolders = [
    {
      category: "bride",
      folder: "bride",
      label: "Bride",
      files: [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
        "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg",
        "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg",
        "20.jpg", "21.jpg", "22.jpg", "23.jpg", "24.jpg", "25.jpg",
        "26.jpg", "27.jpg", "28.jpg", "29.webp", "30.webp",
      ],
    },
    {
      category: "couple",
      folder: "couple",
      label: "Couple",
      files: [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
        "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg",
        "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg", "19.jpg",
        "20.jpg",
      ],
    },
    {
      category: "formal",
      folder: "formal_couple",
      label: "Formal",
      files: [
        "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
        "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.webp", "13.webp",
        "14.webp", "15.webp",
      ],
    },
  ];

  const frontendGalleryRatioOverrides = {
    "bride/12.jpg": 1.779,
    "bride/13.jpg": 1.779,
    "bride/15.jpg": 1.5,
  };

  function qs(selector, scope) {
    return (scope || doc).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || doc).querySelectorAll(selector));
  }

  function setReadyFallback() {
    qs(".loader")?.remove();
    qs(".site-header")?.classList.add("is-visible");
    qsa(".line-mask > span").forEach((line) => {
      line.style.transform = "none";
    });
  }

  function loadExternalScript(src, timeoutMs) {
    return new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      const timeout = window.setTimeout(() => {
        script.remove();
        reject(new Error(`Timed out loading ${src}`));
      }, timeoutMs);

      script.src = src;
      script.async = false;
      script.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error(`Could not load ${src}`));
      };

      doc.head.appendChild(script);
    });
  }

  async function ensureGsapLibrary() {
    if (reduceMotion) {
      return false;
    }

    try {
      if (typeof window.gsap === "undefined") {
        await loadExternalScript(animationScripts.gsap, 2600);
      }

      hasGsap = typeof window.gsap !== "undefined";
      return hasGsap;
    } catch (error) {
      hasGsap = typeof window.gsap !== "undefined";
      return false;
    }
  }

  async function ensureScrollTriggerPlugin() {
    if (reduceMotion || !hasGsap) {
      return false;
    }

    try {
      if (typeof window.ScrollTrigger === "undefined") {
        await loadExternalScript(animationScripts.scrollTrigger, 2600);
      }

      hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

      if (hasGsap && hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      return hasScrollTrigger;
    } catch (error) {
      hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
      return false;
    }
  }

  function initNavigation() {
    const header = qs(".site-header");
    const hero = qs(".hero");
    const toggle = qs(".nav-toggle");
    const navLinks = qsa(".primary-nav a, .site-footer a[href^='#']");

    const updateHeader = () => {
      const heroExit = hero
        ? hero.offsetTop + hero.offsetHeight - 80
        : window.innerHeight - 80;
      const hasLeftHero = window.scrollY >= heroExit;

      header?.classList.toggle("is-floating", hasLeftHero);
      header?.classList.toggle("is-scrolled", hasLeftHero);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    toggle?.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      body.classList.toggle("nav-open", !isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggle?.setAttribute("aria-expanded", "false");
        body.classList.remove("nav-open");
      });
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggle?.setAttribute("aria-expanded", "false");
        body.classList.remove("nav-open");
      }
    });
  }

  function initLoaderAndHero() {
    if (skipIntro) {
      setReadyFallback();
      return;
    }

    if (!hasGsap || reduceMotion) {
      setReadyFallback();
      return;
    }

    gsap.set(".loader__brand, .loader__place", { autoAlpha: 0, y: 12 });
    gsap.set(".hero__label, .hero__text, .hero__actions, .scroll-cue", {
      autoAlpha: 0,
      y: 22,
    });
    gsap.set(".line-mask > span", { yPercent: 110 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        qs(".loader")?.remove();
        qs(".site-header")?.classList.add("is-visible");
      },
    });

    tl.to(".loader__brand", { autoAlpha: 1, y: 0, duration: 0.55 })
      .to(".loader__line", { scaleX: 1, duration: 0.75 }, "-=0.18")
      .to(".loader__place", { autoAlpha: 1, y: 0, duration: 0.48 }, "-=0.42")
      .to(
        ".loader",
        { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
        "+=0.28",
      )
      .to(".hero__label", { autoAlpha: 1, y: 0, duration: 0.62 }, "-=0.45")
      .to(
        ".line-mask > span",
        { yPercent: 0, duration: 0.95, stagger: 0.1 },
        "-=0.35",
      )
      .to(".hero__text", { autoAlpha: 1, y: 0, duration: 0.72 }, "-=0.48")
      .to(".hero__actions", { autoAlpha: 1, y: 0, duration: 0.68 }, "-=0.48")
      .to(".scroll-cue", { autoAlpha: 1, y: 0, duration: 0.68 }, "-=0.38");

    gsap.to(".hero__media img", {
      scale: 1.13,
      duration: 16,
      ease: "none",
    });
  }

  function revealLines() {
    if (!hasGsap || !hasScrollTrigger || reduceMotion) {
      return;
    }

    qsa(".reveal-lines").forEach((heading) => {
      const lines = qsa("span", heading);
      gsap.set(lines, { yPercent: 110, autoAlpha: 0 });
      gsap.to(lines, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 78%",
        },
      });
    });
  }

  function initScrollAnimations() {
    if (!hasGsap || !hasScrollTrigger || reduceMotion) {
      return;
    }

    gsap.utils.toArray(".section-line").forEach((line) => {
      gsap.from(line, {
        scaleX: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: line,
          start: "top 86%",
        },
      });
    });

    gsap.utils.toArray(".reveal-copy").forEach((copy) => {
      gsap.from(copy, {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: copy,
          start: "top 82%",
        },
      });
    });

    gsap.utils.toArray(".parallax-image img").forEach((image) => {
      gsap.fromTo(
        image,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: image.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    gsap.from(".story-card", {
      autoAlpha: 0,
      y: 80,
      duration: 1,
      stagger: 0.14,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".story-grid",
        start: "top 78%",
      },
    });

    gsap.utils.toArray(".image-parallax img").forEach((image) => {
      gsap.fromTo(
        image,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: image.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    gsap.utils.toArray(".reveal-mask").forEach((item) => {
      const image = qs("img", item);
      gsap.set(item, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(image, { scale: 1.12 });
      gsap.to(item, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
        },
      });
      gsap.to(image, {
        scale: 1,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
        },
      });
    });

    gsap.from(".bride-feature__copy > p, .bride-feature dl div", {
      autoAlpha: 0,
      y: 36,
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".bride-feature",
        start: "top 84%",
      },
    });

    gsap.utils.toArray(".experience-step").forEach((step) => {
      gsap.from(step, {
        autoAlpha: 0,
        y: 42,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: step,
          start: "top 82%",
        },
      });
    });

    gsap.from(".service-card", {
      autoAlpha: 0,
      y: 60,
      duration: 0.95,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".service-grid",
        start: "top 78%",
      },
    });

    gsap.to(".quote__texture", {
      yPercent: -12,
      rotation: 4,
      ease: "none",
      scrollTrigger: {
        trigger: ".quote",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.from(".testimonial-card", {
      autoAlpha: 0,
      y: 45,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".testimonial-row",
        start: "top 80%",
      },
    });

    gsap.from(".booking__content > *", {
      autoAlpha: 0,
      y: 36,
      duration: 0.9,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".booking",
        start: "top 72%",
      },
    });
  }

  function initHorizontalMovement() {
    const section = qs(".couple-movement");
    const pin = qs("[data-movement-pin]");
    const track = qs("[data-movement-track]");

    if (
      !section ||
      !pin ||
      !track ||
      !hasGsap ||
      !hasScrollTrigger ||
      reduceMotion
    ) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
      let tween;

      const getDistance = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        const padValue = getComputedStyle(doc.documentElement)
          .getPropertyValue("--pad")
          .trim();

        const pad = parseFloat(padValue) || 0;

        return Math.max(0, trackWidth - viewportWidth + pad * 2);
      };

      gsap.set(track, { x: 0 });

      tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const refreshAfterImages = () => {
        ScrollTrigger.refresh();
      };

      const images = track.querySelectorAll("img");
      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", refreshAfterImages, { once: true });
          img.addEventListener("error", refreshAfterImages, { once: true });
        }
      });

      window.addEventListener("load", refreshAfterImages);

      return () => {
        window.removeEventListener("load", refreshAfterImages);
        images.forEach((img) => {
          img.removeEventListener("load", refreshAfterImages);
          img.removeEventListener("error", refreshAfterImages);
        });

        if (tween) tween.kill();
      };
    });
  }

  function getFrontendGalleryItems() {
    return frontendGalleryFolders.flatMap((group) =>
      group.files.map((filename) => {
        const key = `${group.folder}/${filename}`;
        const number = filename.split(".")[0];

        return {
          id: `${group.folder}-${number}`,
          title: `${group.label} wedding portrait ${number}`,
          category: group.category,
          label: group.label,
          src: `assets/images/${key}`,
          alt: `${group.label} wedding photograph ${number}`,
          ratio: frontendGalleryRatioOverrides[key] || 0.8,
        };
      }),
    );
  }

  function initFrontendGallery() {
    const galleryGrid = document.querySelector("[data-gallery-grid]");
    const filterButtons = document.querySelectorAll("[data-filter]");

    if (!galleryGrid) return;

    const galleryItems = getFrontendGalleryItems();

    function getPrettyLayout(item, index, filter = "all") {
      const ratio = Number(item.ratio) || 0.8;

      // First respect actual image shape
      if (ratio > 1.35) return "is-wide";
      if (ratio < 0.62) return "is-tall";

      // In filtered category pages, keep it cleaner
      if (filter !== "all") {
        const filteredPattern = [
          "is-portrait",
          "is-portrait",
          "is-feature",
          "is-portrait",
          "is-tall",
          "is-portrait",
          "is-wide",
          "is-portrait",
          "is-portrait",
        ];

        return filteredPattern[index % filteredPattern.length];
      }

      // In All mode, add more variation
      const allPattern = [
        "is-feature",
        "is-portrait",
        "is-tall",
        "is-portrait",
        "is-wide",
        "is-portrait",
        "is-portrait",
        "is-feature",
        "is-tall",
        "is-portrait",
        "is-wide",
        "is-portrait",
        "is-portrait",
        "is-tall",
        "is-portrait",
      ];

      return allPattern[index % allPattern.length];
    }

    function createGalleryItem(item, index, filter = "all") {
      const button = document.createElement("button");
      const layout = getPrettyLayout(item, index, filter);

      button.className = `gallery-item ${layout}`;
      button.type = "button";
      button.dataset.category = item.category;
      button.dataset.src = item.src;
      button.dataset.alt = item.alt;
      button.dataset.cursorLabel = "View";
      button.dataset.label = item.label || item.category;

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || item.title || "Wedding photograph";
      img.loading = "lazy";
      img.decoding = "async";

      button.appendChild(img);

      return button;
    }

    function shuffleArray(array) {
      const copy = [...array];

      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }

      return copy;
    }

    function renderGallery(filter = "all") {
      galleryGrid.innerHTML = "";

      let filteredItems =
        filter === "all"
          ? galleryItems
          : galleryItems.filter((item) => item.category === filter);

      // Scramble only in All mode
      if (filter === "all") {
        filteredItems = shuffleArray(filteredItems);
      }

      filteredItems.forEach((item, index) => {
        galleryGrid.appendChild(createGalleryItem(item, index, filter));
      });

      if (window.gsap) {
        gsap.fromTo(
          galleryGrid.querySelectorAll(".gallery-item"),
          {
            opacity: 0,
            y: 28,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.025,
            ease: "power3.out",
          },
        );
      }

      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }

      if (typeof initLightbox === "function") {
        initLightbox();
      }
    }

    renderGallery("all");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((btn) => {
          btn.classList.remove("is-active");
          btn.setAttribute("aria-selected", "false");
        });

        button.classList.add("is-active");
        button.setAttribute("aria-selected", "true");

        renderGallery(filter);
      });
    });
  }

  function wrapQuoteWords() {
    const quote = qs(".quote-text");
    if (!quote) {
      return;
    }

    const words = quote.textContent.trim().split(/\s+/);
    quote.innerHTML = words
      .map((word) => `<span class="quote-word"><span>${word}</span></span>`)
      .join(" ");

    if (!hasGsap || !hasScrollTrigger || reduceMotion) {
      return;
    }

    gsap.from(".quote-word span", {
      yPercent: 105,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.045,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".quote",
        start: "top 62%",
      },
    });
  }

  function initBackToTop() {
    const button = qs(".back-to-top");

    if (!button) {
      return;
    }

    const updateButton = () => {
      button.classList.toggle(
        "is-visible",
        window.scrollY > window.innerHeight * 0.9,
      );
    };

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    updateButton();
    window.addEventListener("scroll", updateButton, { passive: true });
  }

  function initLightbox() {
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.querySelector(".lightbox");
    const lightboxImage = document.querySelector(".lightbox__figure img");
    const lightboxClose = document.querySelector(".lightbox__close");
    const lightboxPrev = document.querySelector(".lightbox__nav--prev");
    const lightboxNext = document.querySelector(".lightbox__nav--next");

    if (!galleryItems.length || !lightbox || !lightboxImage) {
      return;
    }

    let currentIndex = 0;
    let activeItems = Array.from(galleryItems);

    function openLightbox(index) {
      currentIndex = index;

      const item = activeItems[currentIndex];
      const src = item.dataset.src;
      const alt = item.dataset.alt || "Wedding photograph";

      lightboxImage.src = src;
      lightboxImage.alt = alt;

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");

      setTimeout(() => {
        lightboxImage.removeAttribute("src");
      }, 300);
    }

    function showPrev() {
      currentIndex =
        currentIndex === 0 ? activeItems.length - 1 : currentIndex - 1;

      openLightbox(currentIndex);
    }

    function showNext() {
      currentIndex =
        currentIndex === activeItems.length - 1 ? 0 : currentIndex + 1;

      openLightbox(currentIndex);
    }

    galleryItems.forEach((item, index) => {
      item.onclick = () => {
        activeItems = Array.from(
          document.querySelectorAll(".gallery-item:not(.is-hidden)"),
        );

        const visibleIndex = activeItems.indexOf(item);
        openLightbox(visibleIndex >= 0 ? visibleIndex : index);
      };
    });

    if (lightboxClose) {
      lightboxClose.onclick = closeLightbox;
    }

    if (lightboxPrev) {
      lightboxPrev.onclick = showPrev;
    }

    if (lightboxNext) {
      lightboxNext.onclick = showNext;
    }

    lightbox.onclick = (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    };

    document.onkeydown = (event) => {
      if (!lightbox.classList.contains("is-open")) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
  }

  function initCursor() {
    if (!finePointer || reduceMotion) {
      qsa(".cursor").forEach((cursor) => cursor.remove());
      return;
    }

    const dot = qs(".cursor-dot");
    const ring = qs(".cursor-ring");
    const label = qs(".cursor-ring span");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      },
      { passive: true },
    );

    qsa("a, button, [data-cursor-label]").forEach((target) => {
      target.addEventListener("pointerenter", () => {
        const text = target.dataset.cursorLabel || "";
        ring.classList.add("is-active");
        label.textContent = text;
        label.style.opacity = text ? "1" : "0";
      });

      target.addEventListener("pointerleave", () => {
        ring.classList.remove("is-active");
        label.textContent = "";
        label.style.opacity = "";
      });
    });

    render();
  }

  function initMagneticButtons() {
    if (!finePointer || reduceMotion || !hasGsap) {
      return;
    }

    qsa(".magnetic").forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
          x: x * 0.18,
          y: y * 0.28,
          duration: 0.45,
          ease: "power3.out",
        });
      });

      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "elastic.out(1, 0.35)",
        });
      });
    });
  }

  function initImageLoadRefresh() {
    if (!hasScrollTrigger) {
      return;
    }

    qsa("img").forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", () => ScrollTrigger.refresh(), {
          once: true,
        });
      }
    });
  }

  doc.addEventListener("DOMContentLoaded", async () => {
    initNavigation();
    initFrontendGallery();
    initBackToTop();
    initCursor();

    if (qaSection) {
      setReadyFallback();
      window.setTimeout(() => {
        doc.getElementById(qaSection)?.scrollIntoView({ block: "start" });
      }, 60);
      return;
    }

    if (!skipIntro) {
      await ensureGsapLibrary();
    }

    initLoaderAndHero();

    if (skipIntro) {
      await ensureGsapLibrary();
    }

    await ensureScrollTriggerPlugin();
    revealLines();
    wrapQuoteWords();
    initScrollAnimations();
    initHorizontalMovement();
    initMagneticButtons();
    initImageLoadRefresh();
  });
})();
