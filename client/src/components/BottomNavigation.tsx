import { Home, Phone, User } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const handleCallClick = () => {
    window.location.href = "tel:18004001572";
  };

  const navItems = [
    {
      id: "search",
      label: "Search",
      icon: Home,
      path: "/",
      onClick: undefined
    },
    {
      id: "call",
      label: "Call",
      icon: Phone,
      path: "#",
      onClick: handleCallClick
    },
    {
      id: "about",
      label: "About Us",
      icon: User,
      path: "/about",
      onClick: undefined
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40" style={{ backgroundColor: "#539ED0" }}>
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          
          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-[70px]"
                style={{ 
                  backgroundColor: "#005191",
                  color: "#ffffff"
                }}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.path}>
              <button
                className="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-w-[70px]"
                style={{ 
                  backgroundColor: "#005191",
                  color: "#ffffff"
                }}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
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