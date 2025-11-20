# PM Tool Frontend

Next.js frontend for the real-time project management tool.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Testing

Run tests with Vitest:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utility functions and hooks
└── __tests__/       # Test files
```

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Vitest + React Testing Library
- TailwindCSS
