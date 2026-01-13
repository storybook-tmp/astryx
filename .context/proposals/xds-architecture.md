# XDS Architecture Proposal

*Proposal — January 2026*

## Builder Jobs To Be Done

XDS serves developers across their workflow phases. Based on research in `frontend-developer-jtbd.md`:

### Primary Jobs by Phase

| Phase | Job | What Success Looks Like |
|-------|-----|------------------------|
| **Setup** | Set up project styling | Define tokens/themes in one place; immediate consistency |
| **Setup** | Configure for my stack | Works with my build tools, framework, IDE |
| **Build** | Construct pages from components | Compose UI quickly with typed props, autocomplete |
| **Build** | Customize component appearance | Theme changes propagate everywhere automatically |
| **Build** | Handle edge cases | Swizzle when needed, clear escalation path |
| **Maintain** | Update to new versions | Clear migration path, deprecation warnings |
| **Collaborate** | Work with AI assistants | Typed APIs, constrained options, predictable patterns |

### How XDS Layers Map to Jobs

| XDS Layer | Primary Jobs Served |
|-----------|---------------------|
| **Theme Layer** | Set up styling, customize appearance, maintain consistency |
| **Component API** | Construct pages, stay consistent, work with AI |
| **Swizzle Layer** | Handle edge cases, customize beyond theme |
| **CLI/Tooling** | Configure for stack, adopt incrementally, update versions |

### The Three Core Builder Actions

| Job | What the Builder Wants | XDS Layer |
|-----|------------------------|-----------|
| **1. Set visual style** | "I want to define my project's look and feel" | **Theme Layer** |
| **2. Override/create components** | "I want to customize beyond what's possible in the theme" | **Swizzle Layer** |
| **3. Construct pages** | "I want to use components to build UIs" | **Component API** |

```
┌─────────────────────────────────────────────────────────────────────┐
│  JOB 3: CONSTRUCT PAGES (Component API)                            │
│                                                                     │
│  <Button variant="primary" size="md" />                             │
│  <Stack gap="md"><Card>...</Card></Stack>                          │
│                                                                     │
│  Builder experience:                                                │
│  - Typed props, autocomplete-driven                                │
│  - No styling decisions — just intent and structure                │
│  - AI can generate valid code with high confidence                 │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 2: OVERRIDE/CREATE COMPONENTS (Swizzle Layer)                 │
│                                                                     │
│  npx xds swizzle Button                                            │
│  → src/components/xds/Button/Button.tsx                            │
│                                                                     │
│  Builder experience:                                                │
│  - Full component source, yours to modify                          │
│  - Access to semantic CSS variables (--xds-color-primary)          │
│  - Documented customization points for AI assistance               │
├─────────────────────────────────────────────────────────────────────┤
│  JOB 1: SET VISUAL STYLE (Theme Layer)                             │
│                                                                     │
│  const theme = createTheme({                                       │
│    tokens: {                                                       │
│      color: { primary: ['#0066cc', '#66b3ff'] },                   │
│      spacing: { sm: '0.5rem', md: '1rem' },                        │
│    }                                                               │
│  })                                                                │
│                                                                     │
│  Builder experience:                                                │
│  - Define design tokens in one place                               │
│  - Distributable as npm package                                    │
│  - Components read tokens via CSS variables                        │
└─────────────────────────────────────────────────────────────────────┘
```

### How the Jobs Relate

| If the builder needs... | They use... | Complexity |
|------------------------|-------------|------------|
| Different colors/spacing | Theme tokens | Low |
| New button variant | Swizzle | Medium |
| Custom component structure | Swizzle | Medium |
| New component behavior | New component | High |

**Escalation path**: Theme (tokens) → Swizzle (variants) → Custom. Each step up gives more control at the cost of more responsibility.

---

## Context

Designing the architecture for XDS based on explorations in:
- `frontend-developer-jtbd.md` — Developer jobs research, workflow phases
- `zero-styling-architecture.md` — Components with no styles, theme-driven
- `stylex-vs-tailwind.md` — StyleX core + `@xds/variants` wrapper, token tiers, AI considerations
- `ai-trajectory-predictions.md` — Constraints beat suggestions
- `ai-design-system-gaps.md` — Types as enforcement

