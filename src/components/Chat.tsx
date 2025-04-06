import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useChatStore } from '../lib/store';
import { chat } from '../lib/chat';
import { VCResults } from './VCResults';

export function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, isLoading, setIsLoading, vcResults } = useChatStore();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only auto-scroll after the user has interacted or when there are new messages
    if (hasUserInteracted || messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, vcResults, hasUserInteracted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Mark that user has interacted
    setHasUserInteracted(true);
    
    const userMessage = { role: 'user' as const, content: input };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat([...messages, userMessage]);
      addMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col space-y-4">
          {/* Find VCs trigger response index */}
          {(() => {
            // Find the index of the assistant message that triggered the VC recommendations
            const vcTriggerIndex = messages.findIndex(
              msg => msg.role === 'assistant' && 
              (msg.content.includes("I've found some VC matches") || 
               msg.content.includes("Based on what you've shared"))
            );
            
            // All messages up to and including the trigger should go above VC recommendations
            const messagesAboveVCs = vcTriggerIndex !== -1 ? 
              messages.slice(0, vcTriggerIndex + 1) : 
              messages;
              
            return (
              <>
                {messagesAboveVCs.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className={`p-4 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-zinc-800/50 text-zinc-200'
                        : 'bg-zinc-700/30 text-zinc-300 ml-auto'
                    } max-w-[80%]`}

                  >
                    {message.content}
                  </motion.div>
                ))}
              </>
            );
          })()} 
        </div>
        
        {/* Display VC Results when available */}
        {vcResults && vcResults.length > 0 && (
          <VCResults vcs={vcResults} />
        )}
        
        {/* Messages that should appear after VCs */}
        {vcResults && vcResults.length > 0 && (
          <div className="flex flex-col space-y-4">
            {(() => {
              // Find the index of the assistant message that triggered the VC recommendations
              const vcTriggerIndex = messages.findIndex(
                msg => msg.role === 'assistant' && 
                (msg.content.includes("I've found some VC matches") || 
                 msg.content.includes("Based on what you've shared"))
              );
              
              // Only show messages that came after the VC trigger message
              const messagesAfterVCs = vcTriggerIndex !== -1 && vcTriggerIndex < messages.length - 1 ? 
                messages.slice(vcTriggerIndex + 1) : 
                [];
                
              return messagesAfterVCs.length > 0 ? (
                messagesAfterVCs.map((message, i) => (
                  <motion.div
                    key={`post-vc-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className={`p-4 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-zinc-800/50 text-zinc-200'
                        : 'bg-zinc-700/30 text-zinc-300 ml-auto'
                    } max-w-[80%]`}

                  >
                    {message.content}
                  </motion.div>
                ))
              ) : null;
            })()} 
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="bg-zinc-800/50 p-4 rounded-lg text-zinc-400"

          >
            thinking...
          </motion.div>
        )}
        <div ref={messagesEndRef} />

        {/* Input form always at the bottom */}
        <form onSubmit={handleSubmit} className="relative sticky bottom-4" onClick={() => setHasUserInteracted(true)}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onClick={() => setHasUserInteracted(true)}
            placeholder={vcResults && vcResults.length > 0 ? "ask more about these vcs..." : "tell us about your startup..."}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="w-full p-4 pr-12 bg-transparent border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"

          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}