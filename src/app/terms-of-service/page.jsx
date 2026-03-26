import LegalLayout from "@/components/LegalLayout";
import { Callout, ContactHighlight, DocSection, DocTable, MetaBadge } from "@/components/LegalComponents";

export const metadata = {
  title: "Terms of Service | TASI 2026",
  description: "Terms governing use of the TASI 2026 website and participation processes.",
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      kicker="The terms and conditions governing your participation in TASI 2026."
      updated="March 2026"
      applies="Website users, registrants, delegates, speakers, and partners"
    >
      <div className="mb-8 flex flex-wrap gap-2">
        <MetaBadge variant="teal">Effective: 1 January 2026</MetaBadge>
        <MetaBadge>Last Updated: March 2026</MetaBadge>
        <MetaBadge>Applies to: TASI website and event participation</MetaBadge>
      </div>

      <DocSection number="01" title="Agreement to Terms">
        <p>
          These Terms of Service govern your use of the TASI 2026 website and your participation in the
          Trust and Safety India Festival 2026, co-organised by the Centre for Social Research (CSR)
          and the Trust and Safety Festival (together, the &quot;Organisers&quot;).
        </p>
        <p>
          By accessing our website, registering for the event, or attending in any capacity, you confirm
          that you have read, understood, and agreed to these Terms.
        </p>
      </DocSection>

      <DocSection number="02" title="Registration and Eligibility">
        <ul className="list-disc space-y-1 pl-5">
          <li>Registration is open to professionals, policymakers, academics, civil society representatives, journalists, and students.</li>
          <li>All registrants must be aged 18 or above.</li>
          <li>Registration is personal and non-transferable unless agreed in writing with the Organisers.</li>
          <li>The Organisers reserve the right to decline, verify, or cancel a registration where necessary for safety, capacity, or policy compliance.</li>
        </ul>
      </DocSection>

      <DocSection number="03" title="Attendance and Conduct">
        <p>All attendees are expected to maintain professional and respectful conduct throughout the event.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Harassment, intimidation, or discriminatory behaviour toward any person</li>
          <li>Disruptive conduct during sessions, workshops, or plenary events</li>
          <li>Recording sessions without prior written consent from the Organisers and speakers</li>
          <li>Accessing restricted areas or sessions without appropriate credentials</li>
        </ul>
        <Callout variant="teal">
          <strong className="text-orange-700 dark:text-orange-300">Closed-Door Sessions:</strong> Certain sessions at TASI 2026
          are designated as closed-door or off-the-record under the Chatham House Rule.
        </Callout>
      </DocSection>

      <DocSection number="04" title="Cancellation and Refund Policy">
        <p>
          Registration fee, cancellation, and transfer terms may vary by pass category and are communicated
          during registration. Where no paid fee applies, cancellation terms are operational only.
        </p>
        <DocTable
          headers={["Cancellation Notice", "Refund"]}
          rows={[
            ["60 or more days before event", "As per registration category terms"],
            ["30-59 days before event", "As per registration category terms"],
            ["Less than 30 days before event", "Transfer or adjustment may be allowed at organiser discretion"],
            ["No-show on event day", "No guarantee of refund or transfer"],
          ]}
        />
      </DocSection>

      <DocSection number="05" title="Intellectual Property and Media">
        <ul className="list-disc space-y-1 pl-5">
          <li>Website content, branding, and published materials are owned by or licensed to the Organisers.</li>
          <li>Session photography/video may be captured for event documentation and future communications.</li>
          <li>Use of logos, recordings, or session materials for commercial reuse requires prior written permission.</li>
        </ul>
      </DocSection>

      <DocSection number="06" title="Contact">
        <p>For any questions about these Terms, please contact the TASI 2026 Secretariat:</p>
        <ContactHighlight>
          <strong className="mb-1 block text-stone-900 dark:text-slate-100">TASI 2026 Secretariat - Centre for Social Research</strong>
          Email: {" "}
          <a href="mailto:info1@csrindia.org" className="text-orange-700 underline dark:text-orange-300">
            info1@csrindia.org
          </a>
          <br />Phone: +91 011 46131929
          <br />Address: 2, Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070, India
        </ContactHighlight>
      </DocSection>
    </LegalLayout>
  );
}
