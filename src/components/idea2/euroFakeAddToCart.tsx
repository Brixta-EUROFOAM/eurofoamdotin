'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Fraunces, Space_Grotesk } from 'next/font/google';

/**
 * Eurofoam idea2 — fake add-to-cart click-through.
 *
 * Drop this file in src/components/idea2/EurofoamCartPrank.tsx and render it
 * from a page (see idea2-page-example.tsx for a minimal usage example).
 *
 * Requires: `npm install gsap`
 * Expects three sad-emoji images at public/idea2/sademoji1.png, sademoji2.png,
 * sademoji3.png (adjust SAD_EMOJIS below if your filenames differ); the real
 * mattress product shot at public/idea2/mattress.png; and the pointing-hand
 * illustration at public/idea2/pointing_hand.png (used to hint at each
 * click-here button — see HAND_PRESETS below if your artwork's resting pose
 * doesn't point "up" and the rotate values need adjusting).
 */

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
});

type ScreenId = 'intro' | 'mattress' | 'checkout' | 'paying' | 'sad' | 'gotcha';
type GuiltStage = null | 'intro' | 'bigCard' | 'confirm2' | 'confirm3';

const SAD_EMOJIS = ['/idea2/sademoji1.png', '/idea2/sademoji2.png', '/idea2/sademoji3.png'];

const INTRO_LINES = [
  'Hi.',
  'This is Eurofoam.',
  'We sell mattresses. And pillows.',
  `You're probably here to buy one of those two things.`,
  'Or maybe you just clicked a link.',
  'Either way..  Namaste & Welcome.',
];

const MATTRESS_LINES: { text: string; emph: boolean }[] = [
  { text: `This is one of ours.`, emph: false },
  {
    text: `Made of memory foam, latex foam, and something we're legally required to call "proprietary comfort layers."`,
    emph: true,
  },
  { text: `It's not soft.`, emph: false },
  { text: `It's not hard.`, emph: false },
  { text: `It's just comfy.`, emph: true },
  { text: `We've spent an unreasonable amount of time thinking about this.`, emph: false },
  { text: `(take our word for it)`, emph: false },
];

const CHECKOUT_LINES = [
  `Looks like you're into it as much as we are!`,
  `Good to know.`,
  `Let's help you checkout now!`,
  `So... Card or UPI?`,
];

function pickRandomPosition(avoid: { top: number; left: number }[]) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const buttonWidth = 170;
  const buttonHeight = 54;
  const sidePad = Math.max(24, Math.min(90, w * 0.07));
  const minDist = 260;

  // Only use side gutters so the button can never land over the text.
  const candidates = [
    { left: sidePad, top: h * 0.30 },
    { left: w - sidePad - buttonWidth, top: h * 0.30 },
    { left: sidePad, top: h * 0.58 },
    { left: w - sidePad - buttonWidth, top: h * 0.58 },
  ].filter(
    (pos) =>
      pos.left >= 16 &&
      pos.left + buttonWidth <= w - 16 &&
      pos.top >= 80 &&
      pos.top + buttonHeight <= h - 60
  );

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const safe = shuffled.find(
    (candidate) =>
      !avoid.some(
        (p) =>
          Math.hypot(
            p.left - candidate.left,
            p.top - candidate.top
          ) < minDist
      )
  );

  return safe ?? shuffled[0] ?? {
    left: 16,
    top: Math.max(80, h * 0.3),
  };
}

type HandPreset = {
  rotate: number;
  tipX: number;
  tipY: number;
};

// Supplied hand artwork is 236 x 286px.
// At 130px rendered width, the index-finger tip is approximately (68, 8).
const HAND_WIDTH = 130;
const HAND_TIP_X = 68;
const HAND_TIP_Y = 8;

const BUTTON_WIDTH = 170;
const BUTTON_HEIGHT = 54;

