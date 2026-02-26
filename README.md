# Chrome Dashboard PWA

A modern Progressive Web Application (PWA) for enterprise management built with React, Tailwind CSS, and Django REST Framework backend integration.

## Features

- 📱 **Progressive Web App** - Installable, works offline with service worker
- 🎨 **Chrome Design System** - Clean, modern UI following Chrome design guidelines
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📊 **Dashboard Analytics** - Real-time stats and activity monitoring
- 👥 **User Management** - Comprehensive user CRUD operations
- 🏢 **Departments & Teams** - Organizational structure management
- 📈 **Insights** - Visual analytics and performance metrics
- 📝 **Activity Logs** - System and user activity tracking
- ⚙️ **Settings** - Configurable notifications, privacy, and system settings
- 🔐 **Django REST Framework Integration** - Ready to connect to your backend API

## Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with custom Chrome theme
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Material Symbols Outlined
- **Backend**: Django REST Framework (API integration ready)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your Django backend URL:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Django Backend Integration

### Expected API Endpoints

#### Dashboard
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /api/dashboard/activities/` - Recent activities

#### Users
- `GET /api/users/` - List users
- `GET /api/users/:id/` - Get user details
- `POST /api/users/` - Create user
- `PUT /api/users/:id/` - Update user
- `DELETE /api/users/:id/` - Delete user

#### Departments
- `GET /api/departments/` - List departments
- `GET /api/departments/:id/` - Get department details
- `POST /api/departments/` - Create department
- `PUT /api/departments/:id/` - Update department
- `DELETE /api/departments/:id/` - Delete department

#### Teams
- `GET /api/teams/` - List teams
- `GET /api/teams/:id/` - Get team details
- `POST /api/teams/` - Create team
- `PUT /api/teams/:id/` - Update team
- `DELETE /api/teams/:id/` - Delete team

#### Insights
- `GET /api/insights/` - Analytics data

#### Logs
- `GET /api/logs/` - Activity logs

#### Settings
- `GET /api/settings/` - Get settings
- `PUT /api/settings/` - Update settings

#### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user

### Authentication

The API client automatically:
- Adds Bearer token to requests from `localStorage.getItem('authToken')`
- Redirects to `/login` on 401 Unauthorized responses
- Handles token storage on successful login

## PWA Features

- **Offline Support**: Service worker caches assets
- **Installable**: Can be installed on devices
- **Theme Color**: #1a73e8 (Chrome blue)

Add your PWA icons to `public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

## Customization

### Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  "primary": "#1a73e8",  // Change primary color
  // ...
}
```

### API Base URL
Update `.env`:
```
VITE_API_URL=http://your-backend-url/api
```

## Development

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## License

MIT
