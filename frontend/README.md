# Goal Tracking Portal - Frontend

React frontend for the Goal Setting & Tracking Portal.

## Features

### Pages Implemented
✅ Login & Register
✅ Dashboard with real-time notifications
✅ Employee Goals (with AI suggestions!)
✅ Employee Check-ins
✅ Manager Approvals (with inline editing & bulk approve)
✅ Manager Team Check-ins
✅ Admin All Goals
✅ Admin Shared Goals
✅ Admin Audit Logs
✅ Analytics Dashboard (6 charts)
✅ Notifications Page

## Tech Stack

- **Framework:** React 18 + Vite
- **UI Library:** Ant Design 5
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router v6
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Date Handling:** Day.js

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend will start at: http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── employee/
│   │   │   ├── EmployeeGoals.jsx
│   │   │   └── EmployeeCheckins.jsx
│   │   ├── manager/
│   │   │   ├── ManagerApprovals.jsx
│   │   │   └── ManagerTeamCheckins.jsx
│   │   ├── admin/
│   │   │   ├── AdminGoals.jsx
│   │   │   ├── AdminSharedGoals.jsx
│   │   │   └── AdminAuditLogs.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   └── NotificationsPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Key Features

### 1. AI Goal Suggestions 🤖
- Click "Get AI Suggestion" button
- Powered by OpenAI GPT-3.5
- Auto-fills goal form with SMART goals
- Unique feature - no other team will have this!

### 2. Real-time Notifications
- Bell icon with badge count
- Polls every 30 seconds
- In-app notification center
- Mark as read functionality

### 3. Validation Feedback
- Real-time weightage counter
- Visual progress bar
- Clear error messages
- Prevents invalid submissions

### 4. Manager Bulk Operations
- Approve all goals at once
- Inline editing during approval
- Grouped by employee
- Validation before bulk approve

### 5. Analytics Dashboard
- 6 interactive charts
- Goal distribution
- Completion rates
- Progress trends
- Status overview
- UoM distribution
- Summary statistics

### 6. Mobile Responsive
- Works on all devices
- Collapsible sidebar
- Touch-friendly buttons
- Responsive tables

## User Flows

### Employee Flow
1. Login → My Goals
2. Create goals (max 8, total 100%)
3. Get AI suggestions (optional)
4. Submit for approval
5. View locked goals
6. Add quarterly check-ins
7. View progress scores

### Manager Flow
1. Login → Pending Approvals
2. Review team goals
3. Inline edit target/weightage
4. Approve or reject
5. Bulk approve all
6. View team check-ins
7. Add manager comments

### Admin Flow
1. Login → All Goals
2. View system-wide goals
3. Unlock locked goals
4. Create shared goals
5. Assign to multiple employees
6. View audit logs
7. Export reports

## API Integration

All API calls are handled through `src/services/api.js`:

- Automatic JWT token injection
- Error handling with interceptors
- Automatic redirect on 401
- Organized by feature (auth, goals, manager, admin, etc.)

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variable: `VITE_API_URL`
3. Deploy automatically

### Manual Build
```bash
npm run build
# Upload dist/ folder to any static hosting
```

## Performance

- Code splitting with React Router
- React Query caching (5 min TTL)
- Lazy loading of charts
- Optimized bundle size
- Fast page loads (<2 sec)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT License - AtomQuest Hackathon 2026
