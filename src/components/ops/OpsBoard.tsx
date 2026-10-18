"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Dept = { id: string; name: string; color: string };
type Stage = { id: string; label: string; dept: string; tatHours: number };
type Ev = { at: string; by: string; stage: string; event: string; note?: string };
type Card = {
  id: string;
  createdAt: string;
  status: string;
  customer: { name: string; phone: string; address: string; city: string; pincode: string };
  payment: string;
  total: number;
  notes?: string;
  lines: { name: string; size: string; height: string; variant?: string; quantity: number }[];
  history: Ev[];
  enteredAt: string;
  dueAt: string | null;
};
type Board = { me: { name: string; admin: boolean; depts: string[] }; depts: Dept[]; stages: Stage[]; orders: Card[] };

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function span(ms: number) {
  const h = Math.abs(ms) / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

function ago(iso: string) {
  return `${span(Date.now() - new Date(iso).getTime())} ago`;
}

export default function OpsBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("mine");
  const [phoneStage, setPhoneStage] = useState<string>("");
  const [busy, setBusy] = useState<string>("");
  const [toast, setToast] = useState("");
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/ops/board", { cache: "no-store" }).catch(() => null);
    if (res?.status === 401) {
      window.location.href = "/ops/login";
      return;
    }
    if (!res?.ok) {
      setError("Can't reach the server. Retrying…");
      return;
    }
    setError("");
    setBoard(await res.json());
  }, []);

  useEffect(() => {
    void load();
    const a = setInterval(load, 30_000);
    const b = setInterval(() => tick((n) => n + 1), 60_000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const deptOf = useMemo(() => new Map(board?.depts.map((d) => [d.id, d]) || []), [board]);

  const visibleStages = useMemo(() => {
    if (!board) return [];
    const mine = board.me.admin ? board.depts.map((d) => d.id) : board.me.depts;
    return board.stages.filter((s) => {
      if (filter === "all") return true;
      if (filter === "mine") return mine.includes(s.dept);
      return s.dept === filter;
    });
  }, [board, filter]);

  const byStage = useMemo(() => {
    const m = new Map<string, Card[]>();
    for (const o of board?.orders || []) m.set(o.status, [...(m.get(o.status) || []), o]);
    for (const list of m.values()) list.sort((a, b) => (a.dueAt || "9").localeCompare(b.dueAt || "9"));
    return m;
  }, [board]);

  const activePhone = visibleStages.find((s) => s.id === phoneStage)?.id || visibleStages[0]?.id;

  async function act(id: string, body: Record<string, unknown>, done: string) {
    setBusy(id);
    const res = await fetch("/api/ops/act", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy("");
    if (!res?.ok) {
      setToast(data?.error || "Couldn't save. Try again.");
      return;
    }
    setToast(done);
    void load();
  }

  if (!board) {
    return (
      <main className="op">
        <div className="op-top">
          <span className="op-brand">
            GADDA <small>OPS</small>
          </span>
        </div>
        <p style={{ padding: 24 }}>{error || "Loading orders…"}</p>
      </main>
    );
  }

  const { me, stages } = board;
  const deptChips = me.admin ? board.depts : board.depts.filter((d) => me.depts.includes(d.id));
  const count = (pred: (s: Stage) => boolean) =>
    stages.filter(pred).reduce((n, s) => n + (byStage.get(s.id)?.length || 0), 0);

  return (
    <main className="op">
      <div className="op-top">
        <span className="op-brand">
          GADDA <small>OPS</small>
        </span>
        <span className="op-me">
          {me.name}
          {me.admin ? " · admin" : ""}
        </span>
        <span className="op-sp" />
        {error ? <span className="op-err">{error}</span> : null}
        <button type="button" className="op-link" onClick={() => void load()}>
          Refresh
        </button>
        {me.admin ? <a href="/admin/ops">Settings</a> : null}
        {me.admin ? (
          <a href="/admin">Admin</a>
        ) : (
          <form action="/api/ops/logout" method="post" style={{ display: "inline" }}>
            <button className="op-link">Sign out</button>
          </form>
        )}
      </div>

      <div className="op-filters" role="toolbar" aria-label="Departments">
        {me.admin || me.depts.length > 1 ? (
          <button type="button" className="op-chip" aria-pressed={filter === "mine"} onClick={() => setFilter("mine")}>
            {me.admin ? "Everything" : "My work"}
          </button>
        ) : null}
        {deptChips.map((d) => (
          <button
            key={d.id}
            type="button"
            className="op-chip"
            aria-pressed={filter === d.id || (filter === "mine" && !me.admin && me.depts.length === 1)}
            onClick={() => setFilter(d.id)}
          >
            <i style={{ background: d.color }} />
            {d.name} <b>{count((s) => s.dept === d.id)}</b>
          </button>
        ))}
      </div>

      {/* phone: one stage at a time */}
      <div className="op-filters op-phone-only" role="tablist" aria-label="Stages">
        {visibleStages.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            className="op-chip"
            aria-pressed={s.id === activePhone}
            onClick={() => setPhoneStage(s.id)}
          >
            {s.label} <b>{byStage.get(s.id)?.length || 0}</b>
          </button>
        ))}
      </div>

      <div className="op-cols">
        {visibleStages.map((s) => {
          const list = byStage.get(s.id) || [];
          const dept = deptOf.get(s.dept);
          const idx = stages.findIndex((x) => x.id === s.id);
          const next = stages[idx + 1];
          return (
            <section
              key={s.id}
              className="op-col"
              data-stage={s.id}
              data-phone-hidden={s.id !== activePhone || undefined}
              style={{ ["--dept" as string]: dept?.color }}
            >
              <header className="op-colhead">
                <h2>{s.label}</h2>
                <span>
                  {dept?.name} · {s.tatHours ? `${s.tatHours}h TAT` : "no TAT"} · {list.length}
                </span>
              </header>
              {list.length ? (
                list.map((o) => {
                  const dueMs = o.dueAt ? new Date(o.dueAt).getTime() - Date.now() : null;
                  const late = dueMs !== null && dueMs < 0;
                  const soon = dueMs !== null && !late && dueMs < 3 * 3600_000;
                  const accepted = o.history.some((e) => e.event === "accepted" && e.stage === o.status && e.at >= o.enteredAt);
                  const lastNote = [...o.history].reverse().find((e) => e.note);
                  const last = o.history[o.history.length - 1];
                  return (
                    <article key={o.id} className="op-card" data-late={late || undefined}>
                      <div className="op-card-top">
                        <span className="op-id">{o.id}</span>
                        {dueMs !== null ? (
                          <span className="op-due" data-late={late || undefined} data-soon={soon || undefined}>
                            {late ? `Late ${span(dueMs)}` : `${span(dueMs)} left`}
                          </span>
                        ) : null}
                      </div>
                      <ul className="op-items">
                        {o.lines.map((l, i) => (
                          <li key={i}>
                            {l.quantity} × {l.name}{" "}
                            <span>
                              {l.size} · {l.height}
                              {l.variant ? ` · ${l.variant}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="op-meta">
                        <b>{o.customer.name}</b> · <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
                        <br />
                        {`${o.customer.address}, `}
                        {o.customer.city} {o.customer.pincode}
                        <br />
                        {o.payment === "upi_link" ? "UPI link" : "Pay on delivery"} · {rupees(o.total)} · in stage{" "}
                        {ago(o.enteredAt)}
                      </div>
                      {o.notes ? <div className="op-note">Customer: {o.notes}</div> : null}
                      {lastNote ? (
                        <div className="op-note">
                          {lastNote.by}: {lastNote.note}
                        </div>
                      ) : null}
                      {last ? (
                        <div className="op-last">
                          {last.event === "accepted" ? "Accepted" : last.event === "moved" ? "Moved here" : "Note"} by {last.by},{" "}
                          {ago(last.at)}
                        </div>
                      ) : null}
                      {o.status !== "cancelled" ? (
                        <div className="op-actions">
                          {next ? (
                            <button
                              type="button"
                              className="op-btn op-btn--go"
                              disabled={busy === o.id}
                              onClick={() => void act(o.id, { action: "advance" }, `${o.id} → ${next.label}`)}
                            >
                              Done → {next.label}
                            </button>
                          ) : null}
                          {!accepted && next ? (
                            <button
                              type="button"
                              className="op-btn op-btn--ok"
                              disabled={busy === o.id}
                              onClick={() => void act(o.id, { action: "accept" }, `Accepted ${o.id}`)}
                            >
                              Accept
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="op-btn"
                            disabled={busy === o.id}
                            onClick={() => {
                              const note = prompt(`Note on ${o.id} (everyone on the board sees it):`);
                              if (note?.trim()) void act(o.id, { action: "note", note }, "Note added");
                            }}
                          >
                            Note
                          </button>
                          {me.admin ? (
                            <>
                              <select
                                className="op-select"
                                aria-label="Move to stage"
                                value=""
                                onChange={(e) => {
                                  const to = stages.find((x) => x.id === e.target.value);
                                  if (to) void act(o.id, { action: "set", stage: to.id }, `${o.id} → ${to.label}`);
                                }}
                              >
                                <option value="">Move to…</option>
                                {stages
                                  .filter((x) => x.id !== o.status)
                                  .map((x) => (
                                    <option key={x.id} value={x.id}>
                                      {x.label}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                className="op-btn op-btn--danger"
                                disabled={busy === o.id}
                                onClick={() => {
                                  const why = prompt(`Cancel ${o.id}? Type a reason:`);
                                  if (why !== null) void act(o.id, { action: "cancel", note: why }, `${o.id} cancelled`);
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <div className="op-err">Cancelled</div>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="op-empty">Nothing here. </div>
              )}
            </section>
          );
        })}
      </div>

      {toast ? (
        <div className="op-toast" role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
