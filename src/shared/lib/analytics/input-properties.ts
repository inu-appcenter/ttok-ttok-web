const INPUT_PROPERTY_KEYS = ["query", "field_query", "keywords"] as const;
const CONTACT_OR_IDENTIFIER = /[@＠]|(?:https?:\/\/|www\.|open\.kakao\.com|kakao\.com\/|mailto:|tel:)|(?:\d[\s.()-]*){7}|(?:password|passwd|비밀번호|학번|연락처|전화번호)\s*[:=]/iu;

function isShareableInput(value: unknown, maxLength: number): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    !CONTACT_OR_IDENTIFIER.test(value.normalize("NFKC"));
}

export function filterAnalyticsInputProperties(
  properties: Record<string, unknown>,
  includeInputValues: boolean,
) {
  for (const key of INPUT_PROPERTY_KEYS) {
    if (!Object.hasOwn(properties, key)) continue;
    const value = properties[key];
    if (!includeInputValues) {
      delete properties[key];
    } else if (key === "keywords") {
      if (!Array.isArray(value) || !value.every((item) => isShareableInput(item, 30))) {
        delete properties[key];
      }
    } else {
      const maxLength = key === "query" ? 30 : 100;
      properties[key] = isShareableInput(value, maxLength) ? value : null;
    }
  }
}
