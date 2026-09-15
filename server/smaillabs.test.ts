import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-openid",
      email: "test@example.com",
      name: "Тестовый Пользователь",
      loginMethod: "manus",
      role,
      minecraftNick: "YTSmailDog",
      minecraftSkinType: "licensed",
      minecraftSkinUrl: null,
      bio: "Test bio",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
  };
}

describe("Minecraft skin lookup and settings", () => {
  it("resolves licensed skin to NameMC profile URL", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.minecraft.lookup({
      nick: "YTSmailDog",
      sourceType: "licensed",
    });

    expect(result.nick).toBe("YTSmailDog");
    expect(result.sourceType).toBe("licensed");
    expect(result.profileUrl).toContain("namemc.com/profile/YTSmailDog");
    expect(result.skinTextureUrl).toContain("minotar.net/skin/YTSmailDog");
  });

  it("resolves pirate/TLauncher skin to TLauncher profile URL", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.minecraft.lookup({
      nick: "Milyashac_herry",
      sourceType: "tlauncher",
    });

    expect(result.nick).toBe("Milyashac_herry");
    expect(result.sourceType).toBe("tlauncher");
    expect(result.profileUrl).toContain("tlauncher.org/ru/skin/Milyashac_herry");
  });

  it("returns public site settings successfully", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.settings.get();
    expect(settings).toBeDefined();
    expect(settings?.title).toBe("SmailLabs");
  });
});
