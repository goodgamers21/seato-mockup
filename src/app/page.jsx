"use client";
import React, { useState } from 'react';

// Layout & UI
import DeviceFrame from '../components/layout/DeviceFrame';
import BottomNav from '../components/layout/BottomNav';
import BottomSheet from '../components/ui/BottomSheet';
import InvoiceModal from '../components/ui/InvoiceModal';
import toast, { Toaster } from 'react-hot-toast';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ReservasiScreen from '../screens/ReservasiScreen';
import AkunScreen from '../screens/AkunScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import PromoDetailScreen from '../screens/PromoDetailScreen';
import PromoScreen from '../screens/PromoScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import NearbyScreen from '../screens/NearbyScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRestoForBooking, setSelectedRestoForBooking] = useState('');
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [viewingPromo, setViewingPromo] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [viewingNearby, setViewingNearby] = useState(false);
  const [viewingLeaderboard, setViewingLeaderboard] = useState(false);
  const [viewingSettings, setViewingSettings] = useState(false);
  const [preSelectedPromoId, setPreSelectedPromoId] = useState('');
  
  const [newBookingInvoice, setNewBookingInvoice] = useState(null);

  const openBooking = (restaurantData, promoId = '') => {
    setSelectedRestoForBooking(restaurantData);
    setPreSelectedPromoId(promoId);
    setSheetOpen(true);
  };

  const handleBookingConfirm = async (bookingData) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: selectedRestoForBooking.name,
          date: bookingData.date,
          time: bookingData.time,
          guests: bookingData.guests,
          tableType: bookingData.tableType,
          areaId: bookingData.areaId,
          notes: bookingData.notes,
          promoId: bookingData.promoId,
          userId: currentUser?.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal membuat reservasi.');
        return;
      }

      toast.success('Booking berhasil, silahkan cek email Anda.', {
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      setSheetOpen(false);
      setPreSelectedPromoId('');
      setViewingRestaurant(null); 
      setViewingPromo(null); 
      
      setTimeout(() => {
        setActiveTab('reservasi');
      }, 1500);
    } catch (e) {
      toast.error('Terjadi kesalahan saat memproses booking.');
    }
  };

  const closeBookingInvoice = () => {
    setNewBookingInvoice(null);
    setActiveTab('reservasi');
  };

  const renderActiveScreen = () => {
    if (viewingLeaderboard) {
       return <LeaderboardScreen currentUser={currentUser} onBack={() => setViewingLeaderboard(false)} />;
    }

    if (viewingSettings) {
       return <AkunScreen currentUser={currentUser} onBack={() => setViewingSettings(false)} onLogout={() => { setIsLoggedIn(false); setCurrentUser(null); setActiveTab('home'); setViewingSettings(false); }} />;
    }

    if (viewingRestaurant) {
      return (
        <RestaurantDetailScreen 
          restaurant={viewingRestaurant} 
          onBack={() => setViewingRestaurant(null)} 
          onBooking={openBooking}
        />
      );
    }

    if (viewingPromo) {
      return (
        <PromoDetailScreen
          promo={viewingPromo}
          onBack={() => setViewingPromo(null)}
          onBooking={(restaurant, promoId) => openBooking(restaurant, promoId)}
          onSelectRestaurant={(restaurant) => {
            setViewingRestaurant(restaurant);
            setViewingPromo(null);
          }}
        />
      );
    }

    if (viewingCategory) {
      return (
        <CategoryDetailScreen 
          category={viewingCategory}
          onBack={() => setViewingCategory(null)}
          onSelectRestaurant={setViewingRestaurant}
        />
      );
    }

    if (viewingNearby) {
      return (
        <NearbyScreen 
          onBack={() => setViewingNearby(false)}
          onSelectRestaurant={setViewingRestaurant}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen 
                 onSearch={() => {}} 
                 onSelectRestaurant={setViewingRestaurant} 
                 onSelectPromo={setViewingPromo} 
                 onOpenCategory={setViewingCategory}
                 onOpenNearby={() => setViewingNearby(true)}
               />;
      case 'promo':
        return <PromoScreen />;
      case 'community':
        return <CommunityScreen currentUser={currentUser} />;
      case 'reservasi':
        return <ReservasiScreen currentUser={currentUser} navigateToExplore={() => setActiveTab('home')} />;
      case 'akun':
        return <ProfileScreen 
                  currentUser={currentUser} 
                  onNavigate={(dest) => {
                     if (dest === 'leaderboard') setViewingLeaderboard(true);
                     if (dest === 'settings') setViewingSettings(true);
                  }}
               />;
      default:
        return <HomeScreen currentUser={currentUser} />;
    }
  };

  return (
    <>
      <DeviceFrame activeTab={activeTab}>
        {!isLoggedIn ? (
          <LoginScreen onLogin={(user) => {
            setCurrentUser(user);
            setIsLoggedIn(true);
          }} />
        ) : (
          <>
            {renderActiveScreen()}
            {!viewingRestaurant && !viewingPromo && !viewingCategory && !viewingNearby && !viewingLeaderboard && !viewingSettings && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
            
            <BottomSheet 
              isOpen={sheetOpen} 
              onClose={() => setSheetOpen(false)} 
              restaurant={selectedRestoForBooking}
              onConfirm={handleBookingConfirm}
              preSelectedPromoId={preSelectedPromoId}
            />

            {newBookingInvoice && (
              <InvoiceModal 
                invoice={newBookingInvoice} 
                onClose={closeBookingInvoice} 
              />
            )}
          </>
        )}
      </DeviceFrame>
      
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            zIndex: 9999,
          }
        }}
        containerStyle={{
          position: 'fixed',
          top: '40px',
          zIndex: 9999,
        }}
      />
    </>
  );
}

