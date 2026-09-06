import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

// Tokens Studio (free tier, single-file sync) writes every token set into one
// JSON, keyed by set name. The actual sets synced from Figma are:
//   Primitive/desktop, Primitive/mobile, Typography/desktop, Typography/mobile,
//   Semantic/Mode 1 (single theme - no light/dark)
// Desktop and mobile primitives/typography intentionally hold different values
// (responsive scale), so instead of one flat build we do: mobile values as the
// unconditional :root default, and only the values that actually differ on
// desktop re-declared inside a min-width media query - the same pattern
// globals.css already uses for prefers-color-scheme.
const BREAKPOINT = '768px'; // matches Tailwind's default `md` breakpoint

const raw = JSON.parse(readFileSync('tokens/tokens.json', 'utf-8'));

// Tokens Studio lets a token be typed as generic "Number" instead of the
// semantic type (Spacing / Border Radius / Font Sizes), and that's how these
// sets were synced from Figma. sd-transforms' px transform only adds a `px`
// unit to tokens typed dimension/fontSize/etc, so anything left as "number"
// renders as a bare value (e.g. `12` instead of `12px`). Retype the known
// dimension categories here so px units come out regardless of what type
// was picked in Figma.
function retype(tree, type) {
  if (!tree || typeof tree !== 'object') return tree;
  if ('$value' in tree) return tree.$type === 'number' ? { ...tree, $type: type } : tree;
  return Object.fromEntries(Object.entries(tree).map(([k, v]) => [k, retype(v, type)]));
}

const FONT_WEIGHT_VALUES = {
  Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
};

function normalizeFontWeightValues(tree) {
  if (!tree || typeof tree !== 'object') return tree;
  if ('$value' in tree) {
    const numericValue = FONT_WEIGHT_VALUES[tree.$value];
    return numericValue
      ? { ...tree, $type: 'fontWeight', $value: numericValue }
      : tree;
  }
  return Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [key, normalizeFontWeightValues(value)]),
  );
}

function normalizeDimensionTypes(set) {
  if (!set) return set;
  const out = { ...set };
  if (out.radius) out.radius = retype(out.radius, 'dimension');
  if (out.spacing) out.spacing = retype(out.spacing, 'dimension');
  if (out['font-size']) out['font-size'] = retype(out['font-size'], 'fontSize');
  if (out.typography?.['font-size']) {
    out.typography = { ...out.typography, 'font-size': retype(out.typography['font-size'], 'fontSize') };
  }
  if (out['font-weight']) {
    out['font-weight'] = normalizeFontWeightValues(out['font-weight']);
  }
  if (out.typography?.['font-weight']) {
    out.typography = {
      ...out.typography,
      'font-weight': normalizeFontWeightValues(out.typography['font-weight']),
    };
  }
  return out;
}

for (const key of ['Primitive/mobile', 'Primitive/desktop', 'Typography/mobile', 'Typography/desktop']) {
  if (raw[key]) raw[key] = normalizeDimensionTypes(raw[key]);
}

function deepMerge(a, b) {
  const out = { ...a };
  for (const [key, value] of Object.entries(b)) {
    out[key] =
      value && typeof value === 'object' && a[key] && typeof a[key] === 'object'
        ? deepMerge(a[key], value)
        : value;
  }
  return out;
}

// Recursively tag every leaf token with its tier so the two tiers can be told
// apart after they're merged back together into the same category tree
// (needed for reference resolution - see semanticInput below).
function tag(tree, tier) {
  if (!tree || typeof tree !== 'object') return tree;
  if ('$value' in tree) return { ...tree, tier };
  return Object.fromEntries(Object.entries(tree).map(([k, v]) => [k, tag(v, tier)]));
}

// Returns the subset of `override` whose token values actually differ from `base`.
function diffLeaves(base, override) {
  const out = {};
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base?.[key];
    if (value && typeof value === 'object' && '$value' in value) {
      if (!baseValue || JSON.stringify(baseValue.$value) !== JSON.stringify(value.$value)) {
        out[key] = value;
      }
    } else if (value && typeof value === 'object') {
      const nested = diffLeaves(baseValue ?? {}, value);
      if (Object.keys(nested).length > 0) out[key] = nested;
    }
  }
  return out;
}

const mobile = deepMerge(raw['Primitive/mobile'] ?? {}, raw['Typography/mobile'] ?? {});
const desktop = deepMerge(raw['Primitive/desktop'] ?? {}, raw['Typography/desktop'] ?? {});
const desktopOverrides = diffLeaves(mobile, desktop);
const semantic = raw['Semantic/Mode 1'] ?? {};

// Semantic tokens reference primitives by bare path (e.g. {color.primary.primary-300}),
// so the semantic build needs a full primitive tree present to resolve those
// references into var() names - values don't matter here since outputReferences
// is on, only names do, so it doesn't matter that we picked desktop's tree.
const semanticInput = deepMerge(desktop, tag(semantic, 'semantic'));

async function build(tokens, files) {
  const sd = new StyleDictionary({
    tokens,
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab'],
        buildPath: 'src/_app/styles/tokens/',
        files,
      },
    },
  });
  await sd.buildAllPlatforms();
}

await build(tag(mobile, 'primitive'), [
  {
    destination: 'primitives.mobile.generated.css',
    format: 'css/variables',
    filter: (token) => token.tier === 'primitive',
    // @theme (not :root) so Tailwind also generates utilities straight off
    // primitives (e.g. bg-primary-primary-300), not just semantic tokens.
    // The desktop override file below still wins at >=768px since it's a
    // plain :root declaration imported after this one, same specificity.
    options: { outputReferences: false, selector: '@theme' },
  },
]);

await build(tag(desktopOverrides, 'primitive'), [
  {
    destination: 'primitives.desktop.generated.css',
    format: 'css/variables',
    filter: (token) => token.tier === 'primitive',
    options: { outputReferences: false, selector: [`@media (min-width: ${BREAKPOINT})`, ':root'] },
  },
]);

await build(semanticInput, [
  {
    destination: 'semantic.generated.css',
    format: 'css/variables',
    filter: (token) => token.tier === 'semantic',
    options: { outputReferences: true, selector: '@theme' },
  },
]);
