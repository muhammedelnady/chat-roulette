/** @format */

import type { ConversationEntity, MessageEntity } from "@/src/domain/entities";
import { AppError } from "@/src/domain/errors";
import type { IConversationRepository, IMessageRepository } from "@/src/domain/repositories";
import { err, isErr, isOk, ok } from "@/src/domain/Result";
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

const sampleConv: ConversationEntity = {
  id: "conv-1",
  scope: "ROOM",
  handledBy: "COMMUNITY",
  status: "OPEN",
  createdAt: "2026-11-21T00:00:00.000Z",
  updatedAt: "2026-11-21T00:00:00.000Z",
  participants: [],
};

const sampleMsg: MessageEntity = {
  id: "msg-1",
  clientId: "client-1",
  conversationId: "conv-1",
  senderType: "USER",
  content: "Hello",
  contentType: "text",
  isEdited: false,
  createdAt: "2026-11-21T00:00:00.000Z",
  attachments: [],
};

describe("Chat Use Cases", () => {
  const convRepo: jest.Mocked<IConversationRepository> = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    matchRoulette: jest.fn(),
    close: jest.fn(),
  };

  const msgRepo: jest.Mocked<IMessageRepository> = {
    list: jest.fn(),
    send: jest.fn(),
    markRead: jest.fn(),
    toggleReaction: jest.fn(),
    uploadAttachment: jest.fn(),
    uploadAudio: jest.fn(),
    deleteAttachment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("executes conversation use cases and handles repository failures", async () => {
    convRepo.list.mockResolvedValueOnce(ok({ data: [sampleConv], nextCursor: null }));
    const listRes = await new GetConversationsUseCase(convRepo).execute();
    expect(isOk(listRes) && listRes.value.data).toHaveLength(1);

    convRepo.list.mockRejectedValueOnce(new Error("boom"));
    expect(isErr(await new GetConversationsUseCase(convRepo).execute())).toBe(true);

    convRepo.getById.mockResolvedValueOnce(ok(sampleConv));
    const byIdRes = await new GetConversationByIdUseCase(convRepo).execute("conv-1");
    expect(isOk(byIdRes) && byIdRes.value?.id).toBe("conv-1");

    convRepo.create.mockResolvedValueOnce(ok(sampleConv));
    expect(isOk(await new CreateConversationUseCase(convRepo).execute({ subject: "Test" }))).toBe(
      true
    );

    convRepo.matchRoulette.mockResolvedValueOnce(ok(sampleConv));
    expect(isOk(await new MatchRouletteUseCase(convRepo).execute("React Native"))).toBe(true);

    convRepo.close.mockResolvedValueOnce(err(new AppError("cannot close")));
    expect(isErr(await new CloseConversationUseCase(convRepo).execute("conv-1"))).toBe(true);
  });

  it("executes message and media use cases", async () => {
    msgRepo.list.mockResolvedValueOnce(ok({ data: [sampleMsg], nextCursor: null }));
    const msgsRes = await new GetMessagesUseCase(msgRepo).execute("conv-1");
    expect(isOk(msgsRes) && msgsRes.value.data[0]?.id).toBe("msg-1");

    msgRepo.send.mockResolvedValueOnce(ok(sampleMsg));
    expect(
      isOk(
        await new SendMessageUseCase(msgRepo).execute({ conversationId: "conv-1", content: "Hi" })
      )
    ).toBe(true);

    msgRepo.markRead.mockResolvedValueOnce(ok(undefined));
    expect(isOk(await new MarkMessageReadUseCase(msgRepo).execute("conv-1", "msg-1"))).toBe(true);

    msgRepo.toggleReaction.mockResolvedValueOnce(ok(sampleMsg));
    expect(
      isOk(await new ToggleMessageReactionUseCase(msgRepo).execute("conv-1", "msg-1", "⚡"))
    ).toBe(true);

    msgRepo.uploadAttachment.mockResolvedValueOnce(
      ok({
        id: "att-1",
        url: "https://example.com/a.jpg",
        mimeType: "image/jpeg",
        fileName: "a.jpg",
        fileSize: 100,
      })
    );
    expect(isOk(await new UploadAttachmentUseCase(msgRepo).execute(new FormData()))).toBe(true);

    msgRepo.uploadAudio.mockResolvedValueOnce(
      ok({
        uploadId: "aud-1",
        url: "simulated://aud-1.m4a",
        fileName: "aud-1.m4a",
        mimeType: "audio/m4a",
        fileSize: 1024,
        durationSeconds: 3,
        waveformBars: [0.3, 0.7],
      })
    );
    expect(isOk(await new UploadAudioUseCase(msgRepo).execute(new FormData()))).toBe(true);

    msgRepo.deleteAttachment.mockResolvedValueOnce(ok(undefined));
    expect(isOk(await new DeleteAttachmentUseCase(msgRepo).execute("att-1"))).toBe(true);
  });
});
