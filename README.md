<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/banner-light.svg" />
  <img width="100%" src="./assets/banner-dark.svg" alt="Chat Roulette — Midnight Pulse Real-Time Rooms &amp; Instant Roulette Showcase" />
</picture>

<p align="center">
  <b>Production-grade Expo SDK 58 (React Native 0.88, React 19, New Architecture) real-time messaging &amp; topic-matched roulette showcase built with Strict TypeScript 6, Clean Architecture, AES-256 MMKV offline outbound queueing, Reanimated 4 motion, and 100% EN/AR RTL parity.</b>
</p>

<p align="center">
  <a href="https://github.com/muhammedelnady/chat-roulette/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/muhammedelnady/chat-roulette/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI%20GATE&labelColor=0D1117" alt="CI Status" /></a>&nbsp;
  <img src="https://img.shields.io/badge/EXPO_SDK-58-A855F7?style=for-the-badge&logo=expo&logoColor=white&labelColor=0D1117" alt="Expo SDK 58" />&nbsp;
  <img src="https://img.shields.io/badge/REACT_NATIVE-0.88_%2B_REACT_19-38BDF8?style=for-the-badge&logo=react&logoColor=white&labelColor=0D1117" alt="React Native 0.88" />&nbsp;
  <img src="https://img.shields.io/badge/OUTBOX-MMKV_AES--256-10B981?style=for-the-badge&labelColor=0D1117" alt="MMKV Outbox" />&nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-F59E0B?style=for-the-badge&labelColor=0D1117" alt="MIT License" /></a>
</p>

</div>

---

## 1. Visual Showcase — Midnight Pulse UI, Roulette Radar & Arabic RTL

<table width="100%">
  <thead>
    <tr>
      <th width="25%" align="center">Pulse Rooms Hub</th>
      <th width="25%" align="center">Voice Notes &amp; Reactions</th>
      <th width="25%" align="center">Roulette Radar Match</th>
      <th width="25%" align="center">Live Arabic RTL Mirroring</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="assets/screenshots/rooms-dark.png" alt="Pulse Rooms Dark Theme" width="100%" /></td>
      <td align="center"><img src="assets/screenshots/chat-room.png" alt="Interactive Chat Room with Audio Waveform" width="100%" /></td>
      <td align="center"><img src="assets/screenshots/roulette-radar.png" alt="Topic-Filtered Roulette Radar Match" width="100%" /></td>
      <td align="center"><img src="assets/screenshots/rooms-arabic-rtl.png" alt="Arabic RTL Pulse Rooms" width="100%" /></td>
    </tr>
  </tbody>
</table>

---

## 2. Reviewer's Guide (5-Minute Tour)

Run every engineering gate (`prettier`, `tsc --noEmit`, ESLint Clean Architecture layer boundaries, EN/AR i18n parity, DI & Result checks, Symmetry rules, and Jest coverage suite) with one command:

```bash
npm run verify
```

| Concern                                  | Implementation Files                                                                                                                                                                    | Verification / Tests                                                                                                                               |
| :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clean Architecture & Result Pattern**  | `src/domain/Result.ts`, `src/domain/entities/Chat.ts`, `src/domain/usecases/chat/`                                                                                                      | `src/domain/Result.test.ts`, `src/domain/usecases/chat/ChatUseCases.test.ts`, `scripts/verify-architecture.sh`, `scripts/verify-result-pattern.sh` |
| **Dependency Injection Root**            | `src/di/container.ts`, `src/di/UseCasesProvider.tsx`, `src/di/modules/chatModule.ts`, `src/di/bootstrap.ts`                                                                             | `scripts/verify-di.sh`, `eslint.config.js` (`import/no-restricted-paths`)                                                                          |
| **Offline-First MMKV Outbox**            | `src/data/socket/ChatOutboundQueue.ts`, `src/data/socket/ChatSocketService.ts`, `src/infrastructure/storage/mmkvStorage.ts`                                                             | `src/data/socket/ChatOutboundQueue.test.ts`, `src/data/simulated/SimulatedChatEngine.test.ts`                                                      |
| **Dual-Mode Real-Time Engine**           | `src/data/simulated/SimulatedChatEngine.ts`, `src/data/simulated/SimulatedChatRepositories.ts`, `src/data/repositories/ChatRepositoryImpl.ts`                                           | `src/data/simulated/SimulatedChatEngine.test.ts`, `src/data/mappers/ChatMapper.test.ts`                                                            |
| **Midnight Pulse UI & Showcase Screens** | `src/presentation/theme/colors.ts`, `src/presentation/features/chat/screens/rooms/`, `src/presentation/features/chat/screens/roulette/`, `src/presentation/features/chat/screens/chat/` | `ChatRoomsContent.test.tsx`, `ChatRouletteContent.test.tsx`, `ChatContent.test.tsx`, `AudioMessageBubble.test.tsx`, `ChatMessageBubble.test.tsx`   |
| **Bilingual EN / AR RTL Mirroring**      | `src/infrastructure/i18n/translate.ts`, `src/infrastructure/i18n/langs/en.json`, `src/infrastructure/i18n/langs/ar.json`                                                                | `src/infrastructure/i18n/translate.test.ts`, `scripts/validate-i18n.js`                                                                            |
| **Argent E2E Suite (iOS Simulator)**     | `.argent/e2e/` (`rooms`, `controls`, `roulette`, `chat`, `offline`), `.argent/README.md`, `.github/workflows/e2e-ios.yml`                                                               | `npm run e2e:ios` (12 deterministic YAML tests)                                                                                                    |
| **Symmetry & Security Gates**            | `scripts/check-symmetry.mjs`, `.gitleaks.toml`, `scripts/secret-scan.sh`                                                                                                                | `npm run check:symmetry`, `npm run secret:scan`, `.github/workflows/ci.yml`                                                                        |

