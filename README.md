# AI E-commerce Design Studio

> Turn your product photos into professional marketing visuals in minutes—with editable text you can actually modify.

## 🎯 Product Vision

Help e-commerce sellers and SMEs transform ordinary product photos into professional marketing posters in 3 minutes through AI generation with editable text, solving the pain point of "cannot modify after generation" in existing tools.

## ✨ Core Features

- **AI Background Generation** - Professional studio-quality backgrounds
- **Editable Text** - Unlike Midjourney, you can actually modify the text!
- **Auto Background Removal** - Built-in rembg integration
- **10+ Fonts & Colors** - Customizable text styling
- **One-click Download** - HD export for Pro users

## 🏗️ Tech Stack

### Frontend (Vercel)
- Next.js + React
- Tailwind CSS
- PayPal React SDK

### Backend (AWS/GCP)
- FastAPI / Node.js
- PostgreSQL (Users/Orders)
- Redis (Cache/Queue)
- CloudFlare R2 (Image Storage)

### AI Services
- **Primary**: Nano Banana 2 (via API 易)
- **Alternative**: Qwen-Image-2.0 (Text enhancement)
- **Background Removal**: Self-hosted rembg

## 📦 Project Structure

```
AI-E-commerce-Design-Studio/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   └── styles/       # Tailwind CSS
│   └── package.json
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── services/     # AI & payment services
│   │   └── models/       # Database models
│   └── requirements.txt
├── ai-services/          # AI model integration
│   └── poster-generator/
└── docs/                 # Documentation
    └── requirements.md   # Full PRD
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/Linda260308/AI-E-commerce-Design-Studio.git

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Start development servers
npm run dev  # Frontend
python -m uvicorn app.main:app --reload  # Backend
```

## 💰 Pricing

- **Free**: 5 generations with watermark
- **Pro**: $9.9/mo - 50 generations, HD, editable text
- **Annual**: $99/year (Save 20%)

## 📄 License

MIT

## 📞 Contact

Linda - [GitHub](https://github.com/Linda260308)

---

**Document Version**: 1.0 | **Last Updated**: March 18, 2026
