import Image from "next/image";

export default function EurofoamPage() {
  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      
      <main className="max-w-4xl w-full space-y-12">
        
        {/* Brand & Logo */}
        <div className="flex flex-col items-center space-y-6 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-border">
            <Image
              src="/eurofoam-logo.png"
              alt="Eurofoam Logo"
              width={280}
              height={160}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-wide text-center">
            Eurofoam PU Foam & Mattress
          </h1>
        </div>

        {/* E-Commerce Highlight */}
        <div className="text-white rounded-2xl p-10 text-center shadow-xl border-4 border-white">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-6">
            Exciting News!
          </h2>
          
          <div className="bg-amber-900 text-xl rounded-4xl md:text-2xl font-bold flex flex-col md:flex-row items-center justify-center gap-5 mt-8">
            <span>We have launched our e-commerce at</span>
            
            {/* Stitched Fabric Patch Button */}
            <a
              href="https://gadda.store"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center bg-[#EF7C00] text-black font-medium text-2xl md:text-3xl py-3 px-8 rounded-2xl -rotate-3 hover:-rotate-1 hover:scale-105 transition-all duration-300 shadow-lg animate-pulse hover:animate-none"
              style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", letterSpacing: "0.02em" }}
            >
              {/* White stitching lines (Top and Bottom) */}
              <div className="absolute inset-1 border-y-2 border-dashed border-white/80 rounded-xl pointer-events-none opacity-90 mix-blend-overlay"></div>
              
              <span className="relative z-10">gadda.store</span>
            </a>
          </div>
        </div>

        {/* About Section */}
        <section className="bg-card text-card-foreground rounded-2xl p-8 shadow-md border border-border">
          <p className="text-lg leading-relaxed text-center">
            <strong className="text-amber-500 font-semibold">Eurofoam</strong> is one of the best mattress brands in India, producing premium quality polyurethane foam mattresses. We deal in HD foam, PU foam, HR foam, Spring Mattresses, Foam Mattresses and many more.
          </p>
        </section>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Legal & Addresses */}
          <section className="bg-card text-card-foreground rounded-2xl p-8 shadow-md border border-border space-y-4">
            <h3 className="text-xl font-bold text-amber-500 mb-4 border-b border-border pb-3">Corporate Info</h3>
            <div className="space-y-3">
              <p><strong className="text-muted-foreground">Legal Name:</strong><br /> Umadutt Industries</p>
              <p><strong className="text-muted-foreground">Office Address:</strong><br /> 6th floor, Monal Tower, GS Rd, Swaraj Nagar, Sarumotoria, Guwahati, Assam 781036</p>
              <p><strong className="text-muted-foreground">Factory Address:</strong><br /> 2VV8+7PF Byrnihat, Meghalaya</p>
            </div>
          </section>

          {/* Contact Info */}
          <section className="bg-card text-card-foreground rounded-2xl p-8 shadow-md border border-border space-y-4">
            <h3 className="text-xl font-bold text-amber-500 mb-4 border-b border-border pb-3">Contact Details</h3>
            <div className="space-y-3">
              <p><strong className="text-muted-foreground">Director:</strong><br /> Soni Jhunjhunwala</p>
              <p><strong className="text-muted-foreground">Phone:</strong><br /> <a href="tel:07099017853" className="hover:text-amber-500 transition-colors">07099017853</a></p>
              <div className="flex flex-col">
                <strong className="text-muted-foreground mb-1">Email:</strong>
                <a href="mailto:eurofoammail890@gmail.com" className="hover:text-amber-500 transition-colors">eurofoammail890@gmail.com</a>
                <a href="mailto:director@eurofoam.in" className="hover:text-amber-500 transition-colors">director@eurofoam.in</a>
              </div>
            </div>
          </section>
        </div>

        {/* Factory Map */}
        <section className="bg-card text-card-foreground rounded-2xl p-8 shadow-md border border-border flex flex-col items-center mb-12">
          <h3 className="text-xl font-bold text-amber-500 mb-6 self-start">Factory Location (Byrnihat)</h3>
          
          <div className="w-full h-96 rounded-xl overflow-hidden border border-border bg-muted relative flex items-center justify-center">
            <iframe
              title="Eurofoam Factory Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src="https://www.openstreetmap.org/export/embed.html?bbox=91.805%2C25.995%2C91.955%2C26.145&layer=mapnik"
              className="absolute inset-0 w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 z-0"
            ></iframe>
            
            <div className="z-10 pointer-events-none text-red-600 pb-10 drop-shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between w-full">
            <span>2VV8+7PF Byrnihat, Meghalaya</span>
            <a 
              href="https://www.openstreetmap.org/?mlat=26.07&mlon=91.88#map=13/26.07/91.88" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 hover:underline"
            >
              View Larger Map
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}