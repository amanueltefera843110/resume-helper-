# 🚀 ResumeHub Deployment Guide

## 🔐 Security Setup

### 1. Environment Variables
Never commit API keys or sensitive information to GitHub!

**Local Development:**
```bash
# Create a .env file in your project root
echo "GOOGLE_API_KEY=your_actual_api_key_here" > .env
```

**Production Deployment:**
Set environment variables in your hosting platform:
- **Heroku:** `heroku config:set GOOGLE_API_KEY=your_key`
- **Vercel:** Add in Environment Variables section
- **Railway:** Add in Variables section
- **DigitalOcean:** Add in App Spec environment variables

### 2. Required Environment Variables
```bash
GOOGLE_API_KEY=your_google_gemini_api_key
FLASK_ENV=production
FLASK_DEBUG=False
```

## 🌐 GitHub Deployment

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: ResumeHub application"
```

### 2. Create GitHub Repository
- Go to GitHub.com and create a new repository
- **DO NOT** initialize with README, .gitignore, or license

### 3. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/resumehub.git
git branch -M main
git push -u origin main
```

## 🚀 Production Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-resumehub-app
heroku config:set GOOGLE_API_KEY=your_key
git push heroku main
```

### Option 2: Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Option 3: Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy with one click

## 📁 File Structure
```
resumehub/
├── .env                 # Environment variables (NOT in git)
├── .gitignore          # Git ignore rules
├── backend.py          # Flask backend
├── requirements.txt    # Python dependencies
├── index.html          # Frontend
├── styles.css          # Styles
├── script.js           # Frontend logic
├── uploads/            # Upload directory
│   └── .gitkeep       # Keep directory in git
└── README.md           # Project documentation
```

## ⚠️ Security Checklist
- [ ] API key is in environment variables
- [ ] .env file is in .gitignore
- [ ] No hardcoded secrets in code
- [ ] CORS is properly configured
- [ ] File upload validation is enabled
- [ ] Production environment variables are set

## 🔧 Local Development
```bash
# Install dependencies
pip3 install -r requirements.txt

# Set environment variable
export GOOGLE_API_KEY=your_key

# Run backend
python3 backend.py

# Run frontend (in another terminal)
python3 -m http.server 8000
```

## 🎯 Production Considerations
- Use a production WSGI server (Gunicorn, uWSGI)
- Set up proper CORS for your domain
- Configure file upload limits
- Set up monitoring and logging
- Use HTTPS in production
- Consider rate limiting for API endpoints
