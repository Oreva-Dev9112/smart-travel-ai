// The OpenAI model used for itineraries and chat. Set OPENAI_MODEL to change it without touching code
// (OpenAI retires models regularly: gpt-4 and gpt-3.5-turbo were shut down on 23 Oct 2026).
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";
