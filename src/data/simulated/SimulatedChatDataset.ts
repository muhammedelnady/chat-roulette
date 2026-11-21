/** @format */
/**
 * Data Simulated Chat Dataset
 */

import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";

export interface RoulettePersona {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly location: string;
  readonly topic: string;
  readonly icebreaker: string;
  readonly opener: string;
}

const now = Date.now();
const minsAgo = (minutes: number): string => new Date(now - minutes * 60_000).toISOString();

export const ROULETTE_PERSONAS: readonly RoulettePersona[] = [
  {
    id: "persona-sarah",
    name: "Sarah Chen",
    role: "Staff Mobile Architect",
    location: "San Francisco",
    topic: "React Native",
    icebreaker: "What is one React Native animation or architecture trade-off you enjoyed solving?",
    opener:
      "Hey! Just matched on React Native. Curious how you structure offline queues and New Architecture animations in production!",
  },
  {
    id: "persona-tariq",
    name: "Tariq Al-Mansoor",
    role: "Principal AI Systems Engineer",
    location: "Dubai",
    topic: "AI Agents",
    icebreaker: "How do you keep multi-agent tool calls deterministic under latency pressure?",
    opener:
      "Salaam! Matched on AI Agents. Have you tried streaming structured events over WebSockets into a mobile client?",
  },
  {
    id: "persona-elena",
    name: "Elena Rostova",
    role: "Design Systems Lead",
    location: "Berlin",
    topic: "UI/UX Motion",
    icebreaker: "Spring physics or cubic-bezier curves — which feels better for gesture sheets?",
    opener:
      "Hi there! Love the Midnight Pulse dark tokens here. What spring damping values feel crispest on 120Hz displays?",
  },
  {
    id: "persona-marcus",
    name: "Marcus Vance",
    role: "Distributed Systems Staff",
    location: "London",
    topic: "System Design",
    icebreaker:
      "At-least-once delivery vs idempotency keys — how do you prevent duplicate messages?",
    opener:
      "Hey! Just spun into System Design. Notice how clientId deduplication + MMKV outbox prevents duplicate sends on flaky 4G.",
  },
  {
    id: "persona-leila",
    name: "Leila Haddad",
    role: "Technical Founder",
    location: "Cairo",
    topic: "Founders",
    icebreaker: "What is the smallest MVP feature that earned your highest user retention?",
    opener:
      "Hey builder! Matched on Founders. Building real-time mobile products with clean architecture from day one pays off massively.",
  },
];

export const INITIAL_SIMULATED_CONVERSATIONS: readonly ConversationEntity[] = [
  {
    id: "room-rn-architecture",
    scope: "ROOM",
    handledBy: "COMMUNITY",
    status: "OPEN",
    subject: "React Native & Expo 58 Architecture",
    topic: "Clean Architecture · DI · Reanimated 4",
    category: "TECH",
    participantCount: 42,
    unreadCount: 2,
    isRouletteMatch: false,
    icebreaker: "Share your favorite RN New Architecture win or performance profiling trick!",
    createdAt: minsAgo(180),
    updatedAt: minsAgo(2),
    participants: [
      {
        id: "p-rn-host",
        userId: "bot-pulse-rn",
        role: "SUPPORT_AGENT",
        user: { id: "bot-pulse-rn", fullName: "React Native Lounge", image: null },
      },
    ],
  },
  {
    id: "room-ai-agents",
    scope: "ROOM",
    handledBy: "COMMUNITY",
    status: "OPEN",
    subject: "AI Agents & Realtime Streams",
    topic: "Tool Calling · MCP · Streaming UX",
    category: "TRENDING",
    participantCount: 68,
    unreadCount: 1,
    isRouletteMatch: false,
    icebreaker: "What makes an agentic UI feel instant instead of sluggish?",
    createdAt: minsAgo(240),
    updatedAt: minsAgo(5),
    participants: [
      {
        id: "p-ai-host",
        userId: "bot-pulse-ai",
        role: "SUPPORT_AGENT",
        user: { id: "bot-pulse-ai", fullName: "AI Agents & Builders", image: null },
      },
    ],
  },
  {
    id: "room-ui-motion",
    scope: "ROOM",
    handledBy: "COMMUNITY",
    status: "OPEN",
    subject: "Midnight UI & Motion Craft",
    topic: "Tokens · Glassmorphism · RTL Parity",
    category: "DESIGN",
    participantCount: 31,
    unreadCount: 0,
    isRouletteMatch: false,
    icebreaker: "Toggle AR / RTL from the control deck and inspect how layouts mirror cleanly!",
    createdAt: minsAgo(320),
    updatedAt: minsAgo(14),
    participants: [
      {
        id: "p-ui-host",
        userId: "bot-pulse-ui",
        role: "SUPPORT_AGENT",
        user: { id: "bot-pulse-ui", fullName: "Motion & Design Lab", image: null },
      },
    ],
  },
  {
    id: "room-founders",
    scope: "ROOM",
    handledBy: "COMMUNITY",
    status: "OPEN",
    subject: "Indie Founders & Shippers",
    topic: "Shipping Velocity · Security · CI Gates",
    category: "FOUNDERS",
    participantCount: 27,
    unreadCount: 0,
    isRouletteMatch: false,
    icebreaker: "What CI check saved your team from a Friday outage?",
    createdAt: minsAgo(400),
    updatedAt: minsAgo(28),
    participants: [
      {
        id: "p-founders-host",
        userId: "bot-pulse-founders",
        role: "SUPPORT_AGENT",
        user: { id: "bot-pulse-founders", fullName: "Founders Lounge", image: null },
      },
    ],
  },
  {
    id: "roulette-sarah",
    scope: "ROULETTE",
    handledBy: "PEER",
    status: "OPEN",
    subject: "Sarah Chen",
    topic: "React Native",
    category: "ROULETTE",
    participantCount: 2,
    unreadCount: 1,
    isRouletteMatch: true,
    partnerRole: "Staff Mobile Architect",
    partnerLocation: "San Francisco",
    icebreaker: "What is one React Native animation or architecture trade-off you enjoyed solving?",
    createdAt: minsAgo(60),
    updatedAt: minsAgo(1),
    participants: [
      {
        id: "p-sarah",
        userId: "persona-sarah",
        role: "SUPPORT_AGENT",
        user: { id: "persona-sarah", fullName: "Sarah Chen", image: null },
      },
    ],
  },
];

