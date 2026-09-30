import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted">Effective September 30, 2026</p>
        <div className="mt-10 space-y-9 text-[0.98rem] leading-7 text-ink">
          <LegalSection title="What Skillo collects">
            <p>
              When you create an account, Skillo stores your name, email
              address, securely hashed password, username, profile details, and
              the skills you choose to teach or learn. When you use the product,
              Skillo also stores posts, reactions, follows, exchange proposals,
              learning plans, session records, progress, messages, ratings,
              notifications, community memberships, and Skill Credit ledger
              entries.
            </p>
            <p>
              Skillo does not currently support payments, arbitrary file
              uploads, voice calls, video calls, or precise location collection.
            </p>
          </LegalSection>
          <LegalSection title="Why this information is used">
            <p>
              Your data is used to operate the product: authenticate you, show
              your profile and Skill Wallet, suggest relevant people and
              exchanges, deliver messages and notifications, track agreed
              learning progress, calculate Skill Credits from confirmed teaching
              sessions, and protect the community from misuse.
            </p>
          </LegalSection>
          <LegalSection title="AI-assisted features">
            <p>
              The current MVP generates exchange and learning-plan suggestions
              with deterministic application logic. It does not send profile
              content or messages to an external AI provider. If an external AI
              provider is introduced, this policy will be updated before user
              data is shared, and only the information needed for the requested
              feature will be sent.
            </p>
          </LegalSection>
          <LegalSection title="Who can see what">
            <p>
              Your name, username, bio, skill wallet, completed exchanges,
              reputation information, and Skill Credit balance may be visible to
              other signed-in Skillo members. Direct messages, private decline
              feedback, and exchange workspace content are limited to the
              relevant participants and authorized moderators or administrators
              when review is necessary.
            </p>
            <p>
              Skillo does not sell personal information. Data is not shared with
              advertisers.
            </p>
          </LegalSection>
          <LegalSection title="Storage and security">
            <p>
              Passwords are hashed with bcrypt. Authentication uses an
              HTTP-only, same-site session cookie. Product actions are validated
              on the server and ownership checks are applied to protected
              records. The local demonstration build uses a SQLite database. A
              production deployment should use the configured managed database
              and its backup, access-control, and retention settings.
            </p>
            <p>
              No system can guarantee absolute security. Please use a unique
              password and report suspected account misuse promptly.
            </p>
          </LegalSection>
          <LegalSection title="Retention and your choices">
            <p>
              Profile and activity data is retained while your account is active
              so exchanges and credit records remain auditable. You can edit
              profile and skill information in the product. Account export and
              deletion are not yet self-service in this MVP. To request access,
              correction, or deletion, email{" "}
              <a
                className="font-bold text-brand underline"
                href="mailto:privacy@skillo.app"
              >
                privacy@skillo.app
              </a>
              . Credit and safety records may be retained when reasonably
              required to prevent fraud, resolve disputes, or meet legal
              obligations.
            </p>
          </LegalSection>
          <LegalSection title="Cookies">
            <p>
              Skillo uses one essential session cookie to keep you signed in.
              The current product does not use advertising cookies or
              third-party behavioral tracking.
            </p>
          </LegalSection>
          <LegalSection title="Children and changes">
            <p>
              Skillo is not intended for children under 13. If regional law
              requires a higher minimum age, that local requirement applies.
              Material changes to this policy will be dated and communicated in
              the product when practical.
            </p>
          </LegalSection>
          <LegalSection title="Contact">
            <p>
              Questions about privacy can be sent to{" "}
              <a
                className="font-bold text-brand underline"
                href="mailto:privacy@skillo.app"
              >
                privacy@skillo.app
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
