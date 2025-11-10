# Next.js Architecture Guide (2025)

> **Purpose:**  
> This document defines the recommended architecture, patterns, and best practices for building scalable, maintainable, and future-proof Next.js applications using **App Router**, **Server Components**, **TanStack Query**, **Zustand**, and modern React patterns.

---

## Core Principles

1. **Hybrid Rendering First**

   - Use **Server Components** by default for data fetching and SSR/ISR rendering.
   - Use **Client Components** only for interactivity, state, or real-time updates.
   - Keep client bundles small by default.

2. **Feature-Based Modularization**

   - Organize code by **domain/feature**, not by file type.
   - Each feature should be self-contained (components, hooks, services, stores, types).
   - Co-locate related code when it makes sense.

3. **Type Safety & Consistency**

   - Use **TypeScript (strict mode)** everywhere.
   - Centralize types in `/types` or within feature modules.
   - Avoid `any` — define clear interfaces and shared types.
   - Use Zod for runtime validation.

4. **Separation of Concerns**

   - UI ↔ State ↔ Data fetching ↔ Business logic should be distinct layers.
   - Keep side effects (API calls, mutations) out of presentational components.

5. **Scalable State Strategy**

   - **Server** = source of truth for canonical data.
   - **TanStack Query** = remote data caching, client reactivity and mutating behavior.
   - **Zustand** = ephemeral UI / local state (modals, toggles, ephemeral UI behavior).
   - **React Context** = limited to static configuration that must be globally accessible (e.g., theme, localization flags).
   - **React useState** = component-local state only.
   - **URL state** = shareable filters/search params.

6. **Performance as a First-Class Concern**

   - Optimize for minimal client JS, fast first paint, and low hydration cost.
   - Use server-side rendering or ISR for SEO-sensitive pages and marketing content.
   - Use dynamic imports for heavy client-only components.
   - Optimize images, bundle size, and runtime performance.

7. **Security by Design**
   - Always validate and sanitize inputs.
   - Perform authorization checks server-side.
   - Never expose secrets in client-side code.
   - Use environment variables correctly.

---

## Project Structure

```
/client
├── src/
│   ├── app/                    # Next.js App Router directory
│   │   ├── layout.tsx          # Root layout (Server Component)
│   │   ├── page.tsx            # Root page
│   │   ├── (auth)/             # Auth route group
│   │   ├── (nondashboard)/     # Public routes (SSG/ISR)
│   │   └── dashboard/         # Authenticated routes (SSR)
│   │       ├── page.tsx
│   │       ├── components/     # Feature-specific UI components
│   │       ├── hooks/          # Feature hooks (client-side)
│   │       └── stores/         # Zustand stores for UI state
│   │
│   ├── components/            # Reusable, UI-agnostic components
│   │   ├── ui/                # shadcn/ui primitives
│   │   └── [feature]/         # Feature-specific reusable components
│   │
│   ├── hooks/                  # Shared hooks
│   │   └── queries/           # React Query hooks
│   │
│   ├── lib/                    # Shared utilities, clients, and configs
│   │   ├── db/                # Prisma queries and mutations
│   │   ├── services/          # API client wrappers
│   │   ├── validations/       # Zod schemas
│   │   ├── utils/             # Utility functions
│   │   └── stripe/             # Stripe integration
│   │
│   ├── providers/              # React providers (QueryClient, etc.)
│   ├── types/                 # Global TypeScript types
│   └── middleware.ts          # Next.js middleware
│
└── prisma/                    # Database schema and migrations
```

**Key Guidelines:**

- Prefer co-locating feature code inside the feature folder (components, hooks, services, stores).
- Keep shared UI primitives in `/components/ui/`.
- Group related files by domain (transactions/, properties/), not just by type.

---

## Rendering Strategy

### Server Components (Default)

**Use Server Components for:**

- ✅ Initial page load data fetching
- ✅ SEO-sensitive content
- ✅ URL-driven queries (pagination, filters in URL params)
- ✅ Large datasets that benefit from server-side pagination
- ✅ Data that rarely changes
- ✅ Data needed for layout/static content
- ✅ Database queries and API calls

