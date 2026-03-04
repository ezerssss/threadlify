"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ky, { HTTPError } from "ky";
import { AlertCircleIcon, GripVerticalIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { siReddit } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { USER_PERSONA_SUBREDDITS_URL } from "@/constants/url";
import usePersonaSubreddits from "@/hooks/use-persona-subreddits";
import useUser from "@/hooks/use-user";
import { cn } from "@/lib/utils";

type SortableSubredditItemProps = Readonly<{
  subreddit: string;
  onRemove: () => void;
  disabled: boolean;
}>;

function SortableSubredditItem({ subreddit, onRemove, disabled }: SortableSubredditItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subreddit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-background flex items-center gap-2 rounded-md border p-2",
        isDragging && "z-50 opacity-80 shadow-lg",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <SimpleIcon icon={siReddit} className="size-4 text-[#FF4500]" />
      <span className="flex-1 text-sm font-medium">r/{subreddit}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
        onClick={onRemove}
        disabled={disabled}
      >
        <TrashIcon className="size-4" />
      </Button>
    </div>
  );
}

export default function PersonaSubredditsDialog() {
  const { idToken } = useUser();
  const { subreddits: initialSubreddits, isLoading } = usePersonaSubreddits();

  const [localSubreddits, setLocalSubreddits] = useState<string[]>([]);
  const [newSubreddit, setNewSubreddit] = useState("");
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sync local state when dialog opens or initial data changes
  useEffect(() => {
    if (open) {
      setLocalSubreddits(initialSubreddits);
      setValidationError(null);
    }
  }, [open, initialSubreddits]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalSubreddits((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function handleAddSubreddit() {
    const trimmed = newSubreddit.trim().toLowerCase();

    const cleaned = trimmed.startsWith("r/") ? trimmed.slice(2) : trimmed;

    if (!cleaned) {
      return;
    }

    if (localSubreddits.includes(cleaned)) {
      toast.error(`r/${cleaned} is already in your list.`);
      return;
    }

    if (!/^[a-z0-9_]+$/i.test(cleaned)) {
      toast.error("Invalid subreddit name. Only letters, numbers, and underscores are allowed.");
      return;
    }

    setLocalSubreddits((prev) => [...prev, cleaned]);
    setNewSubreddit("");
  }

  function handleRemoveSubreddit(subreddit: string) {
    setLocalSubreddits((prev) => prev.filter((s) => s !== subreddit));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubreddit();
    }
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setValidationError(null);

      if (!idToken) {
        throw new Error("You are unauthorized to perform this action.");
      }

      await ky.post(USER_PERSONA_SUBREDDITS_URL, {
        json: { subreddits: localSubreddits },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        timeout: 60000,
      });

      toast.success("Persona subreddits updated.");
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 400) {
        const body = await error.response.json<{ message: string }>();
        setValidationError(body.message);
      } else if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = JSON.stringify(localSubreddits) !== JSON.stringify(initialSubreddits);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-1 h-7 gap-1 px-2 text-[11px]">
          <SimpleIcon icon={siReddit} className="size-3.5 text-[#FF4500]" />
          Manage persona subreddits
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[85vh] max-w-md border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SimpleIcon icon={siReddit} className="size-5 text-[#FF4500]" />
            Persona subreddits
          </DialogTitle>
          <DialogDescription>
            Add, remove, or reorder the subreddits where this persona should build karma. Drag to reorder priority.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">r/</span>
              <Input
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="subreddit_name"
                className="pl-8"
                disabled={isSaving}
              />
            </div>
            <Button onClick={handleAddSubreddit} disabled={isSaving || !newSubreddit.trim()}>
              Add
            </Button>
          </div>

          <div className="scrollbar-thin max-h-[40vh] space-y-2 overflow-y-auto pr-1">
            {isLoading && (
              <div className="text-muted-foreground py-4 text-center text-sm">Loading persona subreddits...</div>
            )}

            {!isLoading && localSubreddits.length === 0 && (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No persona subreddits yet. Add at least one so we know where this persona should build karma.
              </div>
            )}

            {!isLoading && localSubreddits.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={localSubreddits} strategy={verticalListSortingStrategy}>
                  {localSubreddits.map((subreddit) => (
                    <SortableSubredditItem
                      key={subreddit}
                      subreddit={subreddit}
                      onRemove={() => handleRemoveSubreddit(subreddit)}
                      disabled={isSaving}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {localSubreddits.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {localSubreddits.length} subreddit{localSubreddits.length === 1 ? "" : "s"} configured
            </p>
          )}

          {validationError && (
            <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-3">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm">{validationError}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {isSaving && (
            <p className="text-muted-foreground mr-auto text-xs">
              Validating persona subreddits, this may take a moment...
            </p>
          )}
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? "Validating..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
