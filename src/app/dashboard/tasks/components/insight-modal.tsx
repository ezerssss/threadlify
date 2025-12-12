"use client";

import { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";

import Link from "next/link";

import ReadMoreArea from "@foxeian/react-read-more";
import { collection, doc, getDocs } from "firebase/firestore";
import * as LucideIcons from "lucide-react";
import { X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";
import { cn, formatISODate } from "@/lib/utils";
import { PostType } from "@/types/post";

interface InsightModalProps {
  open: boolean;
  id: string;
  onOpenChange: (open: boolean) => void;
  iconName: keyof typeof LucideIcons;
  categoryColor: string;
  categoryLabel: string;
  title: string;
  description: string;
  specificTasks: string[];
}

export default function InsightModal(props: InsightModalProps) {
  const { open, id, onOpenChange, iconName, categoryColor, categoryLabel, title, description, specificTasks } = props;
  const { user } = useUser();

  const [posts, setPosts] = useState<PostType[]>([]);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const objectivesCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.OBJECTIVES_COLLECTION);
      const objectiveDocRef = doc(objectivesCollectionRef, id);
      const postsCollectionRef = collection(objectiveDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);
      const postsSnapshot = await getDocs(postsCollectionRef);

      const fetchedPosts: PostType[] = [];
      for (const doc of postsSnapshot.docs) {
        fetchedPosts.push(doc.data() as PostType);
      }

      setPosts(fetchedPosts);
    })();
  }, [user, id]);

  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Lightbulb;

  // 👉 The selected post that appears on the right panel
  const [activePost, setActivePost] = useState<PostType | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setActivePost(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className={cn("bg-card p-0", activePost ? "min-w-[85%]" : "min-w-[50%]")}>
        <DialogHeader hidden>
          <DialogTitle hidden>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex h-[90vh] flex-col p-5 md:p-8">
          <section className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: categoryColor }} />
            <p className="text-sm" style={{ color: categoryColor }}>
              {categoryLabel}
            </p>
          </section>

          <div className="flex min-h-0 flex-1">
            {/* ---------------- LEFT PANEL ---------------- */}
            <div className="scrollbar-thin flex h-full flex-1 flex-col gap-2 overflow-y-auto pr-3">
              {/* Insight header */}

              <h1 className="text-xl leading-tight font-bold">{title}</h1>

              <p className="whitespace-pre-wrap">{description}</p>

              {/* ---------------- SPECIFIC TASKS ---------------- */}
              <div className="mt-3 space-y-2">
                <h2 className="text-lg font-bold">Specific Tasks</h2>

                <div className="space-y-1">
                  {(showAllTasks ? specificTasks : specificTasks.slice(0, 10)).map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="bg-primary mt-1 aspect-square h-2 w-2 rounded-full"></span>
                      <p className="text-sm">{task}</p>
                    </div>
                  ))}
                </div>

                {specificTasks.length > 10 && (
                  <button className="text-primary text-sm underline" onClick={() => setShowAllTasks(!showAllTasks)}>
                    {showAllTasks ? "Show less" : `Show ${specificTasks.length - 10} more`}
                  </button>
                )}
              </div>

              {/* Posts list */}
              <h2 className="mt-4 text-lg font-bold">Referenced Posts</h2>

              <div className="flex-1 space-y-2">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="bg-muted/20 hover:bg-muted/40 border-border flex cursor-pointer flex-col gap-1 rounded-md border p-4 transition-all"
                    onClick={() => setActivePost(post)}
                  >
                    <h3 className="leading-tight font-semibold">{post.title}</h3>

                    <div className="text-muted-foreground pointer-events-none text-xs">
                      <ReadMoreArea lettersLimit={180} expandLabel="See more">
                        {post.body}
                      </ReadMoreArea>
                    </div>

                    <p className="text-muted-foreground text-xs">
                      {post.platform ?? "Unknown"} | {formatISODate(post.postCreatedAt) ?? ""}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* ---------------- RIGHT PANEL (POST DETAIL) ---------------- */}
            {activePost && (
              <div className="border-border relative flex w-[35%] min-w-[35%] flex-col border-l pl-3">
                {/* Close Button */}
                <button
                  className="hover:bg-muted absolute top-0 right-3 rounded-md p-1"
                  onClick={() => setActivePost(null)}
                >
                  <X className="h-4 w-4" />
                </button>

                <Link className="underline" target="_blank" href={activePost.url}>
                  <h2 className="pr-8 text-xl leading-tight font-bold">{activePost.title}</h2>
                </Link>

                <div className="text-muted-foreground mt-2 flex gap-1 text-xs">
                  {activePost.platform && <span>{activePost.platform}</span>} |
                  {activePost.createdAt && <span>{formatISODate(activePost.postCreatedAt)}</span>}
                </div>

                <div className="scrollbar-thin mt-4 space-y-2 overflow-auto pr-4">
                  <p className="whitespace-pre-wrap">{activePost.body}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
