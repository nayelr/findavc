import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useChatStore } from '../lib/store';
import { chat } from '../lib/chat';
import { VCResults } from './VCResults';

export function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to scrollHeight to fit all content
      textarea.style.height = `${Math.max(60, textarea.scrollHeight)}px`;
    }
  }, [input]);

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

  // Handle keyboard events for the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but not with Shift+Enter which creates a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 pb-16">
      <div className="w-full max-w-4xl space-y-8">
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
                    className={`p-5 rounded-lg text-lg ${
                      message.role === 'assistant'
                        ? 'bg-zinc-800/50 text-zinc-200'
                        : 'bg-zinc-700/30 text-zinc-300 ml-auto'
                    } max-w-[85%]`}

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
                    className={`p-5 rounded-lg text-lg ${
                      message.role === 'assistant'
                        ? 'bg-zinc-800/50 text-zinc-200'
                        : 'bg-zinc-700/30 text-zinc-300 ml-auto'
                    } max-w-[85%]`}

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
            className="bg-zinc-800/50 p-5 rounded-lg text-lg text-zinc-400"

          >
            thinking...
          </motion.div>
        )}
        <div ref={messagesEndRef} />

        {/* Input form always at the bottom */}
        <form onSubmit={handleSubmit} className="relative sticky bottom-4" onClick={() => setHasUserInteracted(true)}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onClick={() => setHasUserInteracted(true)}
            onKeyDown={handleKeyDown}
            placeholder={vcResults && vcResults.length > 0 ? "ask more about these vcs..." : "tell us about your startup..."}
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              resize: "none",
              overflow: "hidden",
              minHeight: "60px"
            }}
            rows={1}
            className="w-full p-5 pr-14 bg-transparent border border-zinc-700 rounded-lg text-lg text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}