# Prescription Management System - MVP Requirements

## Project Overview

A simple web application for pharmacy staff to register medicines and create prescriptions with PDF export.

## Technology Stack

- **Next.js 15** with App Router (from mf2 template)
- **TypeScript** (from mf2 template)
- **Tailwind CSS v4** (from mf2 template)
- **shadcn/ui** components (from mf2 template)
- **Lucide React** for icons (from mf2 template)
- **React Hook Form** with **Zod** (from mf2 template)
- **Convex** for database
- **jsPDF** for PDF generation

## Core Features

### 1. Medicine Registration

- Simple form to add medicines
- Fields: name, dosage, type, manufacturer
- Save to Convex database

### 2. Prescription Creation

- Select medicines from dropdown
- Add timing (morning/afternoon/night)
- Add dosage (mg/ml) (blank by default)
- Save prescription

### 3. Prescription Display

- Show medicines grouped by timing
- Clean, simple layout

### 4. PDF Export

- Generate PDF with jsPDF
- Include medicine list and timing
- Download button

## UI/UX Guidelines

- Use shadcn/ui components from mf2 template
- Clean, simple interface
- Basic navigation
- Toast notifications for feedback

## Development Steps

1. **Setup Convex**

   - Install and configure Convex
   - Create basic schema

2. **Build Core Features**

   - Medicine registration form
   - Prescription creator
   - PDF generation with jsPDF

3. **Deploy**
   - Deploy to Vercel

## Success Criteria

- ✅ Staff can register medicines
- ✅ Staff can create prescriptions
- ✅ Prescriptions display clearly
- ✅ PDF export works
- ✅ Basic validation
- ✅ Deployed and working
