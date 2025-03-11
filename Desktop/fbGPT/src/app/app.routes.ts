import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

export const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponent },


  { path: '**', redirectTo: '' }, // Redirect unknown routes to login
];