### Key Requirements

1. **Zero-styling**: Components ship with no inline styles
2. **AI-friendly**: Constrained, predictable, learnable patterns for all three jobs
3. **Open source compatible**: Users define their own themes
4. **Multi-design-system**: Different systems have different semantic lockups
5. **Sub-part styling**: Style internal component slots (icons, labels, etc.)
6. **Evolvable**: Base tokens stay internal, semantic tokens exposed for swizzle
7. **Distributable**: Themes can be packaged and shared independently

---

## Core Architecture

### Three-Layer System

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: COMPONENT API (Public)                               │
│                                                                 │
│  <Button variant="primary" size="md" />                         │
│  <ListItem variant="default" iconSlot={<Icon />} />             │
│                                                                 │
│  - Props define intent, not style                              │
│  - Components define their own variants                        │
│  - TypeScript enforces valid prop combinations                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: DESIGN TOKENS (Theme Layer)                          │
│                                                                 │
│  const myTheme = createTheme({                                 │
│    tokens: {                                                   │
│      color: { primary: [...], secondary: [...] },              │
│      spacing: { sm: '0.5rem', md: '1rem' },                    │
│      radius: { sm: '4px', md: '8px' },                         │
│    }                                                           │
│  })                                                            │
│                                                                 │
│  - Tokens only — no component-level configurations             │
│  - Components read via CSS variables                           │
│  - Distributable as npm packages                               │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: COMPONENT VARIANTS (Swizzle Layer)                   │
│                                                                 │
│  const button = createVariants({                               │
│    variants: { variant: { primary: {...}, secondary: {...} } } │
│  })                                                            │
│                                                                 │
│  - Components define their own variant → style mappings        │
│  - Uses semantic tokens (var(--xds-color-primary))             │
│  - Swizzle to customize variants                               │
└─────────────────────────────────────────────────────────────────┘
```

**Key decision**: Theme = tokens only. Variant customization happens through swizzle, where typing is strict and self-contained.

---

## Handling Different Semantic Lockups

### The Problem

Different design systems have different semantic structures:

| Design System | Button Variants |
|---------------|----------------|
| System A | primary, secondary, tertiary |
| System B | primary, secondary, danger, ghost, link |
| System C | filled, outlined, text |
| System D | brand, neutral, destructive, success |

How does XDS support all of these with a single component library?

### Solution: Swizzle for Variant Customization

With token-only themes, XDS ships **default components with standard variants**. Users swizzle to customize.

**XDS default Button** (what you get out of the box):
```typescript
// @xds/core/Button.tsx
const button = createVariants({
  variants: {
    variant: {
      primary: { backgroundColor: 'var(--xds-color-primary)' },
      secondary: { backgroundColor: 'var(--xds-color-secondary)' },
      danger: { backgroundColor: 'var(--xds-color-danger)' },
    },
    size: {
      sm: { padding: 'var(--xds-spacing-sm)' },
      md: { padding: 'var(--xds-spacing-md)' },
    }
  }
});

export function Button({ variant = 'primary', size = 'md', children }) { ... }
// Props: variant: 'primary' | 'secondary' | 'danger'
```

**System A swizzles** to get their variants:
```typescript
// src/components/xds/Button.tsx (swizzled)
const button = createVariants({
  variants: {
    variant: {
      primary: { backgroundColor: 'var(--xds-color-primary)' },
      secondary: { backgroundColor: 'var(--xds-color-secondary)' },
      tertiary: { backgroundColor: 'transparent', border: '1px solid' },
    }
  }
});

export function Button({ variant = 'primary', children }) { ... }
// Props: variant: 'primary' | 'secondary' | 'tertiary'
```

### Type Safety is Self-Contained

Each component (swizzled or not) has strict types based on its own variant definition:

```typescript
// Type is inferred from createVariants definition
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'tertiary';  // From swizzled definition
  size?: 'sm' | 'md';
  children: React.ReactNode;
};

