import LegalLayout from "@/components/LegalLayout";
import { Callout, ContactHighlight, DocSection, MetaBadge } from "@/components/LegalComponents";

export const metadata = {
  title: "Privacy Policy | TASI 2026",
  description: "How TASI 2026 and Centre for Social Research handle personal data collected through this website.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      kicker="How we collect, use, and protect information submitted through this website and TASI 2026 forms."
      updated="March 2026"
      applies="TASI website pages, contact forms, newsletter signups, and registration links"
    >
      <div className="mb-8 flex flex-wrap gap-2">
        <MetaBadge variant="teal">Effective: 1 January 2026</MetaBadge>
        <MetaBadge>Last Updated: March 2026</MetaBadge>
        <MetaBadge>Applies to: TASI 2026 website interactions</MetaBadge>
      </div>

      <DocSection number="01" title="Introduction">
        <p>
          The Trust and Safety India Festival 2026 (TASI 2026) is co-organised by the Centre for Social
          Research (CSR) and the Trust and Safety Forum. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your personal information when you visit our website or register as
          a delegate, speaker, sponsor, or media partner.
        </p>
        <p>
          We are committed to protecting your privacy and handling your data transparently. By using our
          website or registering for the event, you agree to the practices described here.
        </p>
        <Callout variant="teal">
          <strong className="text-orange-700 dark:text-orange-300">Data Controller:</strong> Centre for Social Research, 2 Nelson
          Mandela Marg, Vasant Kunj, New Delhi - 110070, India. {" "}
          <a href="mailto:info@csrindia.org" className="text-orange-700 underline dark:text-orange-300">
            info@csrindia.org
          </a>
        </Callout>
      </DocSection>

      <DocSection number="02" title="Information We Collect">
        <p>
          <strong className="text-stone-900 dark:text-slate-100">Information you provide directly:</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Full name, email address, and phone number</li>
          <li>Organisation name and job designation</li>
          <li>Delegate category and any details submitted through registration forms</li>
          <li>Messages or enquiries submitted through Contact and Footer forms</li>
          <li>Newsletter subscription email addresses</li>
        </ul>
        <p className="mt-3">
          <strong className="text-stone-900 dark:text-slate-100">Information collected automatically:</strong>
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Basic technical information such as browser type and device type</li>
          <li>Browser type, device type, and operating system</li>
          <li>Pages visited, time spent, and referral URLs</li>
          <li>Interaction data required to improve site performance and usability</li>
        </ul>
        <Callout variant="gold">
          <strong className="text-amber-700 dark:text-amber-300">Note:</strong> We do not intentionally collect sensitive personal
          data through public website forms. Please avoid sharing confidential personal information in open text fields.
        </Callout>
      </DocSection>

      <DocSection number="03" title="How We Use Your Information">
        <p>We use the information we collect for the following purposes:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Processing event registrations submitted through linked registration forms</li>
          <li>Sending event-related communication and updates</li>
          <li>Sharing event updates, programme changes, and post-event materials</li>
          <li>Improving website experience and performance</li>
          <li>Responding to enquiries submitted through our contact form</li>
          <li>Maintaining internal records for event operations and legal compliance</li>
        </ul>
      </DocSection>

      <DocSection number="04" title="Sharing and Disclosure">
        <p>We do not sell your personal data. We may share your information with:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-stone-900 dark:text-slate-100">Co-organiser:</strong> Trust and Safety Forum, for joint event
            administration only
          </li>
          <li>
            <strong className="text-stone-900 dark:text-slate-100">Operational partners:</strong> Technology and event service providers
            who support registrations, communication, and logistics
          </li>
          <li>
            <strong className="text-stone-900 dark:text-slate-100">Service providers:</strong> Email tools, analytics platforms, and
            payment processors, bound by data processing agreements
          </li>
          <li>
            <strong className="text-stone-900 dark:text-slate-100">Government or regulatory bodies:</strong> Where required by law,
            court order, or to protect the safety of our organisation or attendees
          </li>
        </ul>
      </DocSection>

      <DocSection number="05" title="Data Retention and Your Rights">
        <p>
          We retain personal data only for as long as needed for event operations, communication, security,
          and applicable legal obligations.
        </p>
        <p>
          You may request access, correction, or deletion of your information by contacting our team.
          We will respond within a reasonable period.
        </p>
      </DocSection>

      <DocSection number="06" title="Contact Us">
        <p>For questions, concerns, or requests regarding this Privacy Policy:</p>
        <ContactHighlight>
          <strong className="mb-1 block text-stone-900 dark:text-slate-100">Data Privacy Contact - Centre for Social Research</strong>
          Email: {" "}
          <a href="mailto:info@csrindia.org" className="text-orange-700 underline dark:text-orange-300">
            info@csrindia.org
          </a>
          <br />Phone: +91 98105 11540
          <br />Address: 2, Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070, India
        </ContactHighlight>
      </DocSection>
    </LegalLayout>
  );
}
