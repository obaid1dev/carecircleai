# CareCircleAI 🩺💙

**AI-powered caregiver coordination for aging families.**

CareCircleAI helps families care for aging parents and grandparents by combining
a daily AI companion check-in with a shared caregiver dashboard — so no one is
left wondering "how's Mom doing today?"

## The Problem

Millions of families are juggling care for aging relatives with no shared system:
- Missed medications go unnoticed until it's too late
- Doctor appointments fall through the cracks
- Loneliness goes undetected between visits
- Family members are left in the dark because there's no single source of truth

By 2030, 1 in 5 Americans will be 65+ — and the caregiver shortage is only growing.

## What It Does

- **Daily AI Check-ins** — An AI companion talks or chats with the elderly user
  each day: medication reminders, mood check-ins, and simple conversation.
- **Family Dashboard** — Caregivers and family members see check-in history,
  upcoming appointments, and medication logs in one shared view.
- **Smart Flagging** — If check-ins are missed or responses suggest pain,
  confusion, or distress, the system flags it and notifies family automatically.
- **Appointment & Med Tracking** — A simple shared calendar keeps everyone on
  the same page.

## Tech Stack

- **Frontend:** React / TanStack Start, TypeScript, Tailwind CSS
- **AI:** Claude API for conversational check-ins and sentiment/risk flagging
- **Backend/DB:** Supabase (auth, database, storage)
- **Voice/Phone (optional):** Twilio, for elderly users who prefer a phone check-in over an app

## Getting Started

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

You'll need a `.env` file with your Supabase and AI API keys — see `.env.example`.

## Roadmap

- [ ] Voice-based check-ins via phone call
- [ ] Multi-caregiver permissions (siblings, in-home nurses, etc.)
- [ ] Medication adherence trends over time
- [ ] Integration with pharmacy/appointment APIs

## Disclaimer

CareCircleAI is a coordination and companionship tool, not a medical device.
It does not diagnose or treat any condition. In an emergency, contact
emergency services directly.

---

Built with care, for the people who care for others. 💙
