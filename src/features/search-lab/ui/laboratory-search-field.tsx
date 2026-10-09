"use client";

import type { CollegeOption } from "@/entities/lab";

import { HomeSearchField } from "./home-search-field";

export type LaboratorySearchFieldProps = {
  initialQuery?: string;
  category?: string;
  college?: string;
  department?: string;
  categories?: string[];
  categoriesError?: string;
  colleges?: CollegeOption[];
  collegesError?: string;
  isDisabled?: boolean;
};

export function LaboratorySearchField({
  initialQuery = "",
  category = "",
  college = "",
  department = "",
  categories = [],
  categoriesError,
  colleges = [],
  collegesError,
  isDisabled = false,
}: LaboratorySearchFieldProps) {
  return (
    <HomeSearchField
      categories={categories}
      categoriesError={categoriesError}
      colleges={colleges}
      collegesError={collegesError}
      initialCategory={category}
      initialCollege={college}
      initialDepartment={department}
      initialQuery={initialQuery}
      isDisabled={isDisabled}
      requireCondition={false}
    />
  );
}