// ✅ Valid
<Button variant="tertiary">Click</Button>

// ❌ TypeScript error - 'ghost' not in this component's variants
<Button variant="ghost">Click</Button>
```

### How This Simplifies Things

| Concern | Token-only approach |
|---------|---------------------|
| **Where are variants defined?** | In the component file (one place) |
| **Type inference** | Self-contained in component |
| **AI context** | Component file has everything |
| **Customization path** | Swizzle the component |

---

## Sub-Part Styling (Slots)

### The Problem

Components have internal parts that need independent styling:
- Button: icon, label, loading indicator
- ListItem: leading icon, content, trailing action
- Input: prefix, input, suffix, error message

### Solution: Slots in Component Definition

With token-only themes, slots are defined in the component file using Tailwind Variants (recommended) or `createVariants`.

### Full Example: Button with Slots

**Step 1: Theme provides tokens**
```typescript
// theme.ts
export const theme = createTheme({
  tokens: {
    color: {
      primary: ['#0066cc', '#66b3ff'],
      onPrimary: ['#ffffff', '#000000'],
      secondary: ['#6b7280', '#9ca3af'],
      onSecondary: ['#ffffff', '#000000'],
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
    },
  },
});
```

**Step 2: Component defines variants and slots using tokens**
```typescript
// components/Button.tsx
import { tv } from 'tailwind-variants';

// Tailwind preset maps XDS tokens → Tailwind classes
// bg-primary → var(--xds-color-primary)
// px-md → var(--xds-spacing-md)

const button = tv({
  slots: {
    base: 'inline-flex items-center justify-center rounded-md cursor-pointer transition-colors',
    icon: 'shrink-0',
    label: 'font-medium',
    spinner: 'animate-spin',
  },

  variants: {
    variant: {
      primary: {
        base: 'bg-primary text-on-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary/50',
        icon: 'text-on-primary',
      },
      secondary: {
        base: 'bg-secondary text-on-secondary hover:bg-secondary-dark',
        icon: 'text-on-secondary',
      },
      ghost: {
        base: 'bg-transparent text-primary hover:bg-primary/10',
        icon: 'text-primary',
      },
    },
    size: {
      sm: {
        base: 'px-sm py-xs text-sm gap-xs',
        icon: 'w-3 h-3',
      },
      md: {
        base: 'px-md py-sm text-base gap-sm',
        icon: 'w-4 h-4',
      },
      lg: {
        base: 'px-lg py-md text-lg gap-sm',
        icon: 'w-5 h-5',
      },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// TypeScript infers props from variant definition
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant,
  size,
  icon,
  isLoading,
  children,
  onClick,
}: ButtonProps) {
  const styles = button({ variant, size });

  return (
    <button className={styles.base()} onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <Spinner className={styles.spinner()} />
      ) : (
        icon && <span className={styles.icon()}>{icon}</span>
      )}
      <span className={styles.label()}>{children}</span>
    </button>
  );
}
```

**Step 3: Use in app with theme provider**
```tsx
// App.tsx
import { Theme } from '@xds/core';
import { theme } from './theme';
import { Button } from './components/Button';
import { PlusIcon } from './icons';

