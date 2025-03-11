import { Component } from '@angular/core';  
import { SharedVarService } from '../../services/shared-var.service';  
import { CommonModule } from '@angular/common';  
import { take } from 'rxjs';  
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-nav', // Defines the selector for the SideNav component
  standalone: true, // Enables the component to be used independently
  templateUrl: './side-nav.component.html', // Specifies the HTML template file
  styleUrls: ['./side-nav.component.css'], // Specifies the CSS file for styling
  imports: [CommonModule,RouterModule] // Imports necessary Angular modules
})
export class SideNavComponent {
  
  chatHistory$: any;  // Observable for chat history data
  recentChats$: any;  // Observable for recent chats data
  showMetrics = false;  // Boolean to toggle the display of metrics
  showSettings = false;

  firstTokenTime: number | null = null;  // Stores the time for the first token response
  tokensPerSecond: number | null = null;  // Stores the calculated tokens per second
  firstToLastToken: number | null = null;  // Stores the duration from first to last token




  constructor(private sharedVarService: SharedVarService, private router: Router , public authService: AuthService) {
    //  Initializing observables inside the constructor
    this.chatHistory$ = this.sharedVarService.chatHistory$; // Subscribe to chat history observable
    this.recentChats$ = this.sharedVarService.recentChats$; // Subscribe to recent chats observable
    
    // Subscribe to first token time updates from the service
    this.sharedVarService.firstTokenTime$.subscribe((time: number | null) => {
      this.firstTokenTime = time;
    });

    // Subscribe to tokens per second updates from the service
    this.sharedVarService.tokensPerSecond$.subscribe((rate: number | null) => {
      this.tokensPerSecond = rate;
    });

    // Subscribe to first-to-last token duration updates from the service
    this.sharedVarService.firstToLastToken$.subscribe((duration: number | null) => {
      this.firstToLastToken = duration;
    });
  }

  // Method to toggle the visibility of latency metrics
  toggleMetrics() {
    this.showMetrics = !this.showMetrics; // Toggle the showMetrics boolean
    this.sharedVarService.updateShowMetrics(this.showMetrics); // Update the value in the service
  }

  // Method to load the chat history of a selected conversation
  loadChatHistory(conversationId: number) {
    this.sharedVarService.loadChatHistory(conversationId); // Fetch chat history for the given ID
  }
  
  // Method to start a new chat session
  newChat() {
    this.sharedVarService.updateConversationHistory([]); // Clears the conversation history
    this.sharedVarService.updateIsFirstQuestion(true); // Marks that the next question is the first one
    this.sharedVarService.updateShowStartContent(true); // Ensures the start content is displayed
    this.sharedVarService.triggerNewChat(); // Triggers a new chat session

    // Updates chat history by marking all chats as inactive
    this.chatHistory$.pipe(take(1)).subscribe((history: any[]) => {
      const updatedHistory = history.map(chat => ({ ...chat, isActive: false }));
      this.sharedVarService.updateChatHistory(updatedHistory);
    });
  }

  // Method to display chat history when a conversation is selected
  displayChatHistory(conversationId: number) {
    this.sharedVarService.updateShowStartContent(false); // Hide the start content
    this.sharedVarService.loadChatHistory(conversationId); // Load selected conversation history
  }
  
  // Method to set a selected recent chat conversation
  selectRecentChat(conversationId: number) {
    this.sharedVarService.setSelectedConversationId(conversationId); // Update the selected conversation ID
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  openProfile() {
    // Logic for profile settings
    console.log("Profile Clicked");
  }

  openPreferences() {
    // Logic for preferences
    console.log("Preferences Clicked");
  }


  logout() {
    this.authService.logout();
  }
  


  

}
