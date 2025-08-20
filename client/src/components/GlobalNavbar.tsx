import { useState } from 'react';
import { useLocation as useRouter } from 'wouter';
import { Menu, ChevronLeft, MapPin } from 'lucide-react';
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
      <div 
        className="global-navbar"
        style={{
          width: '100vw',
          height: '66px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '2000',
          boxShadow: '0 2px 8px rgba(34,34,34,0.05)',
          padding: '0 24px'
        }}
      >
        {/* Left Section (Menu & Back) */}
        <div 
          className="nav-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}
        >
          <button 
            className="nav-icon"
            onClick={openMenu}
            style={{
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={24} color="#005191" />
          </button>
          {showBackButton && (
            <button 
              className="nav-icon"
              onClick={goBack}
              style={{
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={24} color="#005191" />
            </button>
          )}
        </div>

        {/* Center Section (Logo) */}
        <div 
          className="nav-center"
          style={{
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            className="nav-logo"
            src={sbLogo}
            alt="Santa Barbara County 211"
            style={{
              height: '46px',
              objectFit: 'contain',
              background: 'none'
            }}
          />
        </div>

        {/* Right Section (Location) */}
        <div 
          className="nav-right"
          style={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <button 
            className="nav-icon"
            onClick={goToLocation}
            style={{
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MapPin size={24} color="#005191" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: '2500'
          }}
          onClick={closeMenu}
        />
      )}

      {/* Slide Out Menu */}
      {isMenuOpen && (
        <div 
          className="menu-drawer"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            height: '100vh',
            width: '240px',
            background: '#fff',
            boxShadow: '2px 0 8px rgba(34,34,34,0.08)',
            zIndex: '3000',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 18px',
            gap: '14px',
            transition: 'transform 0.2s',
            transform: 'translateX(0)'
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.key}
              className="menu-item-btn"
              onClick={() => handleMenuItemClick(item)}
              style={{
                background: '#0458a3',
                color: '#fff',
                fontWeight: '600',
                fontSize: '17px',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '6px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.18s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff8200';
                e.currentTarget.style.color = '#222';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0458a3';
                e.currentTarget.style.color = '#fff';
              }}
            >
              <TranslatedText text={item.text} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}