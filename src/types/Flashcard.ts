import { CardProps } from "./Card";

export interface FlashcardProps {
  flashcard_id: string;
  user_id: string;
  created_at: string;
  cards: CardProps[];
  title: string;
  description: string;
}
