import { useEffect, useState, useRef } from 'react';
import { Landing } from './components/Landing';
import { Chat } from './components/Chat';
import { useChatStore } from './lib/store';

function App() {
  const { messages, addMessage } = useChatStore();
  const [showChat, setShowChat] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);
  const hasAddedWelcomeMessage = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);
  const wheelEventTriggered = useRef(false);

  useEffect(() => {
    if (!hasAddedWelcomeMessage.current && messages.length === 0) {
      addMessage({
        role: 'assistant',
        content: "hello! i'm finda, your ai assistant for finding the perfect vc match. tell me about your startup and fundraising goals."
      });
      hasAddedWelcomeMessage.current = true;
    }
  }, []); // Only run once on mount

  // Enhanced scroll/wheel detection
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only trigger once
      if (wheelEventTriggered.current) return;
      
      // Detect downward scrolling (positive deltaY means scrolling down)
      if (e.deltaY > 0 && !showChat) {
        wheelEventTriggered.current = true;
        setShowChat(true);
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
    };

    // Standard scroll detection as backup
    const handleScroll = () => {
      if (window.scrollY > 50 && !showChat) { // More sensitive threshold
        setShowChat(true);
      }
      
      // Show attribution bar only when scrolled down
      if (window.scrollY > 100) {
        setShowAttribution(true);
      } else {
        setShowAttribution(false);
      }
    };

    // Add both wheel and scroll listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showChat]); // Add showChat as dependency to prevent unnecessary triggers

  // Function to pass to Landing component to trigger showing chat
  const handleShowChat = () => {
    setShowChat(true);
    // Scroll to chat section smoothly
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <main className="bg-zinc-900 min-h-screen overflow-auto relative" ref={appRef}>
      {/* Create a container that enables scrolling */}
      <div className="scroll-container bg-zinc-900" style={{ minHeight: '200vh' }}>
        <Landing onShowChat={handleShowChat} />
        {/* Only render the Chat component when showChat is true */}
        {showChat && <Chat />}
      </div>
      
      {/* Attribution bar */}
      <div className={`fixed bottom-0 left-0 right-0 py-3 px-4 bg-zinc-900 text-zinc-400 text-base text-center z-10 transition-opacity duration-300 ${showAttribution ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          built by <a href="https://nayel.me" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors">nayel</a> · 
          data courtesy of <a href="https://www.openvc.app/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors">openvc</a>
        </span>
      </div>
    </main>
  );
}

export default App;