---

## 3. Overview & Showcase Highlights

### Built for Instant Demoing (Zero Backend Required)

Recruiters and engineering reviewers can boot the app immediately with `npx expo start` in **Simulated Real-Time Mode** (`EXPO_PUBLIC_CHAT_MODE=simulated`, default) — or flip to a live Socket.IO + REST backend via `.env`.

### Interactive "Midnight Pulse" Controls Built Into the App

1. **Network Offline Simulation Toggle (`Online` / `Offline Sim`):**
   - Flip offline right inside the **Pulse Rooms** header or **Chat Room** header.
   - Outbound messages transition to `PENDING`, persist inside **`ChatOutboundQueue` (MMKV)**, and display a live queued badge.
   - Flipping back to `Online` automatically triggers connectivity observers (`ConnectivityAdapter` -> `SimulatedChatSocketService.drainBuffer()`), flushing queued messages cleanly in FIFO order (`PENDING` -> `DELIVERED` -> `READ`) and receiving simulated live typing & partner replies.
2. **Chat Roulette Radar (`app/rooms/roulette.tsx`):**
   - Topic-filtered instant matching (`React Native`, `System Design`, `AI Agents`, `UI/UX Motion`, `Founders`) powered by Reanimated 4 pulsing radar rings and haptic feedback.
3. **Rich Interactive Chat Room (`app/rooms/[conversationId].tsx`):**
   - **Audio Voice Notes:** Interactive waveform scrubbing, play/pause, and `1x / 1.5x / 2x` speed toggle (`AudioMessageBubble`) plus live microphone recording (`ExpoAudioRecordingService`).
   - **Emoji Reactions:** Long-press any message to open quick reactions (`⚡`, `🔥`, `🚀`, `💜`) or tap existing reaction pills to toggle counts.
   - **Image Attachments & Lightbox:** Multi-image staging tray with upload spinner and full-screen zoomable lightbox.
   - **Live EN / AR RTL & Dark / Light Theme Switching:** Instant one-tap mirroring and theme token re-skinning without reloading.

---

## 4. Clean Architecture & Data Flow

```mermaid
flowchart LR
    UI["Presentation (Screens, ViewModels, Stores)"] -->|"useUseCases() via DI"| UC["Domain (UseCases, Entities, Interfaces, Result)"]
    DI["DI Composition Root (src/di/)"] --> UI
    DI --> DATA["Data (Repositories, Mappers, Socket, Simulated Engine)"]
    DATA -->|"implements"| UC
    INFRA["Infrastructure (i18n, Audio, Haptics, Logger, MMKV)"] --> DI
```

### Offline Outbox Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OptimisticPending: User sends message (clientId UUID)
    OptimisticPending --> QueuedInMMKV: Connectivity offline
    OptimisticPending --> EmittedToTransport: Connectivity online
    QueuedInMMKV --> EmittedToTransport: Connectivity restored -> drainBuffer()
    EmittedToTransport --> Delivered: Ack received (message:delivered)
    Delivered --> Read: Partner read receipt (message:read)
    EmittedToTransport --> Failed: Max 5 retries exceeded -> Tap to retry
```

---

## 5. Security & Privacy Posture

- **Zero Secrets Committed:** `.env` files, native keystores, Firebase plists, and build artifacts are strictly gitignored.
- **Automated Secret Scanning:** `.gitleaks.toml` and `.github/workflows/ci.yml` enforce zero credential leaks across both working directory and full git history (`bash scripts/secret-scan.sh`).
- **Secure Storage Separation:** Auth tokens and the MMKV master key use `expo-secure-store` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`), while high-throughput caches and outbound queues use AES-256 encrypted MMKV (`react-native-mmkv`).
- **Redacted Logging:** `src/infrastructure/logging/logger.ts` automatically redacts sensitive keys (`token`, `authorization`, `secret`, `apiKey`, `cookie`) and Bearer strings before printing.

---

## 6. Getting Started

```bash
# 1. Clone & install dependencies
git clone https://github.com/muhammedelnady/chat-roulette.git
cd chat-roulette
npm install

# 2. Run the full verification & test suite
npm run verify

# 3. Start Expo development server (Simulated Real-Time Mode by default)
npx expo start

# 4. Run Argent iOS Simulator E2E suite (see .argent/README.md for Release build setup)
npm run e2e:ios
```

Optional: copy `.env.example` to `.env` if connecting to a custom Socket.IO / REST endpoint (`EXPO_PUBLIC_CHAT_MODE=socket`).

---

## 7. License

Distributed under the [MIT License](LICENSE). Copyright (c) 2026 Mohamed Elnady.
