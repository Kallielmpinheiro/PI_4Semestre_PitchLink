import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { api, socialAccounts } from '../../../providers';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { UserProfile, ProfileFormData } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly baseUrl = environment.apiUrl;
  
  private readonly httpOptions = { withCredentials: true };
  

  loginWithGoogle(): void {
    window.location.href = `${this.baseUrl}${socialAccounts.google}`;
  }
  
  loginWithLinkedin(): void {
    window.location.href = `${this.baseUrl}${socialAccounts.linkedin}`;
  }

  checkAuth(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}${api.check}`, 
      this.httpOptions
    ).pipe(
      map((response: any) => {
        if (response?.data) {
          return response;
        }
        return false;
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}${api.logout}`, 
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.baseUrl}${api.DTO}`, 
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  DTO(): Observable<any> {
    return this.getUserProfile();
  }

  saveFullProfile(profileData: ProfileFormData): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${api.save}`, 
      profileData, 
      this.httpOptions
    ).pipe(
      catchError(this.handleHttpError)
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error(error);
    return of(error);
  }
  

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    console.error(error);
    return throwError(() => error);
  }
}