const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Guards the homepage map's responsive layout: losing these rules squeezes
// the heading and intro into two narrow columns on phones.
test('the speaker map keeps its tablet and phone layout rules', () => {
  const css = fs.readFileSync(
    path.join(
      process.cwd(),
      'src/components/home/speaker-countries-map.module.css'
    ),
    'utf8'
  );

  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /@media \(max-width: 850px\)/);
  assert.match(
    css,
    /@media \(max-width: 639px\)[\s\S]*\.headingRow \{[\s\S]*flex-direction: column/
  );
});
