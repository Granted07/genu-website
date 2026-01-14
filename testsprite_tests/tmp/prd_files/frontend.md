# Gen Uprising - Frontend Test Documentation

## Project Overview

**Project Name:** Gen Uprising (genu-website)  
**Framework:** Next.js 15.5.9 with App Router  
**UI Library:** React 19.1.0  
**Styling:** Tailwind CSS 4, Framer Motion  
**Database:** Supabase  
**Local Port:** 3000

## Technology Stack

- **Frontend Framework:** Next.js 15 (App Router, Turbopack)
- **UI Components:** Custom components with Radix UI primitives
- **Animation:** Framer Motion
- **Fonts:** Google Fonts (Manrope, Playfair Display, Rethink Sans, Geist)
- **State Management:** React hooks
- **Markdown Rendering:** react-markdown with remark-gfm
- **Theme:** Dark mode by default (next-themes)

---

## Application Structure

### Pages & Routes

| Route                        | Page                         | Description                                      |
| ---------------------------- | ---------------------------- | ------------------------------------------------ |
| `/`                          | Home                         | Landing page with hero section and navigation    |
| `/case-files`                | Case Files Listing           | Article grid showing case file entries           |
| `/case-files/[uuid]`         | Case File Detail             | Individual case file article page                |
| `/signals`                   | Signals Listing              | Article grid showing signal entries              |
| `/signals/[id]`              | Signal Detail                | Individual signal article page                   |
| `/daughters-of-dissent`      | Daughters of Dissent Listing | Article grid showing DOD entries                 |
| `/daughters-of-dissent/[id]` | DOD Detail                   | Individual DOD article page                      |
| `/hall-of-noise`             | Hall of Noise                | Coming soon page for audio content               |
| `/sponsors`                  | Sponsors                     | Team and sponsor information                     |
| `/admin`                     | Admin Panel                  | Protected admin dashboard for content management |

---

## Navigation Structure

The global navigation bar includes the following tabs:

- **HOME** → `/`
- **CASE FILES** → `/case-files`
- **DAUGHTERS OF DISSENT** → `/daughters-of-dissent`
- **SIGNALS** → `/signals`
- **HALL OF NOISE** → `/hall-of-noise`
- **SPONSORS** → `/sponsors`

### Navigation Features

- Fixed position at top of viewport
- Glassmorphism effect on scroll
- Active tab highlighting based on current route
- Mobile hamburger menu with animated slide-in drawer
- Logo click navigates to home

---

## Page-Specific Test Scenarios

### 1. Home Page (`/`)

**Elements to Test:**

- Hero section with animated text
- Background image loading
- "Read more" button functionality
- Navigation to other sections
- Responsive layout (mobile/desktop)

**User Flows:**

1. User lands on homepage → sees hero content with animations
2. User clicks navigation items → navigates to respective pages
3. User scrolls → navigation bar gains blur effect

---

### 2. Case Files Page (`/case-files`)

**Elements to Test:**

- Article cards loading from API (`/api/casefiles`)
- Category filter buttons
- Card hover animations (lift effect)
- "Reset filters" functionality
- Empty state message when no articles match filter
- Click on article card → navigates to detail page

**User Flows:**

1. Page loads → displays shuffled article cards in grid layout
2. User clicks category filter → articles filter by selected categories
3. User clicks multiple categories → AND filter logic applied
4. User clicks "Reset filters" → all articles shown again
5. User clicks article card → navigates to `/case-files/[uuid]`

**API Endpoint:** `GET /api/casefiles`

---

### 3. Case File Detail Page (`/case-files/[uuid]`)

**Elements to Test:**

- Article title, dek (subtitle), author display
- Category badges
- Markdown content rendering (headings, paragraphs, lists, links, code blocks, tables)
- Scroll progress indicator
- Published date formatting
- Back navigation

**User Flows:**

1. User arrives from listing → article content loads
2. User scrolls → progress bar updates
3. User clicks internal links → appropriate navigation

---

### 4. Signals Page (`/signals`)

**Elements to Test:**

- Article cards loading from API (`/api/signals`)
- Category filter buttons
- Card displays "Signal Brief" label
- "Read signal" CTA button

**User Flows:**

1. Page loads → displays signal articles in card grid
2. User filters by category → articles update
3. User clicks card → navigates to `/signals/[id]`

**API Endpoint:** `GET /api/signals`

---

### 5. Signal Detail Page (`/signals/[id]`)

**Elements to Test:**

- Article content with "Signals" section label
- Author/byline display
- Markdown rendering
- Scroll progress

---

### 6. Daughters of Dissent Page (`/daughters-of-dissent`)

**Elements to Test:**

- Article cards loading from API (`/api/dod`)
- "Field Report" card label
- "Read story" CTA
- Two-line title display ("daughters" / "of dissent")