**Example:**

```tsx
// app/dashboard/properties/page.tsx
import { auth } from "@/auth";
import { getPropertiesData } from "@/lib/services/server/propertiesService";

export default async function PropertiesPage() {
  const session = await auth();
  const { properties, stats } = await getPropertiesData(session.user.id);

  return <PropertiesClient initialProperties={properties} />;
}
```

### Client Components

**Use Client Components for:**

- ✅ Interactive UI (buttons, forms, modals)
- ✅ Browser-only APIs (localStorage, window, etc.)
- ✅ React Query hooks and mutations
- ✅ Zustand stores
- ✅ Event handlers and user interactions
- ✅ Real-time updates

**Example:**

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";

export function PropertiesClient({ initialProperties }) {
  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialData: initialProperties,
  });

  return <PropertiesList properties={properties} />;
}
```

### Static Generation (SSG/ISR)

**Use for:**

- ✅ Marketing pages and landing pages
- ✅ Blog posts and content pages
- ✅ Public documentation

**Example:**

```tsx
export const revalidate = 3600; // ISR: revalidate every hour

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return <BlogList posts={posts} />;
}
```

### Edge Runtime

**Consider Edge Runtime for:**

- ✅ Middleware
- ✅ API routes that need low latency
- ✅ Geo-based routing
- ✅ A/B testing

**Note:** Limited Node.js APIs available. Use sparingly.

---

## State Management Architecture

### Decision Tree: Which State Solution to Use?

```
┌─────────────────────────────────────┐
│ Do you need server data?            │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       YES              NO
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────────┐
│ TanStack     │  │ Is it shared      │
│ Query        │  │ across components?│
└──────────────┘  └────────┬──────────┘
                           │
                   ┌───────┴────────┐
                   │                │
                   YES              NO
                   │                │
                   ▼                ▼
          ┌──────────────┐  ┌──────────────┐
          │ Zustand      │  │ React        │
          │ (UI state)    │  │ useState     │
          └──────────────┘  └──────────────┘
```

### 1. Server as Source of Truth

**Purpose:** Canonical data fetched on the server.

**Pattern:**

- Fetch data in Server Components
- Pass as props to Client Components
- Use React Query's `initialData` to hydrate cache

**Example:**

```tsx
// Server Component
export default async function PropertiesPage() {
  const properties = await getPropertiesData();
  return <PropertiesClient initialProperties={properties} />;
}

// Client Component
("use client");
export function PropertiesClient({ initialProperties }) {
  const { data } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialData: initialProperties, // Server data hydrates cache
  });
}
```

### 2. TanStack Query (Remote State)

**Purpose:** Client-side cache, stale/fresh policies, background refetching, optimistic updates, mutation flows.

**When to Use:**

- ✅ Server data that needs client-side reactivity
- ✅ Data that changes after mutations
- ✅ Data needed across multiple routes
- ✅ Optimistic updates
- ✅ Background refetching
- ✅ Real-time-like interactions

**Query Client Configuration:**

```tsx
// providers/QueryProvider.tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes freshness by default
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      refetchOnWindowFocus: false, // opt-in per-query if needed
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

**Query Key Patterns:**

```tsx
// Hierarchical query keys
export const PROPERTY_QUERY_KEYS = {
  all: ["properties"] as const,
  lists: () => [...PROPERTY_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROPERTY_QUERY_KEYS.all, "detail", id] as const,
  images: (id: string) => [...PROPERTY_QUERY_KEYS.all, "images", id] as const,
} as const;
```

**Mutation Pattern:**

```tsx
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data, { id }) => {
      // Update specific query
      queryClient.setQueryData(PROPERTY_QUERY_KEYS.detail(id), data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: PROPERTY_QUERY_KEYS.lists(),
      });
    },
  });
}
```

**Best Practices:**

- ✅ Always pass `initialData` from server-rendered props when available
- ✅ Use stable query keys (avoid inline objects/arrays)
- ✅ Set `staleTime` based on data freshness needs
- ✅ Invalidate selectively (not all queries)
- ✅ Use `setQueryData` for optimistic updates when possible
- ✅ Avoid refetch loops by ensuring stable keys and proper `staleTime`

