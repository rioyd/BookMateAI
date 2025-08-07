import { useLocation } from "wouter";
import { Book, Camera, Search, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Book, label: "Library", path: "/" },
    { icon: Camera, label: "Scan", path: "/camera" },
    { icon: Search, label: "Check", path: "/duplicate-checker" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`flex-1 py-3 px-4 transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className="text-lg" size={20} />
                <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
