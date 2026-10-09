import { HomeSearchField, type HomeSearchFieldProps } from "./home-search-field";

export type MobileLabExplorerProps = Pick<
  HomeSearchFieldProps,
  "categories" | "categoriesError" | "colleges" | "collegesError"
>;

export function MobileLabExplorer(props: MobileLabExplorerProps) {
  return <HomeSearchField {...props} requireCondition={false} />;
}
