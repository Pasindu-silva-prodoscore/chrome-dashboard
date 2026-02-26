# Deployment Guide

## Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd chrome-dashboard
vercel
```

Follow the prompts:
- Set up and deploy: Y
- Which scope: Select your account
- Link to existing project: N
- Project name: chrome-dashboard
- Directory: ./
- Build command: npm run build
- Output directory: dist

### Step 3: Set Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-backend.com/api`
3. Redeploy

## Deploy to Netlify

### Option 1: Drag & Drop
```bash
npm run build
```
Drag the `dist/` folder to https://app.netlify.com/drop

### Option 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend.com/api"
```

## Deploy to AWS S3 + CloudFront

### Step 1: Build
```bash
npm run build
```

### Step 2: Create S3 Bucket
```bash
aws s3 mb s3://chrome-dashboard
aws s3 sync dist/ s3://chrome-dashboard --acl public-read
```

### Step 3: Configure S3 for Static Hosting
- Enable Static Website Hosting
- Set index.html as index document
- Set index.html as error document (for SPA routing)

### Step 4: CloudFront (Optional)
- Create CloudFront distribution
- Point to S3 bucket
- Set custom error response: 404 → /index.html (200)

## Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run
```bash
docker build -t chrome-dashboard .
docker run -p 80:80 chrome-dashboard
```

## GitHub Pages

### Step 1: Add to package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Update vite.config.js
```javascript
export default defineConfig({
  base: '/chrome-dashboard/',
  // ...
})
```

### Step 4: Deploy
```bash
npm run deploy
```

Visit: https://yourusername.github.io/chrome-dashboard/

## Environment Variables for Production

### Frontend (.env.production)
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

### Django Backend

Update Django settings for production:

```python
# settings.py

ALLOWED_HOSTS = ['yourdomain.com', 'api.yourdomain.com']

CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://chrome-dashboard.vercel.app',
]

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
```

## SSL/HTTPS

Most hosting providers (Vercel, Netlify) provide free SSL automatically.

For custom domains:
- Use Let's Encrypt (free)
- Or CloudFlare (free SSL + CDN)

## Performance Optimization

### 1. Enable Gzip Compression
Already enabled in Vite build.

### 2. Add CDN
```html
<!-- In index.html, add preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 3. Lazy Loading
Already implemented with React Router code splitting.

### 4. Service Worker
Already configured for offline support.

## Monitoring

### Recommended Tools
- **Vercel Analytics** - Free on Vercel
- **Google Analytics** - Add tracking code
- **Sentry** - Error tracking
- **LogRocket** - Session replay

### Add Google Analytics
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Post-Deployment Checklist

✅ Test all pages load correctly
✅ Test API connections
✅ Verify dark mode works
✅ Test on mobile devices
✅ Check PWA installation works
✅ Test offline mode
✅ Verify authentication flow
✅ Check CORS configuration
✅ Test form submissions
✅ Verify environment variables loaded

## Troubleshooting

**Blank page after deployment**
- Check browser console for errors
- Verify base path in vite.config.js
- Check .env variables are set

**API calls failing**
- Check CORS configuration
- Verify API URL is correct
- Check network tab in browser

**PWA not installing**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker is registered

**Icons not loading**
- Check Google Fonts CDN is accessible
- Verify CSP headers allow fonts.googleapis.com

## Scaling Considerations

### Frontend
- Use CDN for static assets
- Enable HTTP/2
- Implement code splitting (already done)
- Add caching headers

### Backend (Django)
- Use Gunicorn + Nginx
- Enable database connection pooling
- Add Redis for caching
- Use Celery for async tasks
- Implement rate limiting

## Cost Estimation

**Free Tier Options:**
- Vercel: Free for personal projects
- Netlify: Free for personal projects
- GitHub Pages: Free
- AWS S3: ~$1-5/month

**Production Options:**
- Vercel Pro: $20/month
- Netlify Pro: $19/month
- AWS: $10-50/month (with CloudFront)
- DigitalOcean: $5-10/month

Choose based on:
- Traffic volume
- Team size
- Support needs
- Feature requirements

---

**Need Help?** Check the troubleshooting section or open an issue.
