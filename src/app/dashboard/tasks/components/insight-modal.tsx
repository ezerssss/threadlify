"use client";

import { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";

import Link from "next/link";

import { collection, doc, getDocs } from "firebase/firestore";
import * as LucideIcons from "lucide-react";
import { ExternalLink, X, CheckCircle2, ChevronDown } from "lucide-react";
import Markdown from "react-markdown";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  whatTheMarketTellsUs: string;
  whyItMatters: string;
  specificTasks: string[];
}

export default function InsightModal(props: InsightModalProps) {
  const {
    open,
    id,
    onOpenChange,
    iconName,
    categoryColor,
    categoryLabel,
    title,
    whatTheMarketTellsUs,
    whyItMatters,
    specificTasks,
  } = props;
  const { user } = useUser();

  const [posts, setPosts] = useState<PostType[]>([]);
  const [activePost, setActivePost] = useState<PostType | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const objectivesCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.OBJECTIVES_COLLECTION);
      const objectiveDocRef = doc(objectivesCollectionRef, id);
      const postsCollectionRef = collection(objectiveDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);

      const snapshot = await getDocs(postsCollectionRef);
      setPosts(snapshot.docs.map((d) => d.data() as PostType));
    })();
  }, [user, id]);

  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Lightbulb;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setActivePost(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className={cn("bg-card p-0", activePost ? "min-w-[90%]" : "min-w-[60%]")}>
        <DialogHeader hidden>
          <DialogTitle hidden>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex h-[90vh] flex-col px-6 py-5">
          <section className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: categoryColor }} />
            <p className="text-sm" style={{ color: categoryColor }}>
              {categoryLabel}
            </p>
          </section>

          <h1 className="mb-3 text-2xl leading-tight font-bold">{title}</h1>

          <hr />

          <div className="flex min-h-0 flex-1">
            {/* ---------------- LEFT PANEL ---------------- */}
            <div className="scrollbar-thin flex h-full flex-1 flex-col overflow-y-auto pr-4">
              <Accordion type="multiple" defaultValue={["what", "tasks"]} className="space-y-2">
                {/* WHAT THE MARKET TELLS US */}
                <AccordionItem value="what">
                  <AccordionTrigger className="ring-0!">What the market is telling us</AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{whatTheMarketTellsUs}</p>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* ACTION ITEMS */}
                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-sm font-bold tracking-wide">NEXT ACTIONS</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {(showAllTasks ? specificTasks : specificTasks.slice(0, 6)).map((task, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-lg p-2 hover:bg-gray-200/30">
                          <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-sm leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>

                    {specificTasks.length > 6 && (
                      <button
                        onClick={() => setShowAllTasks((v) => !v)}
                        className="text-muted-foreground mt-3 flex items-center gap-1 text-sm hover:underline"
                      >
                        {showAllTasks ? "Show less" : `Show ${specificTasks.length - 6} more`}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showAllTasks && "rotate-180")} />
                      </button>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* WHY IT MATTERS */}
                <AccordionItem value="why">
                  <AccordionTrigger className="ring-0!">Why this matters</AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{whyItMatters}</p>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* REFERENCED POSTS */}
                <AccordionItem value="posts">
                  <AccordionTrigger className="ring-0!">
                    <div className="flex items-center gap-2">
                      Referenced posts
                      <Badge variant="secondary">{posts.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {posts.map((post) => (
                        <Card
                          key={post.id}
                          onClick={() => setActivePost(post)}
                          className="hover:bg-muted/50 cursor-pointer gap-0 p-4 transition"
                        >
                          <h3 className="leading-tight font-semibold">{post.title}</h3>
                          <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                            <Markdown>{post.body}</Markdown>
                          </div>
                          <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                            <Badge variant="secondary">{post.platform}</Badge>
                            <span>•</span>
                            <span>{formatISODate(post.postCreatedAt)}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* ---------------- RIGHT PANEL (OPENED POST) ---------------- */}
            {activePost && (
              <div className="border-border relative flex w-[38%] min-w-[38%] flex-col border-l pt-4 pl-4">
                <button
                  className="hover:bg-muted absolute top-2 right-2 rounded-md p-1"
                  onClick={() => setActivePost(null)}
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Post header */}
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="secondary">{activePost.platform}</Badge>
                  <Badge variant="outline">{formatISODate(activePost.postCreatedAt)}</Badge>

                  <Badge className="gap-1">
                    <Link className="flex gap-1 p-0" href={activePost.url} target="_blank">
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Badge>
                </div>

                <h2 className="mb-3 text-xl leading-tight font-bold">{activePost.title}</h2>

                <div className="scrollbar-thin overflow-y-auto pr-2 text-sm whitespace-pre-wrap">
                  <Card className="bg-primary/5 mb-3 gap-2 p-3">
                    <p className="text-xs font-semibold uppercase">Insight</p>
                    <div className="whitespace-pre-wrap">
                      <Markdown>{activePost.insights}</Markdown>
                    </div>
                  </Card>

                  <Markdown>{activePost.body}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
