# Screens

Static marketing captures of the **21 screens** in the Expo Snips catalog, plus one shot of the demo app's gallery screen.

| | |
|---|---|
| Resolution | 780 × 1688 px (390 × 844 CSS viewport @2x, iPhone-class portrait) |
| Mode | Light (`prefers-color-scheme: light`) |
| Options used | `--styling stylesheet --router expo-router --ui native --icons lucide --typescript` |
| Count | 22 PNGs (21 screens + `gallery.png`) |

These files are **committed artifacts** — they do not rebuild automatically. Regenerate them whenever the catalog templates change noticeably.

## How they were produced

1. A scratch Expo app (SDK 57, Expo Router, `src/app`) was created outside the generation flow.
2. Every screen was generated into it with the CLI:

   ```bash
   expo-snips add auth/login --styling stylesheet --router expo-router --ui native --icons lucide --typescript --no-install
   # ...repeated for all 21 screen recipes (the three ui/* recipes are shadcn-only primitives)
   ```

3. The generated `app/` routes were moved under `src/app/`, and the app was started for the web:

   ```bash
   npx expo install react-native-maps expo-notifications react-native-svg
   npm install lucide-react-native react-hook-form zod @hookform/resolvers
   npx expo start --web
   ```

4. Each route was loaded in **headless Microsoft Edge** (`puppeteer-core`, no browser download) at 390 × 844 @2x, `prefers-color-scheme: light`, `networkidle0` + 600 ms settle, then screenshotted.

### Notes

- `map/location` needs a web stand-in for `react-native-maps` (the package ships no web build). The demo app aliased it through `metro.config.js` to a small placeholder that still positions the real markers from the map region.
- Screens that fetch remote images (`content/article-reader`, `chat/conversations`, …) need network access while capturing; the large file sizes are the un-retouched results.
- The scratch app itself is not kept in the repository — these PNGs are the deliverable.

## Regenerating

Recreate the scratch app as described above, then run a capture loop equivalent to:

```js
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
await page.goto(`http://localhost:8082${route}`, { waitUntil: "networkidle0", timeout: 180_000 });
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${slug}.png`, type: "png" });
```

Routes: `/welcome`, `/onboarding/features`, `/permissions`, `/login`, `/register`, `/forgot-password`, `/otp-verification`, `/home`, `/notifications`, `/profile`, `/settings`, `/search`, `/products`, `/products/1`, `/article/1`, `/calendar`, `/chat`, `/dashboard`, `/map`, `/empty`, `/error`, `/screens`.

## Reuse (landing pages, docs, social)

The screens render fine against any background — they are plain portrait PNGs with no device frame.

**Markdown** (three per row):

```html
<table>
  <tr>
    <td align="center" width="33%"><img src="docs/screenshots/auth-login.png" alt="Login screen" width="100%" /></td>
    <td align="center" width="33%"><img src="docs/screenshots/auth-register.png" alt="Register screen" width="100%" /></td>
    <td align="center" width="33%"><img src="docs/screenshots/app-home.png" alt="Home dashboard screen" width="100%" /></td>
  </tr>
</table>
```

**HTML/React** (e.g. a landing page grid):

```html
<img src="/docs/screenshots/auth-login.png" alt="Login screen" style="border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,.12)" />
```

Paths in the snippets above assume the repository root; adjust when embedding elsewhere.
