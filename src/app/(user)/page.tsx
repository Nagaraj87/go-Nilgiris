
import { HeroSection } from '@/components/home/hero-section';
import { ToursSection } from '@/components/home/tours-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ToursSection />
    </div>
  );
}
