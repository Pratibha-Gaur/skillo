import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="page-shell flex h-[72px] items-center">
          <Logo />
        </div>
      </header>
      <main className="page-shell max-w-3xl py-12 sm:py-16">
        <p className="text-sm font-extrabold text-brand">Legal</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em]">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm text-muted">Effective September 30, 2026</p>
        <div className="mt-10 space-y-9 text-[0.98rem] leading-7 text-ink">
          <LegalSection title="Using Skillo">
            <p>
              Skillo is a social network for peer-to-peer skill exchange.
              Members discover people, propose exchanges, agree on learning
              plans, communicate, track sessions, and record progress. Humans
              provide the teaching. Skillo provides coordination and optional
              suggestions.
            </p>
            <p>
              You must be at least 13 years old, or the higher minimum age
              required in your region, and able to agree to these terms. Provide
              accurate account information and keep your sign-in credentials
              private.
            </p>
          </LegalSection>
          <LegalSection title="Respectful skill exchange">
            <p>
              Only offer help you can provide safely and honestly. You do not
              need to be a formal expert, but you should represent your
              experience accurately. Respect another member’s boundaries, time,
              privacy, and right to decline a request without explanation.
            </p>
            <p>
              Do not use Skillo for harassment, discrimination, threats, sexual
              exploitation, fraud, impersonation, spam, illegal activity,
              dangerous instruction, or attempts to move prohibited transactions
              through the platform.
            </p>
          </LegalSection>
          <LegalSection title="Skill Credits">
            <p>
              A Skill Credit is a non-monetary platform record. In the current
              product, one credit is awarded to the teacher only after a session
              lasting more than 30 minutes is marked complete by the teacher and
              confirmed by the learner. Credits do not expire and may be used
              only for eligible learning sessions.
            </p>
            <p>
              Skill Credits are not money, cannot be purchased, withdrawn,
              exchanged for cash, or guaranteed to have any external value.
              Skillo may correct ledger entries created by error, abuse, or
              duplicate confirmation while preserving an auditable record.
            </p>
          </LegalSection>
          <LegalSection title="Content and messages">
            <p>
              You keep ownership of the original content you submit. You give
              Skillo permission to store, process, and display that content as
              needed to operate the features you choose. Do not submit content
              you do not have the right to share.
            </p>
            <p>
              The MVP is designed for text, structured tasks, and code snippets.
              It does not provide arbitrary file sharing, video calls, voice
              calls, or unrestricted media hosting. Attempts to bypass these
              limits may be blocked.
            </p>
          </LegalSection>
          <LegalSection title="Plans, suggestions, and outcomes">
            <p>
              Match suggestions and learning plans are editable guidance, not
              professional advice or guaranteed outcomes. You decide whom to
              contact, what to teach, what to learn, and whether to accept a
              plan. Skillo does not certify a member’s expertise and is not
              responsible for relying on another member’s instruction.
            </p>
          </LegalSection>
          <LegalSection title="Safety and moderation">
            <p>
              Skillo may review reports, remove content, reduce recommendation
              visibility, restrict features, or suspend accounts when reasonably
              necessary to protect people or the service. A single low rating
              does not automatically trigger punishment. Patterns of abuse,
              fraud, or repeated non-completion may lead to stronger action.
            </p>
          </LegalSection>
          <LegalSection title="Availability and changes">
            <p>
              This is an early product. Features may change, experience
              interruptions, or be withdrawn. Skillo will not fabricate a
              completed session, credit, or exchange when a required service is
              unavailable. Reasonable care is taken to preserve records, but
              uninterrupted availability is not guaranteed.
            </p>
          </LegalSection>
          <LegalSection title="Ending your account">
            <p>
              You may stop using Skillo at any time. Self-service account
              deletion is not yet available in the MVP. Contact{" "}
              <a
                className="font-bold text-brand underline"
                href="mailto:support@skillo.app"
              >
                support@skillo.app
              </a>{" "}
              for an account request. Some safety, dispute, and Skill Credit
              ledger records may need to be retained.
            </p>
          </LegalSection>
          <LegalSection title="Contact">
            <p>
              Questions about these terms can be sent to{" "}
              <a
                className="font-bold text-brand underline"
                href="mailto:support@skillo.app"
              >
                support@skillo.app
              </a>
              .
            </p>
          </LegalSection>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </section>
  );
}
