import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type ColorToken = { hex: string; name: string; variable: string };

const semanticColors: ColorToken[] = [
  { name: "기본 배경", variable: "--color-bg-default", hex: "#ffffff" },
  { name: "보조 배경", variable: "--color-bg-subtle", hex: "#f9f9f9" },
  { name: "중립 배경", variable: "--color-bg-neutral", hex: "#f5f5f5" },
  { name: "기본 텍스트", variable: "--color-text-default", hex: "#434343" },
  { name: "보조 텍스트", variable: "--color-text-subtle", hex: "#737373" },
  { name: "기본 액션", variable: "--color-button-primary", hex: "#749fda" },
  { name: "성공 상태", variable: "--color-bg-success", hex: "#e8f6ed" },
  { name: "경고 상태", variable: "--color-bg-warning", hex: "#fdf7e6" },
  { name: "오류 상태", variable: "--color-bg-error", hex: "#fce9e9" },
  { name: "기본 테두리", variable: "--color-border-default", hex: "#acacac" },
];

function ColorPalette() {
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {semanticColors.map((color) => (
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-default" key={color.variable}>
          <div className="h-20" style={{ backgroundColor: `var(${color.variable})` } satisfies CSSProperties} />
          <div className="space-y-1 p-3 text-sm">
            <p className="font-semibold text-text-default">{color.name}</p>
            <p className="font-mono text-text-subtle">{color.variable}</p>
            <p className="font-mono text-text-subtle">{color.hex}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Shared/Design Tokens/Color Palette",
  component: ColorPalette,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ColorPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {};
