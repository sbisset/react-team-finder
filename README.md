# 🛡️ Dota Team Finder

A full-stack web app for Dota 2 players to find teammates, create teams, and connect their Steam account to automatically sync stats.

## 🚀 Live
https://dotateamfinder.netlify.app  


## 🧱 Tech Stack
- **Frontend:** React (Vite), Netlify  
- **Backend:** Django REST Framework, PostgreSQL, Render  
- **Auth:** JWT + Steam OpenID  
- **APIs:** OpenDota, Steam

## ✨ Features
- User authentication (JWT)
- Create & join teams
- Applications & invites system
- Connect Steam account
- Auto-sync Dota stats (MMR, win/loss, top heroes)

## ⚙️ Setup

### Backend
```bash
cd main
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend 
```bash
cd main
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
## 🔮 Future Improvements
⚡ Background jobs for stat syncing

🔔 Notifications system




  
