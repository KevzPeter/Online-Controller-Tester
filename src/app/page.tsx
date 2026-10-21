import GamePad from "@/components/gamepad";
import ClientCanvas from "@/components/clientCanvas";

export default function Home() {
  return (
    <main className="flex flex-col grow lg:flex-row text-gray-400 pt-2 pb-8">
      <GamePad />
      <ClientCanvas />
    </main>
  );
}
