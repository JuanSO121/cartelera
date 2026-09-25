export type MovieStatus = 'DRAFT' | 'PUBLISHED';

export const MOVIE_STATUS_LABELS: Record<MovieStatus, string> = {
  DRAFT: 'En edición',
  PUBLISHED: 'Publicada',
};

/** Película tal como la ve el área administrativa. */
export interface Movie {
  id: number;
  title: string;
  description: string;
  coverUrl: string | null;
  score: number;
  status: MovieStatus;
  createdAt: string;
  updatedAt: string;
}

/** Película tal como la ve el área pública (sin estado). */
export interface PublicMovie {
  id: number;
  title: string;
  description: string;
  coverUrl: string | null;
  score: number;
  createdAt: string;
}

export interface MovieRequest {
  title: string;
  description: string;
  score: number;
  status: MovieStatus;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminMovieQuery {
  search: string;
  status: MovieStatus | '';
  page: number;
  size: number;
}

export type MovieSort = 'recent' | 'score';

export interface PublicMovieQuery {
  search: string;
  sort: MovieSort;
  page: number;
  size: number;
}
