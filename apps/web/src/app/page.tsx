import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { GameModesSection } from '@/components/landing/GameModesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'IPL Auction Simulator | Build Your Dream IPL Team',
  description: 'The most immersive IPL auction simulator ever built. Compete in real-time auctions, build your dream team, challenge AI opponents, and simulate full IPL seasons. Play free.',
  keywords: ['IPL', 'auction', 'cricket', 'simulator', 'fantasy', 'multiplayer', 'T20', 'Indian Premier League'],
  openGraph: {
    title: 'IPL Auction Simulator - The Ultimate Cricket Gaming Experience',
    description: 'Build your dream IPL team in the most advanced auction simulator. Real-time multiplayer, AI opponents, match simulation, and more.',
    type: 'website',
    siteName: 'IPL Auction Simulator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPL Auction Simulator',
    description: 'Build your dream IPL team in real-time auctions. Play free.',
  },
};

export default function LandingPage() {
  return (
    <main className="bg-[#030014] min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <GameModesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
