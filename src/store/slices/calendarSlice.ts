import type { StateCreator } from 'zustand';
import type { CalendarEvent } from '../../types';

export interface CalendarSlice {
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (date: string, content: string) => void;
  deleteCalendarEvent: (id: string) => void;
  updateCalendarEvent: (id: string, content: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createCalendarSlice: StateCreator<CalendarSlice> = (set, get) => ({
  calendarEvents: [],

  addCalendarEvent: (date, content) => {
    const event: CalendarEvent = {
      id: generateId(),
      date,
      content,
      createdAt: new Date().toISOString(),
    };
    set({ calendarEvents: [...get().calendarEvents, event] });
  },

  deleteCalendarEvent: (id) => {
    set({ calendarEvents: get().calendarEvents.filter((e) => e.id !== id) });
  },

  updateCalendarEvent: (id, content) => {
    set({
      calendarEvents: get().calendarEvents.map((e) =>
        e.id === id ? { ...e, content } : e
      ),
    });
  },
});
