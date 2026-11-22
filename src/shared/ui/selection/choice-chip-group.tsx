"use client";

import type { ReactNode } from "react";

const CHIP_CLASSES =
  "group inline-flex min-h-8 cursor-pointer items-center rounded-[var(--radius-full)] border border-border-subtle bg-bg-default px-[14px] py-[var(--spacing-spacing-1)] text-text-subtle hover:border-border-primary hover:bg-bg-primary-subtle has-[:checked]:border-bg-primary has-[:checked]:bg-bg-primary has-[:checked]:text-text-inverse has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-border-primary";

type ChoiceChipGroupBaseProps = {
  className?: string;
  disabled?: boolean;
  /** legend 옆에 붙는 짧은 안내. 예: "최대 3개까지 선택할 수 있어요" */
  hint?: ReactNode;
  label: ReactNode;
  name: string;
  options: readonly string[];
};

type SingleChoiceChipGroupProps = ChoiceChipGroupBaseProps & {
  multiple?: false;
  onChange: (value: string) => void;
  value: string;
};

type MultipleChoiceChipGroupProps = ChoiceChipGroupBaseProps & {
  /** 이 개수만큼 고르면 선택하지 않은 칩을 비활성화한다. */
  maxSelected?: number;
  multiple: true;
  onChange: (values: string[]) => void;
  value: readonly string[];
};

export type ChoiceChipGroupProps =
  | SingleChoiceChipGroupProps
  | MultipleChoiceChipGroupProps;

/** 선택지 밖의 저장값도 사라지지 않도록 뒤에 덧붙여 보여준다. */
function withSelectedValues(
  options: readonly string[],
  selected: readonly string[],
) {
  const extra = selected.filter((value) => value && !options.includes(value));
  return [...options, ...new Set(extra)];
}

export function ChoiceChipGroup(props: ChoiceChipGroupProps) {
  const { className, disabled, hint, label, name, options } = props;
  const selected = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];
  const isAtMax =
    props.multiple &&
    props.maxSelected !== undefined &&
    props.value.length >= props.maxSelected;

  function handleChange(option: string, isChecked: boolean) {
    if (!props.multiple) {
      props.onChange(option);
      return;
    }
    props.onChange(
      isChecked
        ? [...props.value.filter((value) => value !== option), option]
        : props.value.filter((value) => value !== option),
    );
  }

  return (
    <fieldset
      className={`flex min-w-0 flex-col gap-[var(--spacing-spacing-2)] ${className ?? ""}`}
    >
      <legend className="mb-[var(--spacing-spacing-2)] flex flex-wrap items-baseline gap-x-[var(--spacing-spacing-2)] text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-default">
        {label}
        {hint ? (
          <span className="text-[length:var(--font-size-caption1)] font-normal text-text-subtle">
            {hint}
          </span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-[var(--spacing-spacing-2)]">
        {withSelectedValues(options, selected).map((option) => {
          const isChecked = selected.includes(option);
          return (
            <label className={CHIP_CLASSES} key={option}>
              <input
                checked={isChecked}
                className="sr-only"
                disabled={disabled || (isAtMax && !isChecked)}
                name={name}
                onChange={(event) =>
                  handleChange(option, event.currentTarget.checked)
                }
                type={props.multiple ? "checkbox" : "radio"}
                value={option}
              />
              <span className="text-[length:var(--font-size-body2)] font-normal leading-[1.5]">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