function App() {
  return (
    <Theme theme={theme}>
      {/* Tokens flow through CSS variables */}
      <Button variant="primary" size="md" icon={<PlusIcon />}>
        Add Item
      </Button>

      <Button variant="ghost" size="sm">
        Cancel
      </Button>

      <Button variant="secondary" size="lg" isLoading>
        Saving...
      </Button>
    </Theme>
  );
}
```

### How It All Connects

```
┌─────────────────────────────────────────────────────────────────┐
│  THEME (tokens only)                                            │
│  primary: ['#0066cc', '#66b3ff']                               │
│           ↓                                                     │
│  Generates CSS: --xds-color-primary: light-dark(#0066cc, ...)  │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  TAILWIND PRESET                                                │
│  Maps: bg-primary → background-color: var(--xds-color-primary) │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT (variants + slots)                                   │
│  primary: { base: 'bg-primary text-on-primary' }               │
│  Button reads tokens via Tailwind classes                      │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  USAGE                                                          │
│  <Button variant="primary" icon={<Plus />}>Add</Button>        │
│  Props are typed, tokens flow through, slots render correctly  │
└─────────────────────────────────────────────────────────────────┘
```

### Slot Styling per Variant

Slots can have different styles per variant:

```typescript
variants: {
  variant: {
    primary: {
      base: 'bg-primary text-on-primary',
      icon: 'text-on-primary',           // Icon inherits primary colors
    },
    ghost: {
      base: 'bg-transparent text-primary',
      icon: 'text-primary opacity-70',   // Icon is slightly muted
    },
  }
}
```

### Using StyleX + createVariants (Alternative)

For advanced users who prefer StyleX:

```typescript
import * as stylex from '@stylexjs/stylex';
import { createVariants } from '@xds/variants';

const button = createVariants({
  base: stylex.create({ root: { cursor: 'pointer', borderRadius: 4 } }).root,

  slots: {
    icon: stylex.create({ root: { width: 16, height: 16 } }).root,
    label: stylex.create({ root: { fontWeight: 500 } }).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-primary)',
          color: 'var(--xds-color-on-primary)',
        }
      }).root,
    }
  }
});
```

---

## Theme Definition API

### Light/Dark Mode Enforcement

All color tokens are **required** to be `[light, dark]` pairs — TypeScript enforces this:

```typescript
type LightDarkPair = [light: string, dark: string];

// ❌ Type error: expected [string, string]
primary: '#0066cc',

// ✅ Valid: both light and dark values
primary: ['#0066cc', '#66b3ff'],
```

### The "on*" Pattern

Every background color has a corresponding foreground color for accessible contrast:

```
primary     → onPrimary      (text color when on primary background)
surface     → onSurface      (general text color)
danger      → onDanger       (text on danger background)
```

### createTheme Function

```typescript
import { createTheme } from '@xds/core';

export const myTheme = createTheme({
  tokens: {
    color: {
      // Surfaces — [light, dark]
      background: ['#ffffff', '#121212'],
      onBackground: ['#1a1a1a', '#e0e0e0'],
      surface: ['#f5f5f5', '#1e1e1e'],
      onSurface: ['#1a1a1a', '#e0e0e0'],

      // Brand — [light, dark]
      primary: ['#0066cc', '#66b3ff'],
      onPrimary: ['#ffffff', '#000000'],
      secondary: ['#6b7280', '#9ca3af'],
      onSecondary: ['#ffffff', '#000000'],

      // Semantic — [light, dark]
      danger: ['#dc2626', '#f87171'],
      onDanger: ['#ffffff', '#000000'],
      success: ['#16a34a', '#4ade80'],
      onSuccess: ['#ffffff', '#000000'],

      // Borders
      border: ['#e5e7eb', '#374151'],
      borderFocus: ['#0066cc', '#66b3ff'],
    },

    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },

    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },

    typography: {
      fontFamily: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      }
    },
  },
});

