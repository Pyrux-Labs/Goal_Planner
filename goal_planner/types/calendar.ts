export type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time?: string;
  color?: string;
  completed: boolean;
  type: "task" | "habit";
};

export type CalendarEventsMap = Record<string, CalendarEvent[]>;