import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { cn } from "@/lib/utils";

function SidebarCopyRight() {
  const { open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <p className={cn("text-muted-foreground text-sm", open ? "text-left" : "text-center text-lg")}>
          {open ? APP_CONFIG.copyright : "©"}
        </p>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default SidebarCopyRight;