type MyTheme = typeof myTheme;
```

**Note**: Theme contains only tokens. Component variants are defined in component files.

### Generated CSS Output

Themes generate CSS using the `light-dark()` function:

```css
:root {
  color-scheme: light dark;

  /* Colors with automatic light/dark support */
  --xds-color-primary: light-dark(#0066cc, #66b3ff);
  --xds-color-on-primary: light-dark(#ffffff, #000000);
  --xds-color-background: light-dark(#ffffff, #121212);
  --xds-color-on-background: light-dark(#1a1a1a, #e0e0e0);

  /* Spacing (no light/dark needed) */
  --xds-spacing-sm: 0.5rem;
  --xds-spacing-md: 1rem;
}
```

Components reference these variables and automatically adapt to light/dark mode.

### Manual Mode Override

For apps that want manual light/dark toggle:

```tsx
// Follow system preference (default)
<Theme theme={myTheme} mode="system">

// Force dark mode
<Theme theme={myTheme} mode="dark">

// Force light mode
<Theme theme={myTheme} mode="light">
```

### Using the Theme

```typescript
import { Theme } from '@xds/core';
import { myTheme } from './theme';

function App() {
  return (
    <Theme theme={myTheme}>
      <Button variant="primary" size="md">
        Click me
      </Button>
    </Theme>
  );
}
```

### Theme Composition

Themes can extend other themes:

```typescript
import { baseTheme } from '@xds/themes/base';

const myTheme = createTheme({
  extends: baseTheme,

  // Override specific tokens
  tokens: {
    color: {
      primary: ['#custom-brand', '#custom-brand-dark'],
      secondary: ['#custom-secondary', '#custom-secondary-dark'],
    }
  },
});
```

To add new button variants, swizzle the Button component instead of modifying the theme.

---

## AI Compatibility Considerations

### AI-Friendliness by Job

| Job | AI Difficulty | Why |
|-----|---------------|-----|
| **Construct pages** | ✅ Easy | Typed props, autocomplete, finite options |
| **Set visual style** | ⚠️ Medium | Theme structure is learnable, but separate from components |
| **Override components** | ⚠️ Medium | Documented patterns, semantic tokens, but unfamiliar StyleX |

### Why This Architecture Is AI-Friendly

| Design Decision | AI Benefit |
|-----------------|------------|
| **Props, not classes** | `variant="primary"` is learnable; `bg-blue-500 hover:bg-blue-600` is arbitrary |
| **TypeScript enforcement** | Invalid props fail at compile time, AI gets immediate feedback |
| **Finite variant set** | AI learns discrete options, not infinite styling possibilities |
| **Consistent patterns** | Same API shape across all components |
| **No arbitrary values** | Can't generate `mt-[13px]`, only valid tokens |
| **Re-export pattern** | Concrete types in one file, no cross-package reasoning |

### The Author vs Consumer Gap

The "AI gap" is primarily for **component authors**, not **component consumers**.

| Role | API Surface | AI Difficulty |
|------|-------------|---------------|
| **Consumer** (Job 3) | `<Button variant="primary" size="md">` | Trivial — typed props, autocomplete |
| **Theme author** (Job 1) | `createTheme({ ... })` | Medium — structured, learnable |
| **Swizzler** (Job 2) | StyleX + semantic CSS variables | Medium — documented patterns |
| **Component author** | `createVariants({ ... stylex.create() ... })` | Higher — unfamiliar patterns |

**Why this matters**: Most users are consumers (Job 3). They never touch StyleX — they just use typed props.

### Theme as AI Context

Themes are structured data that can be included in AI context:

```typescript
// Theme can be serialized for LLM context
const themeContext = {
  availableVariants: {
    button: ['primary', 'secondary', 'danger'],
    input: ['default', 'error', 'success'],
  },
  availableSizes: ['sm', 'md', 'lg'],
  // ...
};
```

This enables AI to:
1. Know valid prop values without reading source
2. Generate only theme-valid code
3. Adapt to different themes dynamically

---

## Tailwind Interoperability

### Exporting Theme as CSS Variables

```typescript
// Auto-generated from theme
:root {
  --xds-color-primary: #0066cc;
  --xds-color-secondary: #6b7280;
  --xds-spacing-md: 1rem;
  /* ... */
}
```

### Tailwind Preset

```css
/* @xds/tailwind-preset */
@import "tailwindcss";
@import "@xds/tokens/css";

@theme {
  --color-primary: var(--xds-color-primary);
  --color-secondary: var(--xds-color-secondary);
  --spacing-md: var(--xds-spacing-md);
  /* ... */
}
```

Now Tailwind users can use XDS tokens:

```html
<div class="bg-primary text-on-primary p-md">
  Tailwind with XDS tokens
</div>
```

### Linting for Arbitrary Values

Provide ESLint/Stylelint rules to prevent:

```html
<!-- ❌ Flagged by lint -->
<div class="bg-[#0066cc] mt-[13px]">

<!-- ✅ Allowed -->
<div class="bg-primary mt-md">
```

---

## Swizzle API

**Job 2: Override/Create Components** — When you need to customize variants or behavior.

With token-only themes, swizzle is the path for **any component-level customization** beyond token changes.

### When to Swizzle

| Need | Solution |
|------|----------|
| Different primary color | Edit theme tokens |
| New button variant (e.g. `ghost`) | Swizzle Button |
| Custom click tracking | Swizzle Button |
| Different animation | Swizzle Button |
| Structural changes | Swizzle Button |

### Swizzle Command

```bash
# Default: Tailwind Variants format (recommended)
npx xds swizzle Button

# StyleX format (for advanced users)
npx xds swizzle Button --format=stylex
```

### Generated Code: Tailwind Variants (Default)

```typescript
/**
 * 🎨 SWIZZLED COMPONENT: Button
 *
 * Source: @xds/core@2.1.0
 * Swizzled: 2026-01-09
 *
 * ⚠️ This component is now your responsibility.
 *
 * RULES:
 * ✅ Use XDS token classes: bg-primary, text-on-primary, p-md
 * ❌ No arbitrary values: bg-[#ff0000], mt-[13px]
 *
 * COMMON CUSTOMIZATIONS:
 * - Add variant: add to variants.variant below
 * - Add behavior: modify handleClick function
 * - Change structure: modify JSX return
 */

import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    base: 'rounded-md cursor-pointer transition-colors',
    icon: 'w-4 h-4',
    label: 'font-medium',
  },

  variants: {
    // 👇 CUSTOMIZE: Add or modify variants
    variant: {
      primary: {
        base: 'bg-primary text-on-primary hover:bg-primary-dark',
        icon: 'text-on-primary',
      },
      secondary: {
        base: 'bg-secondary text-on-secondary hover:bg-secondary-dark',
        icon: 'text-on-secondary',
      },
      danger: {
        base: 'bg-danger text-on-danger hover:bg-danger-dark',
      },
    },

    size: {
      sm: { base: 'px-sm py-xs text-sm', icon: 'w-3 h-3' },
      md: { base: 'px-md py-sm text-base', icon: 'w-4 h-4' },
      lg: { base: 'px-lg py-md text-lg', icon: 'w-5 h-5' },
    },
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  // 👇 CUSTOMIZE: Add new props
}

export function Button({ variant, size, icon, children, onClick }: ButtonProps) {
  const styles = button({ variant, size });

  // 👇 CUSTOMIZE: Add behavior (tracking, analytics, etc.)
  const handleClick = () => {
    onClick?.();
  };

  return (
    <button className={styles.base()} onClick={handleClick}>
      {icon && <span className={styles.icon()}>{icon}</span>}
      <span className={styles.label()}>{children}</span>
    </button>
  );
}
```

### Why Tailwind is the Default

| Consideration | Tailwind Variants | StyleX |
|--------------|-------------------|--------|
| **AI familiarity** | ✅ High training data | ⚠️ Less common |
| **Learning curve** | ✅ Familiar to most | ⚠️ New syntax |
| **Encapsulation** | ⚠️ Classes in DOM | ✅ No exposed classes |
| **Recommendation** | **Default for most** | Advanced users |

### Format: StyleX (Alternative)

For advanced users who want maximum encapsulation:

```bash
npx xds swizzle Button --format=stylex
```

```typescript
import * as stylex from '@stylexjs/stylex';
import { createVariants } from '@xds/variants';

const button = createVariants({
  base: stylex.create({ root: { cursor: 'pointer', borderRadius: 4 } }).root,

  slots: {
    icon: stylex.create({ root: { width: 16, height: 16 } }).root,
    label: stylex.create({ root: { fontWeight: 500 } }).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: {
          backgroundColor: 'var(--xds-color-primary)',
          color: 'var(--xds-color-on-primary)',
        }
      }).root,
      // 👇 CUSTOMIZE: Add variants
    }
  }
});

