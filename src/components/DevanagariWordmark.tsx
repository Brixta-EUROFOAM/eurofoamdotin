import type { CSSProperties } from "react";

type Props = {
  text: string;
  background?: string;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export default function DevanagariWordmark({
  text,
  background = "#FF6500",
  color = "#111111",
  className = "",
  size = "lg",
}: Props) {
  const style = {
    "--dw-bg": background,
    "--dw-fg": color,
  } as CSSProperties;

  return (
    <div
      className={`devanagari-wordmark-shell devanagari-wordmark-shell--${size} ${className}`}
      style={style}
    >
      <span
        className="devanagari-wordmark-text"
        aria-label={text}
      >
        {text}
      </span>
    </div>
  );
}
