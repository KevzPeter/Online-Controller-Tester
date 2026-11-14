import GamePad from "@/components/gamepad";
import ClientCanvas from "@/components/clientCanvas";

export default function Home() {
  return (
    <main className="grid w-full min-w-0 grow grid-cols-1 gap-4 px-4 pt-2 pb-8 text-gray-400 lg:grid-cols-2">
      <GamePad />
      <ClientCanvas />
    </main>
  );
}
