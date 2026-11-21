/** @format */

import { io } from "socket.io-client";

import { http } from "@/src/data/api";
import { configureHttpAuth } from "@/src/data/api/client";
import { extractEnvelopeEntity } from "@/src/data/api/envelope";
import { TtlCacheManager } from "@/src/data/cache/TtlCacheManager";
import { BaseRepository } from "@/src/data/repositories/BaseRepository";
import { ChatRepositoryImpl } from "@/src/data/repositories/ChatRepositoryImpl";
import { MessageRepositoryImpl } from "@/src/data/repositories/MessageRepositoryImpl";
import { SimulatedChatEngine } from "@/src/data/simulated/SimulatedChatEngine";
import {
  SimulatedChatRepository,
  SimulatedChatSocketService,
  SimulatedMessageRepository,
} from "@/src/data/simulated/SimulatedChatRepositories";
import { ChatSocketService } from "@/src/data/socket/ChatSocketService";
import {
  type AppError,
  AuthError,
  NetworkError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "@/src/domain/errors";
import { isErr, isOk, ok } from "@/src/domain/Result";
import { log as infraLog } from "@/src/infrastructure/logging/logger";
import {
  getStorageSync,
  initStorage,
  isUsingFallbackStorage,
  primeFallbackStorage,
  resetStorageForTests,
} from "@/src/infrastructure/storage/mmkvStorage";

const mockSocketListeners = new Map<string, ((...args: unknown[]) => void)[]>();
const mockIoListeners = new Map<string, ((...args: unknown[]) => void)[]>();

const mockSocketInstance = {
  connected: false,
  auth: {} as Record<string, unknown> | ((cb: (data: Record<string, unknown>) => void) => void),
  io: {
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      const list = mockIoListeners.get(event) ?? [];
      list.push(cb);
      mockIoListeners.set(event, list);
    }),
    off: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      const list = mockIoListeners.get(event) ?? [];
      mockIoListeners.set(
        event,
        list.filter((fn) => fn !== cb)
      );
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

class ExposedBaseRepository extends BaseRepository {
  exposeHandleError(error: unknown, context: string, errorCode?: string): AppError {
    return this.handleError(error, context, errorCode);
  }
}

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
    mockSocketInstance.auth = {};
    resetStorageForTests();
    getStorageSync().clearAll();
  });

  it("handles MMKV fallback storage, ttl namespace isolation, corrupt purge, and eviction", async () => {
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
    cache.set("a", { count: 1 }, 5000, "etag-1");
    cache.set("b", { count: 2 }, 0);
    expect(initialized.contains("ttl:a")).toBe(true);
    expect(cache.getFresh<{ count: number }>("a")).toEqual({ count: 1 });
    expect(cache.getFresh<{ count: number }>("a", Date.now() + 10000)).toBeNull();
    expect(cache.getStaleFallback<{ count: number }>("a")).toEqual({ count: 1 });
    expect(cache.getFresh<{ count: number }>("b")).toEqual({ count: 2 });

    initialized.setString("ttl:corrupt", "{not-json");
    expect(cache.getEnvelope("corrupt")).toBeNull();
    expect(initialized.contains("ttl:corrupt")).toBe(false);

    initialized.setString("ttl:bad-shape", JSON.stringify({ version: 99 }));
    expect(cache.getEnvelope("bad-shape")).toBeNull();
    expect(initialized.contains("ttl:bad-shape")).toBe(false);

    expect(cache.invalidatePrefix("")).toBe(2);
    expect(initialized.contains("k_str")).toBe(true);

    for (let i = 0; i < 205; i += 1) {
      cache.set(`item-${i}`, i, 1000);
    }
    const ttlKeys = initialized.getAllKeys().filter((k) => k.startsWith("ttl:"));
    expect(ttlKeys.length).toBeLessThanOrEqual(200);
  });

  it("extracts valid envelopes and maps BaseRepository errors safely", () => {
    expect(extractEnvelopeEntity(null)).toBeNull();
    expect(extractEnvelopeEntity({ empty: true })).toBeNull();
    expect(extractEnvelopeEntity({ conversation: { id: "" } }, ["conversation"])).toBeNull();
    expect(extractEnvelopeEntity({ conversation: { id: "c1" } }, ["conversation"])).toEqual({
      id: "c1",
    });
    expect(
      extractEnvelopeEntity({ data: { conversation: { id: "c2" } } }, ["conversation"])
    ).toEqual({ id: "c2" });
    expect(extractEnvelopeEntity({ data: { _id: "c3" } })).toEqual({ id: "c3", _id: "c3" });
    expect(extractEnvelopeEntity({ id: "c4" })).toEqual({ id: "c4" });

    const repo = new ExposedBaseRepository();
    expect(repo.exposeHandleError(null, "ctx")).toBeInstanceOf(ServerError);
    expect(repo.exposeHandleError({ code: "ECONNABORTED" }, "ctx")).toBeInstanceOf(TimeoutError);
    expect(repo.exposeHandleError({ code: "ERR_NETWORK", request: {} }, "ctx")).toBeInstanceOf(
      NetworkError
    );
    expect(repo.exposeHandleError({ response: { status: 400 } }, "ctx")).toBeInstanceOf(
      ValidationError
    );
    expect(repo.exposeHandleError({ response: { status: 401 } }, "ctx")).toBeInstanceOf(AuthError);
    expect(repo.exposeHandleError({ response: { status: 403 } }, "ctx")).toBeInstanceOf(
      PermissionError
    );
    expect(repo.exposeHandleError({ response: { status: 404 } }, "ctx")).toBeInstanceOf(
      NotFoundError
    );
    expect(repo.exposeHandleError({ response: { status: 429 } }, "ctx")).toBeInstanceOf(
      RateLimitError
    );

    const domainErr = new NetworkError("preserved");
    expect(repo.exposeHandleError(domainErr, "ctx")).toBe(domainErr);

    infraLog.setSeverity("debug");
    const child = infraLog.createChild("Test");
    child.info("payload", { token: "secret-abc", safe: 1 });
    expect(infraLog.createChild).toHaveBeenCalledWith("Test");
    expect(child.info).toHaveBeenCalledWith("payload", { token: "secret-abc", safe: 1 });
  });

  it("executes ChatRepositoryImpl & MessageRepositoryImpl online, offline, and error paths", async () => {
    const httpMock = http as jest.Mocked<typeof http>;
    const chatRepo = new ChatRepositoryImpl({ isConnected: () => true });
    const msgRepo = new MessageRepositoryImpl({ isConnected: () => true });

    httpMock.get.mockResolvedValueOnce({ data: { data: [sampleConvDto], nextCursor: null } });
    const listRes = await chatRepo.list("cur-1", 10);
    expect(isOk(listRes)).toBe(true);
    if (isOk(listRes)) {
      expect(listRes.value.data).toHaveLength(1);
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

    let onlineFlag = false;
    const offlineRepo = new ChatRepositoryImpl({ isConnected: () => onlineFlag });
    const missOffline = await offlineRepo.list();
    expect(isErr(missOffline) && missOffline.error).toBeInstanceOf(NetworkError);

    onlineFlag = true;
    const cachedChatRepo = new ChatRepositoryImpl({ isConnected: () => onlineFlag });
    httpMock.get.mockResolvedValueOnce({ data: { data: [sampleConvDto], nextCursor: null } });
    expect(isOk(await cachedChatRepo.list())).toBe(true);

    onlineFlag = false;
    const offlineHit = await cachedChatRepo.list();
    expect(isOk(offlineHit) && offlineHit.value.data).toHaveLength(1);

    const resetAuth = configureHttpAuth({
      getToken: jest.fn().mockResolvedValue("tok-1"),
      getTokens: jest.fn().mockResolvedValue(ok({ accessToken: "tok-1", refreshToken: null })),
      saveTokens: jest.fn(),
      clearTokens: jest.fn(),
    });
    resetAuth();
  });

  it("connects with mutex, binds Socket.IO auth callback, flushes once, and cleans up on dispose", async () => {
    let connectivityCb: ((online: boolean) => void) | undefined;
    const isOnline = true;
    const connectivity = {
      isConnected: () => isOnline,
      observeConnectivity: (cb: (online: boolean) => void) => {
        connectivityCb = cb;
        return jest.fn();
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

    await Promise.all([socketService.connect(), socketService.connect()]);
    expect(io).toHaveBeenCalledTimes(1);

    const ioCallOptions = (io as jest.Mock).mock.calls[0]?.[1] as {
      auth: (cb: (data: Record<string, unknown>) => void) => void;
    };
    const authCb = jest.fn();
    ioCallOptions.auth(authCb);
    await new Promise((r) => setTimeout(r, 0));
    expect(authCb).toHaveBeenCalledWith(expect.objectContaining({ token: "access-tok" }));

    socketService.joinConversation("conv-100");
    socketService.sendMessage({
      conversationId: "conv-100",
      clientId: "c-off",
      content: "Buffered msg",
    });
    expect(socketService.getPendingQueueCount()).toBe(1);

    mockSocketInstance.connected = true;
    mockSocketListeners.get("connect")?.forEach((cb) => cb());
    expect(mockSocketInstance.emit).toHaveBeenCalledWith("conversation:join", "conv-100");
    expect(mockSocketInstance.emit).toHaveBeenCalledWith(
      "message:send",
      expect.objectContaining({ clientId: "c-off" })
    );

    mockIoListeners.get("reconnect")?.forEach((cb) => cb(1));
    expect(reconnectSpy).toHaveBeenCalledWith(1);

    connectivityCb?.(true);
    socketService.offEvent("reconnect");
    mockIoListeners.get("reconnect")?.forEach((cb) => cb(2));
    expect(reconnectSpy).toHaveBeenCalledTimes(1);

    socketService.dispose();
    expect(mockSocketInstance.io.off).toHaveBeenCalledWith("reconnect", expect.any(Function));
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
    expect(isOk(await msgRepo.markRead(convId))).toBe(true);
    expect(isOk(await msgRepo.uploadAttachment(new FormData()))).toBe(true);
    expect(isOk(await msgRepo.uploadAudio())).toBe(true);
    expect(isOk(await convRepo.close(convId))).toBe(true);
    expect(isErr(await convRepo.close("nonexistent"))).toBe(true);

    const simLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const simSocket = new SimulatedChatSocketService(
      simLogger,
      { isConnected: () => true },
      engine
    );
    simSocket.connect();
    simSocket.joinConversation(convId);
    simSocket.sendMessage({ conversationId: convId, clientId: "sim-c1", content: "hello" });
    simSocket.disconnect();
  });
});