export const INITIAL_SIMULATED_MESSAGES: Record<string, readonly MessageEntity[]> = {
  "room-rn-architecture": [
    {
      id: "msg-rn-1",
      clientId: "msg-rn-1",
      conversationId: "room-rn-architecture",
      senderId: "bot-pulse-rn",
      senderType: "BOT",
      senderName: "Pulse Host",
      content:
        "Welcome to React Native & Expo 58 Lounge! Try toggling Offline Sim in Showcase Controls, sending messages, and watching the MMKV Outbox flush on reconnect.",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(18),
      attachments: [],
      reactions: { "⚡": ["you", "sarah"], "🚀": ["you"] },
      metadata: {
        isBotGreeting: true,
        options: [
          {
            id: "arch",
            labelEn: "Clean Architecture tour",
            labelAr: "جولة المعمارية النظيفة",
            query: "Walk me through the Clean Architecture",
          },
          {
            id: "outbox",
            labelEn: "Test MMKV outbox",
            labelAr: "اختبار طابور MMKV",
            query: "How does the MMKV offline outbox work?",
          },
        ],
      },
    },
    {
      id: "msg-rn-2",
      clientId: "msg-rn-2",
      conversationId: "room-rn-architecture",
      senderId: "persona-marcus",
      senderType: "SUPPORT_AGENT",
      senderName: "Marcus Vance",
      content: "Here is a quick 6s voice breakdown on why strict ESLint boundary gates matter:",
      contentType: "AUDIO",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(6),
      attachments: [],
      metadata: {
        audioUrl: "simulated://voice-architecture-note.m4a",
        duration: 6,
        waveform: [0.35, 0.72, 0.55, 0.9, 0.65, 0.42, 0.85, 0.95, 0.6, 0.48, 0.78, 0.5, 0.3],
      },
      reactions: { "🔥": ["you", "elena"] },
    },
    {
      id: "msg-rn-3",
      clientId: "msg-rn-3",
      conversationId: "room-rn-architecture",
      senderId: "persona-sarah",
      senderType: "SUPPORT_AGENT",
      senderName: "Sarah Chen",
      content:
        "Domain has zero outward dependencies, Presentation only speaks to UseCases via DI, and every ViewModel is <= 300 LOC.",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(2),
      attachments: [],
      reactions: { "💜": ["you"] },
    },
  ],
  "room-ai-agents": [
    {
      id: "msg-ai-1",
      clientId: "msg-ai-1",
      conversationId: "room-ai-agents",
      senderId: "persona-tariq",
      senderType: "SUPPORT_AGENT",
      senderName: "Tariq Al-Mansoor",
      content:
        "Optimistic message IDs (`clientId`) paired with idempotent server acks make streaming agents feel instantaneous even on 3G.",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(5),
      attachments: [],
      reactions: { "⚡": ["you"] },
    },
  ],
  "room-ui-motion": [
    {
      id: "msg-ui-1",
      clientId: "msg-ui-1",
      conversationId: "room-ui-motion",
      senderId: "persona-elena",
      senderType: "SUPPORT_AGENT",
      senderName: "Elena Rostova",
      content:
        "Zero inline styles, zero hardcoded hex colors in components, and full English/Arabic RTL mirroring across every screen.",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(14),
      attachments: [],
      reactions: { "🔥": ["you"] },
    },
  ],
  "room-founders": [
    {
      id: "msg-fnd-1",
      clientId: "msg-fnd-1",
      conversationId: "room-founders",
      senderId: "persona-leila",
      senderType: "SUPPORT_AGENT",
      senderName: "Leila Haddad",
      content:
        "Automated gitleaks secret scanning + symmetry checks in CI catch regressions before code ever leaves your machine.",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(28),
      attachments: [],
    },
  ],
  "roulette-sarah": [
    {
      id: "msg-sarah-1",
      clientId: "msg-sarah-1",
      conversationId: "roulette-sarah",
      senderId: "persona-sarah",
      senderType: "SUPPORT_AGENT",
      senderName: "Sarah Chen",
      content:
        "Hey! Glad Chat Roulette paired us. Try sending a message, a voice note, or toggling Offline Sim to watch the queued delivery lifecycle!",
      contentType: "text",
      status: "READ",
      isEdited: false,
      createdAt: minsAgo(1),
      attachments: [],
      reactions: { "🚀": ["you"] },
    },
  ],
};
