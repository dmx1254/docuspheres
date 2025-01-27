import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertDate = (date: Date | string) => {
  const dateConverted = new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return dateConverted;
};

export interface LocationEntry {
  country: string;
  count: number;
}

export interface DayData {
  _id: string;
  locations: LocationEntry[];
}

export interface BrowserStat {
  browser: string;
  value: number;
}
