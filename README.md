# nergy.ai

**Understand the product. Start the writing.**

nergy.ai is an interactive Technical Writing Copilot concept. It turns public product materials for complex AI-agent products into an easy-to-understand logic map, separates verified facts from assumptions, and suggests high-value documentation starting points.

The included demo analyzes Delight.ai using official public materials current as of July 14, 2026.

## Product principles

- Explain the product before generating documentation.
- Keep verified public documentation separate from details that require product or engineering confirmation.
- Suggest writing opportunities; do not replace a Technical Writer's judgment.
- Make agent logic understandable to developers, operators, marketers, and designers.

## Demo flow

1. Enter the Delight.ai URL and run the staged analysis.
2. Explore the interactive product logic map.
3. Select a logic node to read a plain-language explanation and example.
4. Filter documentation suggestions by audience.
5. Add suggestions to a Writing Plan and generate a first-pass outline.
6. Inspect the official sources and evidence labels behind the analysis.

## Evidence labels

- `DOCS`: Supported by public documentation.
- `SPEC`: Supported by a provided internal specification.
- `CONFIRM`: Requires confirmation from Product or Engineering.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Stack

React, TypeScript, Vite, Tailwind CSS, and Lucide icons.

## Accuracy note

The Delight.ai diagram is a public-source understanding model, not a claim about the company's private service boundaries, data schemas, or exact runtime sequence. Those details are intentionally marked for confirmation.
