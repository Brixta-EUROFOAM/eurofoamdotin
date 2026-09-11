"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/analytics?days=${days}`,
        { cache: "no-store" }
      );

      const body = await response.json();

      if (response.ok) {
        setData(body.analytics);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [days]);

  if (loading && !data) {
    return (
      <div className="border border-ink/10 bg-white p-10">
        Loading telemetry...
      </div>
    );
  }

  const analytics = data || {};

  const cards = [
    [analytics.sessions || 0, "TOTAL VISITS"],
    [analytics.uniqueVisitors || 0, "UNIQUE VISITORS"],
    [analytics.totalPageViews || 0, "PAGE VIEWS"],
    [analytics.productViews || 0, "PRODUCT VIEWS"],
    [analytics.addToCart || 0, "ADD TO CART"],
    [analytics.checkoutStarts || 0, "CHECKOUT STARTS"],
    [analytics.guestVisitors || 0, "GUEST VISITORS"],
    [analytics.accountVisitors || 0, "SIGNED-IN VISITORS"],
    [
      `${analytics.averageEngagementSeconds || 0}s`,
      "AVG ENGAGEMENT"
    ]
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-gold-dark">
            SITE TELEMETRY
          </p>

          <h1 className="mt-3 font-display text-5xl">
            Store intelligence.
          </h1>

          <p className="mt-4 text-sm text-ink/55">
            First-party traffic, anonymous sessions,
            product interest and shopping behaviour.
          </p>
        </div>

        <div className="flex gap-2">
          {[1, 7, 30, 90].map((value) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={`rounded-full px-4 py-2 text-xs font-black ${
                days === value
                  ? "bg-ink text-white"
                  : "border border-ink/10 bg-white"
              }`}
            >
              {value === 1 ? "24H" : `${value}D`}
            </button>
          ))}

          <button
            onClick={() => void load()}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-black"
          >
            REFRESH
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([value, label]) => (
          <div
            key={String(label)}
            className="border border-ink/10 bg-white p-6"
          >
            <div className="text-4xl font-semibold tracking-[-0.04em]">
              {value}
            </div>

            <div className="mt-3 text-[10px] font-black uppercase tracking-[0.15em] text-ink/40">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Ranking
          title="Most viewed products"
          rows={analytics.topProducts || []}
        />

        <Ranking
          title="Most viewed pages"
          rows={analytics.topPages || []}
        />

        <Ranking
          title="Traffic sources"
          rows={analytics.referrers || []}
        />

        <Ranking
          title="Devices"
          rows={analytics.devices || []}
        />
      </div>
    </div>
  );
}

function Ranking({
  title,
  rows
}: {
  title: string;
  rows: {
    name: string;
    count: number;
  }[];
}) {
  const max = Math.max(
    ...rows.map((row) => row.count),
    1
  );

  return (
    <section className="border border-ink/10 bg-white p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <div className="mt-6 space-y-4">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.name}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate text-ink/60">
                  {row.name}
                </span>

                <strong>{row.count}</strong>
              </div>

              <div className="mt-2 h-1 bg-ink/10">
                <div
                  className="h-full bg-ink"
                  style={{
                    width: `${(row.count / max) * 100}%`
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink/40">
            No data yet.
          </p>
        )}
      </div>
    </section>
  );
}
