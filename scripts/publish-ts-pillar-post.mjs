import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_TOKEN;

let k = 0;
const key = () => `tsblock${(k++).toString().padStart(3, '0')}`;

const block = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: `${key()}s`, text, marks: [] }],
});

const h2 = (t) => block(t, 'h2');
const p = (t) => block(t);

const body = [
  p(
    'Every time you report a harassing comment, recover a hacked account, or scroll a feed without stumbling into graphic violence, you are seeing trust and safety at work. It is one of the most consequential disciplines on the internet, and one of the least understood. In the past few weeks alone, it has been at the centre of Apple’s biggest product announcements, a breach affecting more than twenty thousand Instagram accounts, a new American federal law, and a privacy standoff in the United Kingdom. This post explains what trust and safety actually is, and uses those four stories to show why it now sits at the heart of how the internet is governed.'
  ),

  h2('What is trust and safety?'),
  p(
    'Trust and safety, often shortened to T&S, is the work of protecting people from harm on digital platforms. The name covers a lot of ground, but the core of it is simple: someone has to decide what a platform allows, build the systems and teams that enforce those rules, and pick up the pieces when something slips through. A trust and safety team is usually doing all three at once.'
  ),
  p(
    'The day-to-day work is more varied than most people imagine. The most visible part is content moderation, the removal of hate speech, harassment, misinformation, and graphic or illegal material. But the same teams are also responsible for keeping children safe from grooming and exploitation, stopping account takeovers and impersonation scams, and fighting the spread of intimate images shared without consent, a problem that generative AI has made dramatically worse. And sitting underneath all of it is policy work: taking laws as different as India’s IT Rules, the EU’s Digital Services Act, and the US Take It Down Act, and turning them into systems that actually function at the scale of millions of users.'
  ),
  p(
    'A useful way to think about it: cybersecurity protects systems from attackers, while trust and safety protects people from each other, and increasingly from the misuse of the platforms’ own tools. Four stories from recent weeks show exactly what that means.'
  ),

  h2('Apple puts child safety at the centre of the operating system'),
  p(
    'At WWDC in June 2026, Apple made trust and safety one of the pillars of its keynote, previewing a suite of child safety features arriving with iOS 27 this autumn. Child Accounts now apply age-tailored safeguards across the whole system. A new Ask to Browse mode requires parental approval before a child visits a website for the first time. Time Allowances give parents per-app and per-category time controls. And Communication Safety, which detects and blurs nudity in Messages and FaceTime, is now on by default for everyone under 18, and has been extended to intervene on violent and graphic content as well.'
  ),
  p(
    'The significance is bigger than any single feature. The world’s most valuable company is treating safety not as a settings page buried five menus deep, but as core product architecture. That is what mature trust and safety looks like: protection designed in, not bolted on.'
  ),

  h2('Meta’s AI support bot and the 20,000 hijacked Instagram accounts'),
  p(
    'In June 2026, Meta disclosed that 20,225 Instagram accounts were compromised after attackers abused its AI-powered support system. A bug meant the system failed to verify that the email address supplied in a password-reset conversation actually belonged to the account in question. As a result, attackers could simply talk the chatbot into sending reset links for accounts they did not own, and in some cases change the account email entirely. The flaw went unnoticed for over six weeks. Hijacked accounts, including high-profile and verified ones, were resold on dark-web marketplaces.'
  ),
  p(
    'Two lessons stand out. First, AI agents are now part of the attack surface: when you give a chatbot the power to reset passwords, a prompt becomes a weapon, and every capability you grant it must be verified as rigorously as a human support agent’s. Second, basic hygiene still works: Meta confirmed that accounts with two-factor authentication enabled could not be entered even after a successful password reset. Trust and safety failures are rarely exotic; they are usually a missing check in an overlooked code path.'
  ),

  h2('The Take It Down Act: image-based abuse becomes a legal obligation'),
  p(
    'In the United States, the Take It Down Act, signed in May 2025, reached its compliance deadline on 19 May 2026. Platforms that host user-generated content must now operate a notice-and-takedown process for non-consensual intimate imagery, including AI-generated deepfakes, and remove reported content within 48 hours, along with reasonable efforts to remove known copies. The Federal Trade Commission has signalled aggressive enforcement, with civil penalties that can exceed $50,000 per violation.'
  ),
  p(
    'For years, removing intimate images shared without consent depended on platform goodwill and survivors’ persistence. That era is ending: takedown is becoming a legal duty with a clock attached. For trust and safety teams, this converts policy into engineering: intake forms, identity verification for reporters, hash-matching to catch re-uploads, and audit trails for regulators. It is a template other countries, India included, are watching closely. The Centre for Social Research has long advocated for exactly these protections for women and girls online.'
  ),

  h2('The UK’s scanning order: when safety and surveillance collide'),
  p(
    'Not every government intervention in the name of safety is welcomed by the safety community. In June 2026, the UK government announced that content on devices sold or used in the country should be scanned for nudity, combining age verification with on-device “client-side” scanning under powers linked to the Online Safety Act, with companies given until September to comply. The backlash was immediate. Signal warned the plan “endangers us all” and, alongside WhatsApp, has said it would leave the UK rather than weaken encryption. Cryptographers have repeatedly warned that scanning every message before encryption creates vulnerabilities that make everyone less safe.'
  ),
  p(
    'This is the hardest debate in trust and safety today: child protection and private communication are both legitimate, vital goals, and crude mandates can damage both at once. Getting this balance right requires technologists, policymakers, child-safety advocates, and civil-liberties experts in the same room, not talking past each other.'
  ),

  h2('Why this matters for India'),
  p(
    'India is the world’s largest open internet market, with nearly a billion users, dozens of languages, and some of the highest rates of platform adoption anywhere. Every issue above, from child safety defaults and AI-driven account compromise to image-based abuse and encryption policy, plays out here at unmatched scale, yet most global trust and safety frameworks are written elsewhere. India needs its own convening space where government, industry, academia, and civil society shape these answers together.'
  ),
  p(
    'That is what the Trust and Safety India Festival exists to do. TASI 2026, convened by the Centre for Social Research, takes place on 14–15 October 2026 at the India International Centre, New Delhi, bringing together the people building, regulating, and studying online safety. If the four stories in this post matter to your work, or to your family’s life online, that conversation is yours too. Registration is open at trustandsafetyindia.org/register.'
  ),
];

const doc = {
  _id: 'post-what-is-trust-and-safety',
  _type: 'post',
  title: 'What is Trust and Safety? Apple, Meta, and Two Governments Just Showed Us',
  slug: { _type: 'slug', current: 'what-is-trust-and-safety' },
  excerpt:
    'Apple’s new child safety features, a Meta AI flaw that hijacked 20,000 Instagram accounts, the US Take It Down Act, and the UK’s scanning order: four stories that explain what trust and safety really means.',
  publishedAt: '2026-06-12T09:00:00+05:30',
  author: 'Saquib Jamil',
  category: 'COMMENTARY',
  image: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-8b2843183aba3d2779fe179ab5078c298c4fac0e-1536x1024-png',
    },
  },
  body,
};

const res = await fetch(
  `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
  }
);

const json = await res.json();
console.log(res.status, JSON.stringify(json, null, 2));
