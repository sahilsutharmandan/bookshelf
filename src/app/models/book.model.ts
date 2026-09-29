export interface BookSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  number_of_pages_median?: number;
  isbn?: string[];
}

export interface SearchResponse {
  numFound: number;
  docs: BookSearchResult[];
}

export interface BookDetail {
  title: string;
  description?: string | { type: string; value: string };
  covers?: number[];
  subjects?: string[];
  key: string;
}

export interface ReadingListEntry {
  workId: string;
  title: string;
  authors: string[];
  coverId?: number;
  status: ReadingStatus;
  rating: number;
  notes: string;
  dateAdded: string;
  year?: number;
}

export type ReadingStatus = 'want' | 'reading' | 'finished';

export interface ReadingGoal {
  year: number;
  target: number;
}

export interface SubjectResponse {
  works: SubjectWork[];
}

export interface SubjectWork {
  key: string;
  title: string;
  authors?: { name: string }[];
  cover_id?: number;
}
