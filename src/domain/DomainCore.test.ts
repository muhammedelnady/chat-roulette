/** @format */

import * as Crypto from "expo-crypto";

import type { VoiceNote } from "@/src/domain/entities";
import {
  AppError,
  AuthError,
  CacheError,
  ErrorCategory,
  NetworkError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  SerializationError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "@/src/domain/errors";
import { InMemoryEventBus, LanguageChangedEvent } from "@/src/domain/events";
import type { IConversationRepository, IMessageRepository } from "@/src/domain/repositories";
import { isErr, isOk, ok } from "@/src/domain/Result";
import type { IAudioRecordingService } from "@/src/domain/services";
import {
  CancelVoiceRecordingUseCase,
  StartVoiceRecordingUseCase,
  StopVoiceRecordingUseCase,
} from "@/src/domain/usecases/audio";
import {
  CloseConversationUseCase,
  CreateConversationUseCase,
  DeleteAttachmentUseCase,
  GetConversationByIdUseCase,
  GetConversationsUseCase,
  GetMessagesUseCase,
  MarkMessageReadUseCase,
  MatchRouletteUseCase,
  SendMessageUseCase,
  ToggleMessageReactionUseCase,
  UploadAttachmentUseCase,
  UploadAudioUseCase,
} from "@/src/domain/usecases/chat";
import { generateUUID } from "@/src/domain/utils/uuid";

describe("Domain Core", () => {
  it("constructs domain and app errors with proper categories and metadata", () => {
    const valErr = new ValidationError("Invalid field", "subject", { min: 3 });
    expect(valErr.category).toBe(ErrorCategory.VALIDATION);
    expect(valErr.field).toBe("subject");

    const notFound = new NotFoundError("Conversation");
    expect(notFound.category).toBe(ErrorCategory.NOT_FOUND);
    expect(notFound.message).toBe("Conversation not found");

    const appErr = new AppError("Generic failure");
    expect(appErr.category).toBe(ErrorCategory.UNKNOWN);

    const netErr = new NetworkError();
    expect(netErr.category).toBe(ErrorCategory.NETWORK);

    const timeoutErr = new TimeoutError();
    expect(timeoutErr.category).toBe(ErrorCategory.TIMEOUT);
    expect(timeoutErr.code).toBe("TIMEOUT_ERROR");

    const serverErr = new ServerError();
    expect(serverErr.category).toBe(ErrorCategory.SERVER);

    const rateErr = new RateLimitError();
    expect(rateErr.category).toBe(ErrorCategory.RATE_LIMIT);

    const authErr = new AuthError();
    expect(authErr.category).toBe(ErrorCategory.AUTH);

    const permErr = new PermissionError();
    expect(permErr.category).toBe(ErrorCategory.PERMISSION);

    const cacheErr = new CacheError();
    expect(cacheErr.category).toBe(ErrorCategory.CACHE);

    const serialErr = new SerializationError();
    expect(serialErr.category).toBe(ErrorCategory.SERIALIZATION);
  });

  it("publishes, subscribes, handles errors, and clears InMemoryEventBus", async () => {
    const warn = jest.fn();
    const bus = new InMemoryEventBus({
      silly: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn,
      error: jest.fn(),
    });

    const received: Record<string, unknown>[] = [];
    const event = new LanguageChangedEvent("ar");
    expect(event.eventType).toBe("LanguageChangedEvent");
    expect(event.toPayload()).toMatchObject({ language: "ar" });

    await bus.publish(event);
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);

    const unsubscribe = bus.subscribe<LanguageChangedEvent>("LanguageChangedEvent", (e) => {
      received.push(e.toPayload());
    });
    const unsubAsyncFail = bus.subscribe("LanguageChangedEvent", async () => {
      throw new Error("async failure");
    });
    const unsubSyncFail = bus.subscribe("LanguageChangedEvent", () => {
      throw new Error("sync failure");
    });

    expect(bus.handlerCount("LanguageChangedEvent")).toBe(3);
    await bus.publishAll([event]);
    expect(received).toHaveLength(1);

    unsubscribe();
    unsubAsyncFail();
    unsubSyncFail();
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);

    bus.subscribe("LanguageChangedEvent", () => {});
    bus.clear();
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);
  });

  it("generates valid RFC4122 v4 UUIDs across native and byte fallback paths", () => {
    const directUuid = generateUUID();
    expect(directUuid).toMatch(/^[0-9a-f-]{36}$/i);

    const spy = jest.spyOn(Crypto, "randomUUID").mockImplementation(() => {
      throw new Error("unavailable");
    });
    const origCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => {
          throw new Error("web crypto unavailable");
        },
      },
      configurable: true,
    });
    jest.spyOn(Crypto, "getRandomBytes").mockReturnValue(new Uint8Array(31).fill(0xab));

    const fallbackUuid = generateUUID();
    expect(fallbackUuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );

    Object.defineProperty(globalThis, "crypto", { value: origCrypto, configurable: true });
    spy.mockRestore();
  });

  it("executes audio recording use cases", async () => {
    const sampleVoice: VoiceNote = {
      uri: "file:///voice.m4a",
      durationMs: 2500,
      mimeType: "audio/m4a",
      createdAt: 1700000000000,
    };
    const audioService: jest.Mocked<IAudioRecordingService> = {
      startRecording: jest.fn().mockResolvedValue(ok(undefined)),
      stopRecording: jest.fn().mockResolvedValue(ok(sampleVoice)),
      cancelRecording: jest.fn().mockResolvedValue(ok(undefined)),
      isRecording: jest.fn().mockReturnValue(false),
      getDurationMs: jest.fn().mockReturnValue(0),
    };

    expect(isOk(await new StartVoiceRecordingUseCase(audioService).execute())).toBe(true);
    const stopRes = await new StopVoiceRecordingUseCase(audioService).execute();
    expect(isOk(stopRes) && stopRes.value.uri).toBe("file:///voice.m4a");
    expect(isOk(await new CancelVoiceRecordingUseCase(audioService).execute())).toBe(true);
  });

  it("handles exception failure paths across all chat use cases", async () => {
    const failingConvRepo: jest.Mocked<IConversationRepository> = {
      list: jest.fn().mockRejectedValue("non-error"),
      getById: jest.fn().mockRejectedValue(new Error("fail")),
      create: jest.fn().mockRejectedValue(new Error("fail")),
      matchRoulette: jest.fn().mockRejectedValue(new Error("fail")),
      close: jest.fn().mockRejectedValue(new Error("fail")),
    };
    const failingMsgRepo: jest.Mocked<IMessageRepository> = {
      list: jest.fn().mockRejectedValue(new Error("fail")),
      send: jest.fn().mockRejectedValue(new Error("fail")),
      markRead: jest.fn().mockRejectedValue(new Error("fail")),
      toggleReaction: jest.fn().mockRejectedValue(new Error("fail")),
      uploadAttachment: jest.fn().mockRejectedValue(new Error("fail")),
      uploadAudio: jest.fn().mockRejectedValue(new Error("fail")),
      deleteAttachment: jest.fn().mockRejectedValue(new Error("fail")),
    };

    expect(isErr(await new GetConversationsUseCase(failingConvRepo).execute())).toBe(true);
    expect(isErr(await new GetConversationByIdUseCase(failingConvRepo).execute("c1"))).toBe(true);
    expect(isErr(await new CreateConversationUseCase(failingConvRepo).execute({}))).toBe(true);
    expect(isErr(await new MatchRouletteUseCase(failingConvRepo).execute())).toBe(true);
    expect(isErr(await new CloseConversationUseCase(failingConvRepo).execute("c1"))).toBe(true);
    expect(isErr(await new GetMessagesUseCase(failingMsgRepo).execute("c1"))).toBe(true);
    expect(
      isErr(
        await new SendMessageUseCase(failingMsgRepo).execute({
          conversationId: "c1",
          content: "hi",
        })
      )
    ).toBe(true);
    expect(isErr(await new MarkMessageReadUseCase(failingMsgRepo).execute("c1", "m1"))).toBe(true);
    expect(
      isErr(await new ToggleMessageReactionUseCase(failingMsgRepo).execute("c1", "m1", "⚡"))
    ).toBe(true);
    expect(isErr(await new UploadAttachmentUseCase(failingMsgRepo).execute(new FormData()))).toBe(
      true
    );
    expect(isErr(await new UploadAudioUseCase(failingMsgRepo).execute(new FormData()))).toBe(true);
    expect(isErr(await new DeleteAttachmentUseCase(failingMsgRepo).execute("a1"))).toBe(true);
  });
});
