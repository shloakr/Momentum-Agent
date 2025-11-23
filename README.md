# Text Momentum MVP

A mobile-first text-based habit builder app built with Next.js, TypeScript, and Vercel AI SDK.

## Features

- **Landing Page**: Clean, mobile-first interface with action buttons
- **Text Momentum Chat**: AI-powered chat interface using OpenAI
- **Placeholder Buttons**: Find friends, Search Groups, View Calendar (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   ├── chat/
│   │   └── page.tsx              # Chat interface page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── lib/
│   └── utils.ts                  # Utility functions
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Vercel AI SDK with OpenAI
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Mobile-First Design

The app is optimized for mobile devices with:
- Responsive layouts
- Touch-friendly buttons
- Smooth transitions
- Clean, modern UI

## Next Steps

To extend this MVP:
1. Implement authentication (Firebase Auth)
2. Add Google Calendar integration
3. Build the social features (Find friends, Search Groups)
4. Implement scheduled check-ins with Twilio SMS
5. Add database integration (Firebase)

## License

Private project for CS188

