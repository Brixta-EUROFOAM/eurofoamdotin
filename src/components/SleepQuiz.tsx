"use client";

// GADDA SleepMatch V8: active motion studies; existing retail and checkout logic retained.

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ProductVisual from "@/components/store/ProductVisual";
import { useCart } from "@/components/CartProvider";
import { money, type Mattress } from "@/lib/catalog";
import { mattressPrice } from "@/lib/mattress-pricing";
import { SIZE_GROUPS, type SizeRow } from "@/lib/sizes";
import { trackEvent } from "@/lib/telemetry-client";
import SleepMatchLeadCapture from "@/components/store/SleepMatchLeadCapture";

type MatchKey = "regular" | "pro" | "ultimate";
type Option = {
  id?: string;
  visual?: string;
  insight?: string;
  label: string;
  hint: string;
  symbol: string;
  score: Partial<Record<MatchKey, number>>;
  why: string;
};
type Question = { eyebrow: string; title: string; subtitle: string; choices: Option[] };

/* An honest, deterministic preference matcher—not a clinical assessment.
   The problem receives the highest weight. Later answers refine the match. */
const QUESTIONS: Question[] = [
  {
    eyebrow: "01 / START WITH THE PROBLEM",
    title: "What do you wish was different about your nights?",
    subtitle: "Forget foam names and mattress jargon. Pick the one thing you most want to change.",
    choices: [
      { id: "firm", label: "My bed feels like a plank", hint: "Too hard around my shoulders or hips", symbol: "01", score: { pro: 9, ultimate: 4 }, why: "you prefer more surface cushioning", insight: "A hard surface and a supportive base are not the same thing. A softer comfort layer can sit above a steady core." },
      { id: "sinking", label: "I sink in too much", hint: "Getting comfortable shouldn't mean getting stuck", symbol: "02", score: { regular: 10, pro: 1 }, why: "you prefer a steadier surface", insight: "Start with the support base and the amount of contouring you like, not the number of layers." },
      { id: "hot", label: "My bed gets too warm", hint: "I keep turning over or throwing off the blanket", symbol: "03", score: { ultimate: 10, pro: 1 }, why: "you care about temperature comfort", insight: "Ultimate uses cooling-oriented comfort materials. Room temperature, covers and bedding still matter; no fixed cooling effect is promised." },
      { id: "partner", label: "Every movement wakes me up", hint: "I notice my partner turning or getting out of bed", symbol: "04", score: { pro: 8, ultimate: 4 }, why: "movement on a shared bed matters to you", insight: "Compare foam constructions and Pro's optional pocket-spring base. Movement isolation is not guaranteed." },
      { id: "restless", label: "I can't find a comfortable position", hint: "Side, back, side again. Nothing feels quite right", symbol: "05", score: {}, why: "you want to find a comfortable surface feel", insight: "Your sleeping position and preferred feel are useful starting points. Restlessness alone cannot tell us which mattress is right." },
      { id: "tired", label: "I sleep, but wake up tired", hint: "A full night doesn't always feel like enough", symbol: "06", score: {}, why: "you want to explore mattress comfort", insight: "A mattress is only one part of sleep. We'll look at comfort preferences, not diagnose fatigue. If tiredness persists, consider speaking with a healthcare professional." },
      { id: "cold", label: "I wake up feeling cold", hint: "I struggle to stay comfortably warm", symbol: "07", score: {}, why: "temperature comfort matters to you", insight: "Bedding, room temperature and clothing may matter more than mattress choice here. We won't recommend a cooling upgrade just because you feel cold." },
      { id: "stiff", label: "I wake up feeling stiff", hint: "I want to explore a more comfortable support-and-cushion balance", symbol: "08", score: {}, why: "you want to compare support and cushioning", insight: "Stiffness can have many causes. Your preferred position and surface feel can help shortlist mattresses, not diagnose or treat pain." },
      { id: "value", label: "I just want a good mattress", hint: "No unnecessary upgrades or confusing choices", symbol: "09", score: { regular: 10, pro: 1 }, why: "you value straightforward construction and price", insight: "A higher price isn't automatically a better fit. Regular is our straightforward foam build." },
      { id: "unsure", label: "Nothing specific. Help me choose", hint: "I'm replacing a bed or just exploring options", symbol: "10", score: {}, why: "you are exploring your options", insight: "No need to invent a problem. We'll shortlist by position, feel and buying priority." },
    ],
  },
  {
    eyebrow: "02 / HOW YOU SLEEP",
    title: "When you finally get comfortable, how are you lying?",
    subtitle: "Think about how you usually fall asleep, not how you're supposed to sleep.",
    choices: [
      { label: "On my side", hint: "Shoulders and hips against the mattress", symbol: "A", score: { pro: 3, ultimate: 3 }, why: "you mainly sleep on your side" },
      { label: "On my back", hint: "I like an even, steady surface", symbol: "B", score: { pro: 3, regular: 2 }, why: "you mainly sleep on your back" },
      { label: "On my stomach", hint: "I prefer less sink around my hips", symbol: "C", score: { regular: 4, pro: 1 }, why: "you mainly sleep on your stomach" },
      { label: "I keep changing positions", hint: "I rarely stay in one position all night", symbol: "D", score: { pro: 3, ultimate: 1 }, why: "you change positions during the night" },
    ],
  },
  {
    eyebrow: "03 / YOUR COMFORT",
    title: "Forget the labels. How should your bed actually feel?",
    subtitle: "Choose the feel you enjoy most. Softer isn't always better, and firmer isn't always more supportive.",
    choices: [
      { label: "Steady. I like lying on top", hint: "A firmer surface with some cushioning", symbol: "I", score: { regular: 6, pro: 1 }, why: "you prefer a firm surface" },
      { label: "A little give, with support underneath", hint: "Not too hard, not too plush", symbol: "II", score: { pro: 7 }, why: "you prefer a balanced feel" },
      { label: "Cushioned. I like a softer hug", hint: "More contouring and a plush feel", symbol: "III", score: { ultimate: 7, pro: 1 }, why: "you enjoy a plush feel" },
    ],
  },
  {
    eyebrow: "04 / WHAT IS WORTH PAYING FOR",
    title: "What would make this purchase worth it?",
    subtitle: "We're not here to sell you the most expensive mattress. Just a sensible fit.",
    choices: [
      { label: "Get the essentials right", hint: "A straightforward build at a sensible price", symbol: "₹", score: { regular: 7, pro: 1 }, why: "you want value before upgrades" },
      { label: "Get the balance right", hint: "Cushioning and support for everyday use", symbol: "✓", score: { pro: 7 }, why: "you prioritise balanced everyday comfort" },
      { label: "Pay more if the materials make sense", hint: "I'm open to premium comfort layers", symbol: "+", score: { ultimate: 7 }, why: "you are considering premium comfort layers" },
    ],
  },
];

