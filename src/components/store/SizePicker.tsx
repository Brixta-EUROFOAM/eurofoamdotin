"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { money, type Mattress } from "@/lib/catalog";
import {
  SIZE_GROUPS,
  customCheck,
  customLabel,
  customPrice,
  groupsOf,
  parseCustom,
  toCm,
  type SizeRow,
  type Sizing,
} from "@/lib/sizes";
import MeasureGuide from "@/components/store/MeasureGuide";

export type SizeChoice = { size: string; height: string; sizeAdd: number };

/*
  "Choose your size" sheet (opens from the product page, or straight away
  with ?variant=true). Group → exact dimension → thickness, or Custom.
*/
export default function SizePicker({
  mattress,
  sizing,
  open,
  initial,
  startGroup,
  onClose,
  onConfirm,
  optionsAdd,
}: {
  mattress: Mattress;
  sizing: Sizing;
  open: boolean;
  initial: { size: string; height: string };
  startGroup?: string;
  onClose: () => void;
  onConfirm: (c: SizeChoice) => void;
  optionsAdd: number;
}) {
  const rows = mattress.sizes as SizeRow[];
  const groups = useMemo(() => groupsOf(rows), [rows]);
  const initialCustom = parseCustom(initial.size);
  const initialRow = rows.find((r) => r.label === initial.size);

  const [group, setGroup] = useState<string>(initialCustom ? "Custom" : initialRow?.group || groups[0]?.id || "");
  const [size, setSize] = useState(initialRow?.label || "");
  const [height, setHeight] = useState(initial.height);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [len, setLen] = useState(initialCustom ? String(initialCustom.length) : "");
  const [wid, setWid] = useState(initialCustom ? String(initialCustom.width) : "");
  const [guide, setGuide] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (startGroup) {
      setGroup(startGroup);
      const first = groups.find((g) => g.id === startGroup)?.rows;
      if (first?.length && !first.some((r) => r.label === size)) setSize(pickCommon(startGroup, first).label);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => dialog.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startGroup]);

  const heightAdd = mattress.heights.find((h) => h.label === height)?.priceAdd || 0;
  const priceOf = (sizeAdd: number) => mattress.basePrice + sizeAdd + heightAdd + optionsAdd;

  // custom
  const toIn = (v: string) => {
    const n = Number(v);
    if (!v || !Number.isFinite(n)) return NaN;
    return unit === "cm" ? Math.round((n / 2.54) * 2) / 2 : n;
  };
  const cl = toIn(len);
  const cw = toIn(wid);
  const customErr = len || wid ? customCheck(cl, cw, sizing) : null;
  const custom = !customErr && len && wid ? customPrice(rows, cl, cw, sizing) : null;

  const isCustom = group === "Custom";
  const chosen = isCustom
    ? custom
      ? { size: customLabel(cl, cw), sizeAdd: custom.priceAdd }
      : null
    : (() => {
        const r = rows.find((x) => x.label === size && (x.group || x.label.split(" ")[0]) === group);
        return r ? { size: r.label, sizeAdd: r.priceAdd } : null;
      })();

  if (!open) return null;

  const groupRows = groups.find((g) => g.id === group)?.rows || [];
  const info = SIZE_GROUPS.find((g) => g.id === group);
  const show = (inch?: number) => (inch ? (unit === "in" ? `${inch}` : `${toCm(inch)}`) : "");

  return (
    <div className="g-sp-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="g-sp" role="dialog" aria-modal="true" aria-labelledby="sp-title" tabIndex={-1} ref={dialog}>
        <header className="g-sp-head">
          <h2 id="sp-title">Choose your size</h2>
          <button type="button" className="g-sp-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="g-sp-body">
          <div className="g-sp-product">
            {mattress.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mattress.image} alt="" />
            ) : null}
            <div>
              <b>{mattress.name}</b>
              <span>{mattress.firmness} feel</span>
            </div>
          </div>

          <button type="button" className="g-sp-measure" aria-expanded={guide} onClick={() => setGuide((v) => !v)}>
            <span aria-hidden="true">📏</span>
            {guide ? "Hide the measuring guide" : "40 seconds of measuring saves you from ordering the wrong size"}
          </button>
          {guide ? <MeasureGuide sizing={sizing} compact /> : null}

          <div className="g-sp-label">
            <h3>Size group</h3>
            <div className="g-sp-unit" role="group" aria-label="Units">
              <button type="button" aria-pressed={unit === "in"} onClick={() => setUnit("in")}>
                inch
              </button>
              <button type="button" aria-pressed={unit === "cm"} onClick={() => setUnit("cm")}>
                cm
              </button>
            </div>
          </div>
          <div className="g-sp-groups" role="tablist">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={group === g.id}
                onClick={() => {
                  setGroup(g.id);
                  if (!g.rows.some((r) => r.label === size)) setSize(pickCommon(g.id, g.rows).label);
                }}
              >
                {g.id}
                <small>from {money(priceOf(Math.min(...g.rows.map((r) => r.priceAdd))))}</small>
              </button>
            ))}
            {sizing.customEnabled ? (
              <button type="button" role="tab" aria-selected={isCustom} onClick={() => setGroup("Custom")} className="g-sp-custom">
                <em>Order any size</em>
                Custom
              </button>
            ) : null}
          </div>

          {!isCustom ? (
            <>
              {info ? <p className="g-sp-fits">{info.fits}</p> : null}
              <h3 className="g-sp-h">
                Dimension <span>(length × breadth, in {unit === "in" ? "inches" : "cm"})</span>
              </h3>
              <div className="g-sp-dims" role="radiogroup" aria-label="Dimension">
                {groupRows.map((r) => {
                  const common = info && r.length === info.common[0] && r.width === info.common[1];
                  return (
                    <button key={r.label} type="button" role="radio" aria-checked={size === r.label} onClick={() => setSize(r.label)}>
                      {common ? <em>Most common</em> : null}
                      <b>
                        {r.length ? `${show(r.length)} × ${show(r.width)}` : r.label}
                      </b>
                      <small>{money(priceOf(r.priceAdd))}</small>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="g-sp-fits">
                Odd-sized bed? We cut it to your measurements. Priced as the next standard size up
                {sizing.customFee ? ` + ${money(sizing.customFee)} for the custom cut` : ""}. It&apos;s cut just for you, so
                measure twice.
              </p>
              <h3 className="g-sp-h">
                Dimension <span>(in {unit === "in" ? "inches" : "cm"})</span>
              </h3>
              <div className="g-sp-custom-in">
                <label>
                  <span>Length</span>
                  <input
                    inputMode="decimal"
                    placeholder={`Enter length${unit === "in" ? ` (${sizing.minLength}–${sizing.maxLength})` : ""}`}
                    value={len}
                    onChange={(e) => setLen(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
                  />
                </label>
                <span aria-hidden="true">×</span>
                <label>
                  <span>Breadth</span>
                  <input
                    inputMode="decimal"
                    placeholder={`Enter breadth${unit === "in" ? ` (${sizing.minWidth}–${sizing.maxWidth})` : ""}`}
                    value={wid}
                    onChange={(e) => setWid(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))}
                  />
                </label>
              </div>
              {customErr ? (
                <p className="g-error" role="alert" style={{ margin: "10px 0 0" }}>
                  {customErr}
                </p>
              ) : custom ? (
                <p className="g-sp-ok">
                  {cl} × {cw} in{unit === "cm" ? ` (rounded to the nearest ½ inch)` : ""} ·{" "}
                  <b>{money(priceOf(custom.priceAdd))}</b>
                  <span>
                    Priced as {custom.from.label}
                    {sizing.customFee ? ` + ${money(sizing.customFee)} custom cut` : ""}
                  </span>
                </p>
              ) : null}
            </>
          )}

          {mattress.heights.length > 1 ? (
            <>
              <h3 className="g-sp-h">Thickness</h3>
              <div className="g-sp-dims g-sp-dims--h" role="radiogroup" aria-label="Thickness">
                {mattress.heights.map((h) => (
                  <button key={h.label} type="button" role="radio" aria-checked={height === h.label} onClick={() => setHeight(h.label)}>
                    <b>{h.label}</b>
                    <small>{h.priceAdd ? `+ ${money(h.priceAdd)}` : "Standard"}</small>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <p className="g-sp-note">
            {sizing.fitNote}{" "}
            <Link href="/size-guide" className="g-link" target="_blank">
              Full size guide
            </Link>
          </p>
        </div>

        <footer className="g-sp-foot">
          <div>
            <b>{chosen ? money(priceOf(chosen.sizeAdd)) : "—"}</b>
            <span>{chosen ? `${chosen.size.replace(/ in$/, '"')} · ${height}` : isCustom ? "Enter your size" : "Pick a dimension"}</span>
          </div>
          <button
            type="button"
            className="g-btn g-btn--orange"
            disabled={!chosen}
            onClick={() => chosen && onConfirm({ size: chosen.size, height, sizeAdd: chosen.sizeAdd })}
          >
            Confirm size
          </button>
        </footer>
      </div>
    </div>
  );
}

function pickCommon(group: string, rows: SizeRow[]) {
  const c = SIZE_GROUPS.find((g) => g.id === group)?.common;
  return (c && rows.find((r) => r.length === c[0] && r.width === c[1])) || rows[0];
}
