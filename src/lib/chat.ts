import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { getVCs, getRecommendedVCs } from './vcs';
import { useChatStore } from './store';

// Use environment variables for API credentials
const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://vc.openai.azure.com/';
const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;

// Create a function to get the OpenAI client or handle missing API key
const getOpenAIClient = () => {
  if (!apiKey) {
    console.error('Azure OpenAI API key is missing. Please set the VITE_AZURE_OPENAI_KEY environment variable.');
    throw new Error('Azure OpenAI API key is not configured');
  }
  
  return new OpenAIClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );
};

// Only create the client when needed
let client: OpenAIClient | null = null;

export async function chat(messages: { role: string; content: string }[]) {
  try {
    // Check if we have enough information to show VC recommendations before making the API call
    const shouldShowRecommendations = shouldShowVCRecommendations(messages, "");
    
    // If we have enough information to show recommendations, immediately return a brief response
    // and trigger the VC recommendations
    if (shouldShowRecommendations) {
      try {
        const vcData = await getVCs();
        const recommendations = getRecommendedVCs(vcData, 6);
        const { setVcResults } = useChatStore.getState();
        setVcResults(recommendations);
        
        // Get the last message to check if it's from the user
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage.role === 'user') {
          // Return a brief, positive conclusion without asking for more information
          return "great! based on what you've shared about your startup, i've found some vc matches that might be a good fit for you.";
        } else {
          // If the last message was from the assistant, just return the original response
          return lastMessage.content;
        }
      } catch (error) {
        console.error('Error getting VC recommendations:', error);
        return "i'm having trouble processing your request. please try again later.";
      }
    }
    
    // If we don't have enough information yet, add a system message to guide the AI
    let messagesToSend = [...messages];
    const lastUserMessageIndex = messages.findIndex(msg => msg.role === 'user');
    
    // Add a system message to help guide the conversation toward gathering necessary info
    if (lastUserMessageIndex !== -1) {
      messagesToSend = [
        ...messages,
        {
          role: 'system',
          content: 'always respond in all lowercase like a friend texting. focus on gathering essential information about the startup (industry, stage, funding needs) without asking too many questions at once. use casual language and short sentences. once you have enough information, provide a brief conclusion and do not ask for more details.'
        }
      ];
    }
    
    // Initialize the client if it doesn't exist
    if (!client) {
      client = getOpenAIClient();
    }
    
    const events = await client.streamChatCompletions(
      'gpt-35-turbo',
      messagesToSend,
      { maxTokens: 800 }
    );

    let response = '';
    for await (const event of events) {
      for (const choice of event.choices) {
        const content = choice.delta?.content;
        if (content) {
          response += content;
        }
      }
    }
    
    // Check if the response contains enough information to show VC recommendations
    if (shouldShowVCRecommendations(messages, response)) {
      try {
        const vcData = await getVCs();
        const recommendations = getRecommendedVCs(vcData, 6);
        const { setVcResults } = useChatStore.getState();
        setVcResults(recommendations);
        
        // If the response is asking for more information, replace it with a conclusion
        if (response.toLowerCase().includes('could you share') || 
            response.toLowerCase().includes('could you tell me') ||
            response.toLowerCase().includes('can you provide') ||
            response.toLowerCase().includes('would you mind')) {
          return "great! based on what you've shared about your startup, i've found some vc matches that might be a good fit for you.";
        }
        
        // Otherwise return the original response
        return response;
      } catch (error) {
        console.error('Error getting VC recommendations:', error);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error in chat function:', error);
    return "i'm having trouble connecting to the service. please check your api configuration or try again later.";
  }
}

// Helper function to determine if we should show VC recommendations
function shouldShowVCRecommendations(messages: { role: string; content: string }[], latestResponse: string): boolean {
  // Only process if there are messages to analyze
  if (messages.length < 2) return false;
  
  // Look for key information in the conversation
  const conversationText = messages.map(msg => msg.content.toLowerCase()).join(' ');
  
  // Check for essential information markers in the entire conversation
  const hasStageMentioned = /pre-?seed|seed|series a|early stage|growth|startup stage/.test(conversationText);
  const hasIndustryMentioned = /tech|ai|software|hardware|biotech|fintech|health|consumer|b2b|saas|enterprise|mobile|platform/.test(conversationText);
  const hasFundingMentioned = /funding|raise|investment|capital|money|million|financing|investor|cash/.test(conversationText);
  const hasDescribedBusiness = conversationText.length > 200; // Rough heuristic for sufficient description
  
  // Count how many key pieces of information we have
  let infoScore = 0;
  if (hasStageMentioned) infoScore++;
  if (hasIndustryMentioned) infoScore++;
  if (hasFundingMentioned) infoScore++;
  if (hasDescribedBusiness) infoScore++;
  
  // Check if the AI's most recent response indicates it has understood the user's needs
  const understandingIndicators = [
    'i understand',
    'got it',
    'based on what you\'ve shared',
    'sounds like',
    'it seems like',
    'thank you for sharing',
    'thanks for providing',
    'from what you\'ve told me'
  ];
  
  const aiUnderstandsUser = understandingIndicators.some(indicator => 
    latestResponse.toLowerCase().includes(indicator)
  );
  
  // We need enough information AND at least 3 message exchanges
  const enoughInfo = infoScore >= 3;
  const sufficientInteraction = messages.length >= 4;
  
  return (enoughInfo && sufficientInteraction) || (aiUnderstandsUser && infoScore >= 2);
}