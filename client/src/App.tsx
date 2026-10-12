import React, { useState } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './pages/LandingPage.js';
import { LobbyPage } from './pages/LobbyPage.js';
import { AuctionArenaPage } from './pages/AuctionArenaPage.js';
import { MyTeamPage } from './pages/MyTeamPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { CreateRoomModal } from './components/CreateRoomModal.js';
import { JoinRoomModal } from './components/JoinRoomModal.js';
import { CatalogueBrowser } from './components/CatalogueBrowser.js';
import { ProfileModal } from './components/ProfileModal.js';
import { Toast } from './components/Toast.js';
import { Footer } from './components/Footer.js';
import { useUser } from './context/UserContext.js';
import { LoginPage } from './pages/LoginPage.js';

function MainRouter() {
  const { roomState } = useAuction();
  const { user } = useUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'arena' | 'team' | 'leaderboard'>('arena');

  if (!user) {
    return <LoginPage />;
  }

  // Decide view based on roomState status
  const renderCurrentView = () => {
    if (!roomState) {
      return (
        <LandingPage
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenJoin={() => setIsJoinOpen(true)}
          onOpenCatalogue={() => setIsCatalogueOpen(true)}
        />
      );
    }

    if (roomState.status === 'LOBBY') {
      return <LobbyPage />;
    }

    if (roomState.status === 'AUCTION_ACTIVE') {
      if (currentTab === 'team') return <MyTeamPage />;
      if (currentTab === 'leaderboard') return <ResultsPage />;
      return <AuctionArenaPage />;
    }

    if (roomState.status === 'COMPLETED') {
      if (currentTab === 'team') return <MyTeamPage />;
      return <ResultsPage />;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090D] text-[#F5F0E7]">
      {(!roomState || roomState.status !== 'AUCTION_ACTIVE') && (
        <Navbar
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenJoin={() => setIsJoinOpen(true)}
          onOpenCatalogue={() => setIsCatalogueOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
      )}

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          setCurrentTab('arena');
        }}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          setIsJoinOpen(false);
          setCurrentTab('arena');
        }}
      />

      <CatalogueBrowser
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Floating Alerts */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <MainRouter />
    </AuctionProvider>
  );
}
