# Roadmap

Where Smart Travel AI is going: from an AI that writes a plan to a planner that checks its own work, so each day fits your budget, the weather and the map. Hours are estimates.

## Planned (~45 h)

- [ ] **Structured, checked AI output** (~8 h). Have the model return the itinerary as JSON instead of free text, check it against a Zod schema, and retry with the errors when it doesn't fit. Stream the days onto the page as they arrive instead of waiting for the whole plan.
- [ ] **Route optimisation** (~12 h). Reorder each day's stops to cut travel time: geocode the stops, build a distance matrix, and solve the small travelling-salesman problem (nearest-neighbour start, improved with 2-opt). Show each day's route on a map (MapLibre with OpenStreetMap tiles).
- [ ] **Budget planner** (~8 h). Split the total budget across stays, food, transport and activities, show what each day costs, and re-plan the days that go over.
- [ ] **Weather-aware days** (~5 h). When the forecast for a day turns bad, swap its outdoor plans for indoor ones and say why.
- [ ] **Calendar export** (~2 h). Download the whole trip as an .ics file.
- [ ] **Tests and CI** (~6 h). Tests for the itinerary route with the outside services mocked, tests for the route optimiser, and GitHub Actions running tests, lint and the build on every push.
- [ ] **Code health** (~4 h). Clear the 97 lint issues left after the Next.js 16 upgrade (mostly loose `any` types), split the 540-line itinerary route into smaller modules, and move to Zod 4.

## Later ideas

- Compare two versions of a trip side by side (for example a cheaper and a slower one).
- Share a read-only link to an itinerary.
- Packing list built from the weather and activities.

## Not planned

- **Accounts and saved personal data.** Trips stay in your own browser.
- **Booking or payments.** It plans trips; it doesn't book them.
