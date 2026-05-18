# 🎯 AtomQuest Goal Tracking Portal

> Enterprise-grade Goal Setting & Performance Tracking System — AtomQuest Hackathon 1.0

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://atomquest-frontend.vercel.app)
[![Backend API](https://img.shields.io/badge/API-online-blue)](https://atomquest-backend-33sg.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Hackathon judges:** See [docs/SUBMISSION.md](docs/SUBMISSION.md) for deliverables, credentials, and a 3-minute demo path.

> **Note:** Backend on Render free tier may cold-start (~30–60s) after idle time. Open the live site once before judging.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Demo Credentials](#demo-credentials)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 🌟 Overview

AtomQuest Goal Tracking Portal is a comprehensive performance management system designed for organizations to streamline goal setting, tracking, and evaluation processes. Built with modern technologies and enterprise-grade security, it provides role-based access for Admins, Managers, and Employees.

### Key Highlights
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 🎯 **Goal Management** - Create, track, and manage goals with approval workflows
- 🤖 **AI-Powered** - Smart goal suggestions using OpenAI
- 📊 **Analytics & Reports** - Comprehensive dashboards and exportable reports
- 🔔 **Real-time Notifications** - Stay updated on goal approvals and deadlines
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

---

## ✨ Features

### For Employees
- ✅ Create and manage personal goals
- ✅ Submit goals for manager approval
- ✅ Track progress with quarterly check-ins
- ✅ Get AI-powered goal suggestions
- ✅ View notifications and updates
- ✅ Use pre-built goal templates

### For Managers
- ✅ View and manage team goals
- ✅ Approve or reject goal submissions
- ✅ Monitor team performance (Team Check-ins)
- ✅ Generate team reports
- ✅ Track completion rates

### For Admins
- ✅ Manage users and roles
- ✅ Configure thrust areas
- ✅ Create goal templates
- ✅ View system-wide analytics
- ✅ Access audit logs
- ✅ Export comprehensive reports

### Advanced Features
- 🤖 **AI Goal Suggestions** - Contextual goal recommendations
- 📊 **Progress Tracking** - Visual progress indicators and charts
- 🔄 **Approval Workflow** - Multi-level goal approval process
- 📧 **Email Notifications** - Automated email alerts (via Resend)
- 📈 **Analytics Dashboard** - Real-time performance metrics
- 🔍 **Audit Trail** - Complete history of all changes
- 📥 **CSV Export** - Download reports in CSV format
- 🎨 **Premium dark UI** - Modern SaaS design across all roles

---

## 📁 Project Structure

```
atomquest-hackathon/
├── frontend/          # React + Vite SPA (Vercel)
├── backend/           # FastAPI API (Render)
├── docs/              # Submission, architecture, demo script
├── tests/             # Additional test suites
├── scripts/           # Dev utility scripts
├── test_comprehensive.py   # Main API test (run from repo root)
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Ant Design (antd)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts
- **Styling**: CSS Modules + Ant Design

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Email**: Resend API
- **AI**: OpenRouter (OpenAI GPT-3.5)

### DevOps & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Supabase (PostgreSQL)
- **Version Control**: Git + GitHub
- **CI/CD**: Automatic deployment on push

---

## 🌐 Live Demo

### URLs
- **Frontend**: [https://atomquest-frontend.vercel.app](https://atomquest-frontend.vercel.app)
- **Backend API**: [https://atomquest-backend-33sg.onrender.com](https://atomquest-backend-33sg.onrender.com)
- **API Docs**: [https://atomquest-backend-33sg.onrender.com/docs](https://atomquest-backend-33sg.onrender.com/docs)
- **GitHub**: [https://github.com/TejasviUpadhyay1907/atomquest-hackathon](https://github.com/TejasviUpadhyay1907/atomquest-hackathon)

---

## 🔐 Demo Credentials

### Admin Account
```
Email: admin@demo.com
Password: password123
```
**Access**: Full system access, user management, system configuration

### Manager Account
```
Email: manager@demo.com
Password: password123
```
**Access**: Team management, goal approvals, team reports

### Employee Account
```
Email: emp1@demo.com
Password: password123
```
**Access**: Personal goals, check-ins, progress tracking

---

## 🏗️ Architecture

High-level flow: **Browser → React (Vercel) → FastAPI (Render) → PostgreSQL (Supabase)** with **Resend** (email) and **OpenRouter/OpenAI** (AI suggestions).

Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Diagram file (PNG/PDF): add to [docs/architecture/](docs/architecture/) when ready.

```
┌──────────────┐     HTTPS/JWT      ┌──────────────┐     SQL      ┌──────────────┐
│ React SPA    │ ────────────────► │ FastAPI      │ ──────────► │ PostgreSQL   │
│ Vercel       │                   │ Render       │             │ Supabase     │
└──────────────┘                   └──────┬───────┘             └──────────────┘
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                         Resend (email)      OpenRouter (AI)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/atomquest
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RESEND_API_KEY=your-resend-api-key
OPENAI_API_KEY=your-openai-api-key
EOF

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Database Setup

```bash
# Create database
createdb atomquest

# Run migrations
cd backend
alembic upgrade head

# Add demo users
python create_demo_users.py
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Goal Endpoints
- `GET /api/goals/my-goals` - Get user's goals
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `POST /api/goals/{id}/submit` - Submit for approval

### Manager Endpoints
- `GET /api/manager/team` - Get team members
- `GET /api/manager/team-goals` - Get team goals
- `POST /api/manager/goals/{id}/approve` - Approve goal
- `POST /api/manager/goals/{id}/reject` - Reject goal

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/audit-logs` - Audit trail

### AI Endpoints
- `POST /api/ai/suggest-goals` - Get AI goal suggestions
- `POST /api/ai/improve-description` - Improve goal description

For complete API documentation, visit: [https://atomquest-backend-33sg.onrender.com/docs](https://atomquest-backend-33sg.onrender.com/docs)

---

## 🧪 Testing

### API test (recommended)
```bash
# From repository root — tests live backend
python test_comprehensive.py
```

### Other suites
```bash
python tests/test_frontend_deep.py
python backend/quick_test.py
```

See [docs/TESTING.md](docs/TESTING.md) and [docs/MANUAL_TESTING.md](docs/MANUAL_TESTING.md).

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| [docs/SUBMISSION.md](docs/SUBMISSION.md) | Hackathon deliverables |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | Demo walkthrough |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy notes |

---


## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Endpoints**: 50+
- **Database Models**: 7
- **Frontend Pages**: 12
- **Components**: 30+
- **Test Coverage**: 75%+

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developer**: Tejasvi Upadhyay  
**GitHub**: [@TejasviUpadhyay1907](https://github.com/TejasviUpadhyay1907)

---

## 🙏 Acknowledgments

- **AtomQuest Hackathon** - For the opportunity
- **FastAPI** - Amazing Python framework
- **React** - Powerful frontend library
- **Ant Design** - Beautiful UI components
- **Supabase** - Excellent database hosting
- **Vercel & Render** - Seamless deployment platforms

---

## 📞 Support

Open an issue on [GitHub](https://github.com/TejasviUpadhyay1907/atomquest-hackathon/issues).

---

## 🎯 Roadmap (future)

- [ ] Microsoft Entra ID / SSO
- [ ] Microsoft Teams notifications
- [ ] Calendar-enforced quarterly windows
- [ ] Mobile app

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for AtomQuest Hackathon 2026**

---

*Last Updated: May 2026*
