# Luma Studio ✨

Luma Studio is an AI-powered image restyling workbench built with modern web technologies. It uses a unique "Describe and Redraw" workflow: leveraging Google Gemini's advanced vision models to deeply analyze uploaded images, and Hugging Face's inference pipelines (like Stable Diffusion XL and FLUX) to regenerate them in stunning new styles.

![Luma Studio](https://raw.githubusercontent.com/ahmed-mohamed-sh/luma-studio/main/public/og-image.png)

## 🚀 Features

*   **Describe and Redraw Pipeline**: Upload any image, let Gemini 1.5/2.0 Flash analyze its exact composition, lighting, and subjects, and let Hugging Face inference models redraw it in a custom style.
*   **Studio Workbench**: A responsive, interactive workspace to experiment with different AI models and curated style presets.
*   **Generation History**: View and manage your previously generated images.
*   **Authentication & Quotas**: Secure user authentication and tiered usage quotas, powered by Clerk.
*   **Lightning Fast Storage**: Image uploads and transformations handled seamlessly by ImageKit.

## 🛠️ Tech Stack

Luma Studio is built on a cutting-edge, highly-scalable modern stack:

*   **Framework**: [Next.js](https://nextjs.org) (App Router, React 19)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com/), and [Motion](https://motion.dev/) for fluid animations
*   **Authentication & Billing**: [Clerk](https://clerk.com/)
*   **Database**: Serverless PostgreSQL via [Neon](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
*   **AI Integration**: 
    *   [Google Gemini API](https://ai.google.dev/) (Image Vision & Prompt Generation)
    *   [Hugging Face Inference API](https://huggingface.co/) (Image Generation)
*   **Image Hosting**: [ImageKit](https://imagekit.io/)
*   **Monitoring**: [Sentry](https://sentry.io/)

## ⚙️ Getting Started

### Prerequisites
Make sure you have Node.js 20+ installed.

### Environment Variables
Copy the `.env.example` file to `.env` and fill in the required keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Database
DATABASE_URL=

# AI Providers
GEMINI_API_KEY=
HF_TOKEN=

# ImageKit
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=

# Sentry (Optional for local dev)
SENTRY_AUTH_TOKEN=
```

### Installation

1. Install dependencies:
```bash
npm install
# or yarn install, pnpm install, bun install
```

2. Push the database schema:
```bash
npm run db:push
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Scripts

*   `npm run dev` - Starts the local development server.
*   `npm run build` - Builds the application for production.
*   `npm run start` - Starts the production server.
*   `npm run db:push` - Pushes Drizzle schema changes to your Neon Postgres database.
*   `npm run lint` - Runs ESLint.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📄 License

This project is licensed under the MIT License.
