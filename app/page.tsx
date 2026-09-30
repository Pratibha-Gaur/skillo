import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  Repeat2,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PublicFooter } from "@/components/layout/public-footer";
import { Avatar } from "@/components/ui/avatar";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/home" : "/signup";
  const primaryLabel = user ? "Go to your home" : "Start exchanging";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line/80 bg-canvas/95">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Logo />
          <nav
            className="hidden items-center gap-7 text-sm font-bold text-muted md:flex"
            aria-label="Main navigation"
          >
            <a
              href="#how-it-works"
              className="transition-colors hover:text-ink"
            >
              How it works
            </a>
            <a
              href="#skill-chains"
              className="transition-colors hover:text-ink"
            >
              Skill Chains
            </a>
            <Link href="/skills" className="transition-colors hover:text-ink">
              Explore skills
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {!user && (
              <Link
                href="/login"
                className={buttonClassName("tertiary", "hidden sm:inline-flex")}
              >
                Sign in
              </Link>
            )}
            <Link href={primaryHref} className={buttonClassName("primary")}>
              {primaryLabel}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="page-shell grid min-h-[690px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand">
              <span
                className="h-2 w-2 rounded-full bg-coral"
                aria-hidden="true"
              />
              Skills become more useful when they are shared
            </p>
            <h1 className="font-display text-[3.5rem] font-semibold leading-[0.97] tracking-[-0.045em] text-ink sm:text-[4.6rem] lg:text-[5.35rem]">
              Everyone has something to teach.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Exchange skills with people who want to learn what you know.
              Skillo helps you find each other, make a plan, and keep moving.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className={buttonClassName(
                  "primary",
                  "min-h-12 px-5 text-base",
                )}
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/skills"
                className={buttonClassName(
                  "secondary",
                  "min-h-12 px-5 text-base",
                )}
              >
                Explore skills
              </Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">
              Start with one thing you know and one thing you want to learn.
            </p>
          </div>

          <div
            className="relative mx-auto w-full max-w-[540px]"
            aria-label="An example Python and photography skill exchange"
          >
            <div
              className="absolute -left-3 top-10 h-20 w-20 rounded-[24px] bg-[#E9C15E] sm:-left-8"
              aria-hidden="true"
            />
            <div
              className="absolute -right-4 bottom-14 h-28 w-16 rounded-[28px] bg-[#DCEADF] sm:-right-8"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[28px] border border-[#CED8CF] bg-surface p-5 shadow-soft sm:p-8">
              <div className="flex items-center justify-between border-b border-line pb-5">
                <div>
                  <p className="text-sm font-bold text-muted">
                    A direct skill exchange
                  </p>
                  <p className="mt-1 text-lg font-extrabold tracking-tight">
                    A good match works both ways
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Repeat2 className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <div className="grid gap-4 py-7 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="rounded-2xl bg-[#EEF5F0] p-5">
                  <Avatar name="Pratibha Gaur" color="fern" size="lg" />
                  <p className="mt-4 font-extrabold">Pratibha</p>
                  <p className="mt-1 text-sm text-muted">Can help with</p>
                  <p className="mt-2 text-xl font-extrabold text-brand">
                    Python
                  </p>
                </div>
                <div className="mx-auto flex h-11 w-11 rotate-90 items-center justify-center rounded-xl border border-line bg-white text-coral sm:rotate-0">
                  <Repeat2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="rounded-2xl bg-[#FCF0EA] p-5">
                  <Avatar name="Maya Kapoor" color="coral" size="lg" />
                  <p className="mt-4 font-extrabold">Maya</p>
                  <p className="mt-1 text-sm text-muted">Can help with</p>
                  <p className="mt-2 text-xl font-extrabold text-[#9A4939]">
                    Photography
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-line bg-[#FAFAF6] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5E5BB] text-[#7A5A12]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-6 text-muted">
                    <strong className="text-ink">
                      Skillo suggests a simple plan.
                    </strong>{" "}
                    Both people can edit it before the exchange begins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-line bg-surface py-20 sm:py-24"
        >
          <div className="page-shell">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold text-brand">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
                Human learning, with just enough structure.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                You bring the knowledge. Skillo handles discovery, planning, and
                the small details that make an exchange easier to finish.
              </p>
            </div>
            <ol className="mt-12 grid gap-10 md:grid-cols-3">
              <li className="border-t-2 border-brand pt-5">
                <span className="text-sm font-extrabold text-brand">01</span>
                <Compass className="mt-6 h-6 w-6 text-ink" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  Find your counterpart
                </h3>
                <p className="mt-2 leading-7 text-muted">
                  Discover someone who knows what you want to learn and values
                  what you can share.
                </p>
              </li>
              <li className="border-t-2 border-coral pt-5">
                <span className="text-sm font-extrabold text-[#A54633]">
                  02
                </span>
                <UsersRound
                  className="mt-6 h-6 w-6 text-ink"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  Agree on the exchange
                </h3>
                <p className="mt-2 leading-7 text-muted">
                  Edit a suggested proposal together. Nothing starts until both
                  people are comfortable.
                </p>
              </li>
              <li className="border-t-2 border-sun pt-5">
                <span className="text-sm font-extrabold text-[#765817]">
                  03
                </span>
                <Check className="mt-6 h-6 w-6 text-ink" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  Learn, teach, and progress
                </h3>
                <p className="mt-2 leading-7 text-muted">
                  Use a shared plan, complete sessions, and earn a Skill Credit
                  when your teaching is confirmed.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section
          id="skill-chains"
          className="page-shell grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.88fr_1.12fr] lg:items-center"
        >
          <div>
            <p className="text-sm font-extrabold text-brand">
              When a direct swap is not available
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
              Skills can travel through a chain.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted">
              A Skill Chain connects several people so each person teaches one
              skill and learns another. The value keeps moving without turning
              skills into money.
            </p>
            <Link
              href="/skills"
              className={buttonClassName("secondary", "mt-7")}
            >
              See exchange opportunities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-[26px] border border-line bg-[#EEF3EF] p-5 sm:p-8">
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              aria-label="Python to photography to video editing to UI design skill chain"
            >
              {["Python", "Photography", "Video Editing", "UI Design"].map(
                (skill, index) => (
                  <div key={skill} className="contents">
                    <div className="flex min-h-20 flex-1 items-center justify-center rounded-xl border border-line bg-surface px-4 text-center font-extrabold shadow-[0_4px_14px_rgba(31,46,38,0.05)]">
                      {skill}
                    </div>
                    {index < 3 && (
                      <ArrowRight
                        className="mx-auto h-5 w-5 rotate-90 shrink-0 text-brand sm:rotate-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ),
              )}
            </div>
            <p className="mt-5 text-center text-sm leading-6 text-muted">
              Each person contributes something useful. Everyone leaves with a
              next skill.
            </p>
          </div>
        </section>

        <section className="bg-[#173E31] py-20 text-white sm:py-24">
          <div className="page-shell flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold text-[#AAD2BC]">
                Learning works better with another person
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
                What you know could be exactly where someone else needs to
                begin.
              </h2>
            </div>
            <Link
              href={primaryHref}
              className={buttonClassName(
                "secondary",
                "min-h-12 border-white/20 bg-white px-5 text-base text-[#173E31] hover:bg-[#F1F4EF]",
              )}
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
