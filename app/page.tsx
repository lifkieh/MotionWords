import Image from "next/image";

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">
        MotionWords
      </h1>

      <p className="mt-4">
        Interactive Sign Alphabet Tutor
      </p>

      <div className="mt-8 space-y-3">
        <p>Learn Alphabet</p>
        <p>Spelling Tutor</p>
        <p>Quiz</p>
        <p>Compare Mode</p>
      </div>
    </main>
  );
}