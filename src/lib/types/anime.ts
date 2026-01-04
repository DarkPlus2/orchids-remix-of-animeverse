export interface EmbedSource {
  name: string;
  url: string;
}

export interface Episode {
  number: number;
  title: string;
  embedSources: EmbedSource[];
  thumbnail?: string;
  season: number;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  japaneseTitle: string;
  synopsis: string;
  coverImage: string;
  bannerImage: string;
  rating: number;
  genres: string[];
  status: 'ongoing' | 'completed' | 'not_yet_aired';
  releaseYear: number;
  totalEpisodes: number;
  type: 'Movie' | 'Series' | 'OVA' | 'Special';
  episodes?: Episode[];
  trending: boolean;
  mostWatched: boolean;
  pinned: boolean;
  studios: string[];
  producers: string[];
  duration: number;
  seasonCount: number;
}