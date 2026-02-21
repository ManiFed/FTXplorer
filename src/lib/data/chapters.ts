import type { Chapter } from '@/types';
import { chaptersArraySchema } from './schemas';
import chaptersData from '../../../public/data/chapters.json';

let _chapters: Chapter[] | null = null;

export function getChapters(): Chapter[] {
  if (_chapters) return _chapters;
  const parsed = chaptersArraySchema.parse(chaptersData);
  _chapters = parsed as Chapter[];
  return _chapters;
}

export function getChapter(number: number): Chapter | undefined {
  return getChapters().find((ch) => ch.number === number);
}

export function getTotalChapters(): number {
  return getChapters().length;
}
