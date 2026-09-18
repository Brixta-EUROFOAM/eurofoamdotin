import DevanagariWordmark from "@/components/DevanagariWordmark";

export default function TypeLabPage() {
  return (
    <main className="min-h-screen bg-[#F3ECDD] p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF6500]">
            Type Lab
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em] text-[#111111] md:text-7xl">
            Devanagari-inspired English Wordmark
          </h1>

          <p className="max-w-3xl text-sm leading-7 text-black/60 md:text-base">
            English letters styled to feel like Devanagari Hindi script:
            shirorekha top line, elegant curves, sharp calligraphic flavor,
            solid vector-like presentation.
          </p>
        </div>

        <DevanagariWordmark
          text="GADDA"
          background="#FF6500"
          size="xl"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <DevanagariWordmark
            text="GADDA"
            background="#111111"
            color="#F3ECDD"
            size="lg"
          />

          <DevanagariWordmark
            text="GADDA"
            background="#F3ECDD"
            color="#111111"
            size="lg"
          />
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF6500]">
            Usage
          </p>

          <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#111111] p-5 text-sm text-[#F3ECDD]">
{`import DevanagariWordmark from "@/components/DevanagariWordmark";

<DevanagariWordmark
  text="GADDA"
  background="#FF6500"
  size="xl"
/>`}
          </pre>

          <p className="mt-5 text-sm leading-6 text-black/60">
            Optional licensed font file:
            <code className="ml-2 rounded bg-black/5 px-2 py-1 text-black">
              public/fonts/Samarkan.woff2
            </code>
          </p>
        </section>

      </div>
    </main>
  );
}
