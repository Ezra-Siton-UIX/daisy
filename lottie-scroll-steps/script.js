/**
 * Lottie Scroll Steps (desktop only)
 * Pinned section: scroll scrubs ONE gsap timeline that drives the Lottie
 * frame, the step texts and the nav. No snap.
 *
 * Sync comes from Lottie markers (After Effects composition markers):
 *   "1 Out", "2 In", "2 Out", "3 In", ... "N In"
 * → step i holds between its In/Out frames, the texts swap halfway
 *   through each Out → In transition. No markers → equal split.
 *
 * Requires: gsap, ScrollTrigger, ScrollToPlugin, lottie-web
 *
 * Markup hooks:
 *   [data-ls]          root (gets pinned)
 *   [data-ls-text]     one per step, stacked on top of each other
 *   [data-ls-step]     nav buttons (same order/count as texts), optional
 *   [data-ls-lottie]   Lottie container, JSON url in data-src
 * CSS gets --ls-progress (0 → 1, dot to dot) on the root.
 */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const BREAKPOINT = "(min-width: 992px)"; // keep in sync with CSS

const DEFAULTS = {
  scrollPerStep: 1, // viewport heights of scrolling per step
  fade: 0.3,        // text fade duration (seconds of Lottie time)
  y: 10,            // px the text moves while fading
  scrub: 0.3,
};

/**
 * Returns [startFrame, endFrame] of the "hold" range for each step,
 * relative to the Lottie's first frame.
 */
function getHoldRanges(data, steps) {
  const first = data.ip;
  const last = data.op - data.ip - 1;
  const markers = (data.markers || []).map((m) => m.tm - first).sort((a, b) => a - b);

  if (markers.length === 2 * (steps - 1)) {
    // [0, "1 Out"], ["2 In", "2 Out"], ..., ["N In", last]
    const edges = [0, ...markers, last];
    return Array.from({ length: steps }, (_, i) => [edges[2 * i], edges[2 * i + 1]]);
  }

  // Fallback: holds and transitions all get the same length
  const k = last / (2 * steps - 1);
  return Array.from({ length: steps }, (_, i) => [2 * i * k, (2 * i + 1) * k]);
}

function initLottieSteps(root, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const texts = gsap.utils.toArray("[data-ls-text]", root);
  const steps = gsap.utils.toArray("[data-ls-step]", root);
  const lottieEl = root.querySelector("[data-ls-lottie]");
  const lastIndex = texts.length - 1;

  if (lastIndex < 1) return;

  const mm = gsap.matchMedia();

  mm.add(BREAKPOINT, (ctx) => {
    const anim = lottie.loadAnimation({
      container: lottieEl,
      path: lottieEl.dataset.src,
      renderer: "svg",
      loop: false,
      autoplay: false,
    });

    // Everything the timeline animates that isn't a DOM element
    const state = { frame: 0, nav: 0 };

    const render = () => {
      root.style.setProperty("--ls-progress", state.nav);
      if (anim.isLoaded) anim.goToAndStop(state.frame, true);

      const current = Math.round(state.nav * lastIndex);
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i <= current);
        step.classList.toggle("is-current", i === current);
      });
    };

    gsap.set(texts.slice(1), { autoAlpha: 0, y: o.y });

    // Pin is created right away (its length doesn't depend on the Lottie),
    // the timeline gets filled once the JSON is loaded.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: render,
      scrollTrigger: {
        trigger: root,
        pin: true,
        start: "top top",
        end: () => "+=" + window.innerHeight * o.scrollPerStep * texts.length,
        scrub: o.scrub,
        invalidateOnRefresh: true,
      },
    });

    const build = () => {
      const fps = anim.frameRate;
      const holds = getHoldRanges(anim.animationData, texts.length);

      holds.forEach(([from, to], i) => {
        if (i > 0) {
          // Transition: previous Out → this In
          const start = tl.duration();
          const d = (from - holds[i - 1][1]) / fps;
          const mid = start + d / 2;
          const fade = Math.min(o.fade, d / 2);

          tl.to(state, { frame: from, nav: i / lastIndex, duration: d }, start)
            .to(texts[i - 1], { autoAlpha: 0, y: -o.y, duration: fade, ease: "power1.in" }, mid - fade)
            .to(texts[i], { autoAlpha: 1, y: 0, duration: fade, ease: "power1.out" }, mid);
        }

        // Hold: this step's own frames
        tl.addLabel(`step-${i}`);
        tl.to(state, { frame: to, duration: Math.max((to - from) / fps, 0.001) });
      });

      tl.progress(tl.scrollTrigger.progress);
      render();
    };

    const onLoaded = () => ctx.add(build); // ctx.add → reverted on cleanup
    anim.addEventListener("DOMLoaded", onLoaded);

    // Nav click → smooth scroll to the start of that step
    const handlers = steps.map((step, i) => {
      const onClick = () => {
        if (!tl.labels[`step-${i}`] && i > 0) return; // Lottie not loaded yet
        gsap.to(window, {
          scrollTo: i === 0 ? tl.scrollTrigger.start : tl.scrollTrigger.labelToScroll(`step-${i}`),
          duration: 1.2,
          ease: "power3.out",
          overwrite: "auto",
        });
      };
      step.addEventListener("click", onClick);
      return onClick;
    });

    // Runs when leaving the breakpoint; gsap reverts tweens/pin itself
    return () => {
      steps.forEach((step, i) => {
        step.removeEventListener("click", handlers[i]);
        step.classList.remove("is-active", "is-current");
      });
      anim.removeEventListener("DOMLoaded", onLoaded);
      anim.destroy();
      root.style.removeProperty("--ls-progress");
    };
  });

  return mm;
}

document.querySelectorAll("[data-ls]").forEach((el) => initLottieSteps(el));
