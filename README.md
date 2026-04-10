# SplitClean

Split expenses. Not hairs.

A free Splitwise alternative with all 4 split methods (equal, exact, percent, itemized) — no subscription, no account required, works 100% offline.

## Quick Start

```bash
npm install
npx expo start
```

## CI/CD Pipeline

Zero local builds. Push to GitHub, test on your phone.

### Architecture

```
Push to main
    │
    ├─ Quality gates (TypeScript + tests)
    │
    ├─ Native deps changed? ──YES──► EAS Build (full APK/IPA, ~15 min)
    │                                    │
    │                                    └──► Download from EAS dashboard
    │
    └─ JS-only change? ───────YES──► EAS Update (OTA push, ~30 sec)
                                         │
                                         └──► App updates automatically
```

### Setup (One-Time)

1. **Create Expo account** at [expo.dev](https://expo.dev)

2. **Link project:**
   ```bash
   npm install -g eas-cli
   eas login
   eas init
   ```
   This gives you a project ID. Update `app.json`:
   - Replace `YOUR_PROJECT_ID` in both `updates.url` and `extra.eas.projectId`
   - Replace `YOUR_EXPO_USERNAME` with your Expo username

3. **Set GitHub Secret:**
   - Go to your repo → Settings → Secrets → Actions
   - Add `EXPO_TOKEN`: get it from [expo.dev/accounts/.../settings/access-tokens](https://expo.dev/settings/access-tokens)

4. **First build** (creates signing credentials):
   ```bash
   eas build --platform all --profile preview
   ```
   Or push a commit with message `trigger-build` to run via CI.

5. **Register iOS devices** (for ad-hoc testing):
   ```bash
   eas device:create
   ```
   Follow the URL to register your device's UDID, then rebuild.

### Workflow Triggers

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `preview.yml` | Push to `main` | Auto-detects: OTA update for JS changes, full build for native changes |
| `update.yml` | Manual dispatch | Push OTA update to any branch (preview/production) |
| `build-ios.yml` | Manual dispatch | On-demand iOS build with any profile |

### EAS Build Profiles

| Profile | Distribution | Android | iOS | Use case |
|---------|-------------|---------|-----|----------|
| `development` | Internal | Dev client APK | Dev client IPA | Development with hot reload |
| `preview` | Internal | Direct-install APK | Ad-hoc IPA | Testing on real devices |
| `production` | Store | AAB | App Store IPA | Store submission |

## Testing Builds

### Android (easiest)

1. Push code to `main` (or trigger manual build)
2. Go to [expo.dev](https://expo.dev) → your project → Builds
3. Find the latest `preview` Android build
4. Tap **Install** → download the APK directly to your phone
5. Open the APK to install (enable "Install from unknown sources" if prompted)

### iOS (requires device registration)

1. Register your device first:
   ```bash
   eas device:create
   ```
   This generates a URL — open it on your iPhone to install a profile that registers your device UDID.

2. After registering, rebuild:
   ```bash
   eas build --platform ios --profile preview
   ```

3. Go to [expo.dev](https://expo.dev) → Builds → tap **Install** on the iOS build
4. It will install via an OTA link on your registered device

### OTA Updates (instant, no reinstall)

Once you have a build installed, JS-only changes are pushed automatically:

1. Edit code and push to `main`
2. CI detects it's a JS-only change → runs `eas update`
3. Next time you open the app, it downloads the update automatically
4. No reinstall needed — the app updates itself in seconds

### Development Builds (with Expo Dev Client)

For a full development experience with hot reload:

1. Build a development client:
   ```bash
   eas build --platform android --profile development
   ```
2. Install the dev client APK/IPA on your device
3. Run `npx expo start --dev-client`
4. Scan the QR code in the terminal with your dev client app

## GitHub Secrets Required

| Secret | Where to get it | Required? |
|--------|----------------|-----------|
| `EXPO_TOKEN` | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) | Yes |

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run lint` | Run Expo linter |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests |
| `npm run build:preview` | Build preview APK + IPA |
| `npm run build:production` | Build for store submission |
| `npm run update:preview` | Push OTA update to preview channel |

## Tech Stack

- **Framework:** React Native + Expo SDK 54
- **State:** Zustand
- **Storage:** expo-sqlite (offline-first)
- **Navigation:** expo-router (file-based)
- **Animation:** react-native-reanimated
- **CI/CD:** EAS Build + EAS Update + GitHub Actions
