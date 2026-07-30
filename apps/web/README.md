# `@org/web` — Developer Guide (React 19 & Vite Web Application)

This application is the **modern responsive frontend SPA** for your monorepo. It is built with **React 19**, **Vite**, **Tailwind CSS**, and **React Router DOM 7**.

---

## 📌 What is this application?

`@org/web` is the user-facing presentation layer of your boilerplate. It renders visual pages, manages client routing, and composes UI components with backend server data.

---

## 🎯 What is its exact use?

Use `@org/web` exclusively for visual page composition and navigation:

1. **Page Composition**: Assemble full-screen application views by combining reusable UI primitives from `@org/ui` with data query hooks from `@org/internal-sdk`.
2. **Declarative Routing**: Map URL paths to page components and apply authentication route guards (`<ProtectedRoute />`, `<GuestRoute />`).
3. **Application Shells**: Implement persistent layouts, sidebars, navigation bars, and modals (`src/layout/`).

---

## ✍️ What should you write here?

When adding a new screen or view to your boilerplate, add your code to `src/pages/`:

- **`src/pages/<feature>/<feature>.page.tsx`**: Write full-page React components that represent individual URL destinations.
- **`src/layout/`**: Add layout containers that wrap multiple pages.
- **`src/app.tsx`**: Register your new routes under `<Routes>` using React Router DOM.

### What should you NEVER write here?
- **No Direct Axios / Fetch Calls**: Never write raw `fetch()`, `axios.get()`, or ad-hoc TanStack Query `queryFn` implementations in page components. Put all API calls and hooks in `@org/internal-sdk`.
- **No Reusable UI Primitives**: Do not define standard buttons, input fields, badges, or dialog primitives in this app. Put reusable primitives in `@org/ui`.

---

## 🏗️ Structure You Should Follow

```
apps/web/src/
├── layout/                # Global layout shells (navbar, sidebar, container wrappers)
├── pages/
│   ├── auth/              # Guest authentication screens (login, register, forgot-password)
│   ├── chat/              # Protected workspace screens
│   └── <your-new-page>/   # Add new page folders here
│       └── <feature>.page.tsx
├── app.tsx                # Main React Router configuration & route guards
├── index.css              # Global Tailwind CSS directives & root CSS variables
└── main.tsx               # DOM root mount & SDK Provider initialization
```

---

## 💡 Example Workflow: Adding a New Protected Page

1. Define your query hook `useGetProjects()` in `@org/internal-sdk`.
2. Create `src/pages/projects/projects.page.tsx`:
   ```tsx
   import * as React from 'react';
   import { useGetProjects } from '@org/internal-sdk';
   import { Button, Card, Spinner, Alert } from '@org/ui';

   export function ProjectsPage() {
     const { data, isLoading, isError } = useGetProjects();

     if (isLoading) return <Spinner className="mt-10" />;
     if (isError) return <Alert variant="error">Failed to load projects.</Alert>;

     return (
       <div className="mx-auto max-w-4xl p-6">
         <div className="mb-6 flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
           <Button variant="primary">New Project</Button>
         </div>
         <div className="grid gap-4">
           {data?.items.map((project) => (
             <Card key={project.id} className="p-4">
               <h3 className="font-semibold">{project.title}</h3>
               <p className="text-sm text-slate-600">{project.description}</p>
             </Card>
           ))}
         </div>
       </div>
     );
   }
   ```
3. Register the route in `src/app.tsx` inside the `<ProtectedRoute />` wrapper:
   ```tsx
   <Route element={<ProtectedRoute redirectTo="/login" />}>
     <Route path="/projects" element={<ProjectsPage />} />
   </Route>
   ```
4. Start your server with `pnpm nx dev @org/web` and view your new page!
