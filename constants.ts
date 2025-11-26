import { UWEvent, EventTag } from './types';

// Helper to get dates relative to today
const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EVENTS: UWEvent[] = [
  {
    id: '1',
    title: 'Husky Coding Mixer',
    organizer: 'DubHacks',
    date: getFutureDate(1), // Tomorrow
    startTime: '18:00',
    endTime: '20:00',
    location: 'CSE2 G10 (Gates Center)',
    coordinates: { lat: 47.6534, lng: -122.3040 },
    description: 'Come meet fellow coders! Pizza and soda provided. Great networking opportunity for all CS majors.',
    tags: [EventTag.FREE_FOOD, EventTag.SOCIAL, EventTag.CAREER],
    imageUrl: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: '2',
    title: 'Resume Workshop',
    organizer: 'Career Center',
    date: getFutureDate(1), // Tomorrow
    startTime: '17:30',
    endTime: '19:00',
    location: 'HUB 250',
    coordinates: { lat: 47.6553, lng: -122.3051 },
    description: 'Get your resume ready for the career fair. Expert reviews available. Bring a printed copy.',
    tags: [EventTag.CAREER, EventTag.ACADEMIC, EventTag.RSVP_REQUIRED],
    imageUrl: 'https://picsum.photos/400/200?random=2'
  },
  {
    id: '5',
    title: 'Mock Interview Night',
    organizer: 'Business Council',
    date: getFutureDate(1), // Tomorrow - CLASH WITH EVENT 2 (Career & Time)
    startTime: '18:00',
    endTime: '19:30',
    location: 'Paccar Hall',
    coordinates: { lat: 47.6576, lng: -122.3075 },
    description: 'Practice your interview skills with industry professionals. Business casual attire required.',
    tags: [EventTag.CAREER, EventTag.RSVP_REQUIRED],
    imageUrl: 'https://picsum.photos/400/200?random=5'
  },
  {
    id: '3',
    title: 'Cherry Blossom Picnic',
    organizer: 'Japanese Student Association',
    date: getFutureDate(3),
    startTime: '12:00',
    endTime: '15:00',
    location: 'The Quad',
    coordinates: { lat: 47.6573, lng: -122.3070 },
    description: 'Enjoy the beautiful blossoms with snacks and games. Everyone welcome!',
    tags: [EventTag.FREE_FOOD, EventTag.SOCIAL, EventTag.OUTDOORS],
    imageUrl: 'https://picsum.photos/400/200?random=3'
  },
  {
    id: '4',
    title: 'Gaming Night',
    organizer: 'Husky Gamer Nation',
    date: getFutureDate(4),
    startTime: '19:00',
    endTime: '23:00',
    location: 'HUB Games Area',
    coordinates: { lat: 47.6553, lng: -122.3051 },
    description: 'Smash Bros tournament with prizes! First 50 attendees get a limited edition t-shirt.',
    tags: [EventTag.FREE_MERCH, EventTag.GAMES, EventTag.SOCIAL],
    imageUrl: 'https://picsum.photos/400/200?random=4'
  }
];