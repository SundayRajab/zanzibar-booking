import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 tracking-tight">
                Oceanora
              </span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Experience the pinnacle of luxury and authentic Zanzibari hospitality. 
              We curate the finest stays, transport, and adventures tailored just for you.
            </p>
            <div className="flex items-center gap-4">
              {/* WhatsApp Concierge */}
              <a
                href="https://wa.me/255674020254"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full text-sm font-medium border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp Concierge
              </a>
            </div>
          </div>

           {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Discover</h3>
            <ul className="space-y-3">
              {["Hotels", "Apartments", "Cars", "Tours"].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {["Help Center", "Terms of Service", "Privacy Policy", "Contact Us"].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} Oceanora Booking. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            {['Twitter', 'Instagram', 'Facebook'].map(social => (
              <a key={social} href="#" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
                {social}
              </a>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
