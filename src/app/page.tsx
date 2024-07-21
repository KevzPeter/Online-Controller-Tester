import GamePad from "@/components/gamepad";
const CanvasContainer = lazy(() => import("../components/canvas"));
import Spinner from "@/components/spinner";
import { lazy, Suspense } from "react";

export default function Home() {
  return (
    <main className="flex flex-col grow lg:flex-row text-gray-400 pt-2 pb-8">
      <GamePad />
      <Suspense fallback={<Spinner />}>
        <CanvasContainer />
      </Suspense>
    </main>
  );
}
