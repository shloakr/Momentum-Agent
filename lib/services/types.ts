// Shared types for services

export interface UserProfile {
  id: string;
  name: string;
  goals: Goal[];
  preferences: UserPreferences;
  calendarConnected: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  frequency: string;
  startDate: Date;
  socialPreference: "friends" | "random" | "solo";
}

export type GoalType = 
  | "exercise"
  | "meditation"
  | "reading"
  | "learning"
  | "creative"
  | "social"
  | "health"
  | "productivity"
  | "other";

export interface UserPreferences {
  preferredTimes: string[];
  notificationMethod: "sms" | "email" | "both";
  timezone: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  attendees?: string[];
}

export interface CheckIn {
  id: string;
  userId: string;
  eventId: string;
  completed: boolean;
  timestamp: Date;
  notes?: string;
}