**User Flows:**

1. Page loads → displays DOD articles
2. User filters → articles update
3. User clicks card → navigates to `/daughters-of-dissent/[id]`

**API Endpoint:** `GET /api/dod`

---

### 7. DOD Detail Page (`/daughters-of-dissent/[id]`)

**Elements to Test:**

- "Daughters of Dissent" section label
- Full article rendering
- Category badges
- Scroll progress indicator

---

### 8. Hall of Noise Page (`/hall-of-noise`)

**Elements to Test:**

- "Coming Soon" messaging
- Animated background elements
- Links to other sections (case files, signals, daughters of dissent)
- Reduced motion preference support

**User Flows:**

1. User visits page → sees coming soon message
2. User clicks alternative section links → navigates to those sections

---

### 9. Sponsors Page (`/sponsors`)

**Elements to Test:**

- Sponsor/team member cards
- Card animations on scroll
- Name and description display
- Card tilt effects
- Responsive grid layout

---

### 10. Admin Page (`/admin`)

**Elements to Test:**

- Password authentication form
- Login success/error states
- Table selector (dod, casefiles, signals, hall)
- Data table display
- CRUD operations:
  - Create new article
  - Edit existing article (title, author, category, content)
  - Delete article
- Hall of Noise file upload
- Category input parsing (comma-separated, JSON array)

**User Flows:**

1. User enters incorrect password → error message shown
2. User enters correct password → authenticated, data loads
3. User switches table selector → different table data loads
4. User creates new article → article appears in list
5. User edits article → changes saved
6. User deletes article → article removed from list
7. User uploads audio file (Hall of Noise) → file uploaded to storage

**API Endpoints:**

- `POST /api/admin/auth` - Authentication
- `GET /api/admin/data?table={table}` - Fetch table data
- `POST /api/admin/data` - Create/Update article
- `DELETE /api/admin/data` - Delete article
- `GET /api/admin/hall-of-noise` - Fetch hall of noise entries
- `POST /api/admin/hall-of-noise` - Upload audio file

---

## Component Testing

### ArticleSectionLanding Component

- Renders hero section with title and tagline
- Displays article cards in 3-column grid (desktop) or single column (mobile)
- Category filter pills
- Loading skeleton states
- Empty state messaging
- Error state handling

### ArticlePage Component

- Scroll progress bar
- Hero section with title, dek, author, date
- Category badges with stagger animation
- Markdown content rendering
- All markdown elements: h1-h6, p, ul, ol, li, blockquote, hr, a, strong, em, code, pre, img, table

### Navigation Component

- Desktop horizontal navigation
- Mobile hamburger menu
- Scroll-based styling changes
- Active route indication
- Menu open/close animations

### UI Components

- Button (multiple variants)
- Navigation Menu (Radix-based)
- Scroll Progress indicator

---

## Responsive Breakpoints

| Breakpoint       | Description                             |
| ---------------- | --------------------------------------- |
| `< 640px`        | Mobile - single column, hamburger nav   |
| `640px - 1024px` | Tablet - adjusted spacing               |
| `>= 1024px (lg)` | Desktop - 3-column grid, horizontal nav |

---

## Animation & Motion

- **Page transitions:** Fade in with y-axis translation
- **Card animations:** Staggered reveal, hover lift effect
- **Navigation:** Slide-in mobile menu
- **Scroll progress:** Linear progress bar
- **Reduced motion:** Respects `prefers-reduced-motion` preference

---

## API Endpoints Summary

| Endpoint                   | Method          | Description                    |
| -------------------------- | --------------- | ------------------------------ |
| `/api/casefiles`           | GET             | Fetch all case files           |
| `/api/signals`             | GET             | Fetch all signals              |
| `/api/dod`                 | GET             | Fetch all DOD articles         |
| `/api/hall-of-noise`       | GET             | Fetch hall of noise entries    |
| `/api/admin/auth`          | POST            | Admin authentication           |
| `/api/admin/data`          | GET/POST/DELETE | Admin CRUD operations          |
| `/api/admin/hall-of-noise` | GET/POST        | Admin hall of noise management |

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=<site_url>
ADMIN_PASSWORD=<admin_password>
```

---

## Test Priorities

### Critical (P0)

1. Home page loads correctly
2. Navigation works across all pages
3. Article listing pages load and display cards
4. Article detail pages render content correctly
5. Admin authentication works

### High (P1)

1. Category filtering on listing pages
2. Responsive layout on mobile/tablet
3. Article creation/editing in admin
4. Markdown rendering in articles

### Medium (P2)

1. Animations and transitions
2. Loading/skeleton states
3. Error handling and empty states
4. Scroll progress indicator

### Low (P3)

1. Reduced motion support
2. Card hover effects
3. Navigation scroll effects
