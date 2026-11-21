/** @format */

import { io } from "socket.io-client";

import { http } from "@/src/data/api";
import { extractEnvelopeEntity } from "@/src/data/api/envelope";
import {
  getStorageSync,
  initStorage,
  isUsingFallbackStorage,
  primeFallbackStorage,
} from "@/src/data/cache/mmkvStorage";
import { TtlCacheManager } from "@/src/data/cache/TtlCacheManager";
import { ChatRepositoryImpl } from "@/src/data/repositories/ChatRepositoryImpl";
import { MessageRepositoryImpl } from "@/src/data/repositories/MessageRepositoryImpl";
import { SimulatedChatEngine } from "@/src/data/simulated/SimulatedChatEngine";
import {
  SimulatedChatRepository,
  SimulatedChatSocketService,
  SimulatedMessageRepository,
} from "@/src/data/simulated/SimulatedChatRepositories";
import { ChatSocketService } from "@/src/data/socket/ChatSocketService";
import { clearLogs, getLogs, log as dataLog } from "@/src/data/utils/logger";
import { isErr, isOk, ok } from "@/src/domain/Result";

const mockSocketListeners = new Map<string, ((...args: unknown[]) => void)[]>();
const mockIoListeners = new Map<string, ((...args: unknown[]) => void)[]>();

const mockSocketInstance = {
  connected: false,
  io: {
    opts: { auth: {} as Record<string, unknown> },
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      const list = mockIoListeners.get(event) ?? [];
      list.push(cb);
      mockIoListeners.set(event, list);
    }),
  },
  on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
    const list = mockSocketListeners.get(event) ?? [];
    list.push(cb);
    mockSocketListeners.set(event, list);
  }),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(() => {
    mockSocketInstance.connected = false;
  }),
};

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocketInstance),
}));

