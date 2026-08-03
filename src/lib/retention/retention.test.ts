import { describe, expect, it } from "vitest";
import {
  getRetentionCutoffDate,
  getRetentionCutoffDays,
} from "@/lib/retention/types";

describe("retention cutoff", () => {
  it("default days is 365 when env missing/invalid", () => {
    expect(getRetentionCutoffDays(undefined)).toBe(365);
    expect(getRetentionCutoffDays("")).toBe(365);
    expect(getRetentionCutoffDays("0")).toBe(365);
    expect(getRetentionCutoffDays("-3")).toBe(365);
    expect(getRetentionCutoffDays("90")).toBe(90);
  });

  it("cutoff is N days before now (UTC date arithmetic)", () => {
    const now = new Date("2026-08-02T15:00:00.000Z");
    const cutoff = getRetentionCutoffDate(365, now);
    expect(cutoff.toISOString()).toBe("2025-08-02T15:00:00.000Z");
  });
});