const POSITION: Record<MatchKey, { tagline: string; angle: string; check: string[]; tradeoff: string }> = {
  regular: {
    tagline: "Support. Without the unnecessary extras.",
    angle: "Soft foam on top. A high-density foam base underneath. A straightforward choice if you prefer a firmer feel and sensible spending.",
    check: ["High-density foam support base", "Soft comfort layer", "Firmer feel"],
    tradeoff: "Less contouring than the memory-foam builds. No dedicated cooling-oriented comfort layer.",
  },
  pro: {
    tagline: "Cushioned where you need it. Supported where it matters.",
    angle: "Memory foam and a soft transition layer over a responsive 32D HR base. For people who prefer a balance of cushioning and support.",
    check: ["Memory foam comfort", "32D HR support base", "Optional pocket springs"],
    tradeoff: "Not the firmest or most plush choice. Pocket springs are an optional paid configuration, not included by default.",
  },
  ultimate: {
    tagline: "More responsive comfort. Temperature in mind.",
    angle: "Cooling-oriented memory foam and adaptive foam over a 40D HR base. For people who enjoy a more plush feel and premium comfort materials.",
    check: ["Cooling-oriented memory foam", "Adaptive comfort layer", "40D HR support base"],
    tradeoff: "Higher price and a more plush feel. No guaranteed temperature reduction; natural latex is an optional paid upgrade.",
  },
};

