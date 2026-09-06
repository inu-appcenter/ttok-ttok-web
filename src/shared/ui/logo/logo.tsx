import Image from "next/image";

export type LogoVariant = "horizontal" | "stacked" | "vertical" | "wordmark";

export type LogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: LogoVariant;
};

const logoAssets: Record<LogoVariant, { height: number; src: string; width: number }> = {
  horizontal: { height: 62, src: "/logos/ttok-horizontal.svg", width: 120 },
  stacked: { height: 120, src: "/logos/ttok-stacked.svg", width: 78 },
  vertical: { height: 112, src: "/logos/ttok-vertical.svg", width: 140 },
  wordmark: { height: 41, src: "/logos/ttok-wordmark.svg", width: 74 },
};

export function Logo({
  alt = "똑똑",
  className,
  priority = false,
  variant = "horizontal",
}: LogoProps) {
  const asset = logoAssets[variant];

  return (
    <Image
      alt={alt}
      className={`h-auto object-contain ${className ?? ""}`}
      height={asset.height}
      priority={priority}
      src={asset.src}
      width={asset.width}
    />
  );
}
