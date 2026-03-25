# Lambda JAMB CBT Practice Portal - Deployment Guide

This guide will help you deploy the **Lambda** project.

## 🚀 Frontend: Vercel (Next.js)

Vercel is the best place to host your Next.js frontend.

1.  **Push to GitHub**: (Already initialized in the project).
2.  **Import to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and sign in.
    *   Click "Add New" -> "Project".
    *   Import your `jamb-cbt-practice` repository.
3.  **Configure Build Settings**:
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `.next`
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Your PythonAnywhere URL (e.g., `https://yourusername.pythonanywhere.com`)
5.  **Deploy**: Click "Deploy".

---

## 🐍 Backend: PythonAnywhere (Django)

PythonAnywhere is great for hosting Django backends.

1.  **Clone your repo**:
    *   Open a "Bash Console" on PythonAnywhere.
    *   `git clone https://github.com/sabigal001/jamb-cbt-practice.git`
2.  **Create a Virtual Environment**:
    *   `mkvirtualenv --python=/usr/bin/python3.10 lambda-venv`
    *   `pip install -r backend/requirements.txt`
3.  **Configure Web App**:
    *   Go to the "Web" tab on PythonAnywhere.
    *   "Add a new web app".
    *   Choose "Manual configuration" and "Python 3.10".
    *   **Source code**: `/home/yourusername/jamb-cbt-practice/backend`
    *   **Virtualenv**: `/home/yourusername/.virtualenvs/lambda-venv`
4.  **Static Files**:
    *   In the "Web" tab, add an entry to "Static files":
        *   **URL**: `/static/`
        *   **Path**: `/home/yourusername/jamb-cbt-practice/backend/staticfiles`
5.  **WSGI Configuration**:
    *   Edit your WSGI configuration file (link provided in the Web tab):
    ```python
    import os
    import sys

    path = '/home/yourusername/jamb-cbt-practice/backend'
    if path not in sys.path:
        sys.path.append(path)

    os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    ```
6.  **Environment Variables**:
    *   Add these in your PythonAnywhere console or a `.env` file in the `backend` folder:
    *   `DJANGO_SECRET_KEY`: (A random string)
    *   `DJANGO_DEBUG`: `False`
    *   `ALLOWED_HOSTS`: `yourusername.pythonanywhere.com`
    *   `CORS_ALLOWED_ORIGINS`: `https://your-vercel-domain.vercel.app`
    *   `FRONTEND_URL`: `https://your-vercel-domain.vercel.app`
7.  **Database & Migrations**:
    *   `python manage.py migrate`
    *   `python manage.py collectstatic`

---

## 🛡️ Security Reminders
*   Never share your `.env` file.
*   Ensure `DJANGO_DEBUG` is `False` in production.
*   Update `CORS_ALLOWED_ORIGINS` to only allow your Vercel domain.
