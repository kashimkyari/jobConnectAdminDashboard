import { useState, FC, ElementType } from "react";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Gavel, 
  IdCard, 
  Shield, 
  CreditCard, 
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", icon: BarChart3, label: "Dashboard" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/disputes", icon: Gavel, label: "Disputes" },
  { href: "/kyc", icon: IdCard, label: "KYC Verification" },
  { href: "/content", icon: Shield, label: "Content Moderation" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
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

  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 rounded-lg mb-2 font-medium transition-colors",
          isActive
            ? "text-primary-600 bg-primary-50"
            : "text-secondary-600 hover:text-primary-600 hover:bg-gray-50",
          isCollapsed && "justify-center"
        )}
        data-testid={`link-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
        {!isCollapsed && <span>{label}</span>}
      </a>
    </Link>
  );
};

interface UserProfileProps {
  isCollapsed: boolean;
}

const UserProfile: FC<UserProfileProps> = ({ isCollapsed }) => {
  const { user } = useAuth();

  return (
    <div className="flex items-center px-3 py-2">
      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
        <User className="h-4 w-4 text-primary-600" />
      </div>
      {!isCollapsed && (
        <div className="ml-3">
          <p className="text-sm font-medium text-secondary-700" data-testid="text-username">
            {user?.fullname && user?.lastName 
              ? `${user.lastName} ${user.lastName}` 
              : user?.fullname || "Admin User"}
          </p>
          <p className="text-xs text-secondary-500">Administrator</p>
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn("relative bg-white shadow-lg flex-shrink-0 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && <span className="ml-3 text-xl font-semibold text-secondary-700">JobConnect</span>}
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <div className="px-3">
          {navigationItems.map((item) => (
            <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
          ))}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
        <UserProfile isCollapsed={isCollapsed} />
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-2 flex items-center px-3 py-2 text-secondary-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </Button>
        <div className={cn("mt-4", isCollapsed ? "flex justify-center" : "px-3")}>
          <ThemeToggle />
        </div>
      </div>

      {/* Toggle Button */}
      <div className="absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
        <Button onClick={toggleSidebar} variant="outline" size="icon" className="rounded-full">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
