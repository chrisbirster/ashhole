export type Visibility = 'public' | 'admin';

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

export type PairingRow = {
  playerOne: string;
  playerTwo: string | null;
};

export type EventPlayerRow = {
  name: string;
  handicap: string | null;
};

export type RoomAssignmentRow = {
  room: string;
  occupants: string;
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
  pairings: PairingRow[];
  field: EventPlayerRow[];
  rooms: RoomAssignmentRow[];
};

export type AdminEventDraft = {
  year: number;
  title: string;
  subtitle: string | null;
  status: string;
  visibility: Visibility;
  heroImage: string | null;
  cupWinner: string | null;
  migWinner: string | null;
  rounds: Array<Omit<Round, 'id' | 'eventId' | 'ordinal'>>;
  pairings: PairingRow[];
  field: EventPlayerRow[];
  rooms: RoomAssignmentRow[];
  isCurrent: boolean;
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

export type MemoryPhoto = {
  year: number;
  src: string;
  alt: string;
};

export type ArchiveYear = EventSummary & {
  photos: Array<{ src: string; alt: string }>;
};
