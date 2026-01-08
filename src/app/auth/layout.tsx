import { ReactNode } from "react";

import Image from "next/image";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="bg-primary relative order-2 hidden h-full items-center justify-center rounded-3xl lg:flex">
          <div className="text-primary-foreground space-y-1 px-10">
            <Image src="/images/Logo.png" alt="logo" height={300} width={300} />

            <p className="text-center font-medium">Build what the market actually wants.</p>
          </div>

          <div className="absolute bottom-10 flex w-full justify-between px-10">
            <div className="text-primary-foreground flex-1 space-y-0.5">
              <h2 className="text-[15px] font-medium">Ready to move with confidence?</h2>
              <p className="text-sm">Get your account set up, and dive into your dashboard in minutes.</p>
            </div>
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
