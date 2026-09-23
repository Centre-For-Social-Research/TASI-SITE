const test = require('node:test');
const assert = require('node:assert/strict');
const {
  renderInternalNotificationHtml,
} = require('../src/lib/internal-notification-email.cjs');

test('internal notifications use the festival design and left-align long submissions', () => {
  const html = renderInternalNotificationHtml({
    subject: 'New speaker application',
    text: 'Speaker application for TASI 2026\nName: Example Guest\nEmail: guest@example.com\n\nPitch:\nA long proposal\n\nwith another paragraph.',
  });

  assert.match(html, /cid:tasi-logo/);
  assert.match(html, /cid:tasi-delhi-footer/);
  assert.match(html, /Team notification/);
  assert.match(html, /text-align:left/);
  assert.match(html, /word-break:break-word/);
  assert.match(html, /Speaker application for TASI 2026/);
  assert.match(html, /border-radius:10px/);
  assert.match(html, /Name<\/div><div[^>]*>Example Guest/);
  assert.match(html, /Email<\/div><div[^>]*>guest@example.com/);
  assert.match(html, /<h2[^>]*>Pitch<\/h2>/);
  assert.match(html, /A long proposal<\/p><div[^>]*>&nbsp;<\/div><p/);
  assert.match(html, /with another paragraph\.<\/p>/);
});

test('internal notification text and subject are HTML escaped', () => {
  const html = renderInternalNotificationHtml({
    subject: 'New <script> & application',
    text: 'Name: <img src=x onerror=alert(1)> & details\n\nMessage:\n<script>alert(1)</script>',
  });

  assert.match(html, /New &lt;script&gt; &amp; application/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; details/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>|<img src=x/);
});

test('short notifications keep follow-up notes below their details', () => {
  const html = renderInternalNotificationHtml({
    subject: 'New newsletter subscriber',
    text: 'A new subscriber joined.\nEmail: person@example.com\nSource: website footer\nNo action needed.',
  });

  assert.ok(
    html.indexOf('person@example.com') < html.indexOf('No action needed.')
  );
  assert.match(html, /<p[^>]*>No action needed\.<\/p>/);
});
