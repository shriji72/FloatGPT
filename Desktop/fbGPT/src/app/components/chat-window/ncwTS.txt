import { Component, OnInit, ElementRef, inject, viewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SharedVarService } from '../../services/shared-var.service';
import { ApiCallService } from '../../services/api-call.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormatResponsePipe } from '../../pipes/formatResponse/format-response.pipe';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
  imports: [CommonModule, FormsModule, FormatResponsePipe]
})
export class ChatWindowComponent implements OnInit {
  readonly chatContainer = viewChild.required<ElementRef>('chatContainer');

  userInput: string = '';
  currentTheme: string = 'light';
  chatResponse$: Observable<{ question: string; response: string } | null>;
  showStartContent$: Observable<boolean>;
  conversationHistory$: Observable<any[]>;
  isFirstQuestion$: Observable<boolean>;
  isLoading: boolean = false;
  currentConversationId: number | null = null;
  private abortController: AbortController | null = null;

  // Token tracking
  firstTokenTimestamp: number = 0;
  lastTokenTimestamp: number = 0;
  totalTokens: number = 0;
  startTime: number = 0;

  // Metrics
  timeToFirstToken: number = 0;
  tokensPerSecond: number = 0;
  firstToLastTokenTime: number = 0;

  promptQuestions: string[] = [
    "Write a thank you reply for a birthday wish?",
    "How to become a full stack developer?",
    "What is the best way to learn something new?",
    "What is time dilation in the context of gravity?"
  ];

  private apiService = inject(ApiCallService);
  private sanitizer = inject(DomSanitizer);
  showMetrics$: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private sharedVarService: SharedVarService
  ) {
    // Theme subscription
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Chat-related observables
    this.chatResponse$ = this.sharedVarService.chatResponse$;
    this.showStartContent$ = this.sharedVarService.showStartContent$;
    this.conversationHistory$ = this.sharedVarService.conversationHistory$;
    this.isFirstQuestion$ = this.sharedVarService.isFirstQuestion$;
    this.showMetrics$ = this.sharedVarService.showMetrics$;

    // Updating metrics in SharedVarService
    this.sharedVarService.updateFirstTokenTime(this.timeToFirstToken);
    this.sharedVarService.updateTokensPerSecond(this.tokensPerSecond);
    this.sharedVarService.updateFirstToLastToken(this.firstToLastTokenTime);
  }

  ngOnInit(): void {
    this.sharedVarService.newChatTrigger$.subscribe(() => {
      this.setMetrics();
      this.currentConversationId = Math.floor(Math.random() * 1000);
    });

    const storedConversations = localStorage.getItem('conversations');
    
    if (storedConversations) {
      const conversations = JSON.parse(storedConversations);
      const lastConversation = conversations.length > 0 ? conversations[conversations.length - 1] : null;
      if (lastConversation) {
        this.currentConversationId = lastConversation.conversationId;
        this.sharedVarService.updateConversationHistory(lastConversation.messages);
      }
    }

    window.addEventListener('popstate', this.handlePopState);
    history.pushState(null, '', location.href);
  }

  

  setMetrics() {
    this.firstTokenTimestamp = 0;
    this.lastTokenTimestamp = 0;
    this.totalTokens = 0;
    this.startTime = 0;
    this.timeToFirstToken = 0;
    this.tokensPerSecond = 0;
    this.firstToLastTokenTime = 0;
  }

  private handlePopState = () => {
    this.sharedVarService.updateShowStartContent(true);
    history.pushState(null, '', location.href);
  };

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.getRes(this.userInput);
      this.userInput = "";
    }
  }

  getRes(question: string) {
    this.sharedVarService.updateShowStartContent(false);
    this.isLoading = true;

    if (!this.currentConversationId) {
      this.currentConversationId = Math.floor(Math.random() * 1000);
      this.sharedVarService.updateIsFirstQuestion(true);
    }

    this.conversationHistory$.pipe(take(1)).subscribe((history: any[]) => {
      const newHistory = [...history, { role: 'user', content: `User: ${question}` }];
      this.sharedVarService.updateConversationHistory(newHistory);

      this.sharedVarService.isFirstQuestion$.pipe(take(1)).subscribe((isFirst) => {
        if (isFirst) {
          this.sharedVarService.updateRecentChats(this.currentConversationId!, question);
          this.sharedVarService.updateIsFirstQuestion(false);
        }
      });

      const storedConversations = localStorage.getItem('conversations');
      let conversations = storedConversations ? JSON.parse(storedConversations) : [];
      let conversationIndex = conversations.findIndex((conv: any) => conv.conversationId === this.currentConversationId);

      if (conversationIndex === -1) {
        conversations.push({ conversationId: this.currentConversationId, messages: newHistory });
      } else {
        conversations[conversationIndex].messages = newHistory;
      }

      localStorage.setItem('conversations', JSON.stringify(conversations));

      const controller = new AbortController();
      this.abortController = controller;
      this.firstTokenTimestamp = 0;
      this.lastTokenTimestamp = 0;
      this.totalTokens = 0;
      this.startTime = performance.now();

      this.apiService.getResponse(newHistory, controller.signal).subscribe(
        (chunk: string) => {
          if (!this.firstTokenTimestamp) {
            this.firstTokenTimestamp = performance.now();
            this.timeToFirstToken = (this.firstTokenTimestamp - this.startTime) / 1000;
            this.sharedVarService.updateFirstTokenTime(this.timeToFirstToken);
          }

          this.totalTokens++;
          this.lastTokenTimestamp = performance.now();
          this.firstToLastTokenTime = (this.lastTokenTimestamp - this.firstTokenTimestamp) / 1000;
          this.sharedVarService.updateFirstToLastToken(this.firstToLastTokenTime);

          const formattedResponse = { role: "assistant", content: chunk || "AI: No response received." };
          const updatedHistory = [...newHistory, formattedResponse];
          this.sharedVarService.updateConversationHistory(updatedHistory);

          let storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
          let conversationIndex = storedConversations.findIndex((conv: any) => conv.conversationId === this.currentConversationId);
          if (conversationIndex !== -1) {
            storedConversations[conversationIndex].messages = updatedHistory;
            localStorage.setItem('conversations', JSON.stringify(storedConversations));
          }
        },
        (error: any) => {
          console.error("❌ Error fetching AI response:", error);
          this.isLoading = false;
        },
        () => {
          const totalTime = (performance.now() - this.startTime) / 1000;
          this.tokensPerSecond = totalTime > 0 ? this.totalTokens / totalTime : 0;
          this.sharedVarService.updateTokensPerSecond(this.tokensPerSecond);
          this.isLoading = false;
        }
      );
    });
  }
}