const CAMPAIGN_QUESTIONS: Record<string, Question> = {
  "tired": {
    "eyebrow": "01 / YOUR STARTING POINT",
    "title": "What happens when you wake up?",
    "subtitle": "Choose the closest experience. We will separate mattress comfort from other sleep factors.",
    "choices": [
      {
        "label": "I wake up because the bed feels uncomfortable",
        "hint": "The surface feels wrong during the night",
        "symbol": "01",
        "visual": "restless",
        "score": {},
        "why": "you want to explore surface comfort",
        "insight": "Persistent tiredness deserves medical advice. A mattress match cannot diagnose or treat fatigue."
      },
      {
        "label": "I wake up feeling too warm",
        "hint": "Heat seems to interrupt my comfort",
        "symbol": "02",
        "visual": "hot",
        "score": {},
        "why": "temperature comfort matters to you",
        "insight": "Persistent tiredness deserves medical advice. A mattress match cannot diagnose or treat fatigue."
      },
      {
        "label": "I wake up feeling stiff",
        "hint": "I want to compare cushioning and support",
        "symbol": "03",
        "visual": "stiff",
        "score": {},
        "why": "you want to compare support and cushioning",
        "insight": "Persistent tiredness deserves medical advice. A mattress match cannot diagnose or treat fatigue."
      },
      {
        "label": "I sleep through but still feel tired",
        "hint": "The mattress may not be the reason",
        "symbol": "04",
        "visual": "tired",
        "score": {},
        "why": "fatigue alone does not establish a mattress preference",
        "insight": "Persistent tiredness deserves medical advice. A mattress match cannot diagnose or treat fatigue."
      }
    ]
  },
  "hot": {
    "eyebrow": "01 / YOUR STARTING POINT",
    "title": "Where do you notice the heat?",
    "subtitle": "Not every warm night is a mattress problem.",
    "choices": [
      {
        "label": "The mattress surface feels warm",
        "hint": "Especially where my body touches it",
        "symbol": "01",
        "visual": "hot",
        "score": {
          "ultimate": 5
        },
        "why": "you want to compare cooling-oriented comfort materials",
        "insight": "Cooling-oriented layers are not a guarantee of lower temperature. Room conditions, bedding and ventilation matter."
      },
      {
        "label": "The blanket or room feels warm",
        "hint": "It may be the surroundings",
        "symbol": "02",
        "visual": "cold",
        "score": {},
        "why": "room and bedding conditions may matter more",
        "insight": "Cooling-oriented layers are not a guarantee of lower temperature. Room conditions, bedding and ventilation matter."
      },
      {
        "label": "I feel trapped in the mattress",
        "hint": "I prefer a surface that is easier to move on",
        "symbol": "03",
        "visual": "sinking",
        "score": {
          "regular": 4,
          "pro": 2
        },
        "why": "you prefer less sink-in",
        "insight": "Cooling-oriented layers are not a guarantee of lower temperature. Room conditions, bedding and ventilation matter."
      },
      {
        "label": "I am not sure",
        "hint": "Help me compare the feel first",
        "symbol": "04",
        "visual": "restless",
        "score": {},
        "why": "you want to explore comfort before paying for extras",
        "insight": "Cooling-oriented layers are not a guarantee of lower temperature. Room conditions, bedding and ventilation matter."
      }
    ]
  },
  "restless": {
    "eyebrow": "01 / YOUR STARTING POINT",
    "title": "What makes you change position?",
    "subtitle": "Pick what actually feels wrong, not a foam name.",
    "choices": [
      {
        "label": "Pressure around shoulders or hips",
        "hint": "The surface feels too hard",
        "symbol": "01",
        "visual": "firm",
        "score": {
          "pro": 6,
          "ultimate": 3
        },
        "why": "you prefer more cushioning",
        "insight": "Restlessness has many causes. We only match mattress comfort preferences."
      },
      {
        "label": "I sink in and feel stuck",
        "hint": "I want to move more easily",
        "symbol": "02",
        "visual": "sinking",
        "score": {
          "regular": 6,
          "pro": 2
        },
        "why": "you prefer a steadier feel",
        "insight": "Restlessness has many causes. We only match mattress comfort preferences."
      },
      {
        "label": "The surface gets too warm",
        "hint": "Temperature comfort matters",
        "symbol": "03",
        "visual": "hot",
        "score": {
          "ultimate": 4
        },
        "why": "you want to compare cooling-oriented materials",
        "insight": "Restlessness has many causes. We only match mattress comfort preferences."
      },
      {
        "label": "Nothing specific feels right",
        "hint": "I want to compare different feels",
        "symbol": "04",
        "visual": "restless",
        "score": {},
        "why": "you want to compare surface feel",
        "insight": "Restlessness has many causes. We only match mattress comfort preferences."
      }
    ]
  },
  "stiff": {
    "eyebrow": "01 / YOUR STARTING POINT",
    "title": "What feels uncomfortable about your current bed?",
    "subtitle": "Focus on the mattress surface. Pain and stiffness can have many causes.",
    "choices": [
      {
        "label": "The surface feels too hard",
        "hint": "I want more cushioning",
        "symbol": "01",
        "visual": "firm",
        "score": {
          "pro": 5,
          "ultimate": 2
        },
        "why": "you prefer more cushioning",
        "insight": "Persistent or severe pain should be assessed by a healthcare professional. This is a comfort finder, not medical advice."
      },
      {
        "label": "My hips seem to sink too far",
        "hint": "I prefer a steadier surface",
        "symbol": "02",
        "visual": "sinking",
        "score": {
          "regular": 5,
          "pro": 2
        },
        "why": "you prefer less sink",
        "insight": "Persistent or severe pain should be assessed by a healthcare professional. This is a comfort finder, not medical advice."
      },
      {
        "label": "I want a balance of both",
        "hint": "Cushioned on top, steady underneath",
        "symbol": "03",
        "visual": "restless",
        "score": {
          "pro": 4
        },
        "why": "you prefer a balanced feel",
        "insight": "Persistent or severe pain should be assessed by a healthcare professional. This is a comfort finder, not medical advice."
      },
      {
        "label": "I cannot tell what causes it",
        "hint": "I just want to explore comfort",
        "symbol": "04",
        "visual": "stiff",
        "score": {},
        "why": "you have not identified a specific mattress preference",
        "insight": "Persistent or severe pain should be assessed by a healthcare professional. This is a comfort finder, not medical advice."
      }
    ]
  },
  "cold": {
    "eyebrow": "01 / YOUR STARTING POINT",
    "title": "When does the bed feel too cold?",
    "subtitle": "We will not push a cooling mattress as a solution for feeling cold.",
    "choices": [
      {
        "label": "When I first get into bed",
        "hint": "The sheets or room feel cold",
        "symbol": "01",
        "visual": "cold",
        "score": {},
        "why": "bedding and room conditions may be relevant",
        "insight": "Bedding, clothing and room conditions may be more useful than changing mattresses. Persistent unexplained cold sensitivity warrants medical advice."
      },
      {
        "label": "In the middle of the night",
        "hint": "I want a more comfortable bedding setup",
        "symbol": "02",
        "visual": "cold",
        "score": {},
        "why": "overnight bedding comfort matters",
        "insight": "Bedding, clothing and room conditions may be more useful than changing mattresses. Persistent unexplained cold sensitivity warrants medical advice."
      },
      {
        "label": "The mattress itself feels uncomfortable",
        "hint": "I also want a different surface feel",
        "symbol": "03",
        "visual": "restless",
        "score": {},
        "why": "you want to compare mattress feel",
        "insight": "Bedding, clothing and room conditions may be more useful than changing mattresses. Persistent unexplained cold sensitivity warrants medical advice."
      },
      {
        "label": "I am not sure",
        "hint": "I want to explore my options",
        "symbol": "04",
        "visual": "tired",
        "score": {},
        "why": "you are exploring comfort preferences",
        "insight": "Bedding, clothing and room conditions may be more useful than changing mattresses. Persistent unexplained cold sensitivity warrants medical advice."
      }
    ]
  }
};
const CAMPAIGN_POSITION: Record<string, string> = {"tired": "When you do get comfortable, how do you usually lie?", "hot": "Which sleeping position puts you in contact with the bed most?", "restless": "Which position feels best when you finally settle?", "stiff": "Which position do you prefer when lying comfortably?", "cold": "What is your usual comfortable sleeping position?"};