### 3. Zustand (Local UI State)

**Purpose:** Small, fast, client-only UI state: modals, drawers, filters, ephemeral selections, sidebar state, theme toggles.

**When to Use:**

- ✅ Modal/dialog open/close state
- ✅ Sidebar collapse state
- ✅ Filter UI state (not the actual filter values - those go in URL)
- ✅ Form wizard state
- ✅ Ephemeral selections (checkboxes, temporary UI state)
- ✅ Theme preferences (if not using Context)

**Example:**

```tsx
// stores/ui-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "ui-storage", // localStorage key
    }
  )
);
```

**Usage:**

```tsx
"use client";
import { useUIStore } from "@/stores/ui-store";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={isSidebarOpen ? "open" : "closed"}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

**Guidelines:**

- ✅ Keep Zustand stores focused and small
- ❌ Do NOT put server-canonical data (user profile, lists) into Zustand
- ✅ Use `persist` middleware for UI preferences that should survive refresh
- ✅ Reset stores when appropriate (e.g., on logout)

### 4. React Context (Global Static Configuration)

**Purpose:** Limited to static configuration that must be globally accessible.

**When to Use:**

- ✅ Theme configuration (if not using CSS variables)
- ✅ Localization flags
- ✅ Feature flags (if static)
- ✅ Static configuration that rarely changes

**When NOT to Use:**

- ❌ Server data (use TanStack Query)
- ❌ UI state (use Zustand or useState)
- ❌ Frequently changing state

**Example:**

```tsx
// providers/ThemeProvider.tsx
"use client";
import { createContext, useContext } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value="light">{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### 5. React useState (Component-Local State)

**Purpose:** State that is truly local to a single component and cannot be derived from server state.

**When to Use:**

- ✅ Form input values (before submission)
- ✅ Component-specific UI state (hover, focus, expanded/collapsed)
- ✅ Temporary calculations that don't need to persist
- ✅ Component-level loading states (when not using React Query)

**When NOT to Use:**

- ❌ Server data (use Server Components or React Query)
- ❌ Derived state that can be computed from props
- ❌ State that should be shareable (use URL state or Zustand)
- ❌ State that can be fetched server-side (use Server Components)

**Before using useState, ask:**

1. Can this be fetched server-side? → Use Server Component
2. Can this be derived from props? → Compute in render
3. Does this need to persist/share? → Use URL state or Zustand
4. Is this truly local and ephemeral? → useState is appropriate

**Example:**

```tsx
export function SearchInput() {
  const [value, setValue] = useState("");

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

### 6. URL State (Shareable State)

**Purpose:** State that should be shareable via URL (filters, search params, pagination).

**When to Use:**

- ✅ Search queries
- ✅ Filter values
- ✅ Pagination
- ✅ Sort options
- ✅ Any state that should be bookmarkable/shareable

**Example:**

```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={searchParams.get("type") || "all"}
      onChange={(e) => updateFilter("type", e.target.value)}
    >
      <option value="all">All</option>
      <option value="income">Income</option>
    </select>
  );
}
```

### 7. Avoiding useEffect for Data Fetching

**❌ Don't use useEffect for data fetching:**

```tsx
// ❌ Bad: Using useEffect for data fetching
"use client";
export function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;
  return <List items={properties} />;
}
```

**✅ Good: Use Server Components or React Query:**

```tsx
// ✅ Good: Server Component
export default async function PropertiesPage() {
  const properties = await getPropertiesData();
  return <PropertiesClient initialProperties={properties} />;
}

