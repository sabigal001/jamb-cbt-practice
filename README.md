# λ Lambda - JAMB CBT Practice Portal

Lambda is a modern, high-performance Computer Based Test (CBT) practice portal specifically designed for JAMB aspirants in Nigeria. It provides a realistic exam environment, subject-specific drills, and detailed performance tracking to help students ace their exams with confidence.

## ✨ Features

- **Realistic Mock Exams**: A full-timed exam interface that mimics the official JAMB CBT software.
- **Subject-Specific Drills**: 10-question rapid-fire sessions to master specific subjects.
- **Performance Analytics**: Real-time tracking of Accuracy, XP, and subject mastery.
- **Gamified Progress**: Earn XP for every correct answer and maintain a daily practice streak.
- **Security First**: Secure JWT authentication and protected endpoints.
- **Mobile Ready**: Fully responsive design for practice on the go.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Phosphor Icons.
- **Backend**: Django, Django REST Framework, JWT Auth.
- **API**: Integrated with ALOC API for a massive database of past JAMB questions.
- **Email**: Integrated with `django-mailer` for robust verification and password recovery.

## 🛠️ Installation & Setup

### Backend (Django)
1. Navigate to the `backend` folder.
2. Install dependencies: `pip install -r requirements.txt`.
3. Apply migrations: `python manage.py migrate`.
4. Start server: `python manage.py runserver`.

### Frontend (Next.js)
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start development: `npm run dev`.

## 🌍 Deployment

Detailed instructions for deploying the backend to **PythonAnywhere** and the frontend to **Vercel** can be found in [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛡️ Security

- Environment variable protection for sensitive keys.
- Rate limiting on API endpoints.
- Secure HSTS and XSS headers enabled for production.

## 📝 License

This project is licensed under the MIT License.
