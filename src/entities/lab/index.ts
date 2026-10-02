export { getPopularLabs } from "./api/get-popular-labs";
export { MOCK_LAB_DETAILS, MOCK_LABS } from "./model/mock-labs";
export { toLabSummary, toLabSummaryPage } from "./model/map-laboratory";
export { LabCard, LabCardSkeleton } from "./ui/lab-card";
export type { LabCardProps } from "./ui/lab-card";
export { LabSearchResultItem } from "./ui/lab-search-result-item";
export type { LabSearchResultItemProps } from "./ui/lab-search-result-item";
export { SelectedLabCard } from "./ui/selected-lab-card";
export type { SelectedLabCardProps } from "./ui/selected-lab-card";
export type { LabDetail, LabPaper, LabSummary, LabSummaryPage } from "./model/lab";
export type {
  Laboratory,
  LaboratoryCapacity,
  LaboratoryPage,
  LaboratoryPageParams,
  LaboratoryProfessor,
  LaboratorySearchParams,
} from "./model/laboratory";
