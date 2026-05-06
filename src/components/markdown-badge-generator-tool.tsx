"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ToolEvents } from "@/lib/analytics";

const BADGE_STYLES = [
  { value: "flat", label: "Flat" },
  { value: "flat-square", label: "Flat Square" },
  { value: "for-the-badge", label: "For the Badge" },
  { value: "plastic", label: "Plastic" },
  { value: "social", label: "Social" },
] as const;

type BadgeStyle = (typeof BADGE_STYLES)[number]["value"];

const NAMED_COLORS = [
  { name: "brightgreen", hex: "#4caf50" },
  { name: "green", hex: "#97ca00" },
  { name: "yellowgreen", hex: "#a4a61d" },
  { name: "yellow", hex: "#dfb317" },
  { name: "orange", hex: "#fe7d37" },
  { name: "red", hex: "#e05d44" },
  { name: "blue", hex: "#007ec6" },
  { name: "blueviolet", hex: "#8a2be2" },
  { name: "lightgrey", hex: "#9f9f9f" },
  { name: "success", hex: "#4caf50" },
  { name: "important", hex: "#fe7d37" },
  { name: "critical", hex: "#e05d44" },
  { name: "informational", hex: "#007ec6" },
  { name: "inactive", hex: "#9f9f9f" },
];

type Preset = {
  label: string;
  message: string;
  color: string;
  logo: string;
  style: BadgeStyle;
};

const PRESETS: (Preset & { category: string; displayName: string })[] = [
  { category: "npm", displayName: "npm version", label: "npm", message: "v1.0.0", color: "red", logo: "npm", style: "flat" },
  { category: "npm", displayName: "npm downloads", label: "downloads", message: "1k%2Fmonth", color: "brightgreen", logo: "npm", style: "flat" },
  { category: "github", displayName: "GitHub license", label: "license", message: "MIT", color: "blue", logo: "github", style: "flat" },
  { category: "github", displayName: "GitHub stars", label: "stars", message: "⭐", color: "yellow", logo: "github", style: "social" },
  { category: "github", displayName: "GitHub forks", label: "forks", message: "🍴", color: "blue", logo: "github", style: "social" },
  { category: "github", displayName: "Build passing", label: "build", message: "passing", color: "brightgreen", logo: "githubactions", style: "flat" },
  { category: "github", displayName: "Build failing", label: "build", message: "failing", color: "red", logo: "githubactions", style: "flat" },
  { category: "coverage", displayName: "Coverage 100%", label: "coverage", message: "100%25", color: "brightgreen", logo: "", style: "flat" },
  { category: "coverage", displayName: "Coverage 80%", label: "coverage", message: "80%25", color: "yellowgreen", logo: "", style: "flat" },
  { category: "lang", displayName: "TypeScript", label: "TypeScript", message: "5.x", color: "blue", logo: "typescript", style: "flat" },
  { category: "lang", displayName: "React", label: "React", message: "19.x", color: "61dafb", logo: "react", style: "flat" },
  { category: "lang", displayName: "Next.js", label: "Next.js", message: "16.x", color: "000000", logo: "nextdotjs", style: "flat" },
  { category: "lang", displayName: "Node.js", label: "Node.js", message: "22.x", color: "339933", logo: "nodedotjs", style: "flat" },
  { category: "lang", displayName: "Python", label: "Python", message: "3.12", color: "3776AB", logo: "python", style: "flat" },
  { category: "license", displayName: "MIT License", label: "License", message: "MIT", color: "blue", logo: "", style: "flat" },
  { category: "license", displayName: "Apache 2.0", label: "License", message: "Apache%202.0", color: "blue", logo: "", style: "flat" },
  { category: "license", displayName: "GPL v3", label: "License", message: "GPLv3", color: "blue", logo: "", style: "flat" },
  { category: "misc", displayName: "PRs welcome", label: "PRs", message: "welcome", color: "brightgreen", logo: "", style: "flat" },
  { category: "misc", displayName: "Contributions welcome", label: "contributions", message: "welcome", color: "orange", logo: "", style: "flat" },
  { category: "misc", displayName: "Made with love", label: "made%20with", message: "❤️", color: "red", logo: "", style: "flat" },
];

const PRESET_CATEGORIES = [
  { id: "npm", label: "npm" },
  { id: "github", label: "GitHub" },
  { id: "coverage", label: "Coverage" },
  { id: "lang", label: "Languages" },
  { id: "license", label: "License" },
  { id: "misc", label: "Misc" },
];

function encodeBadgePart(s: string): string {
  return s
    .replace(/-/g, "--")
    .replace(/_/g, "__")
    .replace(/ /g, "_");
}

