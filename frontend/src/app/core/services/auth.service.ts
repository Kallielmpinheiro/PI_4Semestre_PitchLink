import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { api, socialAccounts } from '../../../providers';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { UserProfile, ProfileFormData } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.getBaseUrl();
  private readonly httpOptions = { withCredentials: true };
  private token = '';
  needsProfileCompletion = false;

  setNeedsProfileCompletion(value: boolean): void {
    this.needsProfileCompletion = value;
  }

  getNeedsProfileCompletion(): boolean {
    return this.needsProfileCompletion;
  }
  loginWithGoogle(): void {
    window.location.href = `${this.baseUrl}${socialAccounts.google}`;
  }

  loginWithLinkedin(): void {
    window.location.href = `${this.baseUrl}${socialAccounts.linkedin}`;
  }

  loadTokenFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('jwt_token', token);
      this.token = token;
    }
  }


  checkAuth(): Observable<any> {
    const token = this.token || localStorage.getItem('jwt_token');

    if (!token) {
      return of({ status: 401, message: 'Token não encontrado' });
    }

    return this.http.get(
      `${this.baseUrl}${api.check}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      map(response => ({ status: 200, data: response })),
      catchError(error => of({ status: error.status, message: error.message }))
    );
  }


  logout(): Observable<any> {
    localStorage.removeItem('jwt_token');
    this.token = '';
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
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.token = response.token;
        }
        return response;
      }),
      catchError(this.handleHttpError)
    );
  }

  image(): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    return this.http.get(`${this.baseUrl}${api.image}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.error(error);
    return of(error);
  }

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    console.error(error);
    return throwError(() => error);
  }

  setToken(token: string): void {
    this.token = token;
  }
}