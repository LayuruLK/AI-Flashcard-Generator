"use client";

import Flashcard from "./Flashcard";

interface FlashcardListProps {
  flashcards: { question: string; answer: string }[];
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      {flashcards.map((card, index) => (
        <Flashcard key={index} question={card.question} answer={card.answer} />
      ))}
    </div>
  );
}
