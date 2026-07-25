"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Checkbox,
  Field,
  Input,
  ModalSheet,
  PrimaryButton,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { createGroup } from "@/lib/api/chat";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 200;

/** Group categories offered by the mobile CreateGroupModal. */
const CATEGORIES = [
  "Language Practice",
  "Culture",
  "Study Group",
  "Storytelling",
  "General",
];

export interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onCreated: (groupId: string) => void;
}

export function CreateGroupModal({
  open,
  onClose,
  userId,
  onCreated,
}: CreateGroupModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const close = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setIsPrivate(false);
    onClose();
  };

  const handleCreate = async () => {
    if (!userId) {
      toast.error("Sign in to create a group");
      return;
    }
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const group = await createGroup({
        userId,
        title: title.trim(),
        description: description.trim(),
        category,
        isPrivate,
      });
      toast.success("Group created");
      onCreated(group.id);
      close();
    } catch (err) {
      console.error("[groups] create failed", err);
      toast.error("Couldn't create the group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalSheet
      onClose={close}
      title="Create group"
      size="md"
      footer={
        <PrimaryButton
          loading={submitting}
          disabled={!title.trim() || submitting}
          onClick={handleCreate}
        >
          Create Group
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Group name" counter={{ value: title.length, max: TITLE_MAX }}>
          <Input
            size="md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yoruba Learners"
            maxLength={TITLE_MAX}
          />
        </Field>

        <Field
          label="Description"
          optional
          counter={{ value: description.length, max: DESCRIPTION_MAX }}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What's this group about?"
            maxLength={DESCRIPTION_MAX}
          />
        </Field>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-[var(--foreground)]">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[12px] font-semibold transition",
                  category === c
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Checkbox
          label="Private group"
          description="Hidden from group discovery"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
      </div>
    </ModalSheet>
  );
}
