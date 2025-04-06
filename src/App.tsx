import { useEffect, useState, useRef } from 'react';
import { Landing } from './components/Landing';
import { Chat } from './components/Chat';
import { useChatStore } from './lib/store';

function App() {
  const { messages, addMessage } = useChatStore();
  const [showChat, setShowChat] = useState(false);
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
    <main className="bg-zinc-900 min-h-screen overflow-auto" ref={appRef}>
      {/* Create a container that enables scrolling */}
      <div className="scroll-container bg-zinc-900" style={{ minHeight: '200vh' }}>
        <Landing onShowChat={handleShowChat} />
        {/* Only render the Chat component when showChat is true */}
        {showChat && <Chat />}
      </div>
    </main>
  );
}

export default App;