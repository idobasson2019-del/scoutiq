"use client";

import { useEffect, useState } from "react";
import { Upload, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { usePlayers } from "@/lib/players-store";
import type { Player, PlayerVideo } from "@/types";

/** Data URLs bigger than this reliably blow the localStorage quota. */
const MAX_FILE_BYTES = 3 * 1024 * 1024;

/** Extract a YouTube video id from watch / share / embed / shorts links. */
export function youTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function AddVideoDialog({
  open,
  onOpenChange,
  player,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  player: Player;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { updatePlayer } = usePlayers();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setLink("");
      setFileData("");
      setFileName("");
    }
  }, [open]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast(t("videos.tooLarge"), "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(String(reader.result));
      setFileName(file.name);
      setLink("");
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = link.trim() || fileData;
    if (!source) {
      toast(t("videos.needSource"), "error");
      return;
    }

    const ytId = link.trim() ? youTubeId(link.trim()) : null;
    const video: PlayerVideo = {
      id: "v" + Date.now().toString(36),
      title: title.trim() || fileName || t("videos.clip"),
      url: source,
      kind: ytId ? "youtube" : fileData ? "file" : "url",
    };

    const ok = updatePlayer(player.id, {
      videos: [...(player.videos ?? []), video],
    });
    if (!ok) {
      toast(t("videos.saveFailed"), "error");
      return;
    }
    onOpenChange(false);
    toast(t("videos.added"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("videos.addTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("videos.videoTitle")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("videos.clip")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{t("videos.link")}</Label>
            <Input
              value={link}
              onChange={(e) => { setLink(e.target.value); setFileData(""); setFileName(""); }}
              placeholder="https://www.youtube.com/watch?v=..."
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">{t("videos.linkHint")}</p>
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            <Label className="text-xs">{t("videos.orUpload")}</Label>
            <div className="flex items-center gap-2">
              <Button asChild type="button" variant="outline" size="sm">
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4" /> {t("videos.upload")}
                  <input type="file" accept="video/*" className="hidden" onChange={onFile} />
                </label>
              </Button>
              {fileName && <span className="truncate text-xs text-muted-foreground">{fileName}</span>}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{t("videos.tooLarge")}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit">{t("videos.add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
