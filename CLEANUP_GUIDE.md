# 🧹 Repository Cleanup Guide

> **Essential steps to prepare your AI Vision Classifier for GitHub upload**

---

## 🎯 Overview

This guide helps you clean up unnecessary files, reduce repository size, and ensure your project is ready for professional GitHub presentation.

## 📦 Files Already Excluded by .gitignore

The comprehensive `.gitignore` file already handles most cleanup automatically:

### ✅ **Automatically Excluded:**
- `frontend/node_modules/` (100+ MB)
- `frontend/.next/` (build artifacts)
- `__pycache__/` (Python cache files)
- `db_data/` (PostgreSQL data)
- `uploads/` (user-uploaded images)
- `.env` files (sensitive configuration)
- Docker volumes and cache files

---

## 🗂️ Manual Cleanup Required

### 1. **Large Files to Remove/Check**

Run these commands to identify large files:

```bash
# Find files larger than 10MB
find . -type f -size +10M

# Check repository size by directory
du -sh */ | sort -hr
```

### 2. **Specific Directories to Clean**

```bash
# Remove any existing large files
rm -rf db_data/
rm -rf uploads/
rm -rf frontend/node_modules/
rm -rf frontend/.next/

# Clean Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -name "*.pyc" -delete

# Remove any leftover environment files
rm -f .env .env.local api/.env
```

### 3. **Docker Cleanup**

```bash
# Clean Docker system (optional - run with caution)
docker system prune -a --volumes

# Remove Docker images (optional)
docker image prune -a
```

---

## 📋 Pre-Upload Checklist

### ✅ **Essential Steps:**

- [ ] **Environment Files**: Ensure `.env` files are not committed
- [ ] **Dependencies**: Keep `package.json` but remove `node_modules/`
- [ ] **Secrets**: No API keys, passwords, or tokens in code
- [ ] **Build Artifacts**: Remove all build/dist directories
- [ ] **Large Assets**: No large images or model files
- [ ] **Database Data**: Remove any local database files

### ✅ **Documentation Ready:**
- [ ] **README.md**: Updated with professional overview
- [ ] **PORTFOLIO.md**: Comprehensive project showcase
- [ ] **API Documentation**: FastAPI docs accessible via `/docs`
- [ ] **Installation Guide**: Clear setup instructions

### ✅ **Code Quality:**
- [ ] **Clean Code**: No debug prints or commented code
- [ ] **Type Hints**: Python functions have type annotations
- [ ] **Error Handling**: Proper exception management
- [ ] **Comments**: Meaningful code documentation

---

## 🔒 Security Check

### **Verify No Sensitive Data:**

```bash
# Search for potential secrets (run from project root)
grep -r "password" --include="*.py" --include="*.ts" --include="*.js" .
grep -r "secret" --include="*.py" --include="*.ts" --include="*.js" .
grep -r "api_key" --include="*.py" --include="*.ts" --include="*.js" .
```

### **Replace Any Hardcoded Values:**
- Database credentials → Environment variables
- JWT secrets → Environment variables  
- API keys → Environment variables

---

## 📊 Repository Size Optimization

### **Target Size Goals:**
- **Ideal**: < 50 MB total
- **Maximum**: < 100 MB
- **Per File**: < 10 MB each

### **Size Check Commands:**
```bash
# Check current repository size
du -sh .git
du -sh . --exclude=.git

# Find largest files
find . -name .git -prune -o -type f -exec ls -lh {} \; | sort -k5 -hr | head -20
```

---

## 🎨 Professional Presentation

### **Files to Keep:**
- ✅ Source code (`.py`, `.ts`, `.tsx`, `.js`)
- ✅ Configuration files (`package.json`, `Dockerfile`, etc.)
- ✅ Documentation (`README.md`, `PORTFOLIO.md`)
- ✅ Example images (small, < 1MB each)
- ✅ Environment templates (`.env.original`)

### **Files to Remove:**
- ❌ `node_modules/` directories
- ❌ Build artifacts (`.next/`, `dist/`, `build/`)
- ❌ Database files (`*.db`, `db_data/`)
- ❌ Upload directories (`uploads/`, `media/`)
- ❌ Log files (`*.log`)
- ❌ Cache directories (`__pycache__/`, `.cache/`)

---

## 🚀 Final Preparation Commands

Run these commands before GitHub upload:

```bash
# 1. Ensure you're in the project root
cd /path/to/ai-vision-classifier

# 2. Clean Python cache
find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null

# 3. Clean Node.js dependencies (they'll be reinstalled)
rm -rf frontend/node_modules/
rm -rf frontend/.next/

# 4. Remove any environment files
rm -f .env .env.local api/.env

# 5. Remove uploads and database
rm -rf uploads/
rm -rf db_data/

# 6. Check repository size
du -sh . --exclude=.git

# 7. Verify .gitignore is working
git status
```

---

## 📁 Recommended Repository Structure

After cleanup, your repository should look like:

```
ai-vision-classifier/
├── .gitignore                 ✅ Comprehensive exclusions
├── README.md                  ✅ Professional overview  
├── PORTFOLIO.md               ✅ Showcase document
├── docker-compose.yml         ✅ Service orchestration
├── .env.original              ✅ Environment template
├── api/                       ✅ FastAPI backend
├── model/                     ✅ ML service
├── frontend/                  ✅ Next.js UI (no node_modules)
├── tests/                     ✅ Testing suite
└── stress_test/               ✅ Performance tests
```

---

## 🎯 GitHub Upload Strategy

### **1. Initial Commit:**
```bash
git add .
git commit -m "feat: Initial commit - AI Vision Classifier with Next.js frontend"
git push origin main
```

### **2. Repository Settings:**
- **Description**: "🧠 AI Vision Classifier - Advanced image classification using ResNet50 deep learning with Next.js frontend"
- **Topics**: `machine-learning`, `nextjs`, `fastapi`, `computer-vision`, `tensorflow`, `docker`
- **License**: MIT (recommended)

### **3. README Badges** (optional):
Add these to your README.md:
```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)
```

---

## ✅ Success Indicators

Your repository is ready when:

- [ ] **Size**: < 50 MB total
- [ ] **Clean**: No sensitive data or large files
- [ ] **Professional**: Clear documentation and structure
- [ ] **Functional**: Can be cloned and run with provided instructions
- [ ] **Secure**: All secrets use environment variables

---

## 🎉 Final Notes

- **Portfolio Impact**: This cleanup ensures your repository looks professional to employers and collaborators
- **Performance**: Smaller repositories clone faster and are easier to navigate
- **Security**: No accidental exposure of sensitive data
- **Maintenance**: Easier to maintain and update over time

**Your AI Vision Classifier is now ready to showcase your full-stack machine learning skills!** 🚀 