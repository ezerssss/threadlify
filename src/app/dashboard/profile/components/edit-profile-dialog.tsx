"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditUserProfileSchema, EditUserProfileType } from "@/types/user";

export default function EditProfileDialog({
  profile,
  strategy,
  keywords,
  onSave,
  isLoading,
}: {
  profile: { name: string; description: string; audience: string; tone: string };
  strategy: string;
  keywords: string[];
  onSave?: (data: EditUserProfileType) => Promise<void>;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditUserProfileType>({
    resolver: zodResolver(EditUserProfileSchema),
    defaultValues: {
      name: profile.name,
      description: profile.description,
      audience: profile.audience,
      tone: profile.tone,
      growthStrategy: strategy,
      keywords,
    },
    disabled: isLoading,
  });

  function addKeyword() {
    const current = form.getValues("keywords");
    form.setValue("keywords", ["", ...current]);
  }

  function updateKeyword(index: number, value: string) {
    const updated = [...form.getValues("keywords")];
    updated[index] = value;
    form.setValue("keywords", updated, { shouldValidate: true });
  }

  function removeKeyword(index: number) {
    const updated = form.getValues("keywords").filter((_, i) => i !== index);
    form.setValue("keywords", updated, { shouldValidate: true });
  }

  function handleSave() {
    const valid = form.trigger();
    valid.then(async (ok) => {
      if (ok) {
        await onSave?.(form.getValues());
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <EditIcon className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card overflow-none h-[95%] max-w-3xl min-w-3xl border-none shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your auto-generated profile, strategy, and keywords.</DialogDescription>
        </DialogHeader>

        <div className="scrollbar-thin flex h-full flex-wrap items-start gap-4 overflow-auto">
          <div className="flex-1">
            <h2 className="mb-2 font-bold">Profile Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && <p className="text-xs text-red-500">Name is required.</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...form.register("description")} />
                {form.formState.errors.description && <p className="text-xs text-red-500">Description is required.</p>}
              </div>

              <div className="space-y-2">
                <Label>Audience</Label>
                <Textarea {...form.register("audience")} />
                {form.formState.errors.audience && <p className="text-xs text-red-500">Audience is required.</p>}
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Textarea {...form.register("tone")} />
                {form.formState.errors.tone && <p className="text-xs text-red-500">Tone is required.</p>}
              </div>

              <div className="space-y-2">
                <Label>Growth Strategy</Label>
                <Textarea {...form.register("growthStrategy")} />
                {form.formState.errors.growthStrategy && (
                  <p className="text-xs text-red-500">Growth strategy is required.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="font-bold">Keywords</h2>
              <Button onClick={addKeyword} disabled={isLoading} className="h-fit w-fit px-3 py-2">
                <span className="flex items-center gap-1 !text-xs">
                  <PlusIcon className="size-4" /> Add Keyword
                </span>
              </Button>
            </div>
            <div className="space-y-3">
              {form.formState.errors.keywords && (
                <p className="text-xs text-red-500">
                  There should be at least one keyword and keywords can&apos;t be empty.
                </p>
              )}

              {form.watch("keywords").map((kw, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={kw}
                    placeholder="e.g. marketing tips"
                    onChange={(e) => updateKeyword(i, e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeKeyword(i)}
                    className="bg-destructive text-white"
                  >
                    <TrashIcon className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" disabled={isLoading} onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isLoading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
