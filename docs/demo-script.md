# Talking Rabbitt Demo Script

## Setup
1. Start FastAPI backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. Start Next.js dashboard:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Load `http://localhost:3000` and confirm the synthetic dataset is visible (KPI cards should populate).

## Storyline
1. **Hook (30 seconds)** – “Meet Talking Rabbitt, your AI sidekick for sales stand-ups. Ask it why Q2 dipped or what promo to run next, and it answers with charts, voice, and context.”
2. **Data upload (Optional)** – Drag a CSV of weekly sales into the Upload endpoint (via API or forthcoming UI) to show instant refresh.
3. **Dashboard Walkthrough (2 minutes)**
   - Highlight KPI cards updating as you filter by region / category.
   - Show the trend and breakdown charts reacting to filter changes.
   - Demonstrate persona presets (CEO, CMO, Merch Ops) to show personalized KPIs/themes.
   - Toggle dark mode + promo filters to emphasize customizable experiences.
4. **Conversation (2 minutes)**
   - Ask “Which regions are leading women’s footwear?” and show the chat bubble plus spoken response.
   - Ask “Why did sales drop in Q2?” to surface anomaly insights.
5. **Recommendations (1 minute)** – Point to the textual insights recommending promos or regions to double down on.

## Closing Pitch
- Emphasize rapid onboarding with CSV uploads + synthetic starter data.
- Note optional plug-ins: inventory, supply chain, marketing ROI.
- CTA: “Imagine your CMO asking real-time, voice-driven questions on the fly. That’s Talking Rabbitt.”

