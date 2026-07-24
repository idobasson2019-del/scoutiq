"use client";

import { useState } from "react";
import { Search, Send, Paperclip, UserRound, Target, Check, CheckCheck, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monogram, EmptyState } from "@/components/common/misc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { conversations as seed } from "@/data/misc";
import { cn, timeAgo } from "@/lib/utils";
import type { Conversation, Message } from "@/types";

export default function MessagesPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [convos, setConvos] = useState<Conversation[]>(seed);
  const [activeId, setActiveId] = useState<string>(seed[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = convos.filter(
    (c) => c.subject.toLowerCase().includes(q.toLowerCase()) || c.with.toLowerCase().includes(q.toLowerCase()),
  );
  const active = convos.find((c) => c.id === activeId);

  const openConvo = (id: string) => {
    setActiveId(id);
    setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    if (!draft.trim() || !active) return;
    const msg: Message = {
      id: "m" + Date.now(),
      from: "You",
      text: draft.trim(),
      time: new Date().toISOString(),
      read: false,
      self: true,
    };
    setConvos((cs) =>
      cs.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, msg], lastTime: msg.time } : c)),
    );
    setDraft("");
    toast(t("msg.sent"));
  };

  return (
    <>
      <PageHeader title={t("msg.title")} subtitle={t("msg.subtitle")} />

      <Card className="grid h-[640px] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <div className="flex flex-col border-e border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("msg.searchConversations")} className="ps-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => openConvo(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/60 p-3 text-start transition-colors hover:bg-muted/40",
                  c.id === activeId && "bg-muted/60",
                )}
              >
                <Monogram name={c.with} color={c.avatarColor} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.subject}</span>
                    {c.unread > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{c.unread}</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.messages[c.messages.length - 1]?.text}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground/70">{timeAgo(c.lastTime, lang)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        {active ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Monogram name={active.with} color={active.avatarColor} size={38} />
              <div>
                <div className="text-sm font-medium">{active.subject}</div>
                <div className="text-xs text-muted-foreground">{active.with}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
              {active.messages.map((m) => (
                <div key={m.id} className={cn("flex", m.self ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3.5 py-2 text-sm",
                      m.self ? "bg-primary/15 text-foreground" : "bg-muted",
                    )}
                  >
                    <p>{m.text}</p>
                    <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                      {timeAgo(m.time, lang)}
                      {m.self && (m.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="mb-2 flex items-center gap-1">
                <IconAction icon={Paperclip} tip={t("msg.attach")} onClick={() => toast(t("common.saved"), "info")} />
                <IconAction icon={UserRound} tip={t("msg.linkPlayer")} onClick={() => toast(t("common.saved"), "info")} />
                <IconAction icon={Target} tip={t("msg.linkNeed")} onClick={() => toast(t("common.saved"), "info")} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={t("msg.newMessage")}
                />
                <Button onClick={send} disabled={!draft.trim()}>
                  <Send className="h-4 w-4" /> {t("msg.send")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <EmptyState icon={MessageSquare} title={t("msg.empty")} body={t("msg.emptyBody")} />
          </div>
        )}
      </Card>
    </>
  );
}

function IconAction({ icon: Icon, tip, onClick }: { icon: any; tip: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClick}>
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
