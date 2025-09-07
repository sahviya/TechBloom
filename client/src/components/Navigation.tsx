import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिंदी" },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/journal", label: "Journal", icon: "fas fa-feather-alt" },
    { path: "/community", label: "Community", icon: "fas fa-users" },
    { path: "/genie", label: "Ur Genie", icon: "fas fa-robot" },
    { path: "/media", label: "Media", icon: "fas fa-play-circle" },
    { path: "/games", label: "Games", icon: "fas fa-gamepad" },
    { path: "/books", label: "Books", icon: "fas fa-book-open" },
    { path: "/shopping", label: "Shopping", icon: "fas fa-shopping-bag" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 genie-gradient rounded-full flex items-center justify-center glow-effect shrink-0">
                <i className="fas fa-magic text-primary-foreground text-lg"></i>
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-serif font-bold text-primary">MindBloom</h1>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
              data-testid="sidebar-toggle"
            >
              <i className={`fas fa-${isCollapsed ? 'angle-right' : 'angle-left'}`}></i>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={location === item.path ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location === item.path && "genie-gradient",
                  isCollapsed && "px-2"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} ${isCollapsed ? '' : 'mr-3'} w-4`}></i>
                {!isCollapsed && item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-4">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start p-2",
                  isCollapsed && "justify-center"
                )}
                data-testid="profile-menu"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                  <AvatarFallback className="genie-gradient text-primary-foreground">
                    {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {(user as any)?.firstName || (user as any)?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(user as any)?.email || ""}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="right">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Controls */}
          {!isCollapsed && (
            <div className="space-y-3">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full" data-testid="language-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="theme-selector">
                    <i className="fas fa-palette mr-2"></i>
                    Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <i className="fas fa-sun mr-2"></i>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <i className="fas fa-moon mr-2"></i>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <i className="fas fa-desktop mr-2"></i>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center py-2 px-3 ${
                  location === item.path ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} mb-1`}></i>
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}