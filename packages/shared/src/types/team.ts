import type { Player, PlayerRole } from "./player";

export enum IPLTeam {
  CSK = "csk",
  MI = "mi",
  RCB = "rcb",
  DC = "dc",
  KKR = "kkr",
  PBKS = "pbks",
  RR = "rr",
  GT = "gt",
  LSG = "lsg",
  SRH = "srh",
}

export type IPLTeamId = `${IPLTeam}`;

export interface TeamInfo {
  id: IPLTeamId;
  name: string;
  shortName: string;
  fullName: string;
  city: string;
  homeGround: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  captainId: string | null;
  owner: string;
  coach: string;
  titles: number;
}

export interface TeamBudget {
  totalPurse: number;
  spent: number;
  remaining: number;
  rtmCardsUsed: number;
  rtmCardsTotal: number;
}

export interface SquadSlot {
  slotNumber: number;
  playerId: string | null;
  player: Player | null;
  role: PlayerRole | null;
  isOverseas: boolean;
  price: number;
  isRetained: boolean;
  isCapped: boolean;
}

export interface TeamSquad {
  total: number;
  indian: number;
  overseas: number;
  batsmen: number;
  bowlers: number;
  allRounders: number;
  wicketKeepers: number;
  capped: number;
  uncapped: number;
  slots: SquadSlot[];
}

export interface Team {
  id: string;
  teamId: IPLTeamId;
  info: TeamInfo;
  budget: TeamBudget;
  squad: TeamSquad;
  userId: string;
  seasonId: string;
  createdAt: Date;
  updatedAt: Date;
}