export function Button({ variant = 'primary', children }) {
  const styles = button({ variant });
  return (
    <button {...stylex.props(styles.base())}>
      <span {...stylex.props(styles.slots.label())}>{children}</span>
    </button>
  );
}
```

### Token Enforcement

Both formats use XDS tokens via the Tailwind preset — no arbitrary values:

```tsx
// ✅ Uses XDS token
base: 'bg-primary text-on-primary p-md',

// ❌ Linting error: arbitrary value not allowed
base: 'bg-[#0066cc] text-white p-4',
```

### Swizzle Versioning

Swizzled components are "ejected" — they don't auto-update:

```
⚠️ Swizzled component: Button
   Source version: @xds/core@2.1.0
   Last synced: 2026-01-15

   This component is now your responsibility.
   Check @xds/core changelog for updates.
```

---

## Distributable Themes

**Job 1: Set Visual Style** — Themes can be packaged and shared independently.

### Theme as npm Package

With token-only themes, packages are simple:

```
@company/dark-theme/
├── package.json
├── theme.ts          # Token definitions
├── index.ts          # Exports theme + types
└── tokens.css        # Generated CSS variables
```

```typescript
// @company/dark-theme/theme.ts
import { createTheme } from '@xds/core';

export const darkTheme = createTheme({
  tokens: {
    color: {
      primary: ['#6366f1', '#818cf8'],
      onPrimary: ['#ffffff', '#000000'],
      background: ['#1a1a2e', '#0f0f1a'],
      onBackground: ['#e0e0e0', '#ffffff'],
      // ...
    },
    spacing: {
      sm: '0.5rem',
      md: '1rem',
    },
  },
});

