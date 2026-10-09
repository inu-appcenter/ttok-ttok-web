export const FIELD_INDEX = [
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
  "A-Z",
];
const HANGUL_INITIALS = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export function getInitials(value: string) {
  return [...value]
    .map((character) => {
      const offset = character.charCodeAt(0) - 0xac00;
      return offset >= 0 && offset <= 11171
        ? HANGUL_INITIALS[Math.floor(offset / 588)]
        : character;
    })
    .join("");
}

export function getFieldIndex(value: string) {
  const initial = getInitials(value)[0];
  const basic =
    (
      { ㄲ: "ㄱ", ㄸ: "ㄷ", ㅃ: "ㅂ", ㅆ: "ㅅ", ㅉ: "ㅈ" } as Record<
        string,
        string
      >
    )[initial] ?? initial;
  return FIELD_INDEX.includes(basic) ? basic : "A-Z";
}

export function matchesField(value: string, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (
    value.toLocaleLowerCase().includes(normalizedQuery) ||
    getInitials(value).toLocaleLowerCase().includes(normalizedQuery)
  );
}
