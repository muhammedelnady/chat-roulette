# Argent E2E Test Suite (`chat-roulette`)

Deterministic, model-free iOS Simulator E2E regression tests powered by [`@swmansion/argent`](https://github.com/software-mansion/argent).

## Running Locally

1. Prebuild and build a self-contained Release simulator app (avoids Metro dependency and dev LogBox overlays):

```bash
CI=1 EXPO_NO_TELEMETRY=1 npx expo prebuild --platform ios --clean
SIM_UDID=$(xcrun simctl list devices available -j | node -e 'const d = JSON.parse(require("fs").readFileSync(0, "utf8")); const ios = Object.entries(d.devices).filter(([k]) => k.includes("iOS")).flatMap(([, v]) => v).find((x) => x.isAvailable && x.name.includes("iPhone")); if (!ios) process.exit(1); console.log(ios.udid);')
npx argent run boot-device --udid "$SIM_UDID" --force
xcodebuild -workspace ios/ChatRoulette.xcworkspace -scheme ChatRoulette -configuration Release -sdk iphonesimulator -destination "id=$SIM_UDID" -derivedDataPath ios/build
xcrun simctl install "$SIM_UDID" ios/build/Build/Products/Release-iphonesimulator/ChatRoulette.app
```

2. Run the entire suite:

```bash
npm run e2e:ios
```

Or target a specific simulator UDID / save failure screenshots:

```bash
npx argent e2e run .argent/e2e --recursive --platform ios --device "$SIM_UDID" --output e2e-artifacts
```

## Suite Coverage (5 Areas, 12 Tests)

| Area       | Tests | Files                                                                                                                                                                                   |
| :--------- | ----: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rooms`    |     2 | `rooms/rooms-search-and-clear.yaml`, `rooms/rooms-category-filters.yaml`                                                                                                                |
| `controls` |     2 | `controls/theme-toggle.yaml`, `controls/language-rtl-toggle.yaml`                                                                                                                       |
| `roulette` |     2 | `roulette/roulette-topic-match-and-enter.yaml`, `roulette/roulette-spin-again-and-back.yaml`                                                                                            |
| `chat`     |     5 | `chat/chat-send-and-simulated-reply.yaml`, `chat/chat-faq-icebreaker-chip.yaml`, `chat/chat-reactions.yaml`, `chat/chat-audio-voice-note.yaml`, `chat/chat-context-card-spin-next.yaml` |
| `offline`  |     1 | `offline/offline-queue-and-flush.yaml`                                                                                                                                                  |

## Authoring Rules

- **`testID`-first selectors:** Tap and assert by `id` (or narrow `text` when dynamic content is under test). Zero raw coordinate taps.
- **No fixed sleeps or idle spam:** Wait for the specific destination/replacement element (`await: { visible: ... }` / `await: { hidden: ... }`).
- **Keyboard-layout independence:** Use `tool: fill` with `delayMs: 500` (matching Argent's internal `TYPE_FOCUS_SETTLE_MS`) when populating text fields so tests do not depend on the host macOS keyboard layout (e.g., Arabic vs US QWERTY).
- **Order independence:** Restore MMKV-persisted settings (dark `Midnight` theme, `EN / LTR` language, `Online` connectivity with `0` queued outbound messages) before ending any test that mutates them.
- **Two-pass proof:** Recycle simulator services (`npx argent run stop-all-simulator-servers --devices <UDID>`) and verify two consecutive full passes with unchanged YAML after any test or selector edit.

## Reusable Autonomous Agent Prompt

Adapted from Błażej Kustra's autonomous Argent E2E migration/authoring pattern:

```text
Maintain or extend this repo's Argent E2E tests and open one pull request. Work on your own and don't stop to ask me anything: decide, note the decision in the PR, and keep going.

My setup:
- E2E folder: .argent/e2e
- App id: com.muhammedelnady.chatroulette
- Simulator you may use: <udid or name>. Leave every other device alone.
- Runtime mode: EXPO_PUBLIC_CHAT_MODE=simulated (no secrets required)
- Data you must never touch: none

Rules:
1. Work in a new git worktree and branch. Leave my checkout alone.
2. Load the argent-create-e2e and argent-qa-e2e skills first. Read .argent/README.md and existing flows before changing anything.
3. The app on the current branch is the truth. Keep presentation files <= 300 LOC with zero inline comments (AGENTS.md).
4. Prefix E2E-created messages with "E2E " and restore MMKV-persisted theme, language, and offline queue state at the end of every test.
5. Never put secrets in YAML or PRs (use {{secret:NAME}} if needed).
6. Tap by id or text. Add a testID rather than keeping screen coordinates. Keep coordinates only as a last resort and list them in the PR.
7. Wait for the element you need next. Don't add fixed sleeps or an idle wait after every step.
8. A test is done when it passes twice in a row with unchanged YAML after recycling simulator services. Never weaken a test to get green; if it fails because of the app, save evidence and fix or report the bug.
9. After about 5 attempts on a stubborn test, document it and move on.

In the PR: pass counts and timings per area, failing tests and why, app bugs you found, and any coordinate selectors kept.
```
