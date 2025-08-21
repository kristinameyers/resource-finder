import { useState } from 'react';
import { useLocation as useRouter } from 'wouter';
import { Menu, ChevronLeft, MapPin, X } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import sbLogo from '@/assets/new-211-logo.png';

interface GlobalNavbarProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function GlobalNavbar({ showBackButton = false, onBackClick }: GlobalNavbarProps) {
  const [, setLocation] = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const goBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  const goToLocation = () => {
    setLocation('/update-location');
    closeMenu();
  };

  const menuItems = [
    { key: 'home', path: '/', text: 'Home' },
    { key: 'about', path: '/about', text: 'About' },
    { key: 'category', path: '/search-category', text: 'Search by Category' },
    { key: 'keyword', path: '/search-keyword', text: 'Search by Keyword' },
    { key: 'location', path: '/update-location', text: 'Update Location' },
    { key: 'favorites', path: '/favorites', text: 'Favorites' },
    { key: 'call', action: () => window.open('tel:211'), text: 'Call 211' },
    { key: 'settings', path: '/settings', text: 'Settings' }
  ];

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      setLocation(item.path);
    }
    closeMenu();
  };

  return (
    <>
      {/* Global Navbar */}
      <div className="global-navbar">
        <div className="nav-left">
          {showBackButton && (
            <button className="nav-icon" onClick={goBack}>
              <ChevronLeft size={24} color="#005191" />
            </button>
          )}
          <button className="nav-icon" onClick={openMenu}>
            <Menu size={24} color="#005191" />
          </button>
        </div>
        <div className="nav-center">
          <img className="nav-logo" src={sbLogo} alt="Santa Barbara 211 Logo"/>
        </div>
        <div className="nav-right">
          <button className="nav-icon" onClick={goToLocation}>
            <MapPin size={24} color="#005191" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Slide Out Menu */}
      <div className={`slide-menu ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Close X button */}
        <div className="menu-header">
          <button className="menu-close-btn" onClick={closeMenu}>
            <X size={24} color="#222" />
          </button>
        </div>
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li 
              key={item.key}
              className="menu-list-item"
              onClick={() => handleMenuItemClick(item)}
            >
              <TranslatedText text={item.text} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}