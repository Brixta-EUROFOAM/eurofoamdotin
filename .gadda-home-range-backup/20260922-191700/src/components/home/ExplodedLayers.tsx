"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const layers = [
  {
    number: "01",
    name: "AirKnit Cover",
    description: "Soft-touch breathable top fabric.",
    asset: "/layers/euro-align/layer-1.png",
  },
  {
    number: "02",
    name: "Relief Foam",
    description: "Contours without a deep sink.",
    asset: "/layers/euro-align/layer-2.png",
  },
  {
    number: "03",
    name: "Support Grid Foam",
    description: "Zoned response through the torso and hips.",
    asset: "/layers/euro-align/layer-3.png",
  },
  {
    number: "04",
    name: "Stability Core",
    description: "Dense base foam for edge-to-edge support.",
    asset: "/layers/euro-align/layer-4.png",
  },
];

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}

function easeOutCubic(n: number) {
  return 1 - Math.pow(1 - n, 3);
}

export default function ExplodedLayers() {
  const sectionRef = useRef<HTMLElement>(null);
  const manualUntil = useRef(0);

  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  const focusLayer = useCallback((index: number) => {
    manualUntil.current = Date.now() + 1800;
    setActive(index);
  }, []);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const travel = Math.max(1, rect.height - vh);

      const raw = clamp(
        -rect.top / travel
      );

      const eased = easeOutCubic(raw);

      setProgress(eased);

      if (Date.now() > manualUntil.current) {
        const index = Math.min(
          layers.length - 1,
          Math.floor(
            clamp(raw * 1.04) *
              layers.length
          )
        );

        setActive(index);
      }
    };

    const request = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener(
      "scroll",
      request,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      request
    );

    return () => {
      window.removeEventListener(
        "scroll",
        request
      );

      window.removeEventListener(
        "resize",
        request
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  /*
    Start almost assembled.
    Spread dramatically as the user moves through
    the pinned orange section.
  */

  const spread =
    10 + progress * 116;

  return (
    <section
      ref={sectionRef}
      id="inside"
      className="gadda-explode"
    >

      <div className="gadda-explode-sticky">

        {/* =========================================
            LEFT — EDITORIAL STORY
        ========================================== */}

        <div className="gadda-explode-copy">

          <p className="gadda-explode-label">
            03 / WHAT&apos;S INSIDE
          </p>

          <h2>
            NO
            <br />
            BLACK
            <br />
            BOX.
          </h2>

          <p className="gadda-explode-intro">
            Mattress layers should not be
            mystery ingredients.
            <br /><br />
            Here&apos;s the whole thing.
          </p>

          <div className="gadda-explode-scroll">
            <span>
              SCROLL TO PULL IT APART
            </span>

            <div>
              <i
                style={{
                  transform:
                    `scaleX(${progress})`,
                }}
              />
            </div>
          </div>

        </div>


        {/* =========================================
            CENTRE — EXPLODING MATTRESS
        ========================================== */}

        <div className="gadda-explode-stage">

          <div className="gadda-explode-stage-top">

            <span>
              MATTRESS / 01
            </span>

            <span>
              EXPLODED VIEW
            </span>

          </div>


          <div className="gadda-layer-stack">

            <div className="gadda-layer-axis" />

            {layers.map(
              (layer, index) => {

                /*
                  Layer zero is topmost.

                  Bottom layers move less.
                  Upper layers travel further upward.
                */

                const reverseIndex =
                  layers.length -
                  index -
                  1;

                const y =
                  -reverseIndex *
                  spread;

                const isActive =
                  index === active;

                const x =
                  isActive
                    ? 20
                    : 0;

                const scale =
                  isActive
                    ? 1.045
                    : 1;

                return (
                  <button
                    key={layer.number}
                    type="button"
                    className={
                      "gadda-layer " +
                      (
                        isActive
                          ? "is-active"
                          : ""
                      )
                    }
                    style={{
                      zIndex:
                        20 - index,

                      transform:
                        `translateX(calc(-50% + ${x}px)) ` +
                        `translateY(${y}px) ` +
                        `scale(${scale})`,
                    }}
                    onClick={() =>
                      focusLayer(index)
                    }
                  >

                    <img
                      src={layer.asset}
                      alt={layer.name}
                      draggable={false}
                    />

                    <span className="gadda-layer-dot" />

                  </button>
                );
              }
            )}

          </div>


          <div className="gadda-layer-caption">
            <span>
              CLICK A LAYER
            </span>

            <strong>
              {layers[active].number}
            </strong>
          </div>

        </div>


        {/* =========================================
            RIGHT — ACTIVE LAYER INFORMATION
        ========================================== */}

        <div className="gadda-explode-info">

          <div className="gadda-explode-number">
            {layers[active].number}
          </div>


          <div
            key={active}
            className="gadda-explode-active"
          >

            <p>
              MATERIAL LAYER
            </p>

            <h3>
              {layers[active].name}
            </h3>

            <div className="gadda-explode-callout">

              <span />

              <p>
                {layers[active].description}
              </p>

            </div>

          </div>


          <div className="gadda-layer-picker">

            {layers.map(
              (layer, index) => (
                <button
                  key={layer.number}
                  type="button"
                  onClick={() =>
                    focusLayer(index)
                  }
                  className={
                    index === active
                      ? "is-active"
                      : ""
                  }
                >

                  <span>
                    {layer.number}
                  </span>

                  <strong>
                    {layer.name}
                  </strong>

                </button>
              )
            )}

          </div>

        </div>

      </div>

    </section>
  );
}
