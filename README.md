# Threadlify

Reddit scanner that finds relevant threads for your products to help you evaluate your PMF.

🏷️ **Status:** Archived \
🤖 **Vibe Coded:** Partially *(Frontend was mostly AI-generated but all server and business logic was implemented by me)*

---

## What it does

- One-step onboarding that automatically analyzes and identifies your product based on your landing page.
- Daily scraping of relevant subreddits to catch posts your product might be relevant in.
- Ability to adjust the filtering criteria using natural language to explain why surfaced posts are not relevant.

## Demo / Screenshot

<!-- Add if you can. If the project can't run anymore, just leave a note: -->
<!-- ⚠️ Can't currently run this to generate a fresh screenshot — README text stands in for now. -->

https://github.com/user-attachments/assets/9ca2455e-9da7-40fd-8132-5c38bee9cb52

## Tech Stack

Typescript · Next.js · Express · Firebase · Redis

## Notes

- Learned a lot of scraping methods and error handling as scraping is not reliable as I wish it can be.
- Implemented a queue system using redis (BullMQ) to handle job processing to handle resumability when updates or crashes happen.
- This was deployed on a DigitalOcean droplet so I had to ensure that when I update the app, I had to make sure no jobs are processing or wait for the current one to stop.
- This was genuinely a fun product to implement as it had a lot of moving parts.
- A good addition might be to host the LLM locally so that the cost was negligible (although the cost was relatively small since we had a lot of aggressive optimizations to prevent unnecessary token usage such as aggressive filtering using hueristics and/or smaller llms to handle simple tasks).
