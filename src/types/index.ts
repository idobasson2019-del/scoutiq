export type Role = "owner" | "scout_lead" | "scout";

export type Lang = "he" | "en";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  teamId: string | null;
  avatar?: string;
  title?: string;
  /**
   * Mock-only password for the front-end prototype. If unset, the shared demo
   * password is used. This is a placeholder for Supabase Auth, where passwords
   * are hashed server-side and never stored on the client. Do not put real
   * credentials here.
   */
  password?: string;
}

export type TeamStatus =
  | "active"
  | "suspended"
  | "contract_ended"
  | "trial"
  | "pending_activation";

export interface Team {
  id: string;
  name: string;
  country: string;
  league: string;
  logoColor: string;
  /** Optional logo image — an external URL (e.g. from Google) or a data URL. */
  logoUrl?: string;
  status: TeamStatus;
  users: number;
  proposedPlayers: number;
  contractStart: string;
  contractEnd: string;
  monthlyPrice: number;
  currency: string;
  lastActivity: string;
}

export type Foot = "left" | "right" | "both";

export type PlayerStatus =
  | "new"
  | "proposed"
  | "in_review"
  | "interesting"
  | "need_info"
  | "watchlist"
  | "shortlisted"
  | "contact"
  | "negotiation"
  | "rejected"
  | "signed";

export interface ScoutingReport {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  author: string;
  date: string;
  type: "live" | "video" | "data";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  decisionMaking: number;
  offBall: number;
  styleFit: number;
  risk: "low" | "medium" | "high";
  potential: number;
  overall: number;
  recommendation: "sign" | "monitor" | "pass";
  read: boolean;
}

export interface PlayerStats {
  /** Counting stats */
  goals: number;
  assists: number;
  appearances: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
  /** Rated 0–100 */
  passAccuracy: number;
  defensiveRating: number;
}

export interface PlayerVideo {
  id: string;
  title: string;
  /** YouTube watch/share link, a direct video URL, or an uploaded data URL. */
  url: string;
  kind: "youtube" | "url" | "file";
}

export interface Player {
  id: string;
  name: string;
  photoColor: string;
  /** Optional profile photo — an external URL (e.g. from Google) or a data URL. */
  photoUrl?: string;
  age: number;
  birthDate: string;
  nationality: string;
  nationalityCode: string;
  currentTeam: string;
  league: string;
  position: string;
  secondaryPosition: string;
  foot: Foot;
  height: number;
  weight: number;
  shirtNumber: number;
  marketValue: number;
  salary: number;
  contractEnd: string;
  agent: string;
  scoutingScore: number;
  status: PlayerStatus;
  proposedDate: string;
  availability: "transfer" | "loan" | "free" | "not_available";
  teamIds: string[];
  stats: PlayerStats;
  videos?: PlayerVideo[];
  potential: number;
  risk: "low" | "medium" | "high";
}

export type NeedStatus =
  | "new"
  | "accepted"
  | "searching"
  | "candidates_found"
  | "club_review"
  | "on_hold"
  | "completed"
  | "closed";

export type DealType = "buy" | "loan" | "loan_option" | "free" | "any";

export interface RecruitmentNeed {
  id: string;
  title: string;
  teamId: string;
  position: string;
  secondaryPosition: string;
  count: number;
  minAge: number;
  maxAge: number;
  foot: Foot | "any";
  minHeight: number;
  nationality: string;
  leagues: string[];
  transferBudget: number;
  maxSalary: number;
  dealType: DealType;
  deadline: string;
  urgency: "low" | "medium" | "high";
  formation: string;
  playStyle: string;
  keyAttributes: string[];
  notes: string;
  status: NeedStatus;
  openedBy: string;
  openedDate: string;
  proposedPlayerIds: string[];
}

export interface WatchItem {
  id: string;
  playerId: string;
  reason: string;
  addedBy: string;
  nextReview: string;
  status: PlayerStatus;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  time: string;
  read: boolean;
  self: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  with: string;
  avatarColor: string;
  unread: number;
  lastTime: string;
  messages: Message[];
}

export type NotificationType =
  | "player_added"
  | "report_ready"
  | "need_updated"
  | "message"
  | "player_moved"
  | "contract_ending"
  | "review_due"
  | "user_added"
  | "team_contract_ending";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface Contract {
  id: string;
  teamId: string;
  contractStart: string;
  contractEnd: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  seats: number;
  paymentStatus: "paid" | "pending" | "overdue" | "not_relevant";
  contractStatus: TeamStatus;
  contact: string;
  notes: string;
}
