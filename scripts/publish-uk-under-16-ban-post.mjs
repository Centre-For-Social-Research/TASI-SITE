import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim(),
    ])
);

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_TOKEN;

let k = 0;
const key = () => `ukblock${(k++).toString().padStart(3, '0')}`;

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
    'On 15 June 2026, the United Kingdom became the second country in the world, after Australia, to commit to banning children under 16 from major social media platforms. Prime Minister Keir Starmer announced what the government calls an "Australia-plus" policy: TikTok, Snapchat, Instagram, YouTube, Facebook, and X will be closed to under-16s, with regulations promised before Christmas and enforcement from spring 2027. Messaging apps like WhatsApp and Signal are exempt. Gaming, livestreaming, stranger contact, and romantic AI chatbots all face new restrictions on top.'
  ),
  p(
    'The decision follows a national consultation that drew more than 116,000 responses, with around 90% of parents backing a minimum age of 16. It also follows months of grief-driven campaigning, expert dissent, an intervention from the White House, and a steady drumbeat of warnings from the very child-safety organisations the policy is meant to serve. The reaction has been anything but unanimous.'
  ),
  p(
    'TASI does not take a position on whether Britain made the right call. That is a question for British voters and Parliament. But the episode is a near-perfect case study in the questions our community exists to ask. Strip away the politics and what remains is a hard problem in platform governance: how do you protect children from genuine, documented harm without creating new harms of your own? And what should a country like India learn from watching others try?'
  ),

  h2('What was actually announced'),
  p(
    'The ban targets "user-to-user" platforms whose purpose is social interaction and algorithmic distribution of user content. Beyond the headline prohibition, the "Australia-plus" measures are striking in their breadth: livestreaming blocked for children across apps including gaming platforms; mandatory blocks on adult strangers contacting minors; restrictions on disappearing messages and location sharing; a ban on under-18s using romantic or sexual AI chatbots; and default protections for 16- and 17-year-olds to avoid a "cliff edge" the moment a teenager turns 16. Overnight curfews for older teens are reportedly still under consideration.'
  ),
  p(
    'Crucially, liability sits with platforms, not children or parents. Ofcom, the regulator empowered by the 2023 Online Safety Act, will enforce compliance, with fines modelled on Australia’s regime of up to roughly £25 million. Enforcement hinges on "highly effective age assurance", the unglamorous, contested machinery of actually proving how old a user is.'
  ),

  h2('The evidence the policy rests on'),
  p(
    'It would be wrong to treat this as a moral panic with no foundation. The harms are real and measurable. Research cited around the announcement found that nearly half of UK girls had encountered harmful social-media content in a single week, and that roughly a third of teenagers had seen high-risk suicide, self-harm, or eating-disorder material. Exposure had barely improved since the Online Safety Act came into force. Surveys of young people themselves found that a large majority believed restricting high-risk features would make them safer.'
  ),
  p(
    'That last point matters. The most useful finding in the consultation is not that adults want a ban; it is that many young people agree the most harmful features should be reined in, while still wanting space to communicate, learn, and create. The disagreement is rarely about whether harm exists. It is about whether a blanket age ban is the instrument that best reduces it.'
  ),

  h2('Who is backing it'),
  p(
    'The strongest support comes from bereaved families who have campaigned for years for tougher action, and from ministers who frame the ban as a stand against an industry that has run out of chances. Their case is moral and urgent: the status quo is failing children, and incremental fixes have not moved the needle fast enough.'
  ),
  p(
    'Esther Ghey, mother of the murdered teenager Brianna Ghey, has backed raising the age for social media, arguing that platforms as they stand represent a serious risk to under-16s. Lisa Kenevan, whose son Isaac died at 13, welcomed the announcement and the engagement behind it. Ellen Roome, whose son Jools is believed to have died after an online challenge, has pressed for genuinely strong age verification that extends to gaming sites. Their voices have carried weight precisely because they speak from loss, not theory.'
  ),
  p(
    'Campaigners and ministers have amplified that message. Daisy Greenwell of Smartphone Free Childhood noted how quickly the political winds had shifted on an idea that once seemed remote. Culture Secretary Lisa Nandy argued that tech firms have had more than enough time to put their house in order, and that even an imperfect ban can drive a worthwhile cultural change. Technology Secretary Liz Kendall framed the policy as taking power away from the tech giants and handing it back to parents. Even some safety insiders are sympathetic: Arturo Béjar, a former Meta engineer turned whistleblower, supports keeping under-16s off genuinely unsafe platforms, provided it comes with enforceable safety standards and compliance deadlines.'
  ),

  h2('The case against comes from inside the house'),
  p(
    'The most striking feature of the opposition is who it comes from. Not only technology companies defending their revenue, but many of the child-safety experts the policy is meant to serve. Ian Russell, father of Molly Russell and chair of the Molly Rose Foundation, called sledgehammer techniques like bans likely to cause more problems than they solve, and described a rushed, politically timed policy as gambling with young people’s lives. The foundation’s chief executive, Andy Burrows, warned that an unenforceable ban will quickly unravel, leaving parents with a false sense of safety while the majority of children keep using high-risk sites that have no new incentive to make themselves safer. The NSPCC has made a related argument: force platforms to fix their products rather than simply removing children from them.'
  ),
  p(
    'Privacy and civil-liberties voices raise a different alarm. Big Brother Watch warned that the price of admission to the internet will now be ID checks, and that weakening online anonymity is a step authoritarian regimes can only dream of. Professor Alan Woodward, a cybersecurity expert, put the technical reality plainly: age-verifying children means age-verifying everyone, and creates scope-creep risks as well as a whack-a-mole contest with VPNs. The Electronic Frontier Foundation argues that the underlying Online Safety Act has not made children meaningfully safer.'
  ),
  p(
    'Industry and international voices round out the picture. The Computer and Communications Industry Association warned that blanket feature restrictions could push children towards riskier, unregulated alternatives, while techUK reported a broad consensus against the ban among its members in favour of universal standards for unsafe features. Meta, already seeking judicial review of Ofcom’s fines regime, proposes age verification at the device or app-store level instead. The White House formally urged Britain not to proceed, objecting to one-size-fits-all restrictions and disproportionate compliance burdens on American companies, an intervention the government has said will not change its course.'
  ),
  p(
    'Perhaps the most pointed criticism comes from those watching Australia. Colm Gannon of the International Centre for Missing and Exploited Children in Australia says simply that he does not think the ban is working, and that it risks pushing teenagers into unmoderated spaces beyond the reach of parental controls. Britain’s own Science and Technology Committee, chaired by Chi Onwurah, said it was not convinced by an Australia-style ban and worried about the cliff edge at 16 and the difficulty of defining what actually gets blocked.'
  ),
  p(
    'Australia’s early results give those worries teeth. Millions of accounts were deactivated in the first days of its ban, yet the country’s own e-safety regulator concedes that a substantial proportion of under-16s still have access, with some research suggesting a majority retain it through fake IDs, VPNs, and workarounds. A ban that the majority of its intended subjects can circumvent may shift behaviour into less-moderated spaces, exactly where protections are weakest. There is a real prospect of moving children from imperfectly governed platforms to ungoverned ones.'
  ),

  h2('The voices most often left out: young people'),
  p(
    'The group the policy most affects is the one least represented in the debate. The picture from young people is not uniform. Many concede that social media is addictive and that the most harmful features should be restricted, yet most resist a blanket ban. Teenagers interviewed around the announcement spoke about losing the tools they use to communicate, learn, and express themselves, and about the practical reality that their peers will simply find ways around the rules. A common worry was the cliff edge: turning 16 with no preparation for a world they have been kept out of. As one teenager put it, it is easier for adults to say a policy will affect you now when it does not affect them. A minority of young people back a full Australia-style ban outright. The honest summary is that they want graduated exposure and safer design, not total prohibition, and they want to be in the room when the rules are written.'
  ),

  h2('The privacy problem nobody can wish away'),
  p(
    'Here is the trade-off that should concern every trust-and-safety practitioner, regardless of where they land on the ban itself. You cannot keep under-16s off a platform without checking the age of everyone trying to use it. Cybersecurity researchers put it bluntly: age-verifying children means age-verifying all of us. The proposed methods, from government ID and facial age estimation to credit-card checks and device-level verification, each carry real costs in privacy, data-breach exposure, and the slow normalisation of identity checks as the price of admission to the open internet.'
  ),
  p(
    'Civil-liberties advocates warn of "scope creep": infrastructure built to protect children is rarely dismantled, and can be repurposed. This is not an argument for inaction. It is an argument for honesty. Every age-assurance mandate is also a surveillance decision, and it deserves to be debated as one, with the same seriousness as the harm it aims to prevent.'
  ),

  h2('Why this matters far beyond Britain'),
  p(
    'India is the world’s largest open internet market, with nearly a billion users across dozens of languages. The harms driving the UK’s decision, including algorithmic amplification of self-harm content, grooming, image-based abuse, and addictive design aimed at children, are, if anything, larger here, and our enforcement capacity is differently shaped. When a major democracy adopts a sweeping model, it sets a template that others feel pressure to follow or reject. Australia exported its ban to Britain in eighteen months. The question is whether the next country to consider one does so with eyes open to the enforcement gaps and privacy costs, or simply borrows the headline.'
  ),
  p(
    'The lesson of both Australia and the UK is not that bans are right or wrong. It is that a policy designed for children quietly reshapes the internet for adults, and that the hardest parts, namely age assurance, enforcement, the cliff edge at 16, and the migration to darker corners, are precisely the parts that get the least attention when the announcement is made. Good governance lives in those details.'
  ),

  h2('The question TASI 2026 will hold'),
  p(
    'There is a version of this debate that is purely adversarial: parents against platforms, safety against freedom, one government against another. There is a better version, and it is the one we are building TASI around. Child protection and private communication are both legitimate. Reducing harm and preserving an open, low-friction internet are both worth fighting for. Getting the balance right requires technologists, regulators, child-safety advocates, and young people themselves in the same room, not talking past each other.'
  ),
  p(
    'That is the work. As we prepare for TASI 2026 under the theme "People First. Safety Always.", convened by the Centre for Social Research on 14–15 October 2026 at the India International Centre, New Delhi, the UK’s under-16 ban is exactly the kind of question we intend to take seriously: not "ban or no ban," but what accountable, evidence-based, contestable governance of children’s online safety actually looks like, and who gets a seat at the table when the rules are written. Registration is open at trustandsafetyindia.org/register.'
  ),
];

const doc = {
  _id: 'post-uk-under-16-social-media-ban',
  _type: 'post',
  title:
    'Britain Bans Social Media for Under-16s: What a Contested Policy Teaches Us About Online Safety',
  slug: { _type: 'slug', current: 'uk-under-16-social-media-ban' },
  excerpt:
    'The UK’s "Australia-plus" ban on under-16s is real, opinionated, and far from settled. Beneath the politics sits the question TASI exists to ask: how do you protect children online without creating new harms of your own?',
  publishedAt: '2026-06-15T18:00:00+05:30',
  author: 'TASI Team',
  category: 'COMMENTARY',
  image: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-35352eb4ade15031c01dade43aa9c7ce64b2d8c3-1920x1080-jpg',
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
