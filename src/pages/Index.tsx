import { MainLayout } from "@/layouts/MainLayout";
import { Hero } from "@/components/Hero";
import { FeaturedDishes } from "@/components/FeaturedDishes";
import { AboutTeaser } from "@/components/AboutTeaser";
import { ReservationCTA } from "@/components/ReservationCTA";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <FeaturedDishes />
      <AboutTeaser />
      <ReservationCTA />
    </MainLayout>
  );
};

export default Index;
