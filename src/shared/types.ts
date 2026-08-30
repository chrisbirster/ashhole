export type Visibility = 'public' | 'member' | 'admin';

export type Round = {
  id: number;
  eventId: number;
  ordinal: number;
  dayLabel: string;
  title: string;
  course: string;
  teeTime: string;
  holes: number | null;
  format: string | null;
};

export type EventSummary = {
  id: number;
  year: number;
  title: string;
  subtitle: string | null;
  status: string;
  heroImage: string | null;
  cupWinner: string | null;
  migWinner: string | null;
  rounds: Round[];
};

export type PlayerSummary = {
  id: number;
  slug: string;
  name: string;
  firstYear: number | null;
  appearances: number;
  tier: string;
  years: number[];
};

export type AwardRow = {
  year: number;
  migWinner: string | null;
  cupWinner: string | null;
};

export type ArchiveCard = {
  year: number;
  title: string;
  blurb: string;
  image: string | null;
};

export type ArchiveYear = EventSummary & {
  pairings: Array<{ playerOne: string; playerTwo: string | null }>;
  photos: Array<{ src: string; alt: string }>;
};
