/** @format */

import MockAdapter from "axios-mock-adapter";

import { err, isOk, ok } from "@/src/domain/Result";
import { getStorageSync, resetStorageForTests } from "@/src/infrastructure/storage/mmkvStorage";

import { configureHttpAuth, httpClientInstance, resetHttpAuth } from "./client";

describe("HTTP client interceptors", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    resetHttpAuth();
    resetStorageForTests();
    getStorageSync().clearAll();
    mock = new MockAdapter(httpClientInstance);
  });

  afterEach(() => {
    resetHttpAuth();
    mock.restore();
  });

  it("attaches auth headers for same-origin requests and strips them for cross-origin URLs", async () => {
    getStorageSync().setString("@chat_guest_session_id", "guest-42");
    configureHttpAuth({
      getToken: jest.fn().mockResolvedValue("access-1"),
      getTokens: jest
        .fn()
        .mockResolvedValue(ok({ accessToken: "access-1", refreshToken: "ref-1" })),
      saveTokens: jest.fn().mockResolvedValue(ok(undefined)),
      clearTokens: jest.fn().mockResolvedValue(ok(undefined)),
    });

    mock.onGet("/api/v1/chat/conversations").reply((config) => {
      expect(config.headers?.Authorization).toBe("Bearer access-1");
      expect(config.headers?.["X-Guest-Session-Id"]).toBe("guest-42");
      return [200, { ok: true }];
    });

    mock.onGet("https://other.cdn.example.com/public.json").reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      expect(config.headers?.["X-Guest-Session-Id"]).toBeUndefined();
      return [200, { ok: true }];
    });

    const sameOriginRes = await httpClientInstance.get("/api/v1/chat/conversations");
    expect(sameOriginRes.status).toBe(200);

    const crossOriginRes = await httpClientInstance.get(
      "https://other.cdn.example.com/public.json"
    );
    expect(crossOriginRes.status).toBe(200);
  });

  it("performs single-flight token refresh on concurrent 401 responses", async () => {
    let currentToken = "expired-token";
    const saveTokens = jest.fn(async (access: string) => {
      currentToken = access;
      return ok(undefined);
    });
    const clearTokens = jest.fn().mockResolvedValue(ok(undefined));

    configureHttpAuth({
      getToken: jest.fn(async () => currentToken),
      getTokens: jest
        .fn()
        .mockResolvedValue(ok({ accessToken: "expired-token", refreshToken: "ref-1" })),
      saveTokens,
      clearTokens,
    });

    let callCount = 0;
    mock.onGet("/api/v1/protected").reply((config) => {
      callCount += 1;
      if (config.headers?.Authorization === "Bearer fresh-token") {
        return [200, { data: "ok" }];
      }
      return [401, { message: "Expired" }];
    });

    mock.onPost("/api/v1/auth/refresh").replyOnce(200, {
      data: { accessToken: "fresh-token", refreshToken: "ref-2" },
    });

    const [resA, resB] = await Promise.all([
      httpClientInstance.get("/api/v1/protected"),
      httpClientInstance.get("/api/v1/protected"),
    ]);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);
    expect(saveTokens).toHaveBeenCalledTimes(1);
    expect(saveTokens).toHaveBeenCalledWith("fresh-token", "ref-2");
    expect(clearTokens).not.toHaveBeenCalled();
    expect(callCount).toBe(4);
  });

  it("clears tokens when refresh fails or no refresh token exists", async () => {
    const clearTokens = jest.fn().mockResolvedValue(ok(undefined));
    configureHttpAuth({
      getToken: jest.fn().mockResolvedValue("expired"),
      getTokens: jest.fn().mockResolvedValue(err(new Error("no tokens") as never)),
      saveTokens: jest.fn().mockResolvedValue(ok(undefined)),
      clearTokens,
    });

    mock.onGet("/api/v1/protected").reply(401);

    await expect(httpClientInstance.get("/api/v1/protected")).rejects.toBeDefined();
    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(isOk(ok(true))).toBe(true);
  });
});
