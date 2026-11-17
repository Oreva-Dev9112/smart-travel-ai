# Smart Travel AI

A trip planner that turns your dates, budget and interests into a day-by-day itinerary. It doesn't just ask an AI for ideas: it first looks up your destination's real weather forecast, events happening while you're there and places nearby, and then plans around them. You can export the result as a PDF, or ask follow-up questions in a travel chat.

It's for people planning a trip who want a realistic starting plan in minutes instead of an evening of tabs.

**Try it:** https://smart-travel-ai.vercel.app

> **Status: working, early.** Planning, the chat and PDF export work. Route optimisation, budgets and smarter AI output are planned. See the [roadmap](ROADMAP.md).

## How it works

1. You fill in the trip form: destination, dates, travellers, budget, travel style, accommodation, activities and transport.
2. The server looks up the destination's coordinates (OpenCage), the weather forecast for your dates (WeatherAPI), events on those dates (PredictHQ) and places nearby (Foursquare).
3. All of that goes to an OpenAI model with your preferences, which writes a day-by-day plan that uses the real events and weather.
4. The itinerary page shows the plan, caches it in your browser, and exports it to PDF.

The travel chat (`/assistant`) answers general questions. Without an OpenAI key it replies with sample answers, so the app still runs.

## Built with

- Next.js 16 (App Router) and React 19, in TypeScript
- Tailwind CSS and Framer Motion
- React Hook Form and Zod for the trip form
- OpenAI, OpenCage, WeatherAPI, PredictHQ and Foursquare
- jsPDF and html2canvas for the PDF export
- Vitest and Testing Library for tests
- Hosted on Vercel

## Run it

You need Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # then add your keys
npm run dev
```

Open http://localhost:3000.

| Setting | What it's for |
| --- | --- |
| `OPENAI_API_KEY` | Writing itineraries and chat replies |
| `OPENAI_MODEL` | Optional. The model to use; defaults to `gpt-6-luna` |
| `OPENCAGE_KEY` | Finding the destination's coordinates |
| `WEATHERAPI_KEY` | The weather forecast |
| `PREDICTHQ_API_KEY` | Events during the trip |
| `FOURSQUARE_API_KEY` | Places near the destination |

Other commands:

```bash
npm test         # run the tests
npm run lint     # lint
npm run build    # production build
```

## How the code is laid out

| Path | What it does |
| --- | --- |
| `src/app/search/` | The trip form page |
| `src/components/ItineraryForm.tsx` | The form itself, validated with Zod |
| `src/app/api/generate-itinerary/route.ts` | Gathers weather, events and places, then asks the model for the plan |
| `src/app/itinerary/` | Shows the plan, caches it and exports the PDF |
| `src/app/assistant/` and `src/app/api/chat/` | The travel chat |
| `src/proxy.ts` | Rate-limits the API routes |
| `src/lib/openaiModel.ts` | Which OpenAI model is used |

## Licence

MIT. See [LICENSE](LICENSE).
