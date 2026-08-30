import type { ArchiveCard, AwardRow } from '../shared/types';

export const awards: AwardRow[] = [
  { year: 2024, migWinner: 'Jeff Cochran', cupWinner: 'Brian Bruneau' },
  { year: 2023, migWinner: 'Phil Connelly', cupWinner: 'Brian Bruneau / John Benedict' },
  { year: 2022, migWinner: 'Chris Birster', cupWinner: 'Joey Nicastro / Ty Trainor' },
  { year: 2021, migWinner: 'C. Birster', cupWinner: 'P. Connelly / J. Benedict' },
  { year: 2020, migWinner: 'John Benedict — third time', cupWinner: 'J. Nicastro / C. Birster' },
  { year: 2019, migWinner: 'John Benedict — 2nd time', cupWinner: 'T. Kren / S. Nicastro' },
  { year: 2018, migWinner: 'C. Wells', cupWinner: 'C. Wells / R. Ogle' },
  { year: 2017, migWinner: 'G. Wells — 2nd time', cupWinner: 'J. Benedict / T. Trainor' },
  { year: 2016, migWinner: 'G. Wells', cupWinner: 'T. Kren / R. Ogle' },
  { year: 2015, migWinner: 'Sal Nicastro — 2nd time', cupWinner: 'T. Kren' },
  { year: 2014, migWinner: 'B. Kessler — 2nd time', cupWinner: 'B. Kessler / T. Kren' },
  { year: 2013, migWinner: 'T. Benedict — 3rd time', cupWinner: 'S. Nicastro / G. Wells' },
  { year: 2012, migWinner: 'T. Benedict — 2nd time', cupWinner: 'T. Benedict / D. Cochran' },
  { year: 2011, migWinner: 'B. Kessler', cupWinner: 'S. Nicastro / K. Bupp' },
  { year: 2010, migWinner: 'S. Nicastro', cupWinner: 'S. Nicastro / R. Ogle' },
  { year: 2009, migWinner: 'R. Ogle', cupWinner: 'B. Kessler / R. Anderson' },
  { year: 2008, migWinner: 'J. Benedict', cupWinner: 'J. Benedict / T. Kren' },
  { year: 2007, migWinner: 'D. Connelly', cupWinner: 'G. Lugo / G. Wells' },
  { year: 2006, migWinner: 'S. Fidler', cupWinner: 'T. Kren / R. Olson' },
  { year: 2005, migWinner: 'K. Voelker', cupWinner: 'S. Fidler / R. Olson' },
  { year: 2004, migWinner: 'K. Bupp', cupWinner: 'D. Connelly / K. Bupp' },
  { year: 2003, migWinner: 'C. Bayles', cupWinner: 'T. Benedict / B. Everett' },
  { year: 2002, migWinner: 'T. Benedict', cupWinner: null },
  { year: 2001, migWinner: 'D. Cochran', cupWinner: null },
  { year: 2000, migWinner: 'G. Lugo', cupWinner: null },
  { year: 1990, migWinner: 'R. Olson', cupWinner: null },
];

export const archiveCards: ArchiveCard[] = [
  { year: 1990, title: 'The First Outing', blurb: 'Eight guys. February. Virginia. A tradition begins.', image: '/assets/archive/1990/original-eight.jpg' },
  { year: 1991, title: 'ASHHOLE Gets a Name', blurb: 'Dan Connelly and Roger Hanson give the weekend its permanent name.', image: '/assets/archive/1991/document.jpg' },
  { year: 1996, title: 'The Tradition Grows', blurb: 'The field grows, the stories multiply, and Shenvalee becomes home.', image: '/assets/archive/1996/group.jpg' },
  { year: 2003, title: 'The Cup Era', blurb: 'Competition and camaraderie settle into the modern Classic.', image: '/assets/archive/2003/group.jpg' },
  { year: 2019, title: 'Still Hacking', blurb: 'Three decades in, the Fall Classic keeps rolling.', image: '/assets/archive/2019/group.jpg' },
  { year: 2024, title: 'Latest Complete Archive', blurb: 'Four rounds, one Cup, and another chapter at Shenvalee.', image: '/assets/archive/2024/group.jpg' },
];

export const originalEight = [
  'Ron Anderson', 'John Benedict', 'Dan Connelly', 'Tony Kren',
  'Gil Lugo', 'Joe Ofalt', 'Russ Ogle', 'Harold Swift',
];
