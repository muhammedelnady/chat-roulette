/** @format */

import { directionFromLangTag } from "./direction";
import { translate } from "./translate";

describe("i18n translation & direction", () => {
  it("translates keys and interpolates variables in EN and AR", () => {
    expect(translate("en", "rooms.title")).toBe("Pulse Rooms");
    expect(translate("ar", "rooms.title")).toBe("غرف النبض");
    expect(translate("en", "rooms.membersOnline", { count: 12 })).toBe("12 online");
    expect(translate("ar", "rooms.membersOnline", { count: 12 })).toBe("12 متصل");
  });

  it("resolves RTL direction accurately", () => {
    expect(directionFromLangTag("ar-EG")).toBe("rtl");
    expect(directionFromLangTag("en-US")).toBe("ltr");
    expect(directionFromLangTag(undefined)).toBe("ltr");
  });
});
