import Image from "next/image";

export type LogoVariant = "horizontal" | "stacked" | "vertical" | "wordmark";

export type LogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: LogoVariant;
};

const logoAssets: Record<Exclude<LogoVariant, "vertical">, { height: number; src: string; width: number }> = {
  horizontal: { height: 62, src: "/logos/ttok-horizontal.svg", width: 120 },
  stacked: { height: 114, src: "/logos/ttok-vertical-text-icon.svg", width: 79 },
  wordmark: { height: 45, src: "/logos/ttok-text.svg", width: 79 },
};

export function Logo({
  alt = "똑똑",
  className,
  priority = false,
  variant = "horizontal",
}: LogoProps) {
  if (variant === "vertical") {
    return (
      <span
        aria-label={alt}
        className={`inline-flex w-[140px] flex-col items-center gap-[6px] ${className ?? ""}`}
        role="img"
      >
        <span className="whitespace-nowrap text-[11.457px] font-medium leading-[14px] tracking-[-0.4583px] text-[#749fda]">
          인천대생들을 위한 연구실 서비스
        </span>
        <span className="flex w-[84.988px] flex-col items-center overflow-hidden px-[11px]">
          <Image
            alt=""
            className="h-[56.737px] w-[48.953px] max-w-none"
            height={57}
            priority={priority}
            src="/logos/ttok-login-mark.svg"
            width={49}
          />
          <Image
            alt=""
            className="h-[35.543px] w-[62.988px] max-w-none"
            height={36}
            priority={priority}
            src="/logos/ttok-login-wordmark.svg"
            width={63}
          />
        </span>
      </span>
    );
  }

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
