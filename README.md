# ft_transcendence

## Prerequisites

Install **Node.js** (includes npm and npx automatically):
- Download from: https://nodejs.org/
- Install Node.js v24.12.0 LTS or higher

**Note:** `npx` comes with Node.js/npm, no separate installation needed.

### 1. Install Dependencies

```bash
cd frontEnd
npm install
```

**Why:** This installs TailwindCSS and other required packages from `package.json`. These packages are needed to compile the CSS.

### 2. Compile TailwindCSS

```bash
# One-time build
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css

# OR watch mode (auto-recompiles on changes)
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

### 3. Run Frontend

```bash
# Start web server (in frontEnd directory)
python3 -m http.server 8000

# Open in browser
http://localhost:8000/src/index.html
```
