import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/(landing)/page";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Navbar />
      <main className={`h-full flex w-full flex-col`}>
        <Landing />
      </main>
      <Footer />
    </div>
  );
}