// ✅ Good: React Query with initialData
("use client");
export function PropertiesClient({ initialProperties }) {
  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialData: initialProperties,
  });

  if (isLoading && !initialProperties) return <Loading />;
  return <List items={data} />;
}
```

**When useEffect is acceptable:**

- ✅ Browser-only APIs (scroll position, window size, localStorage)
- ✅ Subscribing to external events (WebSocket, window events)
- ✅ Cleanup for subscriptions
- ✅ Synchronizing with external systems (analytics, third-party libraries)
- ❌ **NOT for data fetching** (use Server Components or React Query)

**Why avoid useEffect for data fetching:**

- ❌ Causes unnecessary client-side JavaScript
- ❌ Slower initial load (data fetched after hydration)
- ❌ No SSR benefits (empty state on first render)
- ❌ More complex error handling
- ❌ No automatic caching or refetching
- ❌ Harder to manage loading states

---

## Data Fetching Patterns

### Hybrid SSR + React Query Pattern

**Principle:** Fetch initial data server-side, hydrate React Query cache, then use React Query for updates.

**Pattern:**

1. Server Component fetches data
2. Pass data to Client Component as `initialData`
3. React Query uses `initialData` to hydrate cache (no duplicate fetch)
4. Subsequent updates use React Query mutations
5. Mutations invalidate cache, triggering refetch

**Example:**

```tsx
// Server Component
export default async function PropertiesPage() {
  const properties = await getPropertiesData();
  return <PropertiesClient initialProperties={properties} />;
}

// Client Component
("use client");
export function PropertiesClient({ initialProperties }) {
  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    initialData: initialProperties, // No fetch on mount if initialData exists
    staleTime: 60 * 1000,
  });

  if (isLoading && !initialProperties) {
    return <Loading />;
  }

  return <PropertiesList properties={data} />;
}
```

**Benefits:**

- ✅ Fast initial load (SSR provides instant content)
- ✅ Fast subsequent navigation (React Query cache)
- ✅ Automatic updates after mutations
- ✅ No duplicate fetches on mount

### Server Actions

**Purpose:** Server-side mutations with type-safe client calls.

**When to Use:**

- ✅ Form submissions
- ✅ Mutations that must run securely on server
- ✅ Operations requiring database transactions

**Example:**

```tsx
// app/actions/properties.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createProperty(formData: FormData) {
  const property = await db.property.create({
    data: { name: formData.get("name") },
  });

  revalidatePath("/dashboard/properties");
  return property;
}

// Client Component
("use client");
import { createProperty } from "@/app/actions/properties";

