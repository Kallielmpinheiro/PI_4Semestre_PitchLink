import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mensagens',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthService],
  templateUrl: './mensagens.component.html',
  styleUrls: ['./mensagens.component.css']
})

export class MensagensComponent implements OnInit, OnDestroy, AfterViewChecked {

  roomId?: string;
  senderId?: number;
  receiverId?: number;
  profilePictureUrl: string = '';
  messagesList: any[] = [];

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  private socket!: WebSocketSubject<any>;
  private shouldScrollToBottom = true;
  private userLoaded = false;
  private roomLoaded = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.closeConnection();
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(content: string): void {
    if (!content.trim() || !this.senderId) return;

    const message = {
      room_id: this.roomId,
      content: content,
      sender_id: this.senderId,
      receiver: this.receiverId || 0
    };

    this.socket.next(message);
  }

  private loadInitialData(): void {
    this.getUser();
    this.getNegociacao();
    this.getImage();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private closeConnection(): void {
    if (this.socket) {
      this.socket.complete();
    }
  }

  private getImage(): void {
    this.authService.image()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.image_url && !this.profilePictureUrl && response.image_url.startsWith('http')) {
            this.profilePictureUrl = response.image_url;
          }
        },
        error: (err) => console.error(err)
      });
  }

  private getUser(): void {
    this.authService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // console.log(response);
          if (response?.data) {
            this.senderId = response.data.id;

            if (response.data.profile_picture?.startsWith('http')) {
              this.profilePictureUrl = response.data.profile_picture;
            }

            this.userLoaded = true;
            this.tryInitializeWebSocket();
          }
        },
        error: (err) => console.error(err)
      });
  }

  private getNegociacao(): void {
    this.authService.getNegociacao()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // console.log(response);
          if (response.data?.length > 0) {
            this.roomId = response.data[0].id;
            this.receiverId = response.data[0].participants[0].id;
            this.roomLoaded = true;
            this.tryInitializeWebSocket();
          }
        },
        error: (err) => console.error(err)
      });
  }

  private tryInitializeWebSocket(): void {
    if (this.userLoaded && this.roomLoaded && this.roomId) {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket(): void {
    if (!this.roomId) return;

    this.socket = webSocket(`ws://localhost:8001/ws/chat/${this.roomId}/`);

    this.socket
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          // console.log(message);
          this.messagesList.push(message);
          this.shouldScrollToBottom = true;
        },
        error: (err) => console.error(err),
      });
  }
}
