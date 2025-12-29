export function expectTimestampLike(x: any) {
  const isIsoString = typeof x === "string" && x.includes("T") && x.endsWith("Z");

  const isTimestampObject =
    typeof x === "object" &&
    x !== null &&
    (typeof x.toDate === "function" || typeof x.seconds === "number");

  expect(isIsoString || isTimestampObject).toBe(true);
}