export function PropertyForm() {
  return (
    <form action={createProperty}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Note:** Server Actions can be combined with React Query for optimistic updates.

### Parallel Data Fetching

**Pattern:** Fetch multiple data sources in parallel on the server.

**Example:**

```tsx
export default async function DashboardPage() {
  const [properties, transactions, analytics] = await Promise.all([
    getPropertiesData(),
    getTransactionsData(),
    getAnalyticsData(),
  ]);

  return (
    <DashboardClient
      initialProperties={properties}
      initialTransactions={transactions}
      initialAnalytics={analytics}
    />
  );
}
```

---

## Query & Cache Management

### Query Key Strategy

**Use hierarchical query keys for organized cache management:**

```tsx
export const PROPERTY_QUERY_KEYS = {
  all: ["properties"] as const,
  lists: () => [...PROPERTY_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...PROPERTY_QUERY_KEYS.all, "detail", id] as const,
  analytics: {
    all: (id: string) => [...PROPERTY_QUERY_KEYS.all, "analytics", id] as const,
    metrics: (id: string, dateFrom?: string, dateTo?: string) =>
      [
        ...PROPERTY_QUERY_KEYS.all,
        "analytics",
        id,
        "metrics",
        { dateFrom, dateTo },
      ] as const,
  },
} as const;
```

**Benefits:**

- ✅ Easy invalidation (e.g., `invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all })`)
- ✅ Type-safe query keys
- ✅ Clear organization

### Cache Policy Guidelines

| Data Type                        | staleTime | gcTime | Notes                      |
| -------------------------------- | --------- | ------ | -------------------------- |
| User profile                     | 5 min     | 30 min | Changes infrequently       |
| Lists (properties, transactions) | 1-2 min   | 30 min | May change after mutations |
| Detail pages                     | 1 min     | 30 min | Needs freshness            |
| Analytics/metrics                | 2-5 min   | 1 hour | Expensive to compute       |
| Reference data (categories)      | Infinity  | 1 hour | Rarely changes             |
| Real-time data                   | 0         | 5 min  | Needs constant updates     |

### Selective Invalidation

**Best Practice:** Invalidate only affected queries, not all queries.

```tsx
// ✅ Good: Selective invalidation
onSuccess: (data, { id }) => {
  queryClient.setQueryData(PROPERTY_QUERY_KEYS.detail(id), data);
  queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() });
};

// ❌ Bad: Invalidating everything
onSuccess: () => {
  queryClient.invalidateQueries(); // Invalidates ALL queries
};
```

### Avoiding Refetch Loops

**Common Causes:**

- Unstable query keys (objects/arrays recreated each render)
- `staleTime: 0` causing immediate refetch
- Invalidations triggered in render loops

**Solutions:**

- ✅ Use stable query keys (primitives, constants)
- ✅ Set appropriate `staleTime`
- ✅ Only invalidate in event handlers or `onSuccess` callbacks

---

## Type Safety & Validation

### TypeScript Strict Mode

**Configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Best Practices:**

- ✅ Avoid `any` - use `unknown` if type is truly unknown
- ✅ Use Prisma-generated types for database entities
- ✅ Extend types with `interface` or type intersection
- ✅ Use generic types for reusable components

### Zod Validation

**Purpose:** Runtime validation + TypeScript inference.

**Pattern:**

```tsx
// lib/validations/property.ts
import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1),
  purchasePrice: z.number().positive(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// API Route
export async function POST(request: Request) {
  const body = await request.json();
  const validated = createPropertySchema.parse(body); // Throws if invalid
  // validated is typed as CreatePropertyInput
}
```

**When to Use:**

- ✅ API route input validation
- ✅ Form validation (with react-hook-form)
- ✅ Environment variable validation
- ✅ External API response validation

### Prisma Type Generation

**Use Prisma-generated types for database entities:**

```tsx
import { Property, Transaction } from "@prisma/client";

// Transform Prisma types for client (e.g., Decimal to number)
export function transformProperty(property: Property): PropertyClient {
  return {
    ...property,
    purchasePrice: property.purchasePrice.toNumber(),
  };
}
```

---

## Performance Optimization

### Code Splitting & Dynamic Imports

**Use dynamic imports for heavy client-only components:**

```tsx
import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <Loading />,
  ssr: false, // Only load on client
});

export function Dashboard() {
  return <HeavyChart />;
}
```

**When to Use:**

- ✅ Large third-party libraries (charts, editors)
- ✅ Components that use browser-only APIs
- ✅ Components that are conditionally rendered

### Image Optimization

**Always use Next.js Image component:**

```tsx
import Image from "next/image";

<Image
  src="/property.jpg"
  alt="Property"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // For blur-up effect
/>;
```

**Benefits:**

- ✅ Automatic WebP/AVIF conversion
- ✅ Lazy loading by default
- ✅ Responsive images
- ✅ Reduced layout shift

### Bundle Size Optimization

**Strategies:**

- ✅ Use dynamic imports for heavy dependencies
- ✅ Tree-shake unused code
- ✅ Analyze bundle size with `@next/bundle-analyzer`
- ✅ Prefer smaller alternatives (e.g., `date-fns` over `moment`)

### Memoization Patterns

**Use React.memo for expensive components:**

```tsx
export const ExpensiveList = React.memo(({ items }) => {
  return items.map((item) => <Item key={item.id} {...item} />);
});
```

**Use useMemo for expensive calculations:**

```tsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

**Use useCallback for stable function references:**

```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**Guidelines:**

- ✅ Only memoize when performance is actually an issue
- ✅ Profile before optimizing
- ✅ Don't over-memoize (adds overhead)

### Virtual Scrolling

**For large lists (1000+ items), use virtual scrolling:**

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

export function LargeList({ items }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key}>{items[virtualItem.index].name}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling & Resilience

### Error Boundaries

**Create error boundaries for component trees:**

```tsx
"use client";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PropertiesList />
    </ErrorBoundary>
  );
}
```

### API Error Handling

**Pattern:**

```tsx
export async function fetchProperties() {
  try {
    const response = await fetch("/api/properties");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Log error
    console.error("Failed to fetch properties:", error);
    // Return user-friendly error
    throw new Error("Unable to load properties. Please try again.");
  }
}
```

### React Query Error Handling

```tsx
const { data, error, isError } = useQuery({
  queryKey: ["properties"],
  queryFn: fetchProperties,
  retry: 1,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### Retry Strategies

**Exponential backoff:**

```tsx
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
```

**Custom retry logic:**

```tsx
retry: (failureCount, error) => {
  if (error.status === 404) return false; // Don't retry 404s
  return failureCount < 3;
},
```

---

## Loading States & UX

### Loading States: Spinners & Zero-First Approach

**Default: Use spinners for loading states:**

```tsx
import { Loading } from "@/components/ui/loading";
import { Loader2 } from "lucide-react";

// Full-page or section loading
export function PropertiesLoading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
      <Loading />
    </div>
  );
}

