/** @format */

import type { VoiceNote } from "@/src/domain/entities";
import {
  AppError,
  AuthError,
  CacheError,
  DomainError,
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
import { err, isErr, isOk, ok } from "@/src/domain/Result";
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("constructs domain and app errors with proper inheritance, categories, and metadata", () => {
    const valErr = new ValidationError("Invalid field", "subject", { min: 3 });
    expect(valErr).toBeInstanceOf(AppError);
    expect(valErr).toBeInstanceOf(DomainError);
    expect(valErr.category).toBe(ErrorCategory.VALIDATION);
    expect(valErr.field).toBe("subject");

    const notFound = new NotFoundError("Conversation");
    expect(notFound).toBeInstanceOf(AppError);
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
    expect(rateErr).toBeInstanceOf(AppError);
    expect(rateErr.category).toBe(ErrorCategory.RATE_LIMIT);

    const authErr = new AuthError();
    expect(authErr.category).toBe(ErrorCategory.AUTH);

    const permErr = new PermissionError();
    expect(permErr).toBeInstanceOf(AppError);
    expect(permErr.category).toBe(ErrorCategory.PERMISSION);

    const cacheErr = new CacheError();
    expect(cacheErr.category).toBe(ErrorCategory.CACHE);

    const serialErr = new SerializationError();
    expect(serialErr.category).toBe(ErrorCategory.SERIALIZATION);
  });

  it("publishes, handles re-entrant unsubscribes, logs failures, and clears InMemoryEventBus", async () => {
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
    expect(event.toPayload()).toMatchObject({
      eventType: "LanguageChangedEvent",
      language: "ar",
    });

    await bus.publish(event);
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);

    let unsubSecond: (() => void) | undefined;
    const unsubscribe = bus.subscribe<LanguageChangedEvent>("LanguageChangedEvent", (e) => {
      received.push(e.toPayload());
      unsubSecond?.();
    });
    const secondSpy = jest.fn();
    unsubSecond = bus.subscribe("LanguageChangedEvent", secondSpy);

    const unsubAsyncFail = bus.subscribe("LanguageChangedEvent", async () => {
      throw new Error("async failure");
    });
    const unsubSyncFail = bus.subscribe("LanguageChangedEvent", () => {
      throw new Error("sync failure");
    });

    expect(bus.handlerCount("LanguageChangedEvent")).toBe(4);
    await bus.publishAll([event]);
    expect(received).toHaveLength(1);
    expect(secondSpy).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(3);

    unsubscribe();
    unsubAsyncFail();
    unsubSyncFail();
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);

    bus.subscribe("LanguageChangedEvent", () => {});
    bus.clear();
    expect(bus.handlerCount("LanguageChangedEvent")).toBe(0);
  });

  it("generates valid RFC4122 v4 UUIDs across randomUUID, getRandomValues, and fallback paths", () => {
    const directUuid = generateUUID();
    expect(directUuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    const origCrypto = globalThis.crypto;
    try {
      Object.defineProperty(globalThis, "crypto", {
        value: {
          getRandomValues: (bytes: Uint8Array) => {
            bytes.fill(0xab);
            return bytes;
          },
        },
        configurable: true,
      });
      const bytesUuid = generateUUID();
      expect(bytesUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );

      Object.defineProperty(globalThis, "crypto", {
        value: {
          randomUUID: () => {
            throw new Error("unavailable");
          },
        },
        configurable: true,
      });
      const mathFallbackUuid = generateUUID();
      expect(mathFallbackUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(mathFallbackUuid).not.toBe(directUuid);
    } finally {
      Object.defineProperty(globalThis, "crypto", { value: origCrypto, configurable: true });
    }
  });

  it("executes audio recording use cases and enforces active recording guard", async () => {
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

    audioService.isRecording.mockReturnValueOnce(true);
    const activeErr = await new StartVoiceRecordingUseCase(audioService).execute();
    expect(isErr(activeErr) && activeErr.error.code).toBe("RECORDING_ALREADY_ACTIVE");

    audioService.startRecording.mockResolvedValueOnce(err(new PermissionError("No mic")));
    const permRes = await new StartVoiceRecordingUseCase(audioService).execute();
    expect(isErr(permRes) && permRes.error).toBeInstanceOf(PermissionError);

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
