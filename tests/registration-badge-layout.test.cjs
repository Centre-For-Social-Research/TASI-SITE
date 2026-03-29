const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getBadgeTierTheme,
  normalizeBadgeSingleLine,
} = require("../src/lib/registration-badge-layout.cjs");

test("uses the registration badge color hex for the tier bar theme", () => {
  assert.deepEqual(
    getBadgeTierTheme({
      badgeColorHex: "#6D28D9",
      badgeColorLabel: "Purple",
    }),
    {
      label: "PURPLE TIER",
      fillColor: [109, 40, 217],
      dotColor: [109, 40, 217],
      textColor: [255, 255, 255],
    },
  );
});

test("normalizes badge text to a single trimmed line", () => {
  assert.equal(
    normalizeBadgeSingleLine("Centre For Social\n Research   "),
    "Centre For Social Research",
  );
});

test("truncates overly long single-line badge text with an ellipsis", () => {
  assert.equal(
    normalizeBadgeSingleLine("An Extremely Long Organization Name That Will Not Fit", 24),
    "An Extremely Long Organ…",
  );
});
