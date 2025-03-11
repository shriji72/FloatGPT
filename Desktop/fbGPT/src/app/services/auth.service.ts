import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  // Store token and user ID after login
  storeAuthData(token: string, userId: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
  }

  // Fetch stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout function
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    console.log('User logged out');
    this.router.navigate(['/login']); // Redirect to login page
  }

  // Fetch user profile with authentication token
  fetchUserProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) return Promise.reject('No token found');

    return fetch('http://localhost:5000/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(error => console.error('Error fetching profile:', error));
  }

  fetchUserChats(): Promise<any> {
    const userId = localStorage.getItem('userId');
    if (!userId) return Promise.reject('User not logged in');
  
    return fetch(`http://localhost:5000/getChats/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(error => console.error('Error fetching chats:', error));
  }
  
}
