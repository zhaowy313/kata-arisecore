import dynamic from 'next/dynamic';

// Dynamic import for WGoBoard
const WGoBoard = dynamic(() => import("./components/WGoBoard"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <WGoBoard />
    </main>
  );
}