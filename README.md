# TaxOp - Indian Tax Assistant

TaxOp is a high-performance web application built with Next.js 15 that empowers Indian taxpayers to understand and navigate Indian tax laws with confidence. It provides AI-driven insights, real-time data integrations, and personalized guidance for tax planning and compliance.

## 🎯 Target Audience

- **Primary Users**: Indian residents aged 18–65 across varying financial literacy levels
- **User Types**: Salaried professionals, freelancers, small business owners, and senior citizens
- **Demographics**: Urban and semi-urban populations

## 🚀 Core Features

### 1. Tax Law Explainer
- AI-Powered Summaries: Gemini API explains sections like 80C, 80D, GST, TDS
- Searchable Database with filters (income type, financial year, etc.)
- User-friendly, jargon-free explanations with examples

### 2. Personalized Tax Benefit Calculator
- Input income, investments, and expenses for personalized recommendations
- AI-driven suggestions for tax savings
- Compare old vs. new tax regimes with visual charts
- Store user input for future reference

### 3. Tax Filing Guide
- Personalized filing paths based on user role (e.g., freelancer, salaried)
- Document checklists and deadline reminders
- Step-by-step guidance through the filing process

### 4. Real-Time Policy Updates
- Integration with NewsAPI and government portals
- Notifications for budget changes, due dates, and policy updates

### 5. Community Forum (Planned)
- User-generated questions with AI-assisted draft answers
- Human moderation with upvoting system
- Topics include GST, TDS, deduction tips

### 6. Multilingual Support (Planned)
- Support for English, Hindi, and regional Indian languages
- Next.js i18n integration

## 🔧 Technical Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + Vercel Postgres/Supabase (planned)
- **Data Fetching**: SWR for asynchronous caching
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Gemini API for tax law explanations
- **Charts**: Chart.js with react-chartjs-2

## 📝 Getting Started

### Prerequisites
- Node.js 18.x or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taxop.git
   cd taxop
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Run the automated setup script (recommended):
   ```bash
   pnpm setup
   ```
   
   - Or manually copy the example environment file:
   ```bash
   cp src/env.example .env.local
   ```
   
   - Edit `.env.local` with your actual configuration values
   - Generate a random string for NEXTAUTH_SECRET or use the one suggested by the setup script

4. Setting up News API for tax updates:
   - Sign up for a free API key at [News API](https://newsapi.org/)
   - Add your API key to `.env.local`:
   ```
   NEWS_API_KEY=your_api_key_here
   ```

5. Setting up Google OAuth:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Set the application type to "Web application"
   - Add "http://localhost:3000" to Authorized JavaScript origins
   - Add "http://localhost:3000/api/auth/callback/google" to Authorized redirect URIs
   - Copy the Client ID and Client Secret to your `.env.local` file

6. Initialize Prisma:
   ```bash
   pnpm prisma generate
   ```

7. Run the development server:
   ```bash
   pnpm dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Project Structure

```
/src
  /app                   # Next.js app router pages
    /api                 # API routes
    /auth                # Authentication pages
    /calculator          # Tax calculator page
    /tax-laws            # Tax law explainer page
    /filing-guide        # Tax filing guide page
  /components            # React components
    /shared              # Shared UI components
    /tax                 # Tax-specific components
    /calculator          # Calculator components
    /forum               # Forum components
  /lib                   # Utilities and shared code
    /providers           # Context providers
    /utils               # Helper functions
  /api                   # API client implementations
    /gemini              # Gemini API integration
    /newsapi             # News API integration
/prisma                  # Prisma schema and migrations
/public                  # Static assets
```

## 📈 Performance Optimizations

- Server Components for improved loading performance
- Static Generation for content that doesn't change frequently
- Image Optimization using Next.js Image component
- Code Splitting with dynamic imports
- Memoization with React.memo, useMemo, and useCallback

## 🔒 Security Features

- NextAuth.js for secure authentication
- JWT Sessions for SSR protection
- Input sanitization and validation
- Rate limiting for API routes

## 📊 Deployment

The application is designed to be deployed on Vercel for optimal performance with Next.js.

```bash
vercel
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/)
- [Google Gemini API](https://ai.google.dev/)
