import { describe, expect, it } from "vitest";

import { classify, cleanHint } from "./kind";

describe("Kind mode", () => {
  it("holds threats at every level", () => {
    expect(classify({ text: "I will find you after class" }, 0)).toBe("Threat");
    expect(classify({ text: "just kys" }, 0)).toBe("Threat");
  });

  it("lets everyday messages through", () => {
    for (const text of ["You were amazing at the dinner", "Funny · Loyal · Chaotic", "You're the GOAT honestly", "I mean it, you look great", "an ode to your jollof"])
      expect(classify({ text }, 2)).toBeNull();
  });

  it("holds insults, body shaming and spam on Standard", () => {
    expect(classify({ text: "You're such a mumu" }, 1)).toBe("Insult");
    expect(classify({ text: "Nobody likes you, they just tolerate you" }, 1)).toBe("Insult");
    expect(classify({ text: "Loud · Bossy · Ugly" }, 1)).toBe("Body shaming");
    expect(classify({ text: "Earn 5k daily, visit www.cashout.xyz" }, 1)).toBe("Spam");
    expect(classify({ text: "WHY ARE YOU ALWAYS LIKE THIS SERIOUSLY" }, 1)).toBe("Shouting");
  });

  it("keeps teasing for Kind only", () => {
    expect(classify({ text: "Loud · Bossy · Annoying" }, 1)).toBeNull();
    expect(classify({ text: "Loud · Bossy · Annoying" }, 2)).toBe("Maybe rude");
    expect(classify({ text: "Honest rating", score: 3 }, 1)).toBeNull();
    expect(classify({ text: "Honest rating", score: 3 }, 2)).toBe("Low rating");
  });

  it("only threats are held when it's off, but your own hidden words always are", () => {
    expect(classify({ text: "You're such a mumu" }, 0)).toBeNull();
    expect(classify({ text: "that dress was fake" }, 0, ["fake"])).toBe("Hidden word");
  });
});

describe("sender hints", () => {
  it("strips handles and numbers", () => {
    expect(cleanHint("I'm @tolu_x, call 0803 555 1234")).toBe("I'm call");
    expect(cleanHint("  we met   this year ")).toBe("we met this year");
  });
});
