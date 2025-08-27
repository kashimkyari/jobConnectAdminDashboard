import { FC, ElementType } from "react";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Gavel, 
  IdCard, 
  Shield, 
  CreditCard,
  TrendingUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", icon: BarChart3, label: "Dashboard" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/disputes", icon: Gavel, label: "Disputes" },
  { href: "/kyc", icon: IdCard, label: "KYC Verification" },
  { href: "/content", icon: Shield, label: "Content Moderation" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/metrics", icon: TrendingUp, label: "Metrics" },
  { href: "/reviews", icon: MessageSquare, label: "Reviews" },
];

interface NavItemProps {
  href: string;
  icon: ElementType;
  label: string;
  isCollapsed: boolean;
}

const NavItem: FC<NavItemProps> = ({ href, icon: Icon, label, isCollapsed }) => {
  const [location] = useLocation();
  const isActive = location === href;

  const linkContent = (
    <a
      className={cn(
        "flex items-center px-3 py-2 rounded-lg mb-2 font-medium transition-colors w-full",
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        isCollapsed && "justify-center"
      )}
      data-testid={`link-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </a>
  );

  return (
    <Link href={href}>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        linkContent
      )}
    </Link>
  );
};

interface UserProfileProps {
  isCollapsed: boolean;
}


interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <div
      className={cn(
        "relative bg-card shadow-lg flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-3 py-4 border-b h-16">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-xl font-semibold text-foreground truncate">
            JobConnect
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow mt-4 px-3">
        {navigationItems.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>


      {/* Toggle Button */}
      <div className="absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
        <Button
          onClick={toggleSidebar}
          variant="outline"
          size="icon"
          className="rounded-full"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
