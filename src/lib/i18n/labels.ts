import type { Lang } from "@/types";

/** Enum → localized label maps kept separate from the UI-string dictionary. */

export const playerStatusLabels: Record<string, Record<Lang, string>> = {
  new: { he: "חדש", en: "New" },
  proposed: { he: "הוצע לקבוצה", en: "Proposed" },
  in_review: { he: "בבדיקה", en: "In review" },
  interesting: { he: "מעניין", en: "Interesting" },
  need_info: { he: "דרוש מידע נוסף", en: "Needs info" },
  watchlist: { he: "ברשימת מעקב", en: "On watchlist" },
  shortlisted: { he: "מועמד מתקדם", en: "Shortlisted" },
  contact: { he: "יצירת קשר", en: "Contact" },
  negotiation: { he: "משא ומתן", en: "Negotiation" },
  rejected: { he: "נפסל", en: "Rejected" },
  signed: { he: "הוחתם", en: "Signed" },
};

export const needStatusLabels: Record<string, Record<Lang, string>> = {
  new: { he: "חדשה", en: "New" },
  accepted: { he: "התקבלה", en: "Accepted" },
  searching: { he: "בחיפוש", en: "Searching" },
  candidates_found: { he: "נמצאו מועמדים", en: "Candidates found" },
  club_review: { he: "בבדיקת הקבוצה", en: "Club review" },
  on_hold: { he: "הוקפאה", en: "On hold" },
  completed: { he: "הושלמה", en: "Completed" },
  closed: { he: "נסגרה", en: "Closed" },
};

export const teamStatusLabels: Record<string, Record<Lang, string>> = {
  active: { he: "פעילה", en: "Active" },
  suspended: { he: "מושהית", en: "Suspended" },
  contract_ended: { he: "החוזה הסתיים", en: "Contract ended" },
  trial: { he: "בתקופת ניסיון", en: "Trial" },
  pending_activation: { he: "ממתינה להפעלה", en: "Pending activation" },
};

export const dealTypeLabels: Record<string, Record<Lang, string>> = {
  buy: { he: "רכישה", en: "Buy" },
  loan: { he: "השאלה", en: "Loan" },
  loan_option: { he: "השאלה עם אופציה", en: "Loan with option" },
  free: { he: "שחקן חופשי", en: "Free agent" },
  any: { he: "ללא העדפה", en: "Any" },
};

export const footLabels: Record<string, Record<Lang, string>> = {
  left: { he: "שמאל", en: "Left" },
  right: { he: "ימין", en: "Right" },
  both: { he: "שתיים", en: "Both" },
  any: { he: "ללא העדפה", en: "Any" },
};

export const availabilityLabels: Record<string, Record<Lang, string>> = {
  transfer: { he: "זמין להעברה", en: "Available for transfer" },
  loan: { he: "זמין להשאלה", en: "Available on loan" },
  free: { he: "שחקן חופשי", en: "Free agent" },
  not_available: { he: "לא זמין", en: "Not available" },
};

export const riskLabels: Record<string, Record<Lang, string>> = {
  low: { he: "נמוך", en: "Low" },
  medium: { he: "בינוני", en: "Medium" },
  high: { he: "גבוה", en: "High" },
};

export const urgencyLabels: Record<string, Record<Lang, string>> = {
  low: { he: "נמוכה", en: "Low" },
  medium: { he: "בינונית", en: "Medium" },
  high: { he: "גבוהה", en: "High" },
};

export const recommendationLabels: Record<string, Record<Lang, string>> = {
  sign: { he: "מומלץ להחתים", en: "Sign" },
  monitor: { he: "המשך מעקב", en: "Monitor" },
  pass: { he: "לא מומלץ", en: "Pass" },
};

export const paymentLabels: Record<string, Record<Lang, string>> = {
  paid: { he: "שולם", en: "Paid" },
  pending: { he: "ממתין", en: "Pending" },
  overdue: { he: "באיחור", en: "Overdue" },
  not_relevant: { he: "לא רלוונטי", en: "Not relevant" },
};

export const reportTypeLabels: Record<string, Record<Lang, string>> = {
  live: { he: "חי", en: "Live" },
  video: { he: "וידאו", en: "Video" },
  data: { he: "נתונים", en: "Data" },
};

/** Positions — canonical abbreviations map to localized full names. */
export const positionLabels: Record<string, Record<Lang, string>> = {
  GK: { he: "שוער", en: "Goalkeeper" },
  RB: { he: "מגן ימני", en: "Right back" },
  LB: { he: "מגן שמאלי", en: "Left back" },
  CB: { he: "בלם", en: "Centre back" },
  DM: { he: "קשר אחורי", en: "Defensive mid" },
  CM: { he: "קשר מרכזי", en: "Central mid" },
  AM: { he: "קשר התקפי", en: "Attacking mid" },
  RW: { he: "כנף ימני", en: "Right winger" },
  LW: { he: "כנף שמאלי", en: "Left winger" },
  ST: { he: "חלוץ", en: "Striker" },
  CF: { he: "חלוץ מרכזי", en: "Centre forward" },
};

export function label(
  map: Record<string, Record<Lang, string>>,
  key: string,
  lang: Lang,
) {
  return map[key]?.[lang] ?? key;
}
