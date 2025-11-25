export interface HabitIntent {
  activity: string;
  frequency: RecurrencePattern;
  preferredTime?: TimeWindow;
  duration?: number;
  confidence: number;
  rawText: string;
}

export interface RecurrencePattern {
  type: "daily" | "weekly" | "biweekly" | "monthly";
  daysOfWeek?: DayOfWeek[];
  interval?: number;
}

export type DayOfWeek = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface TimeWindow {
  startTime: string;
  endTime?: string;
}

export interface HabitSchedule {
  habitId: string;
  activity: string;
  startDateTime: Date;
  endDateTime: Date;
  recurrence: RecurrencePattern;
  timezone: string;
}

export interface CalendarEventRequest {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  recurrence?: string[];
}

export interface CalendarEventResponse {
  id: string;
  htmlLink: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

export interface HabitAction {
  type: "create" | "update" | "delete";
  habit: HabitIntent;
  calendarEventId?: string;
  status: "pending" | "confirmed" | "completed" | "failed";
  error?: string;
}
