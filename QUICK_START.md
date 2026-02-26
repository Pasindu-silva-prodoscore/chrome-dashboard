# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd chrome-dashboard
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at http://localhost:5173

### 3. Explore the Dashboard

The app is pre-loaded with mock data, so you can explore all features immediately:

- **Dashboard** - Overview with statistics and activity feed
- **Users** - User management with search and filters
- **Departments** - Department organization cards
- **Teams** - Team management table
- **Insights** - Analytics and performance metrics
- **Logs** - Activity monitoring
- **Settings** - App configuration
- **Dark Mode** - Toggle in the header (sun/moon icon)

## Connect to Your Django Backend

### Step 1: Configure API URL
```bash
# Edit .env file
VITE_API_URL=http://localhost:8000/api
```

### Step 2: Set Up Django CORS

Install django-cors-headers:
```bash
pip install django-cors-headers
```

Update Django settings.py:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React dev server
    "http://localhost:3000",
]

# For development only
CORS_ALLOW_ALL_ORIGINS = True
```

### Step 3: Implement Backend Endpoints

See `README.md` for complete API documentation.

Example Django view:
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        'activeUsers': 12842,
        'suspendedUsers': 428,
        'managedDevices': 8215,
        'pendingUpdates': 94
    })
```

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder. Deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Features to Try

✅ **Dark Mode** - Click the theme toggle in the header
✅ **Navigation** - Explore all 7 pages from the sidebar
✅ **Responsive** - Resize your browser to see mobile/tablet views
✅ **Search** - Try the search bar in Users page
✅ **Filters** - Use status filters in Users and Logs pages
✅ **Settings** - Toggle switches and save settings

## Troubleshooting

**Build fails?**
- Make sure all dependencies are installed: `npm install`
- Check Node.js version: `node -v` (should be 18+)

**API not connecting?**
- Check `.env` file has correct VITE_API_URL
- Verify Django server is running
- Check CORS settings in Django

**Icons not showing?**
- Google Fonts CDN must be accessible
- Check internet connection

## What's Included

✅ 7 Complete Pages
✅ PWA Support (installable)
✅ Dark Mode
✅ Responsive Design
✅ Django API Integration
✅ Mock Data (works without backend)
✅ Material Icons
✅ Chrome Design Theme

Enjoy your new dashboard! 🎉