export type DarkTheme = typeof darkTheme;
```

### Using a Theme Package

```typescript
// src/App.tsx
import { Theme } from '@xds/core';
import { darkTheme } from '@company/dark-theme';
import { Button } from '@xds/core';

function App() {
  return (
    <Theme theme={darkTheme}>
      <Button variant="primary">Click me</Button>
    </Theme>
  );
}
```

### Type Safety

With token-only themes, type safety is straightforward:

| What | Where Types Come From |
|------|----------------------|
| **Tokens** | Theme definition (`darkTheme.tokens.color.primary`) |
| **Component variants** | Component definition (self-contained) |

Components have their own types based on their variant definitions — no cross-package type inference needed.

---

## Open Questions

### Resolved

1. ~~**Light/dark mode support?**~~ → **Resolved**: Color tokens are always `[light, dark]` pairs. CSS uses `light-dark()` function. TypeScript enforces pairs.

2. ~~**Swizzle layer ergonomics?**~~ → **Resolved**: Swizzle with Tailwind Variants as default format. StyleX available for advanced users.

3. ~~**Component themes in theme vs component file?**~~ → **Resolved**: Token-only themes. Component variants are defined in component files, customized via swizzle.

4. ~~**Prop naming (intent vs variant)?**~~ → **Resolved**: Use `variant` — more corpus representation for AI.

### Unresolved Design Decisions

1. **How deep should slot nesting go?**
   - `button.slots.icon.hover` or just `button.slots.icon`?
   - Risk of over-specification vs. flexibility

2. **Should themes be runtime or compile-time?**
   - Compile-time: Better performance, type safety
   - Runtime: Dynamic theming, user preferences
   - Hybrid: Base at compile-time, overrides at runtime?

3. **How to handle responsive tokens?**
   - `spacing: { md: { default: '1rem', '@md': '1.5rem' } }`
   - Or separate responsive layer?

4. **Theme validation/linting?**
   - Warn if theme is missing required tokens?
   - Provide a `validateTheme()` function?

5. **Default theme?**
   - Should XDS ship a default theme?
   - Or require users to always define one?

### Swizzle Layer

6. **Swizzle sync command?**
   - `npx xds sync Button` to see upstream changes?
   - How do we help users stay up-to-date?

7. **Component versioning in swizzled files?**
   - Should swizzled files track which XDS version they came from?
   - Warnings when upstream has breaking changes?

### `@xds/variants` Implementation

8. **Type inference complexity?**
   - How do we infer variant props from nested StyleX objects?
   - Tailwind Variants handles this well — can we match it?

9. **Responsive variants?**
   - Should responsive breakpoints be part of variant API?
   - Or handled via Tailwind/StyleX media queries?

---

## Styling Technology

### Decision: StyleX + `@xds/variants` Wrapper

Based on exploration in `stylex-vs-tailwind.md`, the recommended approach is:

**StyleX** for the styling engine:
- Compile-time CSS extraction, zero runtime
- Full TypeScript integration
- Scoped theming is first-class
- No exposed CSS classes to consumers

**`@xds/variants`** wrapper for ergonomics:
- tw-classed-like variant API
- Slots for sub-part styling
- Compound variants, default variants
- Type inference from variant definition

**Tailwind preset** for ecosystem compatibility:
- XDS tokens available as Tailwind utilities
- Interop without compromising enforcement

### Why Not Pure Tailwind?

| Issue | Impact |
|-------|--------|
| Arbitrary values bypass constraints | AI can generate `mt-[13px]` |
| Classes are public | Consumers can depend on implementation details |
| Theme tokens are all public CSS vars | Can't evolve without breaking consumers |
| Type safety is weak | No compile-time enforcement |

### Component Authoring with `@xds/variants`

```typescript
import { createVariants } from '@xds/variants';
import * as stylex from '@stylexjs/stylex';

