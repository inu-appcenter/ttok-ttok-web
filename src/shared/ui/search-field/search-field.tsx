"use client";

import Image from "next/image";
import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { forwardRef } from "react";

type SearchFieldSize = "default" | "lg" | "sm";
type SearchFieldRounded = "all" | "top";

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  elevated?: boolean;
  hoverBackground?: boolean;
  onSearch?: (value: string) => void;
  rounded?: SearchFieldRounded;
  size?: SearchFieldSize;
};

const sizeClasses: Record<SearchFieldSize, string> = {
  default: "h-12 px-[var(--spacing-spacing-5)] text-[length:var(--font-size-body2)]",
  lg: "h-[52px] pl-[var(--spacing-spacing-3)] pr-[var(--spacing-spacing-4)] text-[length:var(--font-size-headline1)]",
  sm: "h-9 px-[var(--spacing-spacing-4)] text-[length:var(--font-size-label2)]",
};

const roundedClasses: Record<SearchFieldSize, Record<SearchFieldRounded, string>> = {
  default: {
    all: "rounded-[var(--radius-2xl)]",
    top: "rounded-t-[var(--radius-2xl)]",
  },
  lg: {
    all: "rounded-[var(--radius-xl)]",
    top: "rounded-t-[var(--radius-xl)]",
  },
  sm: {
    all: "rounded-[var(--radius-xl)]",
    top: "rounded-t-[var(--radius-xl)]",
  },
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      className,
      disabled,
      elevated = true,
      hoverBackground = true,
      onKeyDown,
      onSearch,
      rounded = "all",
      size = "default",
      value,
      ...props
    },
    ref,
  ) {
    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event);

      if (event.key === "Enter" && !event.defaultPrevented) {
        onSearch?.(event.currentTarget.value);
      }
    }

    return (
      <div
        className={`flex items-center border border-border-subtle bg-bg-default transition-colors focus-within:border-border-primary focus-within:bg-bg-default has-[:disabled]:border-border-disabled has-[:disabled]:bg-bg-disabled ${hoverBackground ? "hover:bg-bg-subtle" : ""} ${elevated ? (size === "sm" ? "shadow-[0_2px_8px_var(--color-opacity-black-10)]" : "shadow-[0_4px_16px_var(--color-opacity-black-10)]") : "shadow-none"} ${sizeClasses[size]} ${roundedClasses[size][rounded]}`}
      >
        <input
          {...props}
          className={`min-w-0 flex-1 bg-transparent font-normal leading-[1.5] text-text-default outline-none placeholder:text-text-subtle disabled:cursor-not-allowed disabled:text-text-disabled disabled:placeholder:text-text-disabled ${className ?? ""}`}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          ref={ref}
          type="search"
          value={value}
        />
        <button
          aria-label="검색"
          className="ml-[var(--spacing-spacing-2)] flex shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary disabled:cursor-default"
          disabled={disabled || !onSearch}
          onClick={() => onSearch?.(String(value ?? ""))}
          type="button"
        >
          <Image
            alt=""
            height={size === "default" ? 18 : 16}
            src="/icons/search.svg"
            width={size === "default" ? 18 : 16}
          />
        </button>
      </div>
    );
  },
);