jest.mock("@/src/data/api", () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const sampleConvDto = {
  id: "conv-100",
  scope: "ROOM",
  handledBy: "COMMUNITY",
  status: "OPEN",
  subject: "Expo Showcase",
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

const sampleMsgDto = {
  id: "msg-100",
  clientId: "client-100",
  conversationId: "conv-100",
  senderType: "USER",
  content: "API payload",
  contentType: "text",
  isEdited: false,
  createdAt: "2026-11-21T00:00:00.000Z",
  attachments: [],
};

describe("Data Core", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketListeners.clear();
    mockIoListeners.clear();
    mockSocketInstance.connected = false;
    mockSocketInstance.io.opts = { auth: {} };
    getStorageSync().clearAll();
  });

  it("handles MMKV fallback storage and TTL cache envelopes", async () => {
    const syncStorage = getStorageSync();
    expect(isUsingFallbackStorage()).toBe(true);
    primeFallbackStorage("k_primed", "primed-val");
    expect(syncStorage.getString("k_primed")).toBe("primed-val");

    const initialized = await initStorage();
    initialized.setString("k_str", "hello");
    initialized.setNumber("k_num", 42);
    initialized.setBoolean("k_bool", true);
    expect(initialized.getString("k_str")).toBe("hello");
    expect(initialized.getNumber("k_num")).toBe(42);
    expect(initialized.getBoolean("k_bool")).toBe(true);
    expect(initialized.contains("k_str")).toBe(true);

    const cache = new TtlCacheManager(initialized);
    cache.set("cache:a", { count: 1 }, 5000, "etag-1");
    cache.set("cache:b", { count: 2 }, 0);
    expect(cache.getFresh<{ count: number }>("cache:a")).toEqual({ count: 1 });
    expect(cache.getFresh<{ count: number }>("cache:a", Date.now() + 10000)).toBeNull();
    expect(cache.getStaleFallback<{ count: number }>("cache:a")).toEqual({ count: 1 });
    expect(cache.getFresh<{ count: number }>("cache:b")).toEqual({ count: 2 });

    expect(cache.invalidatePrefix("cache:")).toBe(2);
    expect(cache.getEnvelope("cache:a")).toBeNull();

    cache.set("cache:del", "v");
    cache.delete("cache:del");
    expect(cache.getFresh("cache:del")).toBeNull();
  });

  it("extracts nested envelopes and records redacted data logs", () => {
    expect(extractEnvelopeEntity(null)).toBeNull();
    expect(extractEnvelopeEntity({ conversation: { id: "c1" } }, ["conversation"])).toEqual({
      id: "c1",
    });
    expect(
      extractEnvelopeEntity({ data: { conversation: { id: "c2" } } }, ["conversation"])
    ).toEqual({ id: "c2" });
    expect(extractEnvelopeEntity({ data: { _id: "c3" } })).toEqual({ _id: "c3" });
    expect(extractEnvelopeEntity({ id: "c4" })).toEqual({ id: "c4" });
    expect(extractEnvelopeEntity({ empty: true })).toBeNull();

    clearLogs();
    dataLog.setSeverity("debug");
    const child = dataLog.createChild("Test");
    child.info("payload", { token: "secret-abc", safe: 1 });
    child.exception(new Error("boom"), "context");
    child.exception("raw-err");
    expect(child.getSeverity()).toBe("debug");
    const entries = getLogs();
    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(entries[0])).toContain("[REDACTED]");
    clearLogs();
  });

  it("executes ChatRepositoryImpl & MessageRepositoryImpl online and error paths", async () => {
    const httpMock = http as jest.Mocked<typeof http>;
    const chatRepo = new ChatRepositoryImpl({ isConnected: () => true });
    const msgRepo = new MessageRepositoryImpl({ isConnected: () => true });

    httpMock.get.mockResolvedValueOnce({ data: { data: [sampleConvDto], nextCursor: null } });
    const listRes = await chatRepo.list("cur-1", 10);
    expect(isOk(listRes)).toBe(true);
    if (isOk(listRes)) {
      expect(listRes.value.data).toHaveLength(1);
    }

    httpMock.get.mockResolvedValueOnce({ data: { data: [], nextCursor: null } });
    const emptyRes = await chatRepo.list();
    expect(isOk(emptyRes)).toBe(true);
    if (isOk(emptyRes)) {
      expect(emptyRes.value.data).toHaveLength(0);
    }

    httpMock.get.mockRejectedValueOnce({
      response: { status: 401, data: { message: "Expired" } },
    });
    const authErrRes = await chatRepo.list();
    expect(isErr(authErrRes) && authErrRes.error.code).toBe("UNAUTHORIZED");

    httpMock.get.mockResolvedValueOnce({ data: sampleConvDto });
    const byIdRes = await chatRepo.getById("conv-100");
    expect(isOk(byIdRes) && byIdRes.value?.id).toBe("conv-100");

    httpMock.get.mockResolvedValueOnce({});
    const missingRes = await chatRepo.getById("conv-missing");
    expect(isOk(missingRes) && missingRes.value).toBeNull();

    httpMock.post.mockResolvedValueOnce({ data: sampleConvDto });
    expect(isOk(await chatRepo.create({ subject: "Room" }))).toBe(true);

    httpMock.post.mockResolvedValueOnce({ data: sampleConvDto });
    expect(isOk(await chatRepo.matchRoulette("React Native"))).toBe(true);

    httpMock.post.mockResolvedValueOnce({ data: sampleConvDto });
    expect(isOk(await chatRepo.close("conv-100"))).toBe(true);

    httpMock.post.mockResolvedValueOnce({});
    expect(isErr(await chatRepo.close("conv-100"))).toBe(true);

    httpMock.get.mockResolvedValueOnce({ data: { data: [sampleMsgDto], nextCursor: "next-1" } });
    const msgsRes = await msgRepo.list("conv-100", "c1", 20);
    expect(isOk(msgsRes) && msgsRes.value.nextCursor).toBe("next-1");

    httpMock.post.mockResolvedValueOnce({ data: sampleMsgDto });
    expect(isOk(await msgRepo.send({ conversationId: "conv-100", content: "Hi" }))).toBe(true);

    httpMock.post.mockResolvedValueOnce({});
    expect(isOk(await msgRepo.markRead("conv-100", "msg-100"))).toBe(true);

    httpMock.post.mockResolvedValueOnce({ data: sampleMsgDto });
    expect(isOk(await msgRepo.toggleReaction("conv-100", "msg-100", "🔥"))).toBe(true);

    httpMock.post.mockResolvedValueOnce({
      data: {
        uploadId: "u-1",
        url: "https://cdn.example.com/a.jpg",
        mimeType: "image/jpeg",
        fileName: "a.jpg",
        fileSize: 10,
      },
    });
    expect(isOk(await msgRepo.uploadAttachment(new FormData()))).toBe(true);

    httpMock.post.mockResolvedValueOnce({
      data: {
        uploadId: "a-1",
        url: "https://cdn.example.com/a.m4a",
        mimeType: "audio/m4a",
        fileName: "a.m4a",
        fileSize: 20,
        durationSeconds: 3,
        waveformBars: [0.5],
      },
    });
    expect(isOk(await msgRepo.uploadAudio(new FormData()))).toBe(true);

    httpMock.delete.mockResolvedValueOnce({});
    expect(isOk(await msgRepo.deleteAttachment("a-1"))).toBe(true);

    httpMock.delete.mockRejectedValueOnce({
      response: { status: 429, data: { message: "Slow down" } },
    });
    expect(isErr(await msgRepo.deleteAttachment("a-1"))).toBe(true);
  });

  it("connects, joins, buffers offline, and flushes ChatSocketService", async () => {
    let connectivityCb: ((online: boolean) => void) | undefined;
    let isOnline = false;
    const connectivity = {
      isConnected: () => isOnline,
      observeConnectivity: (cb: (online: boolean) => void) => {
        connectivityCb = cb;
        return () => {};
      },
    };
    const tokenStorage = {
      saveTokens: jest.fn(),
      getTokens: jest.fn().mockResolvedValue(ok({ accessToken: "tok", refreshToken: "ref" })),
      clearTokens: jest.fn(),
      getToken: jest.fn().mockResolvedValue("access-tok"),
    };
    const logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const socketService = new ChatSocketService(
      "https://api.example.com/api/v1",
      logger,
      connectivity,
      tokenStorage
    );

    const reconnectSpy = jest.fn();
    socketService.onEvent("reconnect", reconnectSpy);
    await socketService.connect();
    expect(io).toHaveBeenCalledTimes(1);

    socketService.joinConversation("conv-100");
    socketService.sendMessage({
      conversationId: "conv-100",
      clientId: "c-off",
      content: "Offline msg",
    });
    expect(socketService.getPendingQueueCount()).toBe(1);

    isOnline = true;
    mockSocketInstance.connected = true;
    expect(socketService.isConnected()).toBe(true);
    mockSocketListeners.get("connect")?.forEach((cb) => cb());
    expect(mockSocketInstance.emit).toHaveBeenCalledWith("conversation:join", "conv-100");
    expect(mockSocketInstance.emit).toHaveBeenCalledWith(
      "message:send",
      expect.objectContaining({ clientId: "c-off" })
    );

    socketService.startTyping("conv-100");
    socketService.stopTyping("conv-100");
    socketService.markMessageRead("conv-100", "m-1");
    socketService.deleteAttachment({ attachmentId: "a-1", conversationId: "conv-100" });

    mockIoListeners.get("reconnect")?.forEach((cb) => cb(1));
    expect(reconnectSpy).toHaveBeenCalledWith(1);

    connectivityCb?.(true);
    socketService.leaveConversation("conv-100");
    socketService.offEvent("reconnect", reconnectSpy);
    socketService.disconnect();
    expect(socketService.isConnected()).toBe(false);
  });

  it("exercises SimulatedChatRepositories & SimulatedChatSocketService", async () => {
    const engine = new SimulatedChatEngine();
    const convRepo = new SimulatedChatRepository(engine);
    const msgRepo = new SimulatedMessageRepository(engine);

    const created = await convRepo.create({ subject: "Audio & Motion" });
    expect(isOk(created)).toBe(true);
    if (!isOk(created)) return;

    const convId = created.value.id;
    expect(isOk(await convRepo.getById(convId))).toBe(true);
    expect(isOk(await msgRepo.send({ conversationId: convId, content: "voice note please" }))).toBe(
      true
    );
    expect(isOk(await msgRepo.markRead())).toBe(true);
    expect(isOk(await msgRepo.uploadAttachment(new FormData()))).toBe(true);
    expect(isOk(await msgRepo.uploadAudio())).toBe(true);
    expect(isOk(await msgRepo.deleteAttachment())).toBe(true);

    const voiceReply = engine.buildSimulatedReply(convId, "voice note");
    expect(voiceReply.contentType).toBe("AUDIO");
    expect(engine.buildSimulatedReply(convId, "clean architecture").content).toContain(
      "Clean Architecture"
    );
    expect(engine.buildSimulatedReply(convId, "offline mmkv").content).toContain(
      "ChatOutboundQueue"
    );
    expect(engine.buildSimulatedReply(convId, "animation").content).toContain("Reanimated");
    expect(engine.buildSimulatedReply(convId, "roulette").content).toContain("Spin Roulette");

    expect(isOk(await convRepo.close(convId))).toBe(true);
    expect(isErr(await convRepo.close("nonexistent"))).toBe(true);

    const simLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const simSocket = new SimulatedChatSocketService(
      simLogger,
      { isConnected: () => true },
      engine
    );
    const presenceSpy = jest.fn();
    simSocket.onEvent("support:presence", presenceSpy);
    simSocket.connect();
    expect(presenceSpy).toHaveBeenCalledTimes(1);
    simSocket.joinConversation(convId);
    simSocket.sendMessage({ conversationId: convId, clientId: "sim-c1", content: "hello" });
    simSocket.disconnect();
    simSocket.offEvent("support:presence", presenceSpy);
  });
});