function buildShieldsUrl(
  label: string,
  message: string,
  color: string,
  style: BadgeStyle,
  logo: string
): string {
  if (!label && !message) return "";
  const cleanColor = color.startsWith("#") ? color.slice(1) : color;
  const l = encodeBadgePart(label || "badge");
  const m = encodeBadgePart(message || "");
  const parts = [l, m, cleanColor].filter(Boolean);
  let url = `https://img.shields.io/badge/${parts.join("-")}`;
  const params: string[] = [];
  if (style !== "flat") params.push(`style=${style}`);
  if (logo) params.push(`logo=${encodeURIComponent(logo)}`);
  if (params.length) url += `?${params.join("&")}`;
  return url;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied!`);
      ToolEvents.resultCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — please select and copy manually.");
    }
  }, [text, label]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 h-8 text-xs font-mono"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function MarkdownBadgeGeneratorTool() {
  const [label, setLabel] = useState("build");
  const [message, setMessage] = useState("passing");
  const [color, setColor] = useState("brightgreen");
  const [style, setStyle] = useState<BadgeStyle>("flat");
  const [logo, setLogo] = useState("githubactions");
  const [previewError, setPreviewError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("github");

  const badgeUrl = useMemo(
    () => buildShieldsUrl(label, message, color, style, logo),
    [label, message, color, style, logo]
  );

  const markdownSnippet = badgeUrl
    ? `![${label || "badge"}](${badgeUrl})`
    : "";
  const htmlSnippet = badgeUrl
    ? `<img alt="${label || "badge"}" src="${badgeUrl}" />`
    : "";

  const applyPreset = useCallback((preset: Preset) => {
    setLabel(preset.label);
    setMessage(preset.message);
    setColor(preset.color);
    setStyle(preset.style);
    setLogo(preset.logo);
    setPreviewError(false);
    ToolEvents.toolUsed("preset");
  }, []);

  const categoryPresets = useMemo(
    () => PRESETS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Live Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-muted/30 p-8 text-center"
      >
        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-medium">
          Live Preview
        </p>
        {badgeUrl && !previewError ? (
          <img
            src={badgeUrl}
            alt={`${label} ${message}`}
            onError={() => setPreviewError(true)}
            className="mx-auto max-h-10"
          />
        ) : (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {previewError ? "Preview unavailable — copy URL to use" : "Enter badge details below"}
          </div>
        )}
      </motion.div>

      {/* Builder Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-5"
      >
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">
          Badge Builder
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Label (left text)</label>
            <Input
              placeholder="e.g. build"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setPreviewError(false); }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message (right text)</label>
            <Input
              placeholder="e.g. passing"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setPreviewError(false); }}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <Input
              placeholder="e.g. brightgreen or 4caf50"
              value={color}
              onChange={(e) => { setColor(e.target.value); setPreviewError(false); }}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {NAMED_COLORS.slice(0, 8).map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => { setColor(c.name); setPreviewError(false); }}
                  className="h-5 w-5 rounded-full border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand"
                  style={{ backgroundColor: c.hex }}
                  aria-label={`Use color ${c.name}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Logo (Simple Icons slug)</label>
            <Input
              placeholder="e.g. github, npm, react"
              value={logo}
              onChange={(e) => { setLogo(e.target.value); setPreviewError(false); }}
            />
            <p className="text-xs text-muted-foreground">
              Find slugs at{" "}
              <a
                href="https://simpleicons.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                simpleicons.org
              </a>
            </p>
          </div>
        </div>

        {/* Style selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Style</label>
          <div className="flex flex-wrap gap-2">
            {BADGE_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStyle(s.value); setPreviewError(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  style === s.value
                    ? "bg-brand text-white border-brand"
                    : "border-border/60 hover:border-brand/50 hover:bg-muted/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Output Snippets */}
      {badgeUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
        >
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">
            Copy Snippet
          </h2>

          <div className="space-y-3">
            {[
              { label: "Markdown", code: markdownSnippet },
              { label: "HTML", code: htmlSnippet },
              { label: "URL", code: badgeUrl },
            ].map(({ label: snippetLabel, code }) => (
              <div key={snippetLabel} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {snippetLabel}
                  </span>
                  <CopyButton text={code} label={`Copy ${snippetLabel}`} />
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2 font-mono text-xs break-all text-foreground/80 border border-border/40">
                  {code}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
      >
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-widest">
          Preset Badges
        </h2>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-brand text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {categoryPresets.map((preset) => {
            const previewUrl = buildShieldsUrl(
              preset.label,
              preset.message,
              preset.color,
              preset.style,
              preset.logo
            );
            return (
              <button
                key={preset.displayName}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-brand/40 hover:bg-muted/40 transition-all text-left group"
              >
                <img
                  src={previewUrl}
                  alt={preset.displayName}
                  className="h-5 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {preset.displayName}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
