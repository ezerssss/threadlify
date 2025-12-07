"use client";
import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import ky from "ky";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { INVITES_COLLECTION_REF } from "@/constants/firebase";
import { ACCEPT_INVITE_URL } from "@/constants/url";
import { auth } from "@/firebase";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { InviteType } from "@/types/invite";

const provider = new GoogleAuthProvider();

interface InviteContentProps {
  inviteData: InviteType;
}

// eslint-disable-next-line complexity
function InviteContent(props: InviteContentProps) {
  const { inviteData } = props;
  const { user, userData } = useUser();
  const router = useRouter();

  const { status, claimedBy, id, name, imageUrl } = inviteData;
  const [isLoading, setIsLoading] = useState(status !== "available");
  const [isProcessing, setIsProcessing] = useState(status !== "available");

  if (!!userData && userData.id !== claimedBy) {
    return (
      <>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">This invitation can’t be accepted</CardTitle>
          <p className="text-muted-foreground text-sm">
            You’re already associated with an account using this email address.
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {name}
          </div>
        </CardContent>

        <CardFooter>
          <Button disabled={isLoading} onClick={() => router.replace("/dashboard")} className="w-full" size="lg">
            Go to dashboard
          </Button>
        </CardFooter>
      </>
    );
  }

  if (claimedBy && claimedBy !== user?.uid && status === "processing") {
    return (
      <>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">This invitation is already being processed</CardTitle>
          <p className="text-muted-foreground text-sm">
            This account invitation has already been opened and is currently being accepted by another user.
          </p>
          <p className="text-muted-foreground text-sm">
            If this was intended for you, please wait a moment or contact the person who shared the invitation.
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {name}
          </div>
        </CardContent>
      </>
    );
  }

  if (claimedBy && claimedBy === user?.uid && status === "processing") {
    return (
      <>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">We’re finishing setting things up</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your access request has been received.
            <br /> This usually takes a few moments.
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {name}
          </div>
        </CardContent>

        <CardFooter>
          <Button disabled={isLoading} onClick={handleClaim} className="w-full" size="lg">
            Processing
          </Button>
        </CardFooter>
      </>
    );
  }

  if (claimedBy && claimedBy !== user?.uid && status === "claimed") {
    return (
      <>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">This invitation has already been accepted</CardTitle>
          <p className="text-muted-foreground text-sm">
            This invitation link is no longer active.
            <br /> If you need access to the account, please ask an account administrator to add you.
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {name}
          </div>
        </CardContent>
      </>
    );
  }

  if (claimedBy && claimedBy === user?.uid && status === "claimed") {
    return (
      <>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">Your account is ready</CardTitle>
          <p className="text-muted-foreground text-sm">
            Access has been successfully configured.
            <br /> You can now continue to the dashboard.
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {name}
          </div>
        </CardContent>

        <CardFooter>
          <Button disabled={isLoading} onClick={() => router.replace("/dashboard")} className="w-full" size="lg">
            Go to dashboard
          </Button>
        </CardFooter>
      </>
    );
  }

  async function handleClaim() {
    if (status === "processing" || isLoading) {
      toast.error("Invite is already processing. Please wait until it is finished.");
      return;
    }

    if (status === "claimed") {
      toast.error("Invite already claimed!");
      return;
    }

    try {
      setIsLoading(true);
      const { user } = await signInWithPopup(auth, provider);

      setIsProcessing(true);
      const idToken = await user.getIdToken();

      await ky
        .post(ACCEPT_INVITE_URL, {
          json: { inviteId: id },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .json();

      toast.success("Invitation is now being processed.");
    } catch (error) {
      toastError(error);
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CardHeader className="flex flex-col items-center gap-4 text-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">Claim your account</CardTitle>
        <p className="text-muted-foreground text-sm">This account has been set up and is ready for your access.</p>
      </CardHeader>

      <CardContent className="text-center">
        <div className="flex items-center justify-center gap-2 text-lg font-medium">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {name}
        </div>
      </CardContent>

      <CardFooter>
        <Button disabled={isProcessing} onClick={handleClaim} className="w-full" size="lg">
          {isLoading && isProcessing ? "Processing" : "Claim account"}
        </Button>
      </CardFooter>
    </>
  );
}

export default function InvitePage() {
  const { inviteId } = useParams<{ inviteId: string }>();

  const [inviteData, setInviteData] = useState<InviteType>();

  useEffect(() => {
    const inviteDocRef = doc(INVITES_COLLECTION_REF, inviteId);

    const unsubscribe = onSnapshot(inviteDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setInviteData(docSnapshot.data() as InviteType);
      }
    });

    return () => unsubscribe();
  }, [inviteId]);

  const loadingContent = (
    <>
      <CardHeader hidden className="flex flex-col items-center gap-4 text-center">
        <CardTitle hidden className="text-2xl">
          Loading
        </CardTitle>
      </CardHeader>

      <CardContent className="flex h-full flex-1 flex-col items-center justify-center text-4xl">
        <Spinner />
      </CardContent>
    </>
  );

  const content = inviteData ? <InviteContent inviteData={inviteData} /> : loadingContent;

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center px-4">
      <Card className="min-h-80 w-full max-w-md shadow-lg">{content}</Card>
    </div>
  );
}
