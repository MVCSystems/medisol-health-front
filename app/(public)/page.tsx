import Hero from "@/components/landing/hero";
import AccesoRapido from "@/components/landing/quick-access";

export default function Page() {
  return (
    <div className="flex flex-col">
      <Hero />
      <AccesoRapido />
      {/* <RecentPublications /> */}
    </div>
  );
}
