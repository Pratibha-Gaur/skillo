"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Edit3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlanItem = {
  id: string;
  week: number;
  title: string;
  description: string;
};

export function PlanReview({
  exchangeId,
  initialItems,
  ownApproved,
  partnerApproved,
  partnerName,
}: {
  exchangeId: string;
  initialItems: PlanItem[];
  ownApproved: boolean;
  partnerApproved: boolean;
  partnerName: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function updatePlan() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE",
          items: items.map(({ id, title, description }) => ({
            id,
            title,
            description,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to update the plan.");
      setEditing(false);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to update the plan.",
      );
    } finally {
      setPending(false);
    }
  }

  async function approve() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/exchanges/${exchangeId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to approve the plan.");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to approve the plan.",
      );
      setPending(false);
    }
  }

  function updateItem(
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,680px)_1fr]">
      <section>
        <div className="rounded-xl border border-[#E9DDBD] bg-[#FCF7E8] p-4">
          <div className="flex gap-3">
            <Sparkles
              className="mt-0.5 h-5 w-5 shrink-0 text-[#86651A]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-extrabold">
                A suggested path for both of you
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                This plan is a starting point. Edit the wording or activities
                before you approve it.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-3 py-5 sm:grid-cols-[72px_1fr]"
            >
              <div className="text-sm font-extrabold text-brand">
                Week {item.week}
              </div>
              <div>
                {editing ? (
                  <>
                    <input
                      className="field font-bold"
                      value={item.title}
                      onChange={(event) =>
                        updateItem(index, "title", event.target.value)
                      }
                      maxLength={100}
                    />
                    <textarea
                      className="field mt-2 min-h-24 resize-none py-3 leading-6"
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      maxLength={350}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-extrabold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button onClick={updatePlan} disabled={pending}>
                {pending ? "Saving..." : "Save changes"}
              </Button>
              <Button
                variant="tertiary"
                onClick={() => {
                  setItems(initialItems);
                  setEditing(false);
                }}
                disabled={pending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit plan
            </Button>
          )}
        </div>
      </section>
      <aside>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-extrabold tracking-tight">Approval</h2>
          <div className="mt-5 space-y-4">
            <ApprovalRow label="You" approved={ownApproved} />
            <ApprovalRow label={partnerName} approved={partnerApproved} />
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            The workspace opens after both people approve the plan.
          </p>
          {ownApproved ? (
            <div className="mt-5 rounded-lg bg-brand-soft px-3 py-2.5 text-sm font-bold text-brand">
              <Check className="mr-2 inline h-4 w-4" aria-hidden="true" />
              You approved this plan
            </div>
          ) : (
            <Button
              className="mt-5 w-full"
              onClick={approve}
              disabled={pending || editing}
            >
              {pending ? "Approving..." : "Approve learning plan"}
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}

function ApprovalRow({
  label,
  approved,
}: {
  label: string;
  approved: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-bold ${approved ? "text-brand" : "text-muted"}`}
      >
        {approved && <Check className="h-4 w-4" aria-hidden="true" />}
        {approved ? "Approved" : "Reviewing"}
      </span>
    </div>
  );
}
