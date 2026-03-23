import GamePad from "@/components/gamepad";
import dynamic from "next/dynamic";
import Spinner from "@/components/spinner";

const CanvasContainer = dynamic(() => import("../components/canvas"), {
  ssr: false,
  loading: () => <Spinner />,
});

export default function Home() {
  return (
    <main className="flex flex-col grow lg:flex-row text-gray-400 pt-2 pb-8">
      <GamePad />
      <CanvasContainer />
    </main>
  );
}
