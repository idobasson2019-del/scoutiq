"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import {
  label,
  playerStatusLabels,
  needStatusLabels,
  teamStatusLabels,
  paymentLabels,
  riskLabels,
  urgencyLabels,
  recommendationLabels,
} from "@/lib/i18n/labels";
import type {
  PlayerStatus,
  NeedStatus,
  TeamStatus,
} from "@/types";

type Variant = BadgeProps["variant"];

const playerStatusVariant: Record<PlayerStatus, Variant> = {
  new: "muted",
  proposed: "default",
  in_review: "secondary",
  interesting: "default",
  need_info: "warning",
  watchlist: "secondary",
  shortlisted: "default",
  contact: "default",
  negotiation: "warning",
  rejected: "destructive",
  signed: "success",
};

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  const { lang } = useI18n();
  return (
    <Badge variant={playerStatusVariant[status]}>
      {label(playerStatusLabels, status, lang)}
    </Badge>
  );
}

const needStatusVariant: Record<NeedStatus, Variant> = {
  new: "muted",
  accepted: "secondary",
  searching: "default",
  candidates_found: "default",
  club_review: "warning",
  on_hold: "muted",
  completed: "success",
  closed: "secondary",
};

export function NeedStatusBadge({ status }: { status: NeedStatus }) {
  const { lang } = useI18n();
  return (
    <Badge variant={needStatusVariant[status]}>
      {label(needStatusLabels, status, lang)}
    </Badge>
  );
}

const teamStatusVariant: Record<TeamStatus, Variant> = {
  active: "success",
  suspended: "destructive",
  contract_ended: "muted",
  trial: "warning",
  pending_activation: "secondary",
};

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  const { lang } = useI18n();
  return (
    <Badge variant={teamStatusVariant[status]}>
      {label(teamStatusLabels, status, lang)}
    </Badge>
  );
}

const paymentVariant: Record<string, Variant> = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
  not_relevant: "muted",
};

export function PaymentBadge({ status }: { status: string }) {
  const { lang } = useI18n();
  return (
    <Badge variant={paymentVariant[status] ?? "muted"}>
      {label(paymentLabels, status, lang)}
    </Badge>
  );
}

const riskVariant: Record<string, Variant> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export function RiskBadge({ risk }: { risk: string }) {
  const { lang } = useI18n();
  return (
    <Badge variant={riskVariant[risk] ?? "muted"}>
      {label(riskLabels, risk, lang)}
    </Badge>
  );
}

const urgencyVariant: Record<string, Variant> = {
  low: "muted",
  medium: "warning",
  high: "destructive",
};

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const { lang } = useI18n();
  return (
    <Badge variant={urgencyVariant[urgency] ?? "muted"}>
      {label(urgencyLabels, urgency, lang)}
    </Badge>
  );
}

const recVariant: Record<string, Variant> = {
  sign: "success",
  monitor: "warning",
  pass: "destructive",
};

export function RecommendationBadge({ rec }: { rec: string }) {
  const { lang } = useI18n();
  return (
    <Badge variant={recVariant[rec] ?? "muted"}>
      {label(recommendationLabels, rec, lang)}
    </Badge>
  );
}
