"use client";

import { useId } from "react";

import { Checkbox, Radio } from "@/shared/ui";

type QuickReplyOption = {
  label: string;
  value: string;
};

type QuickRepliesProps = {
  name?: string;
  onValueChange?: (value: string) => void;
  options: QuickReplyOption[];
  value?: string;
};

type MultiQuickRepliesProps = {
  maxSelections?: number;
  name?: string;
  onValueChange?: (values: string[]) => void;
  options: QuickReplyOption[];
  values?: string[];
};

export function QuickReplies({
  name,
  onValueChange,
  options,
  value,
}: QuickRepliesProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div className="flex flex-wrap justify-end gap-2" role="radiogroup">
      {options.map((option) => (
        <Radio
          appearance="chip"
          checked={value === option.value}
          className="text-[length:var(--font-size-body1)] font-normal leading-[1.5] tracking-normal"
          key={option.value}
          name={groupName}
          onChange={() => onValueChange?.(option.value)}
          value={option.value}
        >
          {option.label}
        </Radio>
      ))}
    </div>
  );
}

export function MultiQuickReplies({
  maxSelections = 3,
  name,
  onValueChange,
  options,
  values = [],
}: MultiQuickRepliesProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  function toggleValue(value: string) {
    if (values.includes(value)) {
      onValueChange?.(values.filter((selectedValue) => selectedValue !== value));
      return;
    }

    if (values.length < maxSelections) {
      onValueChange?.([...values, value]);
    }
  }

  return (
    <fieldset className="flex flex-wrap justify-end gap-2">
      <legend className="sr-only">최대 {maxSelections}개 선택</legend>
      {options.map((option) => {
        const isChecked = values.includes(option.value);
        const isDisabled = !isChecked && values.length >= maxSelections;

        return (
          <Checkbox
            appearance="chip"
            checked={isChecked}
            disabled={isDisabled}
            key={option.value}
            name={groupName}
            onChange={() => toggleValue(option.value)}
            value={option.value}
          >
            {option.label}
          </Checkbox>
        );
      })}
    </fieldset>
  );
}

export type { MultiQuickRepliesProps, QuickReplyOption, QuickRepliesProps };
