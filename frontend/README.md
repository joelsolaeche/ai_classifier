# AI Image Classifier - Frontend

A beautiful, modern Next.js frontend for the AI Image Classifier system. Built with Next.js 15, TypeScript, and TailwindCSS 4.

## Features

- 🎨 **Modern UI**: Beautiful, responsive design with TailwindCSS
- 🔐 **Authentication**: JWT-based user authentication
- 📸 **Drag & Drop Upload**: Intuitive image upload interface
- 🤖 **AI Classification**: Real-time image classification using ResNet50
- 📊 **Visual Results**: Beautiful prediction results with confidence scores
- 💬 **Feedback System**: Users can provide feedback to improve the model
- 📱 **Mobile Friendly**: Fully responsive design

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests
- **React Dropzone** - Drag & drop file uploads

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - The URL of your FastAPI backend (default: http://localhost:8000)

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set the environment variable `NEXT_PUBLIC_API_URL` to your backend API URL
3. Deploy!

### Other Platforms

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Integration

The frontend connects to a FastAPI backend with these endpoints:

- `POST /login` - User authentication
- `POST /model/predict` - Image classification
- `POST /feedback/` - User feedback submission
- `POST /user/` - User registration

## Project Structure

```
src/
├── app/                  # Next.js App Router
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── LoginForm.tsx    # Authentication form
│   ├── ImageUpload.tsx  # Drag & drop upload
│   ├── PredictionResults.tsx  # Results display
│   └── FeedbackForm.tsx # Feedback submission
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
└── lib/                 # Utilities
    └── api.ts          # API client configuration
```

## Demo Credentials

- Email: `admin@example.com`
- Password: `admin`
