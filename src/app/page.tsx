import Header from "@/components/Header";
import GamePad from "@/components/GamePad";

export default function Home() {
  return (
    <main className="h-screen bg-slate-900 text-gray-400 p-4">
      <Header />
      <div className="flex flex-col lg:flex-row">
        <GamePad />
      </div>

    </main>
  );
}
