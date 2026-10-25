import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const screensIn = (dir) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(dir, f));
const consultScreens = [...screensIn("app/(tabs)/consult"), ...screensIn("app/midwife"), "app/call.tsx"];
const consultComponents = [
  "AppointmentSummary",
  "BookingPickers",
  "ConsultationRow",
  "JoinCallButton",
  "HoldCountdown",
  "MidwifeAvatar",
  "MidwifeUnavailable",
  "ScreenHeader",
  "SlotPicker",
  "StatusChip",
].map((name) => `components/${name}.tsx`);
const files = [...consultScreens, ...consultComponents];

test("the consult flow draws icons only from components/icons", () => {
  const offenders = files.filter((f) =>
    readFileSync(join(root, f), "utf8").includes("@expo/vector-icons"),
  );
  assert.deepEqual(offenders, [], "use <Icon>/<IconBadge> instead of vector-icon fonts");
  assert.ok(files.length > 15, `expected to scan the consult flow, scanned ${files.length}`);
});
