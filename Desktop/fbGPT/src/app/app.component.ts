import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { SideNavComponent } from "./components/side-nav/side-nav.component";
import { CommonModule } from '@angular/common';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [SideNavComponent, ChatWindowComponent, RouterModule, CommonModule , ]
})
export class AppComponent {
  currentRoute: string = ''; // Store the current route

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; // Update current route
      }
    });
  }

  isLoginPage(): boolean {
    return this.currentRoute === '/login';
  }
}
