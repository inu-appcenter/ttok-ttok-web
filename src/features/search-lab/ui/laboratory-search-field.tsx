"use client";

import { HomeSearchField } from "./home-search-field";

export type LaboratorySearchFieldProps = {
  initialQuery?: string;
  category?: string;
  college?: string;
  department?: string;
  categories?: string[];
  isDisabled?: boolean;
};

export function LaboratorySearchField({
  initialQuery = "",
  category = "",
  college = "",
  department = "",
  categories = [],
  isDisabled = false,
}: LaboratorySearchFieldProps) {
  return (
    <HomeSearchField
      categories={categories}
      initialCategory={category}
      initialCollege={college}
      initialDepartment={department}
      initialQuery={initialQuery}
      isDisabled={isDisabled}
      showRecommendations={false}
    />
  );
}
