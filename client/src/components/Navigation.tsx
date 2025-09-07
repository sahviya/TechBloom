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

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/journal", label: "Journal", icon: "fas fa-feather-alt" },
    { path: "/community", label: "Community", icon: "fas fa-users" },
    { path: "/media", label: "Media", icon: "fas fa-play-circle" },
    { path: "/games", label: "Games", icon: "fas fa-gamepad" },
    { path: "/books", label: "Books", icon: "fas fa-book-open" },
    { path: "/shopping", label: "Shopping", icon: "fas fa-shopping-bag" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 genie-gradient rounded-full flex items-center justify-center glow-effect">
                <i className="fas fa-magic text-primary-foreground text-lg"></i>
              </div>
              <h1 className="text-2xl font-serif font-bold text-primary">MindBloom</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? "default" : "ghost"}
                    className={location === item.path ? "genie-gradient" : ""}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <i className={`${item.icon} mr-2`}></i>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32" data-testid="language-selector">
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
                  <Button variant="outline" size="icon" data-testid="theme-selector">
                    <i className="fas fa-palette"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="profile-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="genie-gradient text-primary-foreground">
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block font-medium">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            </div>
          </div>
        </div>
      </header>

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
