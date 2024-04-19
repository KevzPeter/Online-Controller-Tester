import GamePad from "@/components/GamePad";
import CanvasContainer from "@/components/Canvas";

export default function Home() {
  return (
    <main className="flex flex-col lg:flex-row text-gray-400">
      <GamePad />
      <CanvasContainer />
    </main>
  );
}
