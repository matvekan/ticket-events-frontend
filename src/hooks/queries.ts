import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AnalyticsDto, ChatMessageDto, ChatRoomDto, EventDetailsDto, EventDto, OrderDto, SeatDto, VenueDto } from '../types';

export const queryKeys = {
  events: ['events'] as const,
  event: (id: string) => ['event', id] as const,
  eventSeats: (id: string) => ['event-seats', id] as const,
  venues: ['venues'] as const,
  venue: (id: string) => ['venue', id] as const,
  venueSeats: (id: string) => ['venue-seats', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  adminEvents: ['admin-events'] as const,
  adminAnalytics: ['admin-analytics'] as const,
  chatRoom: ['chat-room'] as const,
  chatMessages: (roomId: string) => ['chat-messages', roomId] as const,
  adminChatRooms: ['admin-chat-rooms'] as const,
};

export function useEvents(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.events, search ?? ''],
    queryFn: async () => {
      const trimmed = search?.trim();
      if (!trimmed) {
        const { data } = await api.get<EventDto[]>('/events');
        return data;
      }
      const { data } = await api.get<EventDto[]>('/events/search', {
        params: { query: trimmed },
      });
      return data;
    },
  });
}

export function useEventDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: async () => {
      const { data } = await api.get<EventDetailsDto>(`/events/${id}`);
      return data;
    },
  });
}

export function useEventSeats(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventSeats(eventId),
    queryFn: async () => {
      const { data } = await api.get<SeatDto[]>(`/events/${eventId}/seats`);
      return data;
    },
  });
}

export function useVenues() {
  return useQuery({
    queryKey: queryKeys.venues,
    queryFn: async () => {
      const { data } = await api.get<VenueDto[]>('/venues');
      return data;
    },
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: queryKeys.venue(id),
    queryFn: async () => {
      const { data } = await api.get<VenueDto>(`/venues/${id}`);
      return data;
    },
  });
}

export function useVenueSeats(venueId: string) {
  return useQuery({
    queryKey: queryKeys.venueSeats(venueId),
    enabled: !!venueId && venueId.length > 0,
    queryFn: async () => {
      const { data } = await api.get<SeatDto[]>(`/venues/${venueId}/seats`);
      return data;
    },
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: queryKeys.adminEvents,
    queryFn: async () => {
      const { data } = await api.get<EventDto[]>('/admin/events');
      return data;
    },
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: queryKeys.adminAnalytics,
    queryFn: async () => {
      const { data } = await api.get<AnalyticsDto>('/admin/analytics');
      return data;
    },
  });
}

export interface VerifyTicketResult {
  valid: boolean;
  reason?: string;
  ticket?: {
    code: string;
    eventTitle: string;
    eventDate: string;
    venueName: string;
    seat: string;
    orderStatus: string;
  };
}

export function useVerifyTicket() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.get<VerifyTicketResult>(`/admin/tickets/${encodeURIComponent(code)}`);
      return data;
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      const { data } = await api.get<OrderDto[]>('/orders/my');
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const { data } = await api.get<OrderDto>(`/orders/${id}`);
      return data;
    },
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; address: string; city: string; latitude?: number | null; longitude?: number | null }) =>
      api.post('/venues', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.venues }),
  });
}

export function useAddSeats(venueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { seats: Array<{ row: string; number: number; type: string; sector: string | null }> }) =>
      api.post(`/venues/${venueId}/seats`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venueSeats(venueId) });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      description: string;
      date: string;
      venueId: string;
      seats: Array<{ seatId: string; priceAmount: number }>;
    }) => api.post('/events', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents });
    },
  });
}

export function useReserveSeats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seatIds: string[]) => api.post('/orders', { seatIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      api.post<{ paymentId: string; paymentUrl: string; status: string }>(`/orders/${orderId}/pay`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.post(`/orders/${orderId}/cancel`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.post(`/admin/orders/${orderId}/refund`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.post(`/events/${eventId}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents });
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.post(`/events/${eventId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: { email: string }) => api.post('/auth/forgot-password', body),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) => api.post('/auth/reset-password', body),
  });
}

export function useOpenChatRoom() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ChatRoomDto>('/chat/room');
      return data;
    },
  });
}

export function useChatMessages(roomId: string | null) {
  return useQuery({
    queryKey: queryKeys.chatMessages(roomId ?? ''),
    enabled: Boolean(roomId),
    queryFn: async () => {
      const { data } = await api.get<ChatMessageDto[]>(`/chat/rooms/${roomId}/messages`);
      return data;
    },
  });
}

export function useAdminChatRooms() {
  return useQuery({
    queryKey: queryKeys.adminChatRooms,
    queryFn: async () => {
      const { data } = await api.get<ChatRoomDto[]>('/admin/chat/rooms');
      return data;
    },
  });
}
