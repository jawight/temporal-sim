# Project: Temporal Interactive Diagram

This project is an interactive diagram visualizing the inner workings of the Temporal durable execution framework.

## Tech Stack
- Frontend Framework: [React](https://react.dev/)
- Build Tool: [Vite](https://vitejs.dev/)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

## Key Files
- `src/App.tsx`: Main component housing the interactive diagram logic.
- `src/main.tsx`: Entry point.
- `index.html`: Main HTML file.

## How to Run
- Install dependencies: `npm install`
- Start dev server: `npm run start` (or `npm run dev`)
- Build for production: `npm run build`

## Adding New Elements
This project is designed to be built incrementally. When adding new elements or components representing Temporal concepts (e.g., Workers, Workflows, Activities), please:
1. Define the new component in `src/`.
2. Import and place it within `src/App.tsx`.
3. Ensure it integrates with the existing interactive diagram state or layout.
