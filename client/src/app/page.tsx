import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";

export default function Home() {
  return (
    <div className="h-full w-full">
      <main className={`h-full flex w-full flex-col`}>
        <Navbar />
        <Landing />
      </main>
    </div>
  );
}
