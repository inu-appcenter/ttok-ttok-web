"use client";

import { HomeSearchField } from "./home-search-field";

export type LaboratorySearchFieldProps = {
  initialQuery?: string;
  category?: string;
  department?: string;
  categories?: string[];
  isDisabled?: boolean;
};

export function LaboratorySearchField({
  initialQuery = "",
  category = "",
  department = "",
  categories = [],
  isDisabled = false,
}: LaboratorySearchFieldProps) {
  return (
    <HomeSearchField
      categories={categories}
      initialCategory={category}
      initialDepartment={department}
      initialQuery={initialQuery}
      isDisabled={isDisabled}
      showRecommendations={false}
    />
  );
}
