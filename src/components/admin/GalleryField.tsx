"use client";

import { useState } from "react";

/*
  All photos of a product. The first one is the MAIN image (shop cards,
  link previews, first photo on the product page); the rest form the gallery.
*/
export default function GalleryField({
  image,
  gallery,
  onChange,
}: {
  image: string;
  gallery?: string[];
  onChange: (next: { image: string; gallery: string[] }) => void;
}) {
  const photos = [image, ...(gallery || [])].filter(Boolean);
  const [busy, setBusy] = useState(0);
  const [url, setUrl] = useState("");

  const commit = (list: string[]) => {
    const clean = Array.from(new Set(list.filter(Boolean))).slice(0, 24);
    onChange({ image: clean[0] || "", gallery: clean.slice(1) });
  };

  async function uploadAll(files: FileList) {
    const added: string[] = [];
    setBusy(files.length);
    for (const file of Array.from(files).slice(0, 12)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form }).catch(() => null);
      const body = await res?.json().catch(() => ({}));
      if (res?.ok && body?.url) added.push(body.url);
      else alert(`${file.name}: ${body?.error || "upload failed"}`);
      setBusy((n) => n - 1);
    }
    setBusy(0);
    commit([...photos, ...added]);
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div className="grid gap-3">
      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((src, i) => (
            <figure
              key={src + i}
              className={`relative m-0 overflow-hidden rounded-xl border bg-white ${i === 0 ? "border-2 border-gold" : "border-ink/10"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-1 text-[10px] font-black text-ink">MAIN IMAGE</span>
              ) : null}
              <figcaption className="flex flex-wrap gap-1 p-2">
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => commit([src, ...photos.filter((_, k) => k !== i)])}
                    className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-black text-white"
                  >
                    MAKE MAIN
                  </button>
                ) : null}
                <button type="button" disabled={!i} onClick={() => move(i, -1)} className="rounded-full border border-ink/15 px-2 py-1 text-[11px] font-black disabled:opacity-30" aria-label="Move left">
                  ←
                </button>
                <button
                  type="button"
                  disabled={i === photos.length - 1}
                  onClick={() => move(i, 1)}
                  className="rounded-full border border-ink/15 px-2 py-1 text-[11px] font-black disabled:opacity-30"
                  aria-label="Move right"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => commit(photos.filter((_, k) => k !== i))}
                  className="ml-auto rounded-full border border-red-200 px-2 py-1 text-[11px] font-black text-red-700"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-ink/20 p-4 text-sm text-ink/55">No photos yet. Upload a few — the first becomes the main image.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-black text-white">
          {busy ? `UPLOADING ${busy}…` : "+ UPLOAD PHOTOS"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            multiple
            className="hidden"
            disabled={Boolean(busy)}
            onChange={(e) => {
              if (e.target.files?.length) void uploadAll(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="min-w-[220px] flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={!url.trim()}
          onClick={() => {
            commit([...photos, url.trim()]);
            setUrl("");
          }}
          className="rounded-full border border-ink/15 px-4 py-2 text-xs font-black disabled:opacity-40"
        >
          ADD URL
        </button>
      </div>
    </div>
  );
}
