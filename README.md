# Medicine Manager

A modern pharmacy management system with a beautiful glass morphism UI for registering medicines and creating prescriptions with PDF export.

## Features

- 💊 **Medicine Registration**: Add and manage medicines with details like dosage, type, and manufacturer
- 📋 **Prescription Builder**: Create prescriptions by selecting medicines and timing
- 📄 **PDF Export**: Generate and download prescription PDFs instantly
- ✨ **Glass Morphism UI**: Beautiful, modern interface with smooth animations
- 🌓 **Dark Mode Support**: Seamless light/dark theme switching
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (all components pre-installed)
- **Database**: Convex (real-time, reactive database)
- **PDF Generation**: jsPDF
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd medicine-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (or connect to existing)
- Generate your Convex URL
- Start the Convex development server

4. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

5. Add your Convex URL to `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Medicine Management

1. Navigate to the **Medicines** tab
2. Click **Register** to add new medicines
3. Fill in the form with medicine details
4. View all registered medicines in the **Browse** tab

### Prescription Creation

1. Navigate to the **Prescriptions** tab
2. Click **Create** to build a new prescription
3. Search and select medicines from your inventory
4. Set timing (Morning/Afternoon/Night) for each medicine
5. Optionally specify custom dosage
6. Click **Create & Download PDF** to generate the prescription

### Prescription History

- View all created prescriptions in the **History** tab
- Download PDFs of previous prescriptions
- Delete old prescriptions when needed

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy Convex to production

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── medicine-form.tsx  # Medicine registration
│   ├── medicine-list.tsx  # Medicine browser
│   ├── prescription-builder.tsx
│   └── prescription-list.tsx
├── convex/                # Backend
│   ├── schema.ts         # Database schema
│   ├── medicines.ts      # Medicine functions
│   └── prescriptions.ts  # Prescription functions
└── lib/                  # Utilities
```

## Database Schema

**Medicines Table**:
- `name`: Medicine name
- `dosage`: Dosage strength
- `type`: Medicine type (tablet, syrup, etc.)
- `manufacturer`: Manufacturing company

**Prescriptions Table**:
- `medicines`: Array of prescribed medicines with timing
- `createdAt`: Timestamp for ordering

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variable: `NEXT_PUBLIC_CONVEX_URL`
4. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

## License

MIT