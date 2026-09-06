import { Button } from "@/shared/ui";

type OnboardingSubmitProps = {
  disabled?: boolean;
};

export function OnboardingSubmit({ disabled = false }: OnboardingSubmitProps) {
  return (
    <Button disabled={disabled} type="submit" variant="text">
      보내기
    </Button>
  );
}
