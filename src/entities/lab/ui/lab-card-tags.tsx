"use client";

import { useEffect, useRef, useState } from "react";
import { Tag } from "@/shared/ui";

export function LabCardTags({ tags }: { tags: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const updateOverflow = () => setIsOverflowing(content.scrollWidth > container.clientWidth);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [tags]);

  return (
    <div
      ref={containerRef}
      className={`mt-1 min-w-0 overflow-hidden ${isOverflowing ? "[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]" : ""}`}
    >
      <div ref={contentRef} className="flex w-max items-center gap-[var(--spacing-spacing-2)]">
        {tags.map((tag, index) => (
          <Tag className="shrink-0 whitespace-nowrap" key={`${tag}-${index}`} size="sm" tone="primary">
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
}
