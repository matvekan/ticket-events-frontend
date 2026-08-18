export type EventStatus = 'draft' | 'published' | 'cancelled' | 'sold_out';
export type SeatStatus = 'free' | 'reserved' | 'sold';
export type SeatType = 'standard' | 'vip' | 'premium';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface EventDto {
  id: string;
  title: string;
  description: string;
  date: string;
  venueName: string;
  venueCity: string;
  priceMin: number;
  priceMax: number;
  status: EventStatus;
}

export interface EventDetailsDto extends EventDto {
  venueAddress: string;
  venueLatitude: number | null;
  venueLongitude: number | null;
  seats: SeatDto[];
}

export interface SeatDto {
  id: string;
  row: string;
  number: number;
  sector: string | null;
  type: SeatType;
  priceAmount: number | null;
  status: SeatStatus | null;
}

export interface VenueDto {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TicketDto {
  id: string;
  code: string;
  eventSeatId: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  priceAmount: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  tickets: TicketDto[];
}

export interface AuthTokenPayload {
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AnalyticsTotals {
  count: number;
  amount: number;
}

export interface AnalyticsByDay {
  day: string;
  revenue: number;
  refunds: number;
}

export interface AnalyticsUser {
  user_id: string;
  orders: number;
  revenue: number;
}

export interface AnalyticsPayment {
  order_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
}

export interface AnalyticsDto {
  totals: {
    payments: AnalyticsTotals;
    refunds: AnalyticsTotals;
    cancellations: number;
    reservations: number;
  };
  byDay: AnalyticsByDay[];
  topUsers: AnalyticsUser[];
  recentPayments: AnalyticsPayment[];
}

export interface ChatMessageDto {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  isSupport: boolean;
  text: string;
  createdAt: string;
}

export interface ChatRoomDto {
  id: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  lastMessage: ChatMessageDto | null;
}