// GADDA V8 — purpose-built, frame-driven editorial illustrations.
// All scene elements are vector graphics. No video files or external requests.
const MOTION_FRAMES = 180;
const motionLabels: Record<string, [string, string]> = {
  hot: ["The heat question", "Surface, bedding or room?"], cold: ["The cold question", "Start with bedding and room temperature."],
  restless: ["The position question", "Side. Back. Side again."], tired: ["The morning question", "A mattress is only one part of sleep."],
  stiff: ["The support question", "Surface comfort and support are different."], firm: ["Too little give?", "Compare surface cushioning."],
  sinking: ["Too much give?", "Compare the feel of the support base."], partner: ["Shared sleep", "Compare movement and surface feel."],
  position: ["How you sleep", "Side, back, stomach or a mix?"], feel: ["How it should feel", "Firm, balanced or plush?"],
  budget: ["What is worth paying for?", "Different builds. Different trade-offs."],
};
function motionKind(kind: string) {
  const map: Record<string,string> = {A:"side",B:"back",C:"stomach",D:"restless",I:"firm",II:"balanced",III:"sinking","₹":"essential","✓":"everyday","+":"premium",value:"essential",unsure:"restless","03":"hot"};
  return map[kind] || kind;
}
const ink = "#262d2c", line = "#69706a", orange = "#e96a32", paper = "#f5efe5";
function Person({x=0,y=0,angle=0,side=false,back=false,stomach=false}: {x?:number;y?:number;angle?:number;side?:boolean;back?:boolean;stomach?:boolean}) {
  return <g transform={`translate(${x} ${y}) rotate(${angle} 160 125)`}>
    <path d={side ? "M121 125 Q160 110 201 132 L236 158 222 177 180 153 139 151Z" : "M122 124Q167 114 213 132L233 151 220 170 177 153 137 151Z"} fill="#435c57" stroke={ink} strokeWidth="2.5"/>
    <path d={side ? "M213 145L260 124 294 153 284 166 255 151 229 178Z" : "M218 144L265 143 305 158 301 174 259 163 223 170Z"} fill="#b4aa92" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d={side ? "M286 155l15 9 15 1q8 9-7 12h-23" : "M299 158l18 8q8 9-6 12l-14-3"} fill="#c99371" stroke={ink} strokeWidth="2"/>
    <path d="M130 134q15 21 39 18l24-10" fill="none" stroke="#d5a17d" strokeWidth="12" strokeLinecap="round"/>
    <path d="M190 142l10-3" stroke="#d5a17d" strokeWidth="9" strokeLinecap="round"/>
    <path d="M117 117l15 6-5 18-16-9" fill="#c99371"/>
    <ellipse cx="100" cy="119" rx="23" ry="21" fill="#d9a27b" stroke={ink} strokeWidth="2.5"/>
    <path d="M79 121Q70 92 101 94q21 0 26 19l-11-5q-8 5-16-5-3 19-21 18Z" fill={ink}/>
    {!stomach && <path d={back?"M104 119l8 0":"M105 118l7 1"} stroke={ink} strokeWidth="2.2" strokeLinecap="round"/>}
  </g>;
}
function Bed({sag=0}: {sag?:number}) {
  return <g>
    <ellipse cx="332" cy="284" rx="256" ry="23" fill="#d8cfc0" opacity=".7"/>
    <path d="M73 230H565V260H73Z" fill="#807665" stroke={ink} strokeWidth="2.5"/>
    <path d="M91 259v22h13v-22M535 259v22h13v-22" fill="#807665" stroke={ink} strokeWidth="2.5"/>
    <path d="M74 222H565V239H74Z" fill="#9caca1" stroke={ink} strokeWidth="2.5"/>
    <path d={`M74 193 Q183 193 244 ${193+sag} Q332 ${193+sag*1.65} 421 ${193+sag*.5} Q505 193 565 193 V222 H74Z`} fill="#fff9ee" stroke={ink} strokeWidth="2.5"/>
    <path d="M82 211H557" stroke="#bcb4a4" strokeWidth="1.5" strokeDasharray="5 6"/>
    <path d="M73 190V115Q73 103 85 103h8v87" fill="#b9ad97" stroke={ink} strokeWidth="2.5"/>
    <rect x="85" y="169" width="95" height="23" rx="12" fill="#d6c3a9" stroke={ink} strokeWidth="2"/>
  </g>;
}
function Room({night=false}: {night?:boolean}) {
  return <g>
    <rect width="640" height="360" fill={night?"#e4e5df":paper}/>
    <path d="M0 278H640V360H0Z" fill="#e6ddcf"/>
    <path d="M0 278H640" stroke="#c7bba9" strokeWidth="1.5"/>
    <rect x="455" y="39" width="118" height="99" rx="4" fill={night?"#b4c2c0":"#e6caa6"} stroke="#85897e" strokeWidth="2"/>
    <path d="M514 40V137M455 89H573" stroke="#fff9ee" strokeWidth="4"/>
    {night?<path d="M548 54a15 15 0 1 0 10 24 17 17 0 0 1-10-24Z" fill="#fff8e5"/>:<circle cx="540" cy="67" r="14" fill="#fff5cf"/>}
    <path d="M452 35v109M577 35v109" stroke="#b5a78f" strokeWidth="6" strokeLinecap="round"/>
    <path d="M25 72h31l12 41H13Z" fill="#e3c39e" stroke="#9b8b76" strokeWidth="1.5"/><path d="M41 114v118m-15 0h30" stroke="#9b8b76" strokeWidth="3"/>
  </g>;
}
function Clock({frame}: {frame:number}) {
  return <g><rect x="46" y="61" width="88" height="63" rx="12" fill="#fff9ee" stroke={ink} strokeWidth="2"/><circle cx="90" cy="92" r="22" fill="none" stroke={line} strokeWidth="2"/><path d="M90 74v18l12 7" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" transform={`rotate(${frame*4} 90 92)`}/><path d="M57 61l-6-9m72 9 6-9" stroke={orange} strokeWidth="3" strokeLinecap="round"/></g>;
}
function Overhead({frame,kind}: {frame:number;kind:string}) {
  const t=frame/MOTION_FRAMES*Math.PI*2, roll=Math.sin(t)*24;
  const isPosition=kind==="position" || kind==="restless";
  const angle=kind==="side"?23:kind==="stomach"?-13:isPosition?roll:Math.sin(t)*2;
  return <g><Room night/><rect x="171" y="37" width="298" height="283" rx="25" fill="#b9ac97" stroke={ink} strokeWidth="3"/><rect x="181" y="48" width="278" height="260" rx="20" fill="#fff9ef" stroke={ink} strokeWidth="2"/><rect x="245" y="60" width="150" height="51" rx="15" fill="#d8c6ac"/>
    <g transform={`translate(${kind==="partner"?-48:isPosition?Math.sin(t)*30:Math.sin(t)*3} ${Math.sin(t)*2}) rotate(${angle} 320 165) scale(1 ${1+Math.sin(t)*.009})`}>
      <ellipse cx="320" cy="103" rx="28" ry="25" fill="#d6a17d" stroke={ink} strokeWidth="2"/><path d="M292 104q-8-33 24-33 33 0 33 29l-15-8-21 4-21 8" fill={ink}/>
      <path d="M295 128q25-12 50 0l19 72q-44 22-88 0Z" fill="#435c57" stroke={ink} strokeWidth="2"/>
      <path d="M297 141l-27 45 23 18m51-63 25 42-20 20" fill="none" stroke="#d6a17d" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={kind==="side"||isPosition?`M301 199L${292+12*Math.sin(t)} 238 320 275M338 199L350 238 328 273`:"M301 199L299 275M338 199L341 275"} stroke="#b3aa94" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M320 135v53" stroke="#738d82" strokeWidth="2" strokeDasharray="5 5"/>
    </g>
    {kind==="partner"&&<g transform={`translate(${Math.sin(t)*8} 0) rotate(${Math.sin(t)*8} 372 165)`}><ellipse cx="378" cy="105" rx="24" ry="23" fill="#d6a17d" stroke={ink} strokeWidth="2"/><path d="M354 106q-7-33 24-32 28 0 26 29l-15-8-20 1Z" fill={ink}/><rect x="353" y="129" width="51" height="78" rx="16" fill="#ab765b" stroke={ink} strokeWidth="2"/><path d="M367 205l-6 65m28-65 8 65" stroke="#b4aa92" strokeWidth="20" strokeLinecap="round"/><path d="M419 155q12 13 0 26m10-37q23 25 0 49" fill="none" stroke={orange} strokeWidth="3" opacity={.5+.5*Math.abs(Math.sin(t))}/></g>}
    {isPosition&&<g stroke={orange} strokeWidth="3" fill="none" strokeLinecap="round" opacity={.5+.5*Math.abs(Math.sin(t))}><path d="M124 135q-27 52 0 90l-13-7m13 7 2-15M517 225q27-52 0-90l13 7m-13-7-2 15"/></g>}
  </g>;
}
function Support({frame,kind}: {frame:number;kind:string}) {
  const wave=(1-Math.cos(frame/MOTION_FRAMES*Math.PI*2))/2;
  const sag=kind==="firm"?0:kind==="sinking"?12+wave*14:7+wave*4;
  return <g><Room/><Bed sag={sag}/><g transform={`translate(0 ${sag*.6})`}><Person x={58} y={51}/></g>
    <g fill="none" stroke={orange} strokeWidth="3" strokeLinecap="round" opacity={.55+wave*.4}>
      {[220,300,382].map((x,i)=><path key={x} d={`M${x} ${130+wave*19+i*2}v24m-7-7 7 7 7-7`}/>)}
    </g><path d="M206 253h250" stroke="#fff9ee" strokeWidth="2" strokeDasharray="5 7"/>
    {kind==="stiff"&&[205,277].map((x,i)=><g key={x} fill="none" stroke={orange} opacity={.85-wave*.45}><circle cx={x} cy={185+i*2} r={10+wave*11} strokeWidth="3"/><circle cx={x} cy={185+i*2} r="4" fill={orange}/></g>)}
  </g>;
}
function Temperature({frame,kind}: {frame:number;kind:string}) {
  const t=frame/MOTION_FRAMES*Math.PI*2, wave=(1-Math.cos(t))/2, hot=kind==="hot";
  return <g><Room night={!hot}/><Bed/><Person x={58} y={51}/>
    <path d={`M${hot?315+wave*112:220-wave*29} 166Q${hot?391+wave*50:338} ${143-wave*9} 477 175L547 188 540 207H${hot?310+wave*112:213-wave*29}Z`} fill={hot?"#d9a47e":"#718d88"} stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/>
    {Array.from({length:5},(_,i)=>{const p=(frame/MOTION_FRAMES+i*.2)%1;const x=232+i*48;const y=142-p*76;return hot?<path key={i} d={`M${x} ${y}q-12-9 0-18t0-18`} stroke={orange} fill="none" strokeWidth="3.8" strokeLinecap="round" opacity={Math.sin(p*Math.PI)*.9}/>:<g key={i} transform={`translate(${x+Math.sin(t+i)*9} ${65+p*66}) rotate(${frame*2+i*15})`} stroke="#56858c" strokeWidth="2.6" strokeLinecap="round" opacity={Math.sin(p*Math.PI)}><path d="M-8 0H8M0-8V8M-6-6L6 6M6-6L-6 6"/></g>})}
  </g>;
}
function Morning({frame}: {frame:number}) {
  const t=frame/MOTION_FRAMES*Math.PI*2, tilt=Math.sin(t)*6;
  return <g><Room/><Bed/><Clock frame={frame}/><g transform={`rotate(${tilt} 246 197)`}>
    <path d="M216 194q-14-49 8-85 29-14 49 9l17 76Z" fill="#435c57" stroke={ink} strokeWidth="2.5"/>
    <path d="M229 135l-9 35 31 12m13-49 16 30-17 22" stroke="#d6a17d" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <ellipse cx="244" cy="92" rx="26" ry="28" fill="#d6a17d" stroke={ink} strokeWidth="2.5"/><path d="M218 94q-12-37 24-38 31 0 31 29l-20-10-16 5-19 14" fill={ink}/><path d="M232 96l8 2m9-2 8-2" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M238 193q40-3 60 15l26 54-20 8-32-48-34-3Z" fill="#b4aa92" stroke={ink} strokeWidth="2.5"/><path d="M304 270l24-7 14 10q1 8-14 10h-24Z" fill="#d6a17d" stroke={ink} strokeWidth="2"/>
  </g><g stroke={orange} strokeWidth="3" fill="none" opacity={.55+.4*Math.sin(t)**2}><path d="M292 71l11-9m-9 25 15-1m-17 14 10 7"/></g></g>;
}
function ValueScene({frame,kind}: {frame:number;kind:string}) {
  const t=frame/MOTION_FRAMES*Math.PI*2;
  return <g><rect width="640" height="360" fill={paper}/>{[0,1,2].map(i=>{const x=48+i*190, y=104+(Math.sin(t+i*1.2)+1)*8;const selected=kind==="essential"?0:kind==="everyday"?1:kind==="premium"?2:-1;return <g opacity={selected<0||selected===i?1:.38} key={i} transform={`translate(${x} ${y})`}><rect x="0" y="0" width="164" height="150" rx="13" fill="#fffaf2" stroke={selected===i?orange:"#bdb09e"} strokeWidth={selected===i?4:2}/><path d="M20 99l62-25 63 25-63 25Z" fill="#b6ab99" stroke={ink} strokeWidth="2"/><path d="M20 85l62-25 63 25-63 25Z" fill="#9fafa1" stroke={ink} strokeWidth="2"/>{i>0&&<path d="M20 71l62-25 63 25-63 25Z" fill="#d4b8a1" stroke={ink} strokeWidth="2"/>}{i>1&&<path d="M20 57l62-25 63 25-63 25Z" fill="#bfd0c7" stroke={ink} strokeWidth="2"/>}<path d={`M20 ${kind==="feel"?45:42}l62-25 63 25-63 25Z`} fill="#fff9ee" stroke={ink} strokeWidth="2"/><text x="82" y="140" textAnchor="middle" fontSize="13" fontWeight="700" fill={ink}>{["REGULAR","PRO","ULTIMATE"][i]}</text></g>})}</g>;
}
function SceneArt({kind,frame=0,mini=false}: {kind:string;frame?:number;mini?:boolean}) {
  const k=motionKind(kind);
  const labels=motionLabels[k] || (['side','back','stomach'].includes(k)?motionLabels.position:motionLabels.restless);
  return <svg viewBox="0 0 640 360" width="100%" height="100%" aria-hidden="true" style={{display:"block"}}>
    {k==="hot"||k==="cold"?<Temperature frame={frame} kind={k}/>:k==="tired"?<Morning frame={frame}/>:['restless','position','side','back','stomach','partner'].includes(k)?<Overhead frame={frame} kind={k}/>:['firm','sinking','stiff','balanced'].includes(k)?<Support frame={frame} kind={k}/>:<ValueScene frame={frame} kind={k}/>}
    {!mini&&<g><rect x="0" y="0" width="640" height="31" fill="#282d2b"/><text x="18" y="20" fill="#f9f5ed" fontSize="11" fontWeight="700" letterSpacing="1.8">GADDA / SLEEP STUDIES</text><text x="622" y="20" textAnchor="end" fill="#e7bb9e" fontSize="11" fontWeight="700">{labels[0].toUpperCase()}</text><rect x="0" y="313" width="640" height="47" fill="#fff9ee"/><text x="19" y="333" fontSize="15" fontWeight="700" fill={ink}>{labels[1]}</text><text x="19" y="347" fontSize="9" fill="#655c50">Illustration · not a product performance test</text><rect x="0" y="357" width={640*(frame+1)/MOTION_FRAMES} height="3" fill={orange}/></g>}
  </svg>;
}
// Single clock for answer previews, only while the active question is visible.
// Main composition uses Remotion's timeline. Cards reuse the same frame-driven art.
const MotionClock = createContext(0);
function usePreviewClock(active:boolean) {
  const [frame,setFrame]=useState(0);
  useEffect(()=>{
    if(!active) return;
    let id=0, start=0, previous=-1;
    const tick=(time:number)=>{if(!start)start=time;const f=Math.floor((time-start)/1000*15)%90*2;if(f!==previous){previous=f;setFrame(f);}id=requestAnimationFrame(tick);};
    id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
  },[active]);
  return frame;
}
function QuizArt({kind}: {kind:string}) {
  const frame=useContext(MotionClock);
  return <span className="sm8-option-art"><SceneArt kind={kind} frame={frame} mini/></span>;
}
// GADDA: answer thumbnails only (large motion preview removed).
function MotionStage({children}: {kind:string;children:ReactNode}) {
  const stage=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false), [reduced,setReduced]=useState(true), [paused,setPaused]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setReduced(mq.matches);sync();mq.addEventListener("change",sync);
    const element=stage.current;let obs:IntersectionObserver|undefined;
    if(element&&"IntersectionObserver" in window){obs=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.05});obs.observe(element);}else setVisible(true);
    return()=>{obs?.disconnect();mq.removeEventListener("change",sync);};
  },[]);
  const active=visible&&!reduced&&!paused;
  const frame=usePreviewClock(active);
  return <MotionClock.Provider value={frame}><div ref={stage} className="sm8-stage">
    
    {children}
    {!reduced && <div className="sm8-film-meta" style={{justifyContent:"flex-end",margin:"4px 0 0"}}><button type="button" onClick={()=>setPaused(v=>!v)}>{paused?"Resume answer animations":"Pause answer animations"}</button></div>}
  </div></MotionClock.Provider>;
}

