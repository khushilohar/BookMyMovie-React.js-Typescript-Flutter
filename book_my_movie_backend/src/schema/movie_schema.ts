export interface Movie {
  id: number;
  title: string;
  description: string;
  image: string;
  rating: number;
  duration_minutes: number;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddMovieData {
  title: string;
  description: string;
  image: string;
  rating?: number;
  duration_minutes: number;
  release_date?: string;
}

export interface UpdateMovie {
  title?: string;
  description?: string;
  image?: string;
  rating?: number;
  duration_minutes?: number;
  release_date?: string;
}
