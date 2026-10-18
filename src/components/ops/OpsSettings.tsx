"use client";

import { useState } from "react";
import type { Dept, OpsConfigInput, Stage, StaffInput } from "@/lib/ops";

type Report = {
  id: string;
  label: string;
  dept: string;
  tatHours: number;
  active: number;
  overdue: number;
  avgHours: number | null;
  onTime: number | null;
  samples: number;
}[];

const COLORS = ["#3a4fd6", "#e8590c", "#8a6d1f", "#1f7a4d", "#9c36b5", "#c92a2a", "#0b7285", "#495057"];

function move<T>(list: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function OpsSettings({ initial, report }: { initial: OpsConfigInput; report: Report }) {
  const [c, setC] = useState<OpsConfigInput>(initial);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "err"; msg?: string }>({ kind: "idle" });
  const dirty = JSON.stringify(c) !== JSON.stringify(initial);

  const set = (next: Partial<OpsConfigInput>) => {
    setStatus({ kind: "idle" });
    setC((prev) => ({ ...prev, ...next }));
  };
  const setDept = (i: number, d: Partial<Dept>) => set({ depts: c.depts.map((x, j) => (j === i ? { ...x, ...d } : x)) });
  const setStage = (i: number, s: Partial<Stage>) => set({ stages: c.stages.map((x, j) => (j === i ? { ...x, ...s } : x)) });
  const setStaff = (i: number, s: Partial<StaffInput>) => set({ staff: c.staff.map((x, j) => (j === i ? { ...x, ...s } : x)) });
  const deptName = (id: string) => c.depts.find((d) => d.id === id)?.name || id;
  const deptColor = (id: string) => c.depts.find((d) => d.id === id)?.color || "#555";

  async function save() {
    setStatus({ kind: "saving" });
    const res = await fetch("/api/admin/ops", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) {
      setC(data);
      setStatus({ kind: "ok", msg: "Saved. The board and order tracking use this now." });
      setTimeout(() => window.location.reload(), 900);
    } else {
      setStatus({ kind: "err", msg: data?.error || "Couldn't save." });
    }
  }

  const totalTat = c.stages.slice(0, -1).reduce((n, s) => n + (Number(s.tatHours) || 0), 0);

  return (
    <div className="ops-set">
      <div className="ops-bar">
        <b>Operations</b>
        <span style={{ opacity: 0.7, fontSize: ".85rem" }}>
          Order to doorstep: {totalTat}h ≈ {Math.ceil(totalTat / 24)} days
        </span>
        <span className="op-sp" />
        {status.msg ? (
          <span style={{ fontWeight: 700, color: status.kind === "err" ? "#ffb4a6" : "#b7f0cd" }}>{status.msg}</span>
        ) : dirty ? (
          <span style={{ fontWeight: 700 }}>Unsaved changes</span>
        ) : null}
        <button type="button" onClick={save} disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Saving…" : "Save"}
        </button>
      </div>

      {/* REPORT */}
      <section className="ops-sec">
        <header>
          <h2>Turnaround right now</h2>
          <p>Live orders in each stage, how many are past their TAT, and how long each stage really took on recent orders.</p>
        </header>
        <div className="ops-scroll">
          <table className="ops-report">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Department</th>
                <th className="n">TAT</th>
                <th className="n">Orders here</th>
                <th className="n">Late</th>
                <th className="n">Avg actual</th>
                <th className="n">On time</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.label}</b>
                  </td>
                  <td>
                    <span style={{ color: deptColor(r.dept), fontWeight: 800 }}>●</span> {deptName(r.dept)}
                  </td>
                  <td className="n">{r.tatHours ? `${r.tatHours}h` : "—"}</td>
                  <td className="n">{r.active}</td>
                  <td className={`n ${r.overdue ? "bad" : ""}`}>{r.overdue}</td>
                  <td className={`n ${r.avgHours !== null && r.tatHours && r.avgHours > r.tatHours ? "bad" : ""}`}>
                    {r.avgHours === null ? "—" : `${r.avgHours < 10 ? r.avgHours.toFixed(1) : Math.round(r.avgHours)}h`}
                  </td>
                  <td className={`n ${r.onTime === null ? "" : r.onTime >= 0.9 ? "good" : r.onTime < 0.7 ? "bad" : ""}`}>
                    {r.onTime === null ? "—" : `${Math.round(r.onTime * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* STAGES */}
      <section className="ops-sec">
        <header>
          <h2>Order stages</h2>
          <p>
            Every order goes top to bottom. Each stage belongs to one department, which moves it on with “Done”. The customer
            sees the “customer label” on Track order, with an expected date worked out from the TATs.
          </p>
        </header>
        <div className="ops-flow" aria-label="Flow preview">
          {c.stages.map((s, i) => (
            <span key={i} style={{ display: "contents" }}>
              {i ? <em>→</em> : null}
              <span style={{ background: deptColor(s.dept) }}>{s.label || "…"}</span>
            </span>
          ))}
        </div>
        <div className="ops-rows">
          {c.stages.map((s, i) => (
            <div className="ops-row ops-row--stage" key={i}>
              <span className="ops-num">{i + 1}</span>
              <label>
                Stage (staff see)
                <input type="text" value={s.label} maxLength={50} onChange={(e) => setStage(i, { label: e.target.value })} />
              </label>
              <label>
                Department
                <select value={s.dept} onChange={(e) => setStage(i, { dept: e.target.value })}>
                  {c.depts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                TAT hours
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={s.tatHours}
                  onChange={(e) => setStage(i, { tatHours: Number(e.target.value) })}
                />
              </label>
              <label>
                Customer label
                <input
                  type="text"
                  value={s.customerLabel}
                  maxLength={50}
                  onChange={(e) => setStage(i, { customerLabel: e.target.value })}
                />
              </label>
              <label className="ops-check">
                <input type="checkbox" checked={s.showCustomer} onChange={(e) => setStage(i, { showCustomer: e.target.checked })} />
                Customer sees
              </label>
              <div className="ops-tools">
                <button type="button" className="ops-ic" disabled={!i} onClick={() => set({ stages: move(c.stages, i, -1) })} aria-label="Up">
                  ↑
                </button>
                <button
                  type="button"
                  className="ops-ic"
                  disabled={i === c.stages.length - 1}
                  onClick={() => set({ stages: move(c.stages, i, 1) })}
                  aria-label="Down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="ops-ic ops-ic--x"
                  aria-label="Remove stage"
                  onClick={() => {
                    if (confirm(`Remove stage "${s.label}"? Orders sitting in it will show as unknown until moved.`))
                      set({ stages: c.stages.filter((_, j) => j !== i) });
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="ops-add"
          onClick={() => {
            const stages = [...c.stages];
            stages.splice(Math.max(0, stages.length - 1), 0, {
              id: "",
              label: "New stage",
              dept: c.depts[0]?.id || "",
              tatHours: 24,
              customerLabel: "In progress",
              showCustomer: false,
            });
            set({ stages });
          }}
        >
          + Add stage (before the last)
        </button>
      </section>

      {/* DEPARTMENTS */}
      <section className="ops-sec">
        <header>
          <h2>Departments</h2>
          <p>Add any team: factory, warehouse, logistics, quality, installation… Each one gets its own view on the board.</p>
        </header>
        <div className="ops-rows">
          {c.depts.map((d, i) => (
            <div className="ops-row ops-row--dept" key={i}>
              <label>
                Name
                <input type="text" value={d.name} maxLength={40} onChange={(e) => setDept(i, { name: e.target.value })} />
              </label>
              <label>
                Colour
                <input type="color" value={d.color} onChange={(e) => setDept(i, { color: e.target.value })} />
              </label>
              <div className="ops-tools">
                <button
                  type="button"
                  className="ops-ic ops-ic--x"
                  aria-label="Remove department"
                  disabled={c.depts.length < 2 || c.stages.some((s) => s.dept === d.id)}
                  title={c.stages.some((s) => s.dept === d.id) ? "Move its stages to another department first" : ""}
                  onClick={() => set({ depts: c.depts.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="ops-add"
          onClick={() => {
            const n = c.depts.length;
            set({ depts: [...c.depts, { id: `dept-${Date.now().toString(36)}`, name: "New department", color: COLORS[n % COLORS.length] }] });
          }}
        >
          + Add department
        </button>
      </section>

      {/* STAFF */}
      <section className="ops-sec">
        <header>
          <h2>Floor staff</h2>
          <p>
            People who use the board at <b>{typeof window === "undefined" ? "" : window.location.host}/ops</b> on their phone. They sign
            in with their name and PIN and only see their departments’ orders. Admins see everything.
          </p>
        </header>
        <div className="ops-rows">
          {c.staff.map((s, i) => (
            <div className="ops-row ops-row--staff" key={s.id || i}>
              <label>
                Name
                <input type="text" value={s.name} maxLength={40} onChange={(e) => setStaff(i, { name: e.target.value })} />
              </label>
              <label className="ops-wide">
                Departments
                <span className="ops-depts">
                  {c.depts.map((d) => (
                    <span key={d.id} className="ops-check">
                      <input
                        type="checkbox"
                        checked={s.depts.includes(d.id)}
                        onChange={(e) =>
                          setStaff(i, { depts: e.target.checked ? [...s.depts, d.id] : s.depts.filter((x) => x !== d.id) })
                        }
                      />
                      {d.name}
                    </span>
                  ))}
                </span>
              </label>
              <label>
                {s.hasPin ? "New PIN (optional)" : "PIN (4–8 digits)"}
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder={s.hasPin ? "•••• keep" : ""}
                  value={s.pin || ""}
                  onChange={(e) => setStaff(i, { pin: e.target.value.replace(/\D/g, "") })}
                />
              </label>
              <label className="ops-check">
                <input type="checkbox" checked={s.active} onChange={(e) => setStaff(i, { active: e.target.checked })} />
                Active
              </label>
              <div className="ops-tools">
                <button
                  type="button"
                  className="ops-ic ops-ic--x"
                  aria-label="Remove person"
                  onClick={() => {
                    if (confirm(`Remove ${s.name || "this person"}?`)) set({ staff: c.staff.filter((_, j) => j !== i) });
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="ops-add"
          onClick={() =>
            set({ staff: [...c.staff, { id: "", name: "", depts: c.depts[1] ? [c.depts[1].id] : [], active: true, pin: "" }] })
          }
        >
          + Add person
        </button>
      </section>
    </div>
  );
}
