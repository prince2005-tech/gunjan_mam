import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import NotificationToast from './components/layout/NotificationToast';

// Pages
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import BinManagement from './pages/BinManagement';
import TruckManagement from './pages/TruckManagement';
import Optimization from './pages/Optimization';
import RoadNetworkAnalysis from './pages/RoadNetworkAnalysis';
import Analytics from './pages/Analytics';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [locationForNewBin, setLocationForNewBin] = useState(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'map':
        return (
          <MapPage
            setActivePage={setActivePage}
            setLocationForNewBin={setLocationForNewBin}
          />
        );
      case 'bins':
        return (
          <BinManagement
            prefilledLocation={locationForNewBin}
            onClearPrefilledLocation={() => setLocationForNewBin(null)}
          />
        );
      case 'trucks':
        return <TruckManagement setActivePage={setActivePage} />;
      case 'optimization':
        return <Optimization setActivePage={setActivePage} />;
      case 'network':
        return <RoadNetworkAnalysis />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F8F5] text-[#1F2937] antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
