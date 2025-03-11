import { Injectable } from '@angular/core'; 
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root', // Makes the service available throughout the app
})
export class SharedVarService {
  getChatHistoryById(id: number): any {
    throw new Error('Method not implemented.'); // Placeholder for fetching chat history by ID
  }

  // Stores the latest chat response (question and response)
  chatResponse = new BehaviorSubject<{ question: string; response: string } | null>(null);
  chatResponse$ = this.chatResponse.asObservable(); // Observable for components to subscribe

  // Controls whether the start content should be displayed
  private showStartContent = new BehaviorSubject<boolean>(true);
  showStartContent$ = this.showStartContent.asObservable();

  // Stores the current conversation history (messages)
  private conversationHistory = new BehaviorSubject<{ role: string; content: string }[]>([]);
  conversationHistory$ = this.conversationHistory.asObservable();

  // Stores the overall chat history
  private chatHistory = new BehaviorSubject<any[]>([]);
  chatHistory$ = this.chatHistory.asObservable();

  // Stores the recent chats list (first question of each new conversation)
  private recentChats = new BehaviorSubject<{ conversationId: number; question: string }[]>([]);
  recentChats$ = this.recentChats.asObservable();

  // Tracks whether the current message is the first question of a conversation
  private isFirstQuestion = new BehaviorSubject<boolean>(true);
  isFirstQuestion$ = this.isFirstQuestion.asObservable();

  // Trigger for detecting new chat sessions
  private newChatTrigger = new BehaviorSubject<boolean>(false);
  newChatTrigger$ = this.newChatTrigger.asObservable();

  // Controls visibility of performance metrics (latency, token speed)
  private showMetricsSubject = new BehaviorSubject<boolean>(false);
  showMetrics$ = this.showMetricsSubject.asObservable();

  // Stores the time of the first token received
  private firstTokenTimeSubject = new BehaviorSubject<number>(0);
  firstTokenTime$ = this.firstTokenTimeSubject.asObservable();

  // Stores the calculated tokens per second
  private tokensPerSecondSubject = new BehaviorSubject<number>(0);
  tokensPerSecond$ = this.tokensPerSecondSubject.asObservable();

  // Stores the time duration from the first to the last token
  private firstToLastTokenSubject = new BehaviorSubject<number>(0);
  firstToLastToken$ = this.firstToLastTokenSubject.asObservable();

  // Stores the currently selected conversation ID
  private selectedConversationId = new BehaviorSubject<number | null>(null);
  selectedConversationId$ = this.selectedConversationId.asObservable();

  // Stores all conversations (each with an ID and messages array)
  private conversations = new BehaviorSubject<{ conversationId: number; messages: { role: string; content: string }[] }[]>([]);
  conversations$ = this.conversations.asObservable();

  // Stores the currently active conversation's messages
  private currentConversation = new BehaviorSubject<{ role: string; content: string }[]>([]);
  currentConversation$ = this.currentConversation.asObservable();

  constructor() {
    // Load saved conversations from local storage when the service initializes
    const savedConversations = JSON.parse(localStorage.getItem('allConversations') || '[]');
    this.chatHistory.next(savedConversations);
  }

  // Updates the conversation history (messages list)
  updateConversationHistory(history: { role: string; content: string }[]) {
    this.conversationHistory.next([...history]);
  }

  // Updates the entire chat history
  updateChatHistory(history: any[]) {
    this.chatHistory.next([...history]);
  }

  // Returns the current chat history
  getChatHistoryValue() {
    return this.chatHistory.getValue();
  }

  // Updates the start content visibility
  updateShowStartContent(state: boolean) {
    this.showStartContent.next(state);
  }

  // Updates whether the next message is the first question
  updateIsFirstQuestion(state: boolean) {
    this.isFirstQuestion.next(state);
  }

  // Updates the visibility of performance metrics
  updateShowMetrics(show: boolean) {
    this.showMetricsSubject.next(show);
  }

  // Updates the first token time with a rounded value
  updateFirstTokenTime(time: number) {
    this.firstTokenTimeSubject.next(parseFloat(time.toFixed(2)));
  }

  // Updates the tokens per second with a rounded value
  updateTokensPerSecond(rate: number) {
    this.tokensPerSecondSubject.next(parseFloat(rate.toFixed(2)));
  }

  // Updates the first-to-last token duration with a rounded value
  updateFirstToLastToken(duration: number) {
    this.firstToLastTokenSubject.next(parseFloat(duration.toFixed(2)));
  }

  // Triggers a new chat session
  triggerNewChat() {
    this.newChatTrigger.next(true);
  }

  // Updates the recent chats list with the first question of a new conversation
  updateRecentChats(conversationId: number, question: string) {
    const currentRecent = this.recentChats.getValue();

    // Ensure only the first question is added per conversation
    if (!currentRecent.some(chat => chat.conversationId === conversationId)) {
      const updatedRecent = [...currentRecent, { conversationId, question }];
      this.recentChats.next(updatedRecent);
    }
  }

  // Clears recent chats (useful when starting fresh)
  clearRecentChats() {
    this.recentChats.next([]);
  }

  // Loads chat history for a selected conversation
  loadChatHistory(conversationId: number) {
    // Retrieve all conversations from local storage
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    // Find the selected conversation by its ID
    const selectedConversation = conversations.find((conv: any) => conv.conversationId === conversationId);

    if (selectedConversation) {
      this.updateConversationHistory(selectedConversation.messages); // Update chat window
      this.setSelectedConversationId(conversationId); // Set selected conversation ID
    }
  }

  // Adds a new conversation to the conversations list
  addNewChat(conversationId: number, firstQuestion: string) {
    const currentChats = this.conversations.getValue();
    this.conversations.next([...currentChats, { conversationId, messages: [{ role: 'user', content: firstQuestion }] }]);
  }

  // Updates the currently selected conversation ID
  setSelectedConversationId(id: number) {
    this.selectedConversationId.next(id);
  }
}