// Button loading state
<button disabled={isLoading}>
  {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
</button>;
```

**For statistics and charts: Use zero-first approach:**

```tsx
export function PropertyStats({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["property-stats", propertyId],
    queryFn: () => fetchPropertyStats(propertyId),
  });

  // Show zeros initially, update when data loads
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;
  const netProfit = data?.netProfit ?? 0;

  return (
    <div>
      <StatCard label="Total Income" value={totalIncome} />
      <StatCard label="Total Expenses" value={totalExpenses} />
      <StatCard label="Net Profit" value={netProfit} />
    </div>
  );
}
```

**Benefits:**

- ✅ Simpler to maintain (less skeleton code)
- ✅ Consistent loading patterns across the app
- ✅ No layout shift (structure visible immediately)
- ✅ Clear loading indication (zeros update to real values)
- ✅ Natural for metrics that start at zero

**When to consider skeletons:**

- Complex content-heavy layouts (e.g., article pages, detailed views)
- Lists where structure preview significantly improves UX
- Cases where perceived loading time is critical

### Suspense Boundaries

**Use Suspense for async Server Components:**

```tsx
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PropertiesList />
    </Suspense>
  );
}
```

### Progressive Loading

**Load critical content first, then enhance:**

```tsx
import { Suspense } from "react";
import { Loading } from "@/components/ui/loading";

export function Dashboard() {
  return (
    <>
      <CriticalKPIs /> {/* Load immediately - shows zeros initially */}
      <Suspense fallback={<Loading />}>
        <HeavyChart /> {/* Load after */}
      </Suspense>
    </>
  );
}
```

### Optimistic Updates

**Update UI immediately, rollback on error:**

```tsx
const mutation = useMutation({
  mutationFn: updateProperty,
  onMutate: async (newProperty) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["properties"] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["properties"]);

    // Optimistically update
    queryClient.setQueryData(["properties"], (old) => ({
      ...old,
      ...newProperty,
    }));

    return { previous };
  },
  onError: (err, newProperty, context) => {
    // Rollback on error
    queryClient.setQueryData(["properties"], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["properties"] });
  },
});
```

---

## Security Best Practices

### Authentication

**Pattern:** Use NextAuth.js with server-side session validation.

```tsx
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### Authorization

**Always check permissions server-side:**

```tsx
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check user owns the resource
  const property = await db.property.findUnique({
    where: { id: propertyId, userId: session.user.id },
  });

  if (!property) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json(property);
}
```

### Input Validation

**Always validate and sanitize inputs:**

```tsx
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body); // Throws if invalid
  // Process validated data
}
```

### Environment Variables

**Never expose secrets in client-side code:**

```tsx
// ✅ Good: Server-only
const dbUrl = process.env.DATABASE_URL;

// ✅ Good: Client-safe
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Bad: Secret in client
const secret = process.env.SECRET_KEY; // Without NEXT_PUBLIC_
```

### CSRF Protection

**Next.js provides CSRF protection by default for Server Actions and API routes.**

### XSS Prevention

**Use React's built-in escaping. Avoid `dangerouslySetInnerHTML` unless necessary:**

