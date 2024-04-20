import GamePad from "@/components/GamePad";
import CanvasContainer from "@/components/Canvas";
import Spinner from "@/components/Spinner";
import { Suspense } from "react";
export default function Home() {
  return (
    <main className="flex flex-col lg:flex-row text-gray-400">
      <GamePad />
      <Suspense fallback={<Spinner />}>
        <CanvasContainer />
      </Suspense>
    </main>
  );
}
