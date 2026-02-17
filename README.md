# 🚀 Real-Time Poll Rooms

A full-stack real-time polling application where users can create polls, share them via a link, and collect votes with live updates across all viewers.

Deployed Version:  
👉 https://real-time-poll-rooms-1-oeqg.onrender.com 

Backend: Node.js + Express + MongoDB + Socket.io  
Frontend: React (Vite)  

---

## 📌 Features

### ✅ Poll Creation
- Create a poll with a question and minimum 2 options.
- Automatically generates a shareable link.

### ✅ Join by Link
- Anyone with the link can view and vote.
- No login required (anonymous voting).

### ✅ Real-Time Results
- When a user votes, results update instantly across all connected users.
- Implemented using room-based WebSocket architecture (Socket.io).

### ✅ Persistence
- Polls and votes are stored in MongoDB Atlas.
- Refreshing the page does not reset results.
- Shared links remain functional permanently.

### ✅ Fairness / Anti-Abuse Mechanisms
Two mechanisms are implemented to reduce repeat or abusive voting:

#### 1️⃣ IP-Based Restriction
- The client IP is hashed and stored.
- Only one vote per IP per poll is allowed.
- Prevents basic repeated voting attempts.

#### 2️⃣ Device Token Restriction
- A UUID-based device token is generated and stored in localStorage.
- Only one vote per device per poll is allowed.
- Prevents repeated voting from the same browser session.

### 🔒 Privacy Consideration
- IP addresses are hashed using SHA-256 before storage.
- Raw IPs are never stored in the database.

---

## 🧠 Fairness Limitations

While effective for reducing abuse, the current system has trade-offs:

- Users on shared networks (e.g., office, college WiFi) may be blocked due to IP-based restriction.
- Users clearing browser storage may bypass device-token restriction.
- VPN usage can bypass IP restriction.

In a production-scale system, additional measures such as:
- Rate limiting
- Authenticated users
- CAPTCHA
- Behavioral detection  
would be implemented.

---

## ⚙️ Technical Architecture

### 🏗 Backend
- Express REST API
- MongoDB Atlas (Mongoose)
- Atomic vote increment using `$inc`
- Compound unique indexes to prevent race-condition duplicates
- Socket.io for real-time updates

### 🔄 Real-Time Strategy

- Clients join a room based on `pollId`
- After successful vote:
  - MongoDB `$inc` updates vote atomically
  - Server emits `pollUpdated` to that specific room
- Only users viewing that poll receive updates

### 🛡 Concurrency Handling

- Application-level duplicate check
- Database-level unique indexes
- Atomic `$inc` operator prevents lost update problems

---

## 📂 Project Structure (Monorepo)

```
/backend
/frontend
README.md
```

- Backend deployed as Render Web Service
- Frontend deployed as Render Static Site

---

## 🧪 Edge Cases Handled

- Poll not found
- Invalid option selection
- Duplicate vote attempts
- Race condition prevention
- Page refresh after voting
- Real-time updates across multiple tabs

---

## 🚀 Local Development Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Mohammadsaad10/Real_Time_Poll_Rooms.git
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
FRONTEND_URL=http://localhost:5174
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Run frontend:

```bash
npm run dev
```

---

## 🌍 Deployment

### Backend (Render Web Service)
Environment Variables:

```
PORT=10000
MONGO_URI=your_atlas_uri
FRONTEND_URL=https://real-time-poll-rooms-1-oeqg.onrender.com
```

### Frontend (Render Static Site)
Environment Variables:

```
VITE_API_URL=https://real-time-poll-rooms-7na2.onrender.com/api
VITE_SOCKET_URL=https://real-time-poll-rooms-7na2.onrender.com
```

SPA routing handled using Render rewrite rule:

```
Source: /*
Destination: /index.html
Action: Rewrite
```

---

## 🛠 Future Improvements

- Poll expiration support
- Rate limiting (IP throttling)
- Admin dashboard for poll creator
- Advanced abuse detection
- Analytics dashboard

---

## 🎯 Key Engineering Decisions

- Used atomic `$inc` for vote updates to prevent lost updates.
- Combined application-level and database-level duplicate protection.
- Used room-based WebSocket architecture to minimize unnecessary broadcasts.
- Kept solution simple and stable as per assignment requirement.

---

## 👨‍💻 Author

Mohammad Saad  
Full-Stack Developer  
React | Node.js | MongoDB | Real-Time Systems
