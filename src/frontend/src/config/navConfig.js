import {
  Home,
  Plus,
  Sparkles,
  User,
  MessageCircle,
  Image,
} from "lucide-react";

export const navItems = [
  { id: "home", icon: Home, label: "Home", path: "/dashboard" },
  { id: "create", icon: Plus, label: "Post", path: "/dashboard?create=true" },
  { id: "ai-tools", icon: Sparkles, label: "AI Tools", path: "/ai-tools" },
  { id: "gallery", icon: Image, label: "Gallery", path: "/gallery" },
  { id: "messages", icon: MessageCircle, label: "Messages", path: "/messages" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

