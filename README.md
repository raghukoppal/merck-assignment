This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Drug Development Portfolio Dashboard (Merck Technical Exercise)

### What’s implemented
- Program list with phase / therapeutic area filters + text search
- Table drill-in to view selected program details
- Milestones + study enrollment details
- Editable metadata when `Edit mode` toggled on (simulated authorization)
- Synthetic data generator (200 programs)
- Accessible role/label usage and keyboard-friendly controls

### How to run
1. Ensure Node.js >= 18.12.0 (Next.js 14 requires modern Node syntax support)
2. Install dependencies: `npm install`
3. Run in development: `npm run dev`
4. For production build: `npm run build` then `npm start`

### Assumptions
- No real PII/PHI used; all generated data is synthetic
- In-memory state is okay for demo: no backend integration was required by prompt
- Authorization is represented by a toggle switch

### Architecture notes
- React + Next.js App Router (client component for interactive UI)
- Local state in component (useState/useMemo) for quick prototyping
- Data set scaling: 200 items in-memory; table and filters remain responsive
- Accessibility: `aria-label`semantic HTML and keyboard focus styles

### To present
- Show runtime at `http://localhost:3000`
- Mention: this could be backed by API routes and persisted in DB in production
- Mention: data generation in `app/page.tsx` includes a phase/area/status distribution

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
