<div align="center">
  <img src="https://github.com/user-attachments/assets/eventide-logo-or-similar" alt="Eventide Logo" width="120" />

  # 🌌 Eventide Calendar

  **A futuristic, high-performance, and deeply interactive 3D calendar built for the next generation of the web.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
  [![Neon Database](https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
</div>

---

## ✨ Features

Eventide isn't just a calendar; it's an experience. We've pushed the boundaries of web UI to deliver something that feels alive.

- 🛸 **"Warp Speed" Page Transitions:** Fluid, 3D flip animations using Framer Motion. The calendar fades backward into space while the list view flies in from the front.
- 🔊 **Sci-Fi UI Sound Effects:** Deeply satisfying, soft electronic "clicks" and "whooshes" powered by the native Web Audio API (Toggleable for peace and quiet).
- 📅 **Optimistic Drag-and-Drop:** Instantly reschedule events by dragging them across the grid. The UI updates instantly while syncing seamlessly with the Neon Postgres database in the background.
- 🎨 **Premium Aesthetics:** Dark mode by default, glassmorphism, dynamic glowing borders, HackerText matrix effects, and Canvas Reveal animations.
- 🔐 **Secure Authentication:** Integrated NextAuth for secure, session-based user authentication.
- ⚡ **Lightning Fast:** Powered by Next.js 16 App Router and deployed on Vercel's Edge Network.

## 🏗️ Architecture & Workflow

Eventide leverages a modern full-stack Serverless architecture for maximum scalability and minimum latency.

```mermaid
graph TD
    %% User Flow
    User((User)) -->|Interacts| Client[Next.js Client Components]
    
    %% Client Tier
    subgraph Frontend [UI & Interactivity]
        Client -->|Framer Motion| Animations[3D Transitions]
        Client -->|Web Audio API| Sounds[Sci-Fi Sounds]
        Client -->|Optimistic UI| State[React State]
    end
    
    %% Network Tier
    Client -->|Server Actions / API| Server[Next.js Server]
    
    %% Backend Tier
    subgraph Backend [Server & Data]
        Server -->|NextAuth| Auth[(Session Data)]
        Server -->|Prisma Client| ORM[Prisma ORM]
    end
    
    %% Database Tier
    ORM -->|Connection Pooling| DB[(Neon Serverless Postgres)]
```

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/CodeWithBasu/Eventide-Calender.git
cd events-calendar-2026
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add your database and auth secrets:
```env
# Neon Database Connection
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"

# NextAuth Secret
NEXTAUTH_SECRET="your_super_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Push the Prisma Schema
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to experience the calendar.

## 💻 Code Snippets

### Optimistic Drag & Drop Updates
To make rescheduling feel instant, Eventide uses optimistic UI rendering. We update the local React state immediately, and gracefully revert if the Server Action fails.

```typescript
onDrop={async (e) => {
  e.preventDefault();
  const eventId = e.dataTransfer.getData('eventId');
  
  const eventToUpdate = localEvents.find(ev => ev.id === eventId);
  const duration = eventToUpdate.endDay - eventToUpdate.startDay;
  const newEndDay = day.date! + duration;
  
  // 1. Optimistic Update (Instant Feedback)
  setLocalEvents(prev => prev.map(ev => 
    ev.id === eventId ? { ...ev, startDay: day.date!, endDay: newEndDay, month: month } : ev
  ));

  // 2. Background Server Sync
  const res = await updateEventDate(eventId, day.date, month);
  
  if (!res.success) {
    // 3. Revert on failure
    setLocalEvents(prev => prev.map(ev => 
      ev.id === eventId ? { ...ev, startDay: originalDay, endDay: originalEndDay } : ev
    ));
    alert(res.error || "Failed to update event date");
  }
}}
```

### Synthetic Audio Engine
Instead of relying on heavy `.mp3` files, Eventide generates high-quality sci-fi sound effects directly in the browser using mathematical oscillators.

```typescript
export const playHoverSound = () => {
  if (!soundsEnabled) return;
  const audioCtx = getAudioContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};
```

## 👨‍💻 About the Author

**Basudev (CodeWithBasu)**  
Passionate full-stack developer obsessed with pushing the limits of web design, beautiful UI/UX, and highly interactive applications. 

- GitHub: [@CodeWithBasu](https://github.com/CodeWithBasu)

---
<div align="center">
  <i>Built with 🖤 for the future of the web.</i>
</div>
