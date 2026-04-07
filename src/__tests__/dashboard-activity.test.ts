import { afterEach, describe, expect, it, vi } from "vitest";

import { goApi } from "@/lib/api/client";
import {
  fetchDashboardActivity,
  normalizeActivityEntry,
  unwrapEntries,
} from "@/lib/dashboard/dashboard-snapshot";
import {
  buildDashboardBrief,
  mapDashboardActivity,
} from "@/lib/dashboard/view-models";

describe("normalizeActivityEntry", () => {
  it("accepts camelCase entry fields", () => {
    expect(
      normalizeActivityEntry({
        id: 7,
        accountId: 12,
        amount: 2450,
        currency: "USD",
        createdAt: "2026-04-07T12:00:00Z",
        transferId: 44,
        counterpartAccountId: 19,
        counterpartOwner: "mariam",
        counterpartCurrency: "EGP",
      }),
    ).toEqual({
      id: 7,
      accountId: 12,
      amount: 2450,
      currency: "USD",
      createdAt: "2026-04-07T12:00:00Z",
      transferId: 44,
      counterpartAccountId: 19,
      counterpartOwner: "mariam",
      counterpartCurrency: "EGP",
    });
  });

  it("accepts snake_case entry fields", () => {
    expect(
      normalizeActivityEntry({
        id: 8,
        account_id: 13,
        amount: -9900,
        currency: "EUR",
        created_at: "2026-04-07T12:00:00Z",
        transfer_id: 55,
        counterpart_account_id: 2,
        counterpart_owner: "omar",
        counterpart_currency: "USD",
      }),
    ).toEqual({
      id: 8,
      accountId: 13,
      amount: -9900,
      currency: "EUR",
      createdAt: "2026-04-07T12:00:00Z",
      transferId: 55,
      counterpartAccountId: 2,
      counterpartOwner: "omar",
      counterpartCurrency: "USD",
    });
  });

  it("accepts stringified int64 fields", () => {
    expect(
      normalizeActivityEntry({
        id: "9",
        account_id: "13",
        amount: "-9900",
        currency: "EUR",
        created_at: "2026-04-07T12:00:00Z",
        transfer_id: "55",
        counterpart_account_id: "2",
        counterpart_owner: "omar",
        counterpart_currency: "USD",
      }),
    ).toEqual({
      id: 9,
      accountId: 13,
      amount: -9900,
      currency: "EUR",
      createdAt: "2026-04-07T12:00:00Z",
      transferId: 55,
      counterpartAccountId: 2,
      counterpartOwner: "omar",
      counterpartCurrency: "USD",
    });
  });

  it("returns null for malformed payloads", () => {
    expect(
      normalizeActivityEntry({
        id: 1,
        amount: 100,
        currency: "USD",
      }),
    ).toBeNull();
  });
});

describe("unwrapEntries", () => {
  it("unwraps the standard entries envelope", () => {
    expect(
      unwrapEntries({
        entries: [
          {
            id: 1,
            account_id: 7,
            amount: 100,
            currency: "USD",
            created_at: "2026-04-07T12:00:00Z",
          },
        ],
      }),
    ).toHaveLength(1);
  });

  it("tolerates fallback envelope shapes", () => {
    expect(
      unwrapEntries({
        items: [
          {
            id: 2,
            accountId: 7,
            amount: 100,
            currency: "USD",
            createdAt: "2026-04-07T12:00:00Z",
          },
        ],
      }),
    ).toHaveLength(1);
  });

  it("returns empty array for malformed payloads", () => {
    expect(unwrapEntries({ entries: [{ nope: true }] })).toEqual([]);
    expect(unwrapEntries({})).toEqual([]);
  });
});

describe("mapDashboardActivity", () => {
  const now = new Date("2026-04-07T12:05:00Z");

  it("maps positive amounts to credit transfer copy", () => {
    const [item] = mapDashboardActivity(
      [
        {
          id: 1,
          accountId: 9,
          amount: 2500,
          currency: "USD",
          createdAt: "2026-04-07T12:00:00Z",
          transferId: 99,
          counterpartAccountId: 44,
          counterpartOwner: "noura",
          counterpartCurrency: "EUR",
        },
      ],
      now,
    );

    expect(item.direction).toBe("credit");
    expect(item.title).toBe("Transfer received");
    expect(item.detail).toContain("noura");
    expect(item.detail).toContain("0044");
    expect(item.detail).toContain("EUR");
    expect(item.amount).toBe("+$25.00");
    expect(item.time).toBe("5 minutes ago");
  });

  it("maps negative amounts to debit transfer copy", () => {
    const [item] = mapDashboardActivity(
      [
        {
          id: 2,
          accountId: 9,
          amount: -1250,
          currency: "USD",
          createdAt: "2026-04-07T12:00:00Z",
          transferId: 101,
          counterpartAccountId: 88,
          counterpartOwner: "salma",
          counterpartCurrency: "EGP",
        },
      ],
      now,
    );

    expect(item.direction).toBe("debit");
    expect(item.title).toBe("Transfer sent");
    expect(item.detail).toContain("salma");
    expect(item.amount).toBe("-$12.50");
  });

  it("maps missing transfer_id to account adjustment", () => {
    const [item] = mapDashboardActivity(
      [
        {
          id: 3,
          accountId: 9,
          amount: 1000,
          currency: "USD",
          createdAt: "2026-04-07T12:00:00Z",
          transferId: null,
          counterpartAccountId: null,
          counterpartOwner: null,
          counterpartCurrency: null,
        },
      ],
      now,
    );

    expect(item.title).toBe("Account adjustment");
    expect(item.detail).toBe("Balance updated on this account.");
  });

  it("falls back to neutral transfer copy when counterpart fields are missing", () => {
    const [item] = mapDashboardActivity(
      [
        {
          id: 4,
          accountId: 9,
          amount: -2000,
          currency: "USD",
          createdAt: "2026-04-07T12:00:00Z",
          transferId: 10,
          counterpartAccountId: null,
          counterpartOwner: null,
          counterpartCurrency: null,
        },
      ],
      now,
    );

    expect(item.detail).toBe("Transfer sent to another account.");
  });
});

describe("dashboard helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps existing brief behavior unchanged", () => {
    expect(
      buildDashboardBrief(
        [
          {
            id: 1,
            owner: "ahmed",
            balance: 123456,
            currency: "USD",
            createdAt: "2026-01-01T00:00:00Z",
          },
        ],
        true,
      ),
    ).toHaveLength(4);
  });

  it("degrades to empty activity when the API call fails", async () => {
    vi.spyOn(goApi, "listEntries").mockRejectedValue(new Error("boom"));

    await expect(fetchDashboardActivity()).resolves.toEqual([]);
  });
});