const HAND_PRESETS: HandPreset[] = [
  { rotate: 180, tipX: BUTTON_WIDTH / 2, tipY: 0 },
  { rotate: 90, tipX: 0, tipY: BUTTON_HEIGHT / 2 },
  { rotate: 270, tipX: BUTTON_WIDTH, tipY: BUTTON_HEIGHT / 2 },
];

function pickHandPresetForPosition(pos: { top: number; left: number }): HandPreset {
  const w = window.innerWidth;

  // Keep the hand outside the central text area too: left-side buttons get
  // a hand entering from the left, right-side buttons get one from the right.
  if (pos.left < w / 2) {
    return HAND_PRESETS[1];
  }

  return HAND_PRESETS[2];
}

type EmojiLayout = { leftVw: number; topVh: number; size: number };

function randomEmojiLayout(): EmojiLayout {
  return {
    leftVw: 8 + Math.random() * 68, // keep off the far edges
    topVh: 5 + Math.random() * 38, // upper portion of the screen, above the message
    size: 70 + Math.random() * 110, // 70–180px, so each feeling is a different size
  };
}

export default function EurofoamCartPrank() {
  const [screen, setScreen] = useState<ScreenId>('intro');

  const [visibleIntroLines, setVisibleIntroLines] = useState(0);
  const [visibleMattressLines, setVisibleMattressLines] = useState(0);

  const [showBtn1, setShowBtn1] = useState(false);
  const [btn1Pos, setBtn1Pos] = useState({ top: 0, left: 0 });
  const [btn1Hand, setBtn1Hand] = useState<HandPreset>(HAND_PRESETS[0]);
  const [showBtn2, setShowBtn2] = useState(false);
  const [btn2Pos, setBtn2Pos] = useState({ top: 0, left: 0 });
  const [btn2Hand, setBtn2Hand] = useState<HandPreset>(HAND_PRESETS[0]);

  const [cartCount, setCartCount] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);

  const [cartFlash, setCartFlash] = useState(false);
  const [visibleCheckoutLines, setVisibleCheckoutLines] = useState(0);
  const [showCheckoutCard, setShowCheckoutCard] = useState(false);
  const [showBail, setShowBail] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<null | 'upi' | 'card'>(null);
  const [guiltStage, setGuiltStage] = useState<GuiltStage>(null);

  const [sadEmojiIndex, setSadEmojiIndex] = useState(0);
  const [sadEmojiVisible, setSadEmojiVisible] = useState(false);
  const [sadEmojiLayout, setSadEmojiLayout] = useState<EmojiLayout[]>(
    SAD_EMOJIS.map(() => ({ leftVw: 50, topVh: 20, size: 120 }))
  );

  const mattressRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLDivElement>(null);
  const cartBadgeRef = useRef<HTMLDivElement>(null);
  const usedButtonPositionsRef = useRef<{ top: number; left: number }[]>([]);

  // ---------- intro sequence ----------
  useEffect(() => {
    if (screen !== 'intro') return;
    const tl = gsap.timeline();
    INTRO_LINES.forEach((_, i) => {
      tl.call(() => setVisibleIntroLines(i + 1), undefined, i === 0 ? 0.6 : '+=1.9');
    });
    tl.call(
      () => {
        const pos = pickRandomPosition(usedButtonPositionsRef.current);
        usedButtonPositionsRef.current.push(pos);
        setBtn1Pos(pos);
        setBtn1Hand(pickHandPresetForPosition(pos));
        setShowBtn1(true);
      },
      undefined,
      '+=1.8'
    );
    return () => {
      tl.kill();
    };
  }, [screen]);

  function handleBtn1Click() {
    setShowBtn1(false);
    setCartVisible(true);
    setScreen('mattress');
  }

  // ---------- mattress reveal sequence ----------
  useEffect(() => {
    if (screen !== 'mattress') return;
    const tl = gsap.timeline({ delay: 0.8 });
    MATTRESS_LINES.forEach((_, i) => {
      tl.call(() => setVisibleMattressLines(i + 1), undefined, i === 0 ? 0 : '+=1.7');
    });
    tl.call(
      () => {
        const pos = pickRandomPosition(usedButtonPositionsRef.current);
        usedButtonPositionsRef.current.push(pos);
        setBtn2Pos(pos);
        setBtn2Hand(pickHandPresetForPosition(pos));
        setShowBtn2(true);
      },
      undefined,
      '+=2.0'
    );
    return () => {
      tl.kill();
    };
  }, [screen]);

  // ---------- add-to-cart flight animation ----------
  function handleAddToCart() {
    setShowBtn2(false);

    const mattressEl = mattressRef.current;
    const cartEl = cartIconRef.current;
    if (!mattressEl || !cartEl) {
      goToCheckout();
      return;
    }

    const startRect = mattressEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const clone = mattressEl.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '60';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);

    const dx = cartRect.left + cartRect.width / 2 - (startRect.left + startRect.width / 2);
    const dy = cartRect.top + cartRect.height / 2 - (startRect.top + startRect.height / 2);

    gsap.to(clone, {
      x: dx,
      y: dy,
      scale: 0.12,
      rotation: 20,
      opacity: 0.3,
      duration: 0.85,
      ease: 'power2.in',
      onComplete: () => {
        clone.remove();
        gsap.fromTo(cartEl, { scale: 1 }, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 });
        setCartCount(1);
        if (cartBadgeRef.current) {
          gsap.fromTo(cartBadgeRef.current, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        }
        gsap.delayedCall(0.4, goToCheckout);
      },
    });
  }

  function goToCheckout() {
    setScreen('checkout');
    setCartFlash(true);
    setVisibleCheckoutLines(0);
    setShowCheckoutCard(false);
    setShowBail(false);
    setGuiltStage(null);

    const tl = gsap.timeline();
    tl.call(() => setCartFlash(false), undefined, '+=1.0');
    CHECKOUT_LINES.forEach((_, i) => {
      tl.call(() => setVisibleCheckoutLines(i + 1), undefined, i === 0 ? '+=0.4' : '+=1.7');
    });
    tl.call(() => setShowCheckoutCard(true), undefined, '+=0.7');
    tl.call(() => setShowBail(true), undefined, '+=3.2');
  }

  function handlePayNow() {
    if (!selectedMethod) return;
    setScreen('paying');
    gsap.delayedCall(1.6, () => setScreen('gotcha'));
  }

  // ---------- guilt-trip dialog tree ----------
  // Clicking the bail link opens a text-only overlay ("Oh, I think you just
  // misclicked...") for 3 seconds with no buttons. It then auto-advances to
  // 'bigCard', where the real payment card itself enlarges and re-centers
  // in the user's face, with one extra button that escalates to 'confirm2'.
  // From confirm2/confirm3, the "soft" outs close the overlay entirely — it
  // only reopens if the person clicks the bail link again. The final two
  // options in confirm3 both lead to the same payoff screen.
  function handleBail() {
    setGuiltStage('intro');
  }

  function closeGuilt() {
    setGuiltStage(null);
  }

  function finalizeBail() {
    setGuiltStage(null);
    setScreen('sad');
  }

  useEffect(() => {
    if (guiltStage !== 'intro') return;
    const t = gsap.delayedCall(3, () => setGuiltStage('bigCard'));
    return () => {
      t.kill();
    };
  }, [guiltStage]);

  // ---------- sad emoji crossfade sequence ----------
  useEffect(() => {
    if (screen !== 'sad') return;
    setSadEmojiIndex(0);
    setSadEmojiVisible(false);
    setSadEmojiLayout(SAD_EMOJIS.map(() => randomEmojiLayout()));

    const tl = gsap.timeline();
    SAD_EMOJIS.forEach((_, i) => {
      const isLast = i === SAD_EMOJIS.length - 1;
      tl.call(
        () => {
          setSadEmojiIndex(i);
          setSadEmojiVisible(true);
        },
        undefined,
        i === 0 ? 0.2 : '+=0.9'
      );
      if (!isLast) {
        tl.call(() => setSadEmojiVisible(false), undefined, '+=0.7');
      }
    });
    return () => {
      tl.kill();
    };
  }, [screen]);

  // reset checkout-related state whenever we leave checkout (so re-runs feel fresh)
  useEffect(() => {
    if (screen === 'checkout') return;
    setCartFlash(false);
    setVisibleCheckoutLines(0);
    setShowCheckoutCard(false);
    setShowBail(false);
    setGuiltStage(null);
  }, [screen]);

  return (
    <div className={`${fraunces.variable} ${spaceGrotesk.variable} prank-root`}>
      <div className={`cart-wrap ${cartVisible ? 'show' : ''}`}>
        <div className="cart-icon" ref={cartIconRef}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div className="cart-badge" ref={cartBadgeRef}>
          {cartCount}
        </div>
      </div>

      <div className="stage">
        {/* Screen 0: intro */}
        <div className={`screen ${screen === 'intro' ? 'active' : ''}`}>
          {INTRO_LINES.map((line, i) => (
            <div key={line} className={`line ${i < visibleIntroLines ? 'show' : ''}`}>
              {line}
            </div>
          ))}
        </div>

        {showBtn1 && (
          <>
            <div
              className="pointer-hand-anchor"
              style={
                {
                  top: btn1Pos.top + btn1Hand.tipY,
                  left: btn1Pos.left + btn1Hand.tipX,
                  '--hand-rotate': `${btn1Hand.rotate}deg`,
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/idea2/pointing_hand.png"
                alt=""
                aria-hidden="true"
                className="pointer-hand"
              />
            </div>
            <button
              className="click-here show"
              style={{ top: btn1Pos.top, left: btn1Pos.left }}
              onClick={handleBtn1Click}
            >
              Click here
            </button>
          </>
        )}

        {/* Screen 1: mattress showpiece */}
        <div className={`screen ${screen === 'mattress' ? 'active' : ''}`}>
          <div className="mattress" ref={mattressRef}>
            <div className="glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/idea2/mattress.png" alt="Eurofoam mattress" />
          </div>
          {MATTRESS_LINES.map((line, i) => (
            <p key={line.text} className={`${line.emph ? 'emph' : ''} ${i < visibleMattressLines ? 'show' : ''}`}>
              {line.text}
            </p>
          ))}
        </div>

        {showBtn2 && (
          <>
            <div
              className="pointer-hand-anchor"
              style={
                {
                  top: btn2Pos.top + btn2Hand.tipY,
                  left: btn2Pos.left + btn2Hand.tipX,
                  '--hand-rotate': `${btn2Hand.rotate}deg`,
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/idea2/pointing_hand.png"
                alt=""
                aria-hidden="true"
                className="pointer-hand"
              />
            </div>
            <button
              className="click-here show"
              style={{ top: btn2Pos.top, left: btn2Pos.left }}
              onClick={handleAddToCart}
            >
              Click here
            </button>
          </>
        )}

        {/* Screen 2: payment gateway */}
        <div className={`screen checkout-screen ${screen === 'checkout' ? 'active' : ''}`}>
          <div className={`flash ${cartFlash ? 'show' : ''}`}>Added to cart.</div>

          <div className="checkout-split">
            <div className="checkout-text-col">
              {CHECKOUT_LINES.map((line, i) => (
                <div key={line} className={`checkout-line ${i < visibleCheckoutLines ? 'show' : ''}`}>
                  {line}
                </div>
              ))}
            </div>

            <div className={`checkout-card-col ${showCheckoutCard ? 'show' : ''} ${guiltStage === 'bigCard' ? 'enlarged' : ''}`}>
              <div className="checkout-card">
                <div className="secure-tag">🔒 Secure Payment</div>
                <div className="amount-badge">
                  <span>Amount payable</span>
                  ₹12,990
                </div>
                <div className="method-row">
                  <button
                    className={`method-pill ${selectedMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('upi')}
                  >
                    UPI
                  </button>
                  <button
                    className={`method-pill ${selectedMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('card')}
                  >
                    Card
                  </button>
                </div>
                <div className={`billing-fields ${selectedMethod ? 'enabled' : ''}`}>
                  <label>
                    Address line 1
                    <input type="text" placeholder="Flat, house no., building" disabled={!selectedMethod} />
                  </label>
                  <label>
                    Address line 2
                    <input type="text" placeholder="Area, landmark" disabled={!selectedMethod} />
                  </label>
                  <label>
                    PIN code
                    <input type="text" placeholder="000000" disabled={!selectedMethod} />
                  </label>
                </div>
                <button className="pay-now" disabled={!selectedMethod} onClick={handlePayNow}>
                  {selectedMethod ? 'Pay ₹12,990' : 'Select a payment method'}
                </button>
                {guiltStage === 'bigCard' && (
                  <button className="force-buy-out-btn" onClick={() => setGuiltStage('confirm2')}>
                    I really don&apos;t want to buy it
                  </button>
                )}
              </div>
            </div>
          </div>

          {guiltStage === 'bigCard' && <div className="bigcard-backdrop" />}

          <button className="bail-link" style={{ opacity: showBail ? 1 : 0 }} onClick={handleBail}>
            I don&apos;t want to buy this
          </button>

          {guiltStage && guiltStage !== 'bigCard' && (
            <div className="guilt-overlay">
              <div className="guilt-glow" />
              <div className="guilt-card">
                {guiltStage === 'intro' && (
                  <p className="guilt-text">Oh, I think you just misclicked... here, let me help you.</p>
                )}

                {guiltStage === 'confirm2' && (
                  <>
                    <p className="guilt-text">Are you sure you don&apos;t want it?</p>
                    <div className="guilt-actions">
                      <button className="guilt-btn primary" onClick={() => setGuiltStage('confirm3')}>
                        YES, I&apos;m sure
                      </button>
                      <button className="guilt-btn" onClick={closeGuilt}>
                        Not sure...
                      </button>
                    </div>
                  </>
                )}

                {guiltStage === 'confirm3' && (
                  <>
                    <p className="guilt-text">Think again... you still have time!!</p>
                    <div className="guilt-actions">
                      <button className="guilt-btn primary" onClick={finalizeBail}>
                        JUST GET ME OUT OF HERE!!!
                      </button>
                      <button className="guilt-btn" onClick={finalizeBail}>
                        Call Police
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Screen 3: paying / stall */}
        <div className={`screen ${screen === 'paying' ? 'active' : ''}`}>
          <div className="headline">Processing your payment</div>
          <div className="sub">(nothing is actually being charged, we promise)</div>
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Screen 4: sad — floating emoji crossfade at scattered positions/sizes */}
        <div className={`screen ${screen === 'sad' ? 'active' : ''}`}>
          {SAD_EMOJIS.map((src, i) => {
            const layout = sadEmojiLayout[i];
            const isVisible = i === sadEmojiIndex && sadEmojiVisible;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="sad-emoji"
                style={{
                  left: `${layout.leftVw}vw`,
                  top: `${layout.topVh}vh`,
                  width: `${layout.size}px`,
                  height: `${layout.size}px`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0.75)',
                }}
              />
            );
          })}
          <div className="sad-message">
            <h2>Okay okay, fine. I suppose.</h2>
            <p>Anyway — here&apos;s the website.</p>
            <a className="cta" href="https://eurofoam.in" target="_blank" rel="noopener noreferrer">
              Go to Eurofoam.in
            </a>
          </div>
        </div>

        {/* Screen 5: gotcha (paid-through path) */}
        <div className={`screen ${screen === 'gotcha' ? 'active' : ''}`}>
          <div className="emoji">😅</div>
          <h2>Relax — nothing was charged.</h2>
          <p>This was just a mattress commercial that got a little out of hand. But hey, since you&apos;re clearly in the market—</p>
          <a className="cta" href="https://eurofoam.in" target="_blank" rel="noopener noreferrer">
            Go to Eurofoam.in
          </a>
        </div>
      </div>

      <style jsx>{`
        .prank-root {
          --bg: #0e1116;
          --panel: #1b1f2a;
          --panel-soft: #22283a;
          --field: #262d3d;
          --mint: #8fe3d1;
          --coral: #ff7a6b;
          --moon: #f4d06f;
          --text: #e8e6e1;
          --text-dim: #9aa0ad;
          position: relative;
          width: 100vw;
          height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-space-grotesk), sans-serif;
          overflow: hidden;
        }

        .stage {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s ease;
        }
        .screen.active {
          opacity: 1;
          pointer-events: auto;
        }

        .cart-wrap {
          position: fixed;
          top: 24px;
          right: 28px;
          z-index: 50;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .cart-wrap.show {
          opacity: 1;
        }
        .cart-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--panel);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        .cart-icon svg {
          width: 22px;
          height: 22px;
          stroke: var(--mint);
        }
        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--coral);
          color: #0e1116;
          font-size: 0.7rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(${cartCount > 0 ? 1 : 0});
        }

        .line {
          font-family: var(--font-fraunces), serif;
          font-weight: 500;
          font-size: clamp(1.4rem, 4vw, 2.4rem);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.7s ease, transform 0.7s ease;
          max-width: 640px;
          line-height: 1.4;
          position: relative;
          z-index: 5;
        }
        .line.show {
          opacity: 1;
          transform: translateY(0);
        }

        .click-here {
          position: absolute;
          background: var(--mint);
          color: #0e1116;
          border: none;
          width: ${BUTTON_WIDTH}px;
          min-width: ${BUTTON_WIDTH}px;
          height: ${BUTTON_HEIGHT}px;
          padding: 0 26px;
          border-radius: 999px;
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 0 0 0 rgba(143, 227, 209, 0.6);
          animation: pulse 2s infinite;
          transition: opacity 0.5s ease;
          z-index: 20;
          pointer-events: auto;
        }
        .click-here:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 3px;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(143, 227, 209, 0.45);
          }
          70% {
            box-shadow: 0 0 0 16px rgba(143, 227, 209, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(143, 227, 209, 0);
          }
        }

        .pointer-hand-anchor {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
          z-index: 19;
          transform-origin: center center;
          animation: handTap 1.2s ease-in-out infinite;
        }

        .pointer-hand {
          position: absolute;
          width: ${HAND_WIDTH}px;
          height: auto;
          left: -${HAND_TIP_X}px;
          top: -${HAND_TIP_Y}px;
          pointer-events: none;
          transform-origin: ${HAND_TIP_X}px ${HAND_TIP_Y}px;
          transform: rotate(var(--hand-rotate, 0deg));
          filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.45));
        }

        @keyframes handTap {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }

        .mattress {
          width: min(80vw, 480px);
          position: relative;
          margin-bottom: 40px;
        }
        .mattress img {
          display: block;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.55));
        }
        .mattress .glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(closest-side, rgba(143, 227, 209, 0.18), transparent);
          z-index: -1;
        }

        .screen p {
          max-width: 480px;
          font-size: 1.05rem;
          color: var(--text-dim);
          margin: 6px 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          position: relative;
          z-index: 5;
        }
        .screen p.show {
          opacity: 1;
          transform: translateY(0);
        }
        .screen p.emph {
          color: var(--text);
          font-family: var(--font-fraunces), serif;
          font-size: 1.3rem;
          font-weight: 500;
        }

        .flash {
          font-family: var(--font-fraunces), serif;
          font-size: 1.15rem;
          color: var(--mint);
          margin-bottom: 16px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .flash.show {
          opacity: 1;
        }

        .checkout-split {
          width: 100%;
          max-width: 1080px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }

        .checkout-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 14px;
        }

        .checkout-line {
          font-family: var(--font-fraunces), serif;
          font-weight: 500;
          font-size: clamp(1.15rem, 2.6vw, 1.6rem);
          color: var(--text);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          max-width: 420px;
          line-height: 1.4;
        }
        .checkout-line.show {
          opacity: 1;
          transform: translateY(0);
        }

        .checkout-card-col {
          flex: 1;
          display: flex;
          justify-content: center;
          opacity: 0;
          transform: translateX(70px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .checkout-card-col.show {
          opacity: 1;
          transform: translateX(0);
        }

        .checkout-card-col.enlarged {
          position: fixed;
          inset: 0;
          z-index: 71;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: none;
        }
        .checkout-card-col.enlarged .checkout-card {
          max-width: 460px;
          width: calc(100% - 48px);
          transform: scale(1.12);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(244, 208, 111, 0.15);
          animation: cardLunge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cardLunge {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        .bigcard-backdrop {
          position: fixed;
          inset: 0;
          z-index: 70;
          background: rgba(6, 8, 12, 0.75);
          animation: fadeIn 0.35s ease;
        }

        .force-buy-out-btn {
          width: 100%;
          margin-top: 12px;
          padding: 14px 0;
          border-radius: 12px;
          border: none;
          background: var(--coral);
          color: #0e1116;
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .force-buy-out-btn:hover {
          transform: translateY(-1px);
        }
        .force-buy-out-btn:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 2px;
        }

        .checkout-card {
          background: var(--panel);
          border-radius: 22px;
          padding: 28px 28px 24px;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          text-align: left;
        }

        @media (max-width: 760px) {
          .screen:not(.checkout-screen) {
            padding-left: 205px;
            padding-right: 205px;
          }

          .line {
            max-width: 100%;
            font-size: clamp(1.2rem, 5vw, 2rem);
          }

          .screen p {
            max-width: 100%;
          }

          .checkout-split {
            flex-direction: column;
            gap: 28px;
          }
          .checkout-text-col {
            align-items: center;
            text-align: center;
          }
          .checkout-line {
            max-width: 100%;
          }
        }

        .secure-tag {
          font-size: 0.75rem;
          color: var(--text-dim);
          letter-spacing: 0.02em;
          margin-bottom: 14px;
        }

        .amount-badge {
          background: var(--moon);
          color: #21200f;
          font-family: var(--font-fraunces), serif;
          font-weight: 600;
          font-size: 1.7rem;
          padding: 14px 18px;
          border-radius: 14px;
          margin-bottom: 16px;
        }
        .amount-badge span {
          display: block;
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 500;
          font-size: 0.8rem;
          color: #4a4522;
          margin-bottom: 2px;
        }

        .method-row {
          display: flex;
          gap: 10px;
          background: rgba(143, 227, 209, 0.1);
          padding: 8px;
          border-radius: 14px;
          margin-bottom: 18px;
        }
        .method-pill {
          flex: 1;
          padding: 12px 0;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text);
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .method-pill:hover {
          border-color: var(--mint);
        }
        .method-pill.active {
          background: var(--mint);
          color: #0e1116;
        }
        .method-pill:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 2px;
        }

        .billing-fields {
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0.4;
          transition: opacity 0.35s ease;
          margin-bottom: 18px;
        }
        .billing-fields.enabled {
          opacity: 1;
        }
        .billing-fields label {
          font-size: 0.72rem;
          color: var(--text-dim);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .billing-fields input {
          background: var(--field);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--text);
          font-family: var(--font-space-grotesk), sans-serif;
          font-size: 0.9rem;
        }
        .billing-fields input:disabled {
          cursor: not-allowed;
        }
        .billing-fields input:focus-visible {
          outline: 2px solid var(--mint);
        }

        .pay-now {
          width: 100%;
          padding: 14px 0;
          border-radius: 12px;
          border: none;
          background: var(--panel-soft);
          color: var(--text-dim);
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: not-allowed;
          transition: background 0.25s ease, color 0.25s ease, transform 0.15s ease;
        }
        .pay-now:not(:disabled) {
          background: var(--coral);
          color: #0e1116;
          cursor: pointer;
        }
        .pay-now:not(:disabled):hover {
          transform: translateY(-1px);
        }
        .pay-now:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 2px;
        }

        .headline {
          font-family: var(--font-fraunces), serif;
          font-size: clamp(1.3rem, 3.5vw, 1.9rem);
          font-weight: 500;
          margin-bottom: 8px;
        }
        .sub {
          color: var(--text-dim);
          font-size: 0.95rem;
          margin-bottom: 40px;
        }
        .dots span {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 4px;
          border-radius: 50%;
          background: var(--mint);
          animation: bounce 1.2s infinite ease-in-out;
        }
        .dots span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .dots span:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        .bail-link {
          position: absolute;
          bottom: 40px;
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: var(--font-space-grotesk), sans-serif;
          font-size: 0.85rem;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: opacity 0.6s ease;
        }
        .bail-link:focus-visible {
          outline: 2px solid var(--moon);
        }

        .guilt-overlay {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 8, 12, 0.72);
          animation: fadeIn 0.35s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .guilt-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(244, 208, 111, 0.16), transparent 60%);
          pointer-events: none;
        }

        .guilt-card {
          position: relative;
          background: var(--panel);
          border-radius: 26px;
          padding: 48px 44px;
          max-width: 460px;
          width: calc(100% - 48px);
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(244, 208, 111, 0.08);
          animation: guiltPop 0.4s ease;
        }
        @keyframes guiltPop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .guilt-card .guilt-quote {
          font-family: var(--font-fraunces), serif;
          font-style: italic;
          color: var(--text-dim);
          font-size: 1rem;
          margin: 0 0 12px;
          opacity: 1;
          transform: none;
        }
        .guilt-card .guilt-text {
          font-family: var(--font-fraunces), serif;
          font-weight: 500;
          font-size: clamp(1.2rem, 3vw, 1.6rem);
          color: var(--text);
          margin: 0 0 6px;
          line-height: 1.4;
          opacity: 1;
          transform: none;
        }

        .guilt-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 26px;
        }
        .guilt-btn {
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: var(--panel-soft);
          color: var(--text);
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.2s ease;
        }
        .guilt-btn:hover {
          transform: translateY(-1px);
        }
        .guilt-btn.primary {
          background: var(--coral);
          color: #0e1116;
        }
        .guilt-btn:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 2px;
        }

        .sad-emoji {
          position: absolute;
          object-fit: contain;
          opacity: 0;
          transform: scale(0.75);
          transition: opacity 0.9s ease, transform 0.9s ease;
          pointer-events: none;
          z-index: 1;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
        }

        .sad-message {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .screen .emoji {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .screen h2 {
          font-family: var(--font-fraunces), serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 3.5vw, 1.9rem);
          max-width: 460px;
          margin: 0 0 10px;
        }

        .cta {
          background: var(--coral);
          color: #0e1116;
          border: none;
          padding: 16px 34px;
          border-radius: 999px;
          font-family: var(--font-space-grotesk), sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s ease;
        }
        .cta:hover {
          transform: translateY(-2px);
        }
        .cta:focus-visible {
          outline: 3px solid var(--moon);
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .click-here,
          .dots span,
          .pointer-hand,
          .pointer-hand-anchor {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .screen,
          .line,
          .screen p,
          .flash,
          .checkout-line,
          .checkout-card-col,
          .billing-fields,
          .bail-link,
          .sad-emoji,
          .guilt-overlay,
          .guilt-card,
          .bigcard-backdrop {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }

        @media (max-width: 480px) {
          .checkout-card {
            padding: 22px 20px;
          }
        }
      `}</style>
    </div>
  );
}