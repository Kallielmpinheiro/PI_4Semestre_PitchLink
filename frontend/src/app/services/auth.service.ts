import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // URL do seu backend Django

  constructor(private http: HttpClient, private router: Router) {}

  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/accounts/google/login/`;
  }
  
  loginWithLinkedin() {
    window.location.href = `${this.apiUrl}/accounts/oidc/linkedin-server/login/?process=login`;
  }

  checkAuth() {
    return this.http.get(`${this.apiUrl}/api/check-auth`, { withCredentials: true });
  }

  logout() {
    return this.http.post(`${this.apiUrl}/accounts/logout/`, {}, { withCredentials: true }).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}