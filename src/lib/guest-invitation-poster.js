import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import {
  Document,
  Font,
  Image,
  Page,
  Text,
  renderToBuffer,
} from '@react-pdf/renderer';

const MM = (value) => value * 2.835;
const POSTER_WIDTH = MM(101.6);
const POSTER_HEIGHT = MM(152.4);

let cachedBackgroundDataUrl = null;

Font.register({
  family: 'GuestInvitationInter',
  src: path.join(
    process.cwd(),
    'public',
    'fonts',
    'inter',
    'Inter-Regular.ttf'
  ),
});

async function getBackgroundDataUrl() {
  if (cachedBackgroundDataUrl) {
    return cachedBackgroundDataUrl;
  }

  const image = await fs.readFile(
    path.join(
      process.cwd(),
      'public',
      'img',
      'tasi-guest-invitation-background.png'
    )
  );
  cachedBackgroundDataUrl = `data:image/png;base64,${image.toString('base64')}`;
  return cachedBackgroundDataUrl;
}

function GuestInvitationPosterPage({ name, backgroundDataUrl }) {
  const guestName = String(name || 'Guest').trim() || 'Guest';
  const greetingFontSize = guestName.length > 24 ? 7.6 : 9.1;

  return React.createElement(
    Page,
    {
      size: [POSTER_WIDTH, POSTER_HEIGHT],
      style: { backgroundColor: '#49112f' },
    },
    React.createElement(Image, {
      alt: '',
      src: backgroundDataUrl,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
      },
    }),
    React.createElement(
      Text,
      {
        style: {
          position: 'absolute',
          top: 99.5,
          left: 20,
          width: POSTER_WIDTH - 40,
          fontFamily: 'GuestInvitationInter',
          fontSize: greetingFontSize,
          lineHeight: 1.4,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      `Dear ${guestName},`
    ),
    React.createElement(
      Text,
      {
        style: {
          position: 'absolute',
          top: 122,
          left: 21,
          width: POSTER_WIDTH - 42,
          fontFamily: 'GuestInvitationInter',
          fontSize: 8.2,
          lineHeight: 1.4,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      'We would be delighted to welcome you as a special guest at the Trust & Safety India Festival 2026.'
    ),
    React.createElement(
      Text,
      {
        style: {
          position: 'absolute',
          top: 157,
          left: 21,
          width: POSTER_WIDTH - 42,
          fontFamily: 'GuestInvitationInter',
          fontSize: 8.2,
          lineHeight: 1.4,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      'Join us in New Delhi on 14-15 October 2026 for meaningful conversations, collaboration, and a shared commitment to safer digital spaces.'
    ),
    React.createElement(
      Text,
      {
        style: {
          position: 'absolute',
          top: 199,
          left: 21,
          width: POSTER_WIDTH - 42,
          fontFamily: 'GuestInvitationInter',
          fontSize: 8.2,
          lineHeight: 1.4,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      'With warm regards,'
    )
  );
}

export async function buildGuestInvitationPoster({ name }) {
  const backgroundDataUrl = await getBackgroundDataUrl();
  const pdfBuffer = await renderToBuffer(
    React.createElement(
      Document,
      null,
      React.createElement(GuestInvitationPosterPage, {
        name,
        backgroundDataUrl,
      })
    )
  );

  return {
    filename: 'TASI-2026-guest-invitation.pdf',
    pdfBuffer,
  };
}
