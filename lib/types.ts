export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  pseudo?: string;
  city: string;
  birthYear: number;
  interests?: string[];
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  tags: string[];
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  maxCapacity: number;
  minAge?: number;
  maxAge?: number;
  isPublic: boolean;
  requiresApproval: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizerId: string;
  organizer?: User;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  eventId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
