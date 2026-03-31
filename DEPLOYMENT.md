# Deployment Guide for GitHub Pages

## Quick Start

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/HROS/', // Change to your repository name
  plugins: [react()],
})
```

2. Deploy:
```bash
npm run deploy
```

## Manual Deployment Steps

1. Build the project:
```bash
npm run build
```

2. Install gh-pages (if not installed):
```bash
npm install --save-dev gh-pages
```

3. Deploy:
```bash
npx gh-pages -d dist
```

## GitHub Setup

1. Push your code to GitHub
2. Go to Settings → Pages
3. Set Source to: Deploy from a branch
4. Select: gh-pages branch
5. Click Save
6. Your site will be available at: `https://yourusername.github.io/HROS`

## Troubleshooting

- Blank page? Check the `base` path in `vite.config.js`
- Assets not loading? Verify the base URL matches your GitHub Pages URL
- Updates not showing? Clear browser cache and hard refresh (Ctrl+F5)

## Environment Variables (if needed)

Create `.env` file:
```
VITE_API_URL=https://your-api-url.com
```

Then in your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```
