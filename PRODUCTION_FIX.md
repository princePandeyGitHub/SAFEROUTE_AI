# Production Build Fix - Tailwind CSS Issue

## Problem
The app was failing in production with this error:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

This occurred because Tailwind CSS v4 with `@tailwindcss/vite` plugin uses `lightningcss` which has platform-specific native bindings that don't work well in serverless environments like Vercel.

## Solution

### 1. Updated `frontend/vite.config.js`
- ✅ Removed `@tailwindcss/vite` plugin (causes lightningcss dependency issues)
- ✅ Added proper build optimization with code splitting
- ✅ Configured SSR settings for Leaflet compatibility

### 2. Updated `frontend/src/index.css`
- ✅ Removed `@import "tailwindcss"` 
- ✅ Added basic global CSS styles
- ✅ No longer dependent on Tailwind compilation

### 3. Cleaned up `package.json` files
- ✅ Removed `@tailwindcss/vite` from root package.json
- ✅ Removed `tailwindcss` from root package.json
- ✅ Frontend package.json already had correct dependencies

## What This Means
- ✅ App now uses **pure CSS** for styling (already in place via `JourneyPlanner.css` and `Map.css`)
- ✅ **No Tailwind compilation** needed in production
- ✅ **Smaller bundle size** without Tailwind overhead
- ✅ **Better production compatibility** - works on Vercel and other serverless platforms

## All Styles Are Already Implemented
Your app styling is completely done with custom CSS:
- `frontend/src/styles/JourneyPlanner.css` - Modal and button styles
- `frontend/src/styles/Map.css` - Journey info panel styles
- `frontend/src/index.css` - Global styles

## Next Steps for Deployment
1. Delete `node_modules` and `package-lock.json` 
2. Run `npm install` to install fresh dependencies
3. Deploy to Vercel or your hosting platform
4. The build should now succeed without lightningcss errors

## Testing Locally
```bash
cd frontend
npm install
npm run build  # Should build without errors
npm run dev    # Should run locally without issues
```

All styling remains intact and responsive! 🎉
