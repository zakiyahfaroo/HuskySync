export enum EventTag {
  FREE_FOOD = "Free Food",
  FREE_MERCH = "Free Merch",
  RSVP_REQUIRED = "RSVP Required",
  CAREER = "Career",
  SOCIAL = "Social",
  ACADEMIC = "Academic",
  OUTDOORS = "Outdoors",
  GAMES = "Games",
}

export interface UWEvent {
  id: string;
  title: string;
  organizer: string; // RSO Name
  date: string; // ISO String for simplified sorting
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  tags: EventTag[];
  imageUrl: string;
}

export interface ComparisonResult {
  hasTimeConflict: boolean;
  commonTags: EventTag[];
  conflictingEvents: UWEvent[];
}