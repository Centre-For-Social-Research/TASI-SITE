const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repoPath = (...segments) => path.join(process.cwd(), ...segments);
const read = (...segments) => fs.readFileSync(repoPath(...segments), 'utf8');
const loadData = (relativePath) =>
  import(pathToFileURL(repoPath(...relativePath)).href);

test('get involved family routes delegate to tracked page components', () => {
  const routes = [
    {
      path: ['src', 'app', 'get-involved', 'page.jsx'],
      component: 'GetInvolvedPage',
      metadata: 'getInvolvedMetadata',
      forbidden: ['involvementOptions', 'quickLinks'],
    },
    {
      path: ['src', 'app', 'speaker-application', 'page.jsx'],
      component: 'SpeakerApplicationPage',
      metadata: 'speakerApplicationMetadata',
      forbidden: ['homepageHighlights', 'proofPoints', 'mediaLogos'],
    },
    {
      path: ['src', 'app', 'volunteer-application', 'page.jsx'],
      component: 'VolunteerApplicationPage',
      metadata: 'volunteerApplicationMetadata',
      forbidden: ['volunteerBenefits', 'volunteerGallery', 'processSteps'],
    },
    {
      path: ['src', 'app', 'exhibition', 'page.jsx'],
      component: 'ExhibitionPage',
      metadata: 'exhibitionMetadata',
      forbidden: ['participationModes', 'extendedBranding', 'proofPoints'],
    },
    {
      path: ['src', 'app', 'media', 'page.jsx'],
      component: 'MediaPage',
      metadata: 'mediaMetadata',
      forbidden: ['mediaResources', 'pressConferenceHighlights'],
    },
    {
      path: ['src', 'app', 'contact', 'page.jsx'],
      component: 'ContactPage',
      metadata: 'contactMetadata',
      forbidden: ['sponsorshipContacts'],
    },
  ];

  for (const route of routes) {
    const source = read(...route.path);
    assert.match(source, new RegExp(`return <${route.component} \\/>`));
    assert.match(source, new RegExp(`metadata = ${route.metadata}`));
    for (const token of route.forbidden) {
      assert.doesNotMatch(source, new RegExp(`const ${token}`));
    }
  }
});

test('media resource subpages share one tracked resource-list component', () => {
  const pressKitSource = read('src', 'app', 'media', 'press-kit', 'page.jsx');
  const pressReleasesSource = read(
    'src',
    'app',
    'media',
    'press-releases',
    'page.jsx'
  );
  const resourceComponent = read(
    'src',
    'components',
    'media',
    'media-resource-list-page.jsx'
  );

  assert.match(pressKitSource, /MediaResourceListPage/);
  assert.match(pressKitSource, /pressKitPage/);
  assert.match(pressReleasesSource, /MediaResourceListPage/);
  assert.match(pressReleasesSource, /pressReleasesPage/);
  assert.match(resourceComponent, /page\.files\.map/);
  assert.match(resourceComponent, /Open Document/);
});

test('get involved data owns live parent-page participation paths', async () => {
  const data = await loadData(['src', 'data', 'get-involved-page.js']);

  assert.equal(data.getInvolvedMetadata.title, 'Get Involved at TASI 2026');
  assert.equal(data.getInvolvedHero.eyebrow, 'Get Involved');
  assert.equal(data.getInvolvedQuickLinks.length, 4);
  assert.equal(data.involvementOptions.length, 12);
  assert.ok(
    data.involvementOptions.some((item) => item.href === '/speaker-application')
  );
  assert.ok(
    data.involvementOptions.some(
      (item) => item.href === '/volunteer-application'
    )
  );
  assert.ok(
    data.involvementOptions.some((item) => item.href === '/exhibition')
  );
  assert.ok(
    data.involvementOptions.some(
      (item) => item.href === '/media#media-accreditation'
    )
  );
  assert.ok(
    data.involvementOptions.some(
      (item) => item.href === '/sponsor#sponsorship-tiers'
    )
  );
});

test('application page data owns speaker, volunteer, media, and contact datasets', async () => {
  const speaker = await loadData([
    'src',
    'data',
    'speaker-application-page.js',
  ]);
  const volunteer = await loadData([
    'src',
    'data',
    'volunteer-application-page.js',
  ]);
  const media = await loadData(['src', 'data', 'media-page.js']);
  const contact = await loadData(['src', 'data', 'contact-page.js']);

  assert.equal(speaker.speakerHighlightSeeds.length, 15);
  assert.equal(speaker.speakerApplicationProofPoints.length, 4);
  assert.equal(speaker.speakerApplicationMediaLogos.length, 6);

  assert.equal(volunteer.volunteerBenefits.length, 4);
  assert.equal(volunteer.volunteerGallery.length, 4);
  assert.equal(volunteer.volunteerProcessSteps.length, 3);
  assert.ok(
    volunteer.volunteerGallery.some((item) =>
      item.src.endsWith('volunteer-checkin.webp')
    )
  );

  assert.equal(media.mediaResources.length, 4);
  assert.equal(media.pressKitPage.files.length, 2);
  assert.equal(media.pressReleasesPage.files.length, 4);
  assert.ok(
    media.pressReleasesPage.files.some(
      (item) => item.href === '/downloads/media-invite-tasi-2025.pdf'
    )
  );

  assert.equal(contact.sponsorshipContacts.length, 4);
  assert.equal(contact.generalContact.email, 'info1@csrindia.org');
});

test('get involved components consume shared data without reintroducing inline lists', () => {
  const parentPage = read(
    'src',
    'components',
    'get-involved',
    'get-involved-page.jsx'
  );
  const speakerPage = read(
    'src',
    'components',
    'speakers',
    'speaker-application-page.jsx'
  );
  const volunteerPage = read(
    'src',
    'components',
    'volunteers',
    'volunteer-application-page.jsx'
  );
  const mediaPage = read('src', 'components', 'media', 'media-page.jsx');

  assert.match(parentPage, /InvolvementCard/);
  assert.match(parentPage, /involvementOptions\.map/);
  assert.doesNotMatch(parentPage, /const involvementOptions/);

  assert.match(speakerPage, /speakerHighlightSeeds/);
  assert.match(speakerPage, /SpeakerApplicationForm/);
  assert.doesNotMatch(speakerPage, /const homepageHighlights/);

  assert.match(volunteerPage, /volunteerGallery\.map/);
  assert.match(volunteerPage, /VolunteerApplicationForm/);
  assert.doesNotMatch(volunteerPage, /const volunteerBenefits/);

  assert.match(mediaPage, /MediaAccreditationSection/);
  assert.match(mediaPage, /mediaResources\.map/);
  assert.doesNotMatch(mediaPage, /const mediaResources/);
});

test('unused get involved media and asset iterations stay removed', () => {
  const removedArtifacts = [
    ['public', 'img', 'volunteers', 'volunteer-team.jpg'],
    ['public', 'img', 'volunteers', 'volunteer-partners.webp'],
    ['public', 'img', 'Exhibition', '7T7A3162.webp'],
    [
      'public',
      'img',
      'Exhibition',
      'WhatsApp Image 2026-04-14 at 8.17.10 PM.webp',
    ],
    [
      'public',
      'downloads',
      'media-invite-india-trust-safety-festival-2025.pdf',
    ],
    ['public', 'downloads', 'Press Conference - Flow of events.docx.pdf'],
  ];

  for (const artifact of removedArtifacts) {
    assert.equal(
      fs.existsSync(repoPath(...artifact)),
      false,
      `Expected ${artifact.join('/')} to stay removed.`
    );
  }
});
