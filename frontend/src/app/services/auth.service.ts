import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';
import { api } from '/app/src/providers'

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private baseUrl = environment.baseUrl

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

  ListService(){
    return this.http.get(`${this.baseUrl}${api.list}`, { withCredentials: true });
  }


}