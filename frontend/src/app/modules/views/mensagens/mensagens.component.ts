import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from '../../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {        
        
        if (params['roomId']) {
          this.roomId = params['roomId'];
          this.roomLoaded = true;
          
          if (this.roomId) {
            this.carregarMensagensEDeterminarParticipantes();
          }
        }
        
        this.loadInitialData();
      });
  }

  private carregarMensagensEDeterminarParticipantes(): void {
    if (!this.roomId) return;
    
    const payload = { id: this.roomId };
    
    this.authService.postSearchMensagensRelated(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          
          if (response && response.messages) {
            const formattedMessages = response.messages.map((msg: any) => ({
              room_id: msg.room_id,
              content: msg.content,
              sender_id: msg.sender_id,
              sender: msg.sender,
              sender_name: msg.sender, 
              sender_img_url: msg.sender_img_url,
              created: msg.created,
              is_read: msg.is_read,
              receiver_id: msg.receiver_id,
              receiver_name: msg.receiver_name, 
              id: msg.id
            }));
            
            const sortedMessages = formattedMessages.sort((a: any, b: any) => 
              new Date(a.created).getTime() - new Date(b.created).getTime()
            );
            
            this.messagesList = sortedMessages;
            this.shouldScrollToBottom = true;
            
            if (!this.receiverId && this.senderId && response.messages.length > 0) {
              const participantsIds = new Set<number>();
              response.messages.forEach((msg: any) => {
                if (msg.sender_id) participantsIds.add(msg.sender_id);
                if (msg.receiver_id) participantsIds.add(msg.receiver_id);
              });
              
              
              const potentialReceivers = [...participantsIds].filter(id => id !== this.senderId);
              
              if (potentialReceivers.length > 0) {
                this.receiverId = potentialReceivers[0];
                
                this.tryInitializeWebSocket();
              } else if (participantsIds.size > 0) {
                this.receiverId = [...participantsIds][0];
                
                this.tryInitializeWebSocket();
              } else {
                this.buscarReceptorDaNegociacao();
              }
            } else if (!this.receiverId && !this.senderId) {
              this.authService.getUser().subscribe(user => {
                if (user && user.data && user.data.id) {
                  this.senderId = user.data.id;
                  this.carregarMensagensEDeterminarParticipantes();
                }
              });
            } else {
              this.tryInitializeWebSocket();
            }
          } else {
            this.buscarReceptorDaNegociacao();
          }
        },
        error: (err) => {
          this.buscarReceptorDaNegociacao();
        }
      });
  }

  private buscarReceptorDaNegociacao(): void {
    
    this.authService.getNegociacao()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.data && response.data.length > 0) {
            const salaCorrespondente = response.data.find(
              (r: any) => r.id === this.roomId
            );
            
            if (salaCorrespondente && salaCorrespondente.participants && salaCorrespondente.participants.length > 0) {
              
              const outroParticipante = salaCorrespondente.participants.find(
                (p: any) => p.id !== this.senderId
              );
              
              if (outroParticipante) {
                this.receiverId = outroParticipante.id;
              } else if (salaCorrespondente.participants.length > 0) {
                this.receiverId = salaCorrespondente.participants[0].id;
              }
              
              this.tryInitializeWebSocket();
            } else {
              if (!this.roomId && response.data.length > 0) {
                this.roomId = response.data[0].id;
                if (response.data[0].participants && response.data[0].participants.length > 0) {
                  this.receiverId = response.data[0].participants[0].id;
                  this.roomLoaded = true;
                  this.tryInitializeWebSocket();
                }
              }
            }
          }
        },
        error: (err) => console.error(err)
      });
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
    if (!content.trim()) {
      return;
    }

    if (!this.senderId) {
      this.authService.getUser().subscribe({
        next: (response) => {
          if (response?.data?.id) {
            this.senderId = response.data.id;
            this.sendMessage(content);
          } 
        },
        error: (err) => console.error(err)
      });
      return;
    }

    if (!this.receiverId && this.roomId) {
      this.carregarMensagensEDeterminarParticipantes();
      
      setTimeout(() => {
        if (this.receiverId) {
          this.enviarMensagemComReceiver(content);
        } else {
        }
      }, 500);
      return;
    }

    this.enviarMensagemComReceiver(content);
  }

  private enviarMensagemComReceiver(content: string): void {
    if (!this.receiverId) {
      return;
    }

    const message = {
      room_id: this.roomId,
      content: content,
      sender_id: this.senderId,
      receiver: this.receiverId
    };

    this.socket.next(message);
  }

  private loadInitialData(): void {
    this.getUser();
    
    if (!this.roomId) {
      this.getNegociacao();
    }
    
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

    this.closeConnection();
    
    this.socket = webSocket(`ws://localhost:8001/ws/chat/${this.roomId}/`);

    this.socket
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.messagesList.push(message);
          this.shouldScrollToBottom = true;
        },
        error: (err) => console.error(err),
      });
  }
}
