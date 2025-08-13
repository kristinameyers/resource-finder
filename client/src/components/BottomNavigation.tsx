import { useLocation } from "wouter";
import { Link } from "wouter";
import { Search, Heart, Phone, Users, Settings, Accessibility } from "lucide-react";
import { useTranslatedText } from "@/components/TranslatedText";

export function BottomNavigation() {
  const [location] = useLocation();
  const { text: searchText } = useTranslatedText("Search");
  const { text: favoritesText } = useTranslatedText("Favorites");
  const { text: callText } = useTranslatedText("Call");
  const { text: aboutText } = useTranslatedText("About Us");
  const { text: settingsText } = useTranslatedText("Settings");
  const { text: accessibilityText } = useTranslatedText("Accessibility");

  const handleCallClick = () => {
    window.location.href = "tel:18004001572";
  };

  const navItems = [
    {
      id: "search",
      label: searchText,
      icon: Search,
      path: "/",
      onClick: undefined
    },
    {
      id: "favorites",
      label: favoritesText,
      icon: Heart,
      path: "/favorites",
      onClick: undefined
    },
    {
      id: "call",
      label: callText,
      icon: Phone,
      path: "#",
      onClick: handleCallClick
    },
    {
      id: "about",
      label: aboutText,
      icon: Users,
      path: "/about",
      onClick: undefined
    },
    {
      id: "settings",
      label: settingsText,
      icon: Settings,
      path: "/settings",
      onClick: undefined
    },
    {
      id: "accessibility",
      label: accessibilityText,
      icon: Accessibility,
      path: "/accessibility",
      onClick: undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40" style={{ backgroundColor: "#539ED0" }}>
      <div className="flex justify-around items-center py-3 px-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          
          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center p-2 min-w-[55px] h-auto rounded-lg transition-all duration-150 transform active:scale-95 hover:scale-105"
                style={{ 
                  backgroundColor: "#005191",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,81,145,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,81,145,0.4)";
                  e.currentTarget.style.backgroundColor = "#0066b3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,81,145,0.3)";
                  e.currentTarget.style.backgroundColor = "#005191";
                }}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium" style={{ color: "#ffffff" }}>{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.path}>
              <button
                className="flex flex-col items-center justify-center p-2 min-w-[55px] h-auto rounded-lg transition-all duration-150 transform active:scale-95 hover:scale-105"
                style={{ 
                  backgroundColor: "#005191",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,81,145,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,81,145,0.4)";
                  e.currentTarget.style.backgroundColor = "#0066b3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,81,145,0.3)";
                  e.currentTarget.style.backgroundColor = "#005191";
                }}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium" style={{ color: "#ffffff" }}>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
      {/* Safe area for mobile devices */}
      <div className="h-safe-bottom bg-inherit"></div>
    </nav>
  );
}