const button = createVariants({
  base: stylex.create({
    root: { cursor: 'pointer', borderRadius: 4 }
  }).root,

  slots: {
    icon: stylex.create({ root: { width: 16, height: 16 } }).root,
    label: stylex.create({ root: { fontWeight: 500 } }).root,
  },

  variants: {
    variant: {
      primary: stylex.create({
        root: { backgroundColor: 'var(--xds-color-primary)' }
      }).root,
      secondary: stylex.create({
        root: { backgroundColor: 'var(--xds-color-secondary)' }
      }).root,
    },
    size: {
      sm: stylex.create({ root: { padding: 4, fontSize: 14 } }).root,
      md: stylex.create({ root: { padding: 8, fontSize: 16 } }).root,
    }
  },

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  }
});

// TypeScript infers: { variant: 'primary' | 'secondary', size: 'sm' | 'md' }
```

This provides tw-classed ergonomics without exposed CSS classes.

---

## Proposed Implementation Phases

### Phase 1: Core Infrastructure
- `@xds/variants` wrapper around StyleX — tw-classed-like ergonomics with compile-time enforcement
- `createTheme()` function with TypeScript inference
- `Theme` context
- Basic token system (colors, spacing, typography)
- 3-5 pilot components (Button, Input, Text, Box, Stack)

### Phase 2: Component Library
- Full component set with variant/size/part slots
- Swizzle CLI
- Storybook integration

### Phase 3: Ecosystem
- Tailwind preset
- CSS variable export
- Lint rules for arbitrary value prevention
- Theme gallery / community themes

### Phase 4: Advanced Features
- Runtime theme switching
- Responsive tokens
- Animation tokens
- Multi-theme composition

---

## Related Explorations

- `frontend-developer-jtbd.md` — Developer jobs research, workflow phases
- `swizzle-layer-ergonomics.md` — Dual-path swizzle approach, AI-friendliness
- `zero-styling-architecture.md` — Foundational concept
- `stylex-vs-tailwind.md` — Styling technology choice, token tiers, `@xds/variants` wrapper approach
- `ai-trajectory-predictions.md` — Why constraints matter long-term
- `required-props-pattern.md` — Explicit APIs for AI
- `distribution-methods.md` — How themes will be distributed
- `stylex-patterns.md` — StyleX usage patterns, challenges, and workarounds (e.g., `backgroundImage` for overlay effects)
- `component-swizzling.md` — How customized components could be distributed alongside themes
- `component-reference.md` — Complete Button implementation as canonical component template

---

## Sources

- [Rangle.io: Token Structure](https://Rangle.io/blog/developing-your-token-structure)
- [StyleX Theming Guide](https://stylexjs.com/docs/learn/theming/creating-themes/)
- [Tailwind v4 Theme Docs](https://tailwindcss.com/docs/theme)
- [UXPin: Component-Based Design](https://www.uxpin.com/studio/blog/component-based-design-complete-implementation-guide/)
