---
name: santa-ai-generator
description: Guidelines for integrating zero-cost Santa AI gift suggestions and festive poems into Secret Santa draws.
---

# Santa AI Generator Skill

## 1. Capabilities
- **Festive Santa Rhyme Generator**: Generates a custom 4-line Christmas poem revealing the match to the participant.
- **Gift Suggestion Engine**: Given recipient's interests/wish list and the session budget, suggests 3 creative, budget-friendly gift ideas.

## 2. Zero-Cost Implementation
- **Primary**: Google Generative AI (`@google/genai` or `@google/generative-ai`) using `gemini-1.5-flash` or `gemini-2.0-flash` (free tier rate limits: 15 RPM, millions of tokens free monthly).
- **Graceful Fallback**: If no `GEMINI_API_KEY` is provided, use an internal deterministic holiday generator so the application never crashes and works 100% offline.
- **Prompt Safety**: Never leak other participant names, secret pairings, or private contact details to external prompts.