function keyOf(p: Mattress): MatchKey {
  const value = `${p.slug} ${p.name}`.toLowerCase();
  if (value.includes("ultimate")) return "ultimate";
  if (value.includes("regular")) return "regular";
  return "pro";
}

function standardSize(rows: SizeRow[], group: string) {
  const common = SIZE_GROUPS.find((g) => g.id === group)?.common;
  if (!common || rows.length === 0) return rows[0]?.label || "";
  return rows.find((r) => r.length === common[0] && r.width === common[1])?.label || rows[0].label;
}

function readableSize(label: string) {
  return label.replace(/^(Single|Double|Queen|King)\s*/, "").replace(/ in$/, " inches");
}

export default function SleepQuiz({ products, initialConcern = "" }: { products: Mattress[]; initialConcern?: string }) {
  const router = useRouter();
  const { addItem, hydrated, count } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [group, setGroup] = useState("Queen");
  const [sizeChoice, setSizeChoice] = useState("");
  const [heightChoice, setHeightChoice] = useState("");
  const [upgrades, setUpgrades] = useState<Record<string, string>>({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [guideProblem, setGuideProblem] = useState("");
  const [campaignConcern, setCampaignConcern] = useState("");
  const campaign = Object.prototype.hasOwnProperty.call(CAMPAIGN_QUESTIONS, initialConcern) ? initialConcern : "";
  const journey = campaign ? [CAMPAIGN_QUESTIONS[campaign], {...QUESTIONS[1], title: CAMPAIGN_POSITION[campaign]}, ...QUESTIONS.slice(2)] : QUESTIONS;
  const finished = step >= QUESTIONS.length;

  // Existing guide links explicitly select a concern. New ad links merely suggest it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const legacy = params.get("problem");
    const suggested = params.get("concern");
    const chosen = QUESTIONS[0].choices.find((c) => c.id === legacy);
    if (!campaign && suggested && QUESTIONS[0].choices.some((c) => c.id === suggested)) {
      setCampaignConcern(suggested);
    } else if (!campaign && chosen && ["firm", "sinking", "hot"].includes(legacy || "")) {
      setAnswers([chosen]);
      setGuideProblem(chosen.label);
      setStep(1);
      trackEvent("quiz_start", { label: "guide_entry" });
    }
  }, [campaign]);

  const ranked = useMemo(() => {
    const scores: Record<MatchKey, number> = { regular: 0, pro: 0, ultimate: 0 };
    for (const answer of answers) {
      for (const [key, points] of Object.entries(answer.score)) scores[key as MatchKey] += points || 0;
    }
    // No mutation of the incoming server catalogue.
    return [...products].sort((a, b) => scores[keyOf(b)] - scores[keyOf(a)]);
  }, [answers, products]);

  const best = ranked[0];
  const availableGroups = useMemo(() => SIZE_GROUPS.filter((g) =>
    best?.sizes.some((s) => (s as SizeRow).group === g.id || s.label === g.id || s.label.startsWith(`${g.id} `))
  ), [best]);
  const activeGroup = availableGroups.some((g) => g.id === group) ? group : (availableGroups[0]?.id || "");
  const groupSizes = useMemo(() => (best?.sizes as SizeRow[] || []).filter((s) =>
    s.group === activeGroup || s.label === activeGroup || s.label.startsWith(`${activeGroup} `)
  ), [best, activeGroup]);
  const size = groupSizes.some((s) => s.label === sizeChoice) ? sizeChoice : standardSize(groupSizes, activeGroup);
  const height = best?.heights.some((h) => h.label === heightChoice) ? heightChoice : best?.heights[0]?.label || "";
  const variant = (best?.options || []).map((o) => {
    const picked = upgrades[o.id];
    return o.choices.find((c) => c.label === picked)?.label || o.choices[0]?.label || "";
  }).filter(Boolean).join(" · ");
  const price = best && size && height
    ? (mattressPrice(best, size, height, variant) ?? (() => {
      const s = best.sizes.find((v) => v.label === size);
      const h = best.heights.find((v) => v.label === height);
      const extra = (best.options || []).reduce((n, o) => n + ((o.choices.find((c) => c.label === upgrades[o.id]) || o.choices[0])?.priceAdd || 0), 0);
      return best.basePrice + (s?.priceAdd || 0) + (h?.priceAdd || 0) + extra;
    })()) : null;

  useEffect(() => {
    if (finished && best) {
      trackEvent("quiz_complete", { productSlug: best.slug, label: "sleepmatch_v7" });
      trackEvent("quiz_result_view", { productSlug: best.slug, label: best.slug });
    }
  }, [finished, best, answers]);

  function choose(option: Option) {
    const next = [...answers.slice(0, step), option];
    setAnswers(next);
    if (step === 0) {
      setGuideProblem("");
      setCampaignConcern("");
      trackEvent("quiz_start", { label: "sleepmatch_v7" });
    }
    trackEvent("quiz_step", { label: String(step + 1) });
    setStep(step + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
    setGroup("Queen");
    setSizeChoice("");
    setHeightChoice("");
    setUpgrades({});
    setCheckingOut(false);
    setGuideProblem("");
    setCampaignConcern("");
  }

  function buyNow() {
    if (!best || !size || !height || price === null || !hydrated || checkingOut) return;
    setCheckingOut(true);
    addItem({
      id: `${best.slug}-${size}-${height}${variant ? `-${variant}` : ""}`,
      slug: best.slug,
      name: best.name,
      image: best.image,
      size,
      height,
      variant: variant || undefined,
      price,
      quantity: 1,
    }, { open: false });
    trackEvent("quiz_checkout_click", { productSlug: best.slug, value: price, label: `${size} ${height}` });
    router.push("/checkout");
  }

  if (!products.length) return <div className="sm-quiz sm-empty">Our mattress finder is temporarily unavailable. <Link href="/mattresses">Browse mattresses</Link>.</div>;

  if (finished && best) {
    const positioning = POSITION[keyOf(best)];
    const sizeIsReady = Boolean(size && height && price !== null);
    return (
      <div className="sm-quiz sm-result" aria-live="polite">
        <div className="sm-result-top">
          <span className="sm-result-heading">SLEEPMATCH / PERSONALISED RESULT</span>
          <button type="button" className="sm-text-button" onClick={reset}>Start over ↺</button>
        </div>
        <div className="sm-result-layout">
          <div className="sm-result-art">
            <div className="sm-result-photo"><ProductVisual image={best.image} layers={best.layers} alt={`${best.name} construction`} /></div>
            <span className="sm-result-stamp">MATCHED TO YOUR ANSWERS</span>
            <div className="sm-result-features">{positioning.check.map((t) => <span key={t}>{t}</span>)}</div>
          </div>
          <div className="sm-result-detail">
            <p className="sm-kicker">RECOMMENDED BASED ON YOUR ANSWERS</p>
            <h2 className="sm-result-name">{best.name}</h2>
            <p className="sm-result-tag">{positioning.tagline}</p>
            <p className="sm-result-why">{positioning.angle}</p>
            <div className="sm-why-box">
              <b>What we considered</b>
              <ul>{answers.filter((a) => a.why).slice(0, 3).map((a, i) => <li key={`${a.label}-${i}`}>{a.why}</li>)}</ul>
            </div>
            <div className="sm-v6-insight"><strong>What you gain. What you trade off.</strong>{positioning.tradeoff}</div>
            {answers[0]?.insight && <p className="sm-config-note">{answers[0].insight}</p>}
            <p className="sm-config-note">This is the closest match across your answers, not a medical assessment or a guarantee. If a specific concern matters more than the others, compare the alternative below before buying.</p>
            <div className="sm-config" aria-labelledby="sm-config-title">
              <div className="sm-config-head"><h3 id="sm-config-title">Make it yours</h3><Link href="/size-guide" target="_blank" rel="noopener noreferrer">Measure your bed ↗</Link></div>
              <p className="sm-config-note">Pick your bed size and thickness. Price updates instantly.</p>
              <div className="sm-size-groups" role="group" aria-label="Mattress size family">
                {availableGroups.map((g) => <button key={g.id} type="button" className={activeGroup === g.id ? "sm-size-chip is-active" : "sm-size-chip"} aria-pressed={activeGroup === g.id} onClick={() => { setGroup(g.id); setSizeChoice(""); }}>{g.id}</button>)}
              </div>
              <div className="sm-fields">
                <label>Exact dimensions
                  <select value={size} onChange={(e: { target: { value: string } }) => setSizeChoice(e.target.value)}>
                    {groupSizes.map((s) => <option key={s.label} value={s.label}>{readableSize(s.label)}</option>)}
                  </select>
                </label>
                <label>Thickness
                  <select value={height} onChange={(e: { target: { value: string } }) => setHeightChoice(e.target.value)}>
                    {best.heights.map((h) => <option value={h.label} key={h.label}>{h.label}</option>)}
                  </select>
                </label>
              </div>
              {(best.options || []).map((opt) => (
                <label className="sm-upgrade" key={opt.id}>{opt.label}
                  <select value={upgrades[opt.id] && opt.choices.some((c) => c.label === upgrades[opt.id]) ? upgrades[opt.id] : (opt.choices[0]?.label || "")}
                    onChange={(e: { target: { value: string } }) => setUpgrades((prev) => ({ ...prev, [opt.id]: e.target.value }))}>
                    {opt.choices.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                  </select>
                </label>
              ))}
              <div className="sm-purchase">
                <div><span>Price for your configuration</span><strong>{sizeIsReady ? money(price!) : "Choose your size"}</strong><small>GST included · Delivery allowance included</small></div>
                <button className="sm-buy" type="button" disabled={!sizeIsReady || !hydrated || checkingOut} onClick={buyNow}>
                  {checkingOut ? "Opening checkout…" : "Continue to checkout"}<span aria-hidden="true">↗</span>
                </button>
              </div>
              {count > 0 && <p className="sm-cart-notice">You already have {count} item{count > 1 ? "s" : ""} in your cart. This match will be added to your existing checkout.</p>}
              <p className="sm-fineprint">Your delivery PIN will be checked at checkout. Currently serving eligible PIN codes in Assam and Meghalaya. <Link href="/policies/trial">Read the 100-night trial terms.</Link></p>
            </div>
            <SleepMatchLeadCapture product={best.name} concern={answers[0]?.label || ""} size={size} height={height} price={price ?? 0} />
            <div className="sm-result-links"><Link href={`/mattresses/${best.slug}?variant=true`}>Product details and custom sizes →</Link>{ranked[1] && <Link href={`/mattresses/${ranked[1].slug}`}>Compare with {ranked[1].name} ↗</Link>}</div>
          </div>
        </div>
      </div>
    );
  }

  const question = journey[step];
  return (
    <div className="sm-quiz sm-v6-question" aria-live="polite">
      <div className="sm-quiz-head">
        <span className="sm-quiz-brand">SLEEPMATCH <span className="sm-quiz-detail">/ FOUR QUESTIONS</span></span>
        <span className="sm-step-count">{String(step + 1).padStart(2, "0")} <span>/ {String(QUESTIONS.length).padStart(2, "0")}</span></span>
      </div>
      <div className="sm-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step}><span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} /></div>
      {guideProblem && step === 1 && <p className="sm-guide-context">Your starting problem: <strong>{guideProblem}</strong>. <button type="button" onClick={() => setStep(0)}>Change</button></p>}
      {step === 0 && campaignConcern && <p className="sm-v6-insight">Came here for a particular concern? We highlighted it below. Pick it or choose something else.</p>}
      {step === 1 && answers[0]?.insight && <div className="sm-v6-insight"><strong>Why we ask</strong>{answers[0].insight}</div>}
      <p className="sm-kicker">{question.eyebrow}</p>
      <h2 className="sm-question-title">{question.title}</h2>
      <p className="sm-question-subtitle">{question.subtitle}</p>
      <MotionStage key={`${campaign}-${step}`} kind={step === 0 ? (campaign || "restless") : step === 1 ? "position" : step === 2 ? "feel" : "budget"}>
      <div className="sm-options" role="group" aria-label={question.title}>
        {question.choices.map((choice) => <button type="button" key={choice.label} className={step === 0 && campaignConcern && choice.id === campaignConcern ? "sm-option is-suggested" : "sm-option"} onClick={() => choose(choice)}>
          <QuizArt kind={choice.visual || choice.id || choice.symbol} />
          <span className="sm-option-copy"><strong>{choice.label}</strong><small>{choice.hint}</small></span>
          <span className="sm-option-arrow" aria-hidden="true">→</span>
        </button>)}
      </div>
      </MotionStage>
      <div className="sm-quiz-foot">
        {step > 0 ? <button className="sm-text-button" type="button" onClick={() => setStep((s) => s - 1)}>← Back</button> : <span>No account required</span>}
        {campaign ? <Link href="/sleep-quiz">Start with a different concern →</Link> : <span>Your result appears instantly</span>}
      </div>
    </div>
  );
}
