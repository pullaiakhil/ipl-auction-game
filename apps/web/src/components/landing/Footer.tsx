import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-[#020010] border-t border-white/[0.04] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
                <span className="text-black font-black text-sm">IPL</span>
              </div>
              <span className="text-white font-bold text-lg">AUCTION<span className="text-amber-400">.</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              The most immersive IPL auction simulator. Build your dream team, compete with friends, and experience cricket like never before.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Game</h4>
            <ul className="space-y-3">
              {['Quick Auction', 'Mega Auction', 'Career Mode', 'Multiplayer', 'AI Challenge'].map(link => (
                <li key={link}>
                  <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-3">
              {['Players Database', 'Teams', 'Analytics', 'Leaderboard', 'Blog'].map(link => (
                <li key={link}>
                  <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-3">
              {['About', 'Privacy Policy', 'Terms of Service', 'Contact', 'Support'].map(link => (
                <li key={link}>
                  <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} IPL Auction Simulator. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">
            This is a fan-made simulator and is not affiliated with BCCI, IPL, or any cricket organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
