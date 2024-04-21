import GamePad from "@/components/GamePad";
const CanvasContainer = lazy(() => import("../components/Canvas"));
import Spinner from "@/components/Spinner";
import { lazy, Suspense } from "react";

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
