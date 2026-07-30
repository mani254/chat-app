# `@org/ui` — Developer Guide (React UI Design System)

This package is the **shared React UI component library and design system** for your monorepo. It provides beautifully styled, accessible UI primitives built with **Tailwind CSS**, `clsx`, `tailwind-merge`, and `lucide-react` icons.

---

## 📌 What is this package?

`@org/ui` is a standalone, presentation-only React library. It houses the reusable visual building blocks of your user interface—such as buttons, form inputs, cards, alerts, and loaders—styled consistently with Tailwind CSS.

---

## 🎯 What is its exact use?

Use `@org/ui` to maintain visual consistency and avoid rewriting UI markup across your application:

1. **Reusable Visual Primitives**: Instead of styling raw `<button>` or `<input>` HTML tags on every page, import `<Button />` or `<Input />` from `@org/ui` for standardized hover, focus, disabled, and loading states.
2. **Decoupled Styling**: By keeping styling inside `@org/ui`, your page components in `@org/web` remain clean, readable, and focused on layout and data flow.
3. **Tailwind Utility Merging**: Uses the standard `cn()` helper (`clsx` + `tailwind-merge`) so consumers can safely override or extend component classes without style conflicts.

---

## ✍️ What should you write here?

When adding a new UI element to your boilerplate, add your component to `src/components/`:

- **`src/components/<component-name>.tsx`**: Write stateless or controlled React components that accept standard HTML attributes and custom style variants.
- **`src/lib/utils.ts`**: Add Tailwind utility helpers or design system constants.

### What should you NEVER write here?
- **No API Calls or Query Hooks**: Never import `@org/internal-sdk`, Axios, or TanStack Query in `@org/ui`.
- **No Domain Business Logic**: Do not import `@org/shared` or `@org/dal`. A `<Button />` or `<Card />` should never know about a "User" or a "Chat Room".
- **No Page Routing**: Do not import React Router or define full pages here.

---

## 🏗️ Structure You Should Follow

```
packages/ui/src/
├── components/            # Reusable UI primitives (button, input, card, alert, spinner, etc.)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── <your-new-component>.tsx
├── lib/
│   ├── utils.ts           # Tailwind CSS class name merger (cn)
│   └── index.ts
└── index.ts               # Always export components from the root index
```

---

## 💡 Example Workflow: Adding a New UI Component

1. Create `src/components/badge.tsx`:
   ```tsx
   import * as React from 'react';
   import { cn } from '../lib/utils';

   export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
     variant?: 'default' | 'success' | 'warning';
   }

   export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
     return (
       <span
         className={cn(
           'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
           variant === 'default' && 'bg-slate-100 text-slate-800',
           variant === 'success' && 'bg-green-100 text-green-800',
           className
         )}
         {...props}
       />
     );
   }
   ```
2. Export `export * from './components/badge';` in `src/index.ts`.
3. Import and use `<Badge variant="success">Active</Badge>` inside `@org/web`!
