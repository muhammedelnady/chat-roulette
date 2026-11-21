/** @format */

import { AppError, ValidationError } from "./errors";
import { err, flatMap, isErr, isOk, map, match, ok, tap, unwrap, unwrapOr } from "./Result";

describe("Result", () => {
  it("handles ok and err type guards and unwrapping", () => {
    const success = ok(42);
    const failure = err(new ValidationError("invalid", "email"));

    expect(isOk(success)).toBe(true);
    expect(isErr(success)).toBe(false);
    expect(isOk(failure)).toBe(false);
    expect(isErr(failure)).toBe(true);
    expect(unwrap(success)).toBe(42);
    expect(() => unwrap(failure)).toThrow();
    expect(() => unwrap(null)).toThrow();
    expect(unwrapOr(failure, 99)).toBe(99);
    expect(unwrapOr(success, 99)).toBe(42);
  });

  it("maps, flatMaps, taps, and matches results", () => {
    const tapFn = jest.fn();
    const mapped = map(ok(10), (n) => n * 2);
    expect(unwrap(mapped)).toBe(20);

    const chained = flatMap(mapped, (n) => ok(n + 5));
    expect(unwrap(chained)).toBe(25);

    const tapped = tap(chained, tapFn);
    expect(tapFn).toHaveBeenCalledWith(25);
    expect(unwrap(tapped)).toBe(25);

    const failure = err(new AppError("boom", "BOOM"));
    expect(isErr(map(failure, (n: number) => n + 1))).toBe(true);
    expect(isErr(flatMap(failure, (n: number) => ok(n)))).toBe(true);

    expect(
      match(chained, {
        ok: (v) => `ok:${v}`,
        err: () => "err",
      })
    ).toBe("ok:25");
    expect(
      match(failure, {
        ok: () => "ok",
        err: (e) => e?.code ?? "unknown",
      })
    ).toBe("BOOM");
  });
});