```tsx
// ✅ Safe: React escapes by default
<div>{userInput}</div>

// ⚠️ Dangerous: Only use if you trust the source
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

---

## API Architecture

### Route Handlers

**Pattern:**

```tsx
// app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPropertySchema } from "@/lib/validations/property";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await getProperties(session.user.id);
  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = createPropertySchema.parse(body);

  const property = await createProperty(session.user.id, validated);
  return NextResponse.json({ property }, { status: 201 });
}
```

### Error Response Format

**Consistent error responses:**

```tsx
return NextResponse.json(
  {
    error: "Property not found",
    code: "PROPERTY_NOT_FOUND",
  },
  { status: 404 }
);
```

### Server Actions

**Use Server Actions for mutations when appropriate:**

```tsx
"use server";

import { revalidatePath } from "next/cache";

export async function createProperty(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const property = await db.property.create({
    data: {
      name: formData.get("name"),
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/properties");
  return property;
}
```

---

## File Organization

### Feature-Based Structure

**Organize by feature, not by type:**

```
/dashboard/properties/
├── page.tsx                    # Server Component
├── components/
│   ├── PropertiesList.tsx
│   ├── PropertyCard.tsx
│   └── PropertyDialog.tsx
├── hooks/
│   └── usePropertyQueries.ts
└── stores/
    └── property-ui-store.ts     # Zustand store for UI state
```

### Co-location Principles

**Keep related code together:**

- ✅ Components and their hooks in the same folder
- ✅ Feature-specific types with the feature

### Barrel Exports

**Use index files for clean imports:**

```tsx
// components/properties/index.ts
export { PropertiesList } from "./PropertiesList";
export { PropertyCard } from "./PropertyCard";

// Usage
import { PropertiesList, PropertyCard } from "@/components/properties";
```

### Naming Conventions

- **Files:** `kebab-case.tsx`
- **Components:** `PascalCase`
- **Functions/Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

---

## Future-Proofing & Modern Patterns

### Server Actions

**Adopt Server Actions for mutations:**

- ✅ Type-safe client calls
- ✅ Automatic CSRF protection
- ✅ Built-in revalidation
- ✅ Progressive enhancement

### Edge Runtime

**Consider Edge Runtime for:**

- ✅ Middleware
- ✅ API routes needing low latency
- ✅ Geo-based routing

**Limitations:**

- ❌ Limited Node.js APIs
- ❌ No file system access
- ❌ No native modules

### RSC Streaming

**Use Suspense for streaming:**

```tsx
export default function Page() {
  return (
    <>
      <CriticalContent />
      <Suspense fallback={<Loading />}>
        <AsyncContent />
      </Suspense>
    </>
  );
}
```

### Cache Revalidation

**Use revalidateTag and revalidatePath:**

```tsx
import { revalidateTag, revalidatePath } from "next/cache";

// After mutation
revalidatePath("/dashboard/properties");
revalidateTag("properties");
```

### Partial Prerendering

**Combine static and dynamic content:**

```tsx
export default function Page() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  );
}
```

---

## Best Practices Summary

### ✅ Do's

- ✅ Use Server Components by default
- ✅ Pass `initialData` from server to React Query
- ✅ Use stable query keys
- ✅ Invalidate selectively
- ✅ Use Zustand for UI state only
- ✅ Validate inputs with Zod
- ✅ Check authorization server-side
- ✅ Use Next.js Image component
- ✅ Code split heavy components
- ✅ Use error boundaries
- ✅ Show loading states
- ✅ Optimize for performance

### ❌ Don'ts

- ❌ Don't use useEffect for data fetching (use Server Components or React Query)
- ❌ Don't use useState for server data
- ❌ Don't use useState when state can be derived from props
- ❌ Don't put server data in Zustand
- ❌ Don't use Context for frequently changing state
- ❌ Don't invalidate all queries
- ❌ Don't use unstable query keys
- ❌ Don't expose secrets in client code
- ❌ Don't skip input validation
- ❌ Don't check authorization only client-side
- ❌ Don't use `any` types
- ❌ Don't over-memoize
- ❌ Don't skip error handling
- ❌ Don't forget loading states

---

## Conclusion

This architecture guide provides a comprehensive foundation for building scalable, maintainable Next.js applications. Follow these patterns consistently, and adapt them to your specific needs while maintaining the core principles.

For project-specific implementation details, refer to `CLAUDE.md`.
