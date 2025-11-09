# Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a New Project** (or select existing):
   - Click on project dropdown at the top
   - Click "New Project"
   - Name it "KStore" or similar
   - Click "Create"

3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search for and enable these APIs:
     - **Places API** (for address autocomplete)
     - **Maps JavaScript API** (for map display)
     - **Geocoding API** (for address validation)

4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

5. **Restrict API Key** (Recommended for security):
   - Click on the API key you just created
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add: `http://localhost:3001/*` (for development)
     - Add your production domain when deploying
   - Under "API restrictions":
     - Select "Restrict key"
     - Check: Places API, Maps JavaScript API, Geocoding API
   - Click "Save"

## Step 2: Add API Key to Environment Variables

Add this line to your `KstoreFront/.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

**Important**: 
- Use `NEXT_PUBLIC_` prefix so it's accessible in the browser
- Never commit this file to Git (it's already in .gitignore)
- Replace `your-api-key-here` with your actual API key

## Step 3: Restart Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## Pricing Information

Google Maps Platform offers:
- **$200 free credit per month**
- Places Autocomplete: $2.83 per 1000 requests
- Most small projects stay within free tier

## Testing

Once set up, the address autocomplete will:
1. Show suggestions as you type in Address Line 1
2. Auto-fill city, state, postal code, and country
3. Work for addresses worldwide

## Troubleshooting

**"This page can't load Google Maps correctly"**
- Check if API key is correct in `.env.local`
- Verify Places API is enabled
- Check API key restrictions

**No suggestions appearing**
- Make sure you're typing a real address
- Check browser console for errors
- Verify API key has proper permissions
