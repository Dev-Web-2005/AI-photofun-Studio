import {
  Home,
  Plus,
  Sparkles,
  User,
  MessageCircle,
  Compass,
} from "lucide-react";

export const navItems = [
  { id: "home", icon: Home, label: "Home", path: "/dashboard" },
  { id: "discover", icon: Compass, label: "Discover", path: "/discover" },
  { id: "ai-tools", icon: Sparkles, label: "AI Tools", path: "/ai-tools" },
  { id: "messages", icon: MessageCircle, label: "Messages", path: "/messages" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];
