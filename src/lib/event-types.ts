export const EVENT_TYPES = [
  { value: "bayan", label: "Bayan" },
  { value: "lecture", label: "Islamic Lecture" },
  { value: "quran_class", label: "Quran Class" },
  { value: "gathering", label: "Community Gathering" },
  { value: "iftar", label: "Iftar" },
  { value: "eid_prayer", label: "Eid Prayer" },
  { value: "youth", label: "Youth Program" },
  { value: "fundraising", label: "Fundraising" },
  { value: "other", label: "Other" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

export const eventTypeLabel = (value: string) => EVENT_TYPES.find((t) => t.value === value)?.label ?? "Event";

/** Types that have a person leading them, so the form asks for a speaker or teacher. */
export const HAS_SPEAKER: readonly string[] = ["bayan", "lecture", "quran_class", "youth"];
