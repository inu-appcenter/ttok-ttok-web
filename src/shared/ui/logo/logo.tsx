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
  stacked: { height: 114, src: "/logos/ttok-vertical-text-icon.svg", width: 79 },
  vertical: { height: 112, src: "/logos/ttok-vertical.svg", width: 140 },
  wordmark: { height: 45, src: "/logos/ttok-text.svg", width: 79 },
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
