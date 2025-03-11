import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  isSignUpActive = false;
  private tempUser: any = null;

  signupData = { name: '', email: '', password: '' };
  signinData = { email: '', password: '' };

  signupMessage = ''; // Stores sign-up error messages
  signinMessage = ''; // Stores sign-in error messages

  constructor(private router: Router) {}

  togglePanel() {
    this.isSignUpActive = !this.isSignUpActive;
    this.signupMessage = ''; // Clear messages on toggle
    this.signinMessage = '';
  }

  onSignUp(event: Event) {
    event.preventDefault();
    this.signupMessage = '';
  
    if (!this.signupData.name.trim() || !this.signupData.email.trim() || !this.signupData.password.trim()) {
      this.signupMessage = 'All fields are required!';
      return;
    }
  
    // Call API to store user in MongoDB
    fetch('http://localhost:5000/api/signup', {  // ✅ Added /api
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.signupData)
    })
    
    
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        this.signupMessage = 'Account created successfully! Please log in.';
        setTimeout(() => {
          this.isSignUpActive = false; // Switch to login form
        }, 1000);
      } else {
        this.signupMessage = data.message || 'Error creating account.';
      }
    })
    .catch(error => {
      console.error('SignUp Error:', error);
      this.signupMessage = 'Something went wrong. Try again later.';
    });
  }
  
  onSignIn(event: Event) {
  event.preventDefault();
  this.signinMessage = '';

  if (!this.signinData.email.trim() || !this.signinData.password.trim()) {
    this.signinMessage = 'All fields are required!';
    return;
  }

  // Call API to verify login
  fetch('http://localhost:5000/api/login', {  // ✅ Added /api
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(this.signinData)
  })
  
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      console.log('Login successful! Token stored.');
      this.router.navigate(['/chatbot']); // Redirect to chatbot
    } else {
      this.signinMessage = data.message || 'Invalid credentials!';
    }
  })
  .catch(error => {
    console.error('SignIn Error:', error);
    this.signinMessage = 'Something went wrong. Try again later.';
  });
}

  
}
