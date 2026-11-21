# Mobile Contributor & Symmetry Guidelines (`chat-roulette`)

Welcome to **Chat Roulette** (Expo SDK 58 + React Native 0.88 + React 19 + Strict TypeScript 6). All contributors must adhere to the **Clean Architecture & Symmetry Standard**.

---

## Core Engineering Rules

1. **Zero Workarounds (`ZERO-WORKAROUND`):**
   - **NO** `// eslint-disable`, **NO** `// @ts-ignore`, **NO** `// @ts-nocheck`.
2. **File Length Ceiling (`SYM-FILE-05`):**
   - Every production file in `src/presentation/` must stay $\le 300$ LOC.
3. **Clean Architecture Boundaries (`SYM-ARCH-01..04`):**
   - **Domain (`src/domain/`):** Pure TypeScript with zero imports from Data, Infrastructure, Presentation, or DI.
   - **Presentation (`src/presentation/`):** Never imports `src/data/` directly. Consumes Domain use cases and services strictly via DI (`useUseCases()`).
   - **Data (`src/data/`):** Implements Domain repository and socket contracts, isolates transport/MMKV/simulation details, and never imports Presentation.
4. **Component & Styling Conventions (`SYM-COMP-01`, `SYM-ONE-04`, `SYM-ONE-05`):**
   - Zero `React.FC` / `FC<Props>`. All props interfaces use `readonly` fields.
   - Zero `TouchableOpacity`. Always use `Pressable` or `AnimatedPressable`.
   - Zero hardcoded hex colors inside components — always read tokens from `useUI()`.
   - Zero inline code comments in `src/` (enforced by `scripts/check-symmetry.mjs`).

---

## Single-Command Verification

```bash
npm run verify
npm run secret:scan
```
