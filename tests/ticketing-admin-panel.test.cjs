const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("ticketing admin panel supports expanding buyer details from a ticket record", () => {
  const source = readFile("src/components/admin/ticketing-admin-panel.jsx");

  assert.match(source, /const \[expandedTicketId, setExpandedTicketId\] = useState\(null\)/);
  assert.match(source, /onClick=\{\(\) =>\s*setExpandedTicketId/);
  assert.match(source, /Buyer Details/);
  assert.match(source, /Billing Address/);
  assert.match(source, /Payment IDs/);
});
