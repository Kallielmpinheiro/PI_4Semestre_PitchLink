import { Component, signal, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Mensagem, Participant, Sala, RoomsResponse } from '../../../../../shared/interfaces/common.interfaces';

@Component({
  selector: 'app-sdbr-mensagens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sdbr-mensagens.component.html',
  styleUrl: './sdbr-mensagens.component.css'
})
export class SdbrMensagensComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userId = signal<number | null>(null);
  mensagensRecebidas = signal<Mensagem[]>([]);
  todasAsSalas = signal<Sala[]>([]); 
  salasSelecionadas = signal<string>('recentes'); 
  userName = signal<string>('');
  userProfilePic = signal<string>('');
  isLoading = signal<boolean>(false);
  semSalasDeNegociacao = signal<boolean>(false);
  salaAtual = signal<string | null>(null); 

  ngOnInit(): void {
    this.getUser();
    this.getAllRooms();
  }
  
  getMensagens() {
    this.authService.getMensagens().subscribe({
      next: (response: any) => {
        const { rooms, messages } = response;
        
        if (this.userId()) {
          const mensagensFiltradas = messages.filter(
            (msg: Mensagem) => msg.receiver_id === this.userId() && msg.sender_id !== this.userId()
          );
          
          const mensagensOrdenadas = mensagensFiltradas.sort((a: Mensagem, b: Mensagem) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
          );
          
          const ultimasMensagens = mensagensOrdenadas.slice(0, 1);
          
          ultimasMensagens.forEach((msg: Mensagem) => {
            if (!msg.sender_img_url || !msg.sender_img_url.startsWith('http')) {
              if (msg.sender_img) {
                msg.sender_img_url = `http://localhost:8000/media/${msg.sender_img}`;
              }
            }
          });
          
          this.mensagensRecebidas.set(ultimasMensagens);
        }
      },
      error: (error) => {
        if (error.status === 404 && error.error?.message === 'Você não participa de nenhuma sala de negociação') {
          this.mensagensRecebidas.set([]);
          this.semSalasDeNegociacao.set(true);
        }
      }
    });
  }

  getUser() {
    this.authService.getUser().subscribe({
      next: (response: any) => {
        const userData = response.data;
        this.userId.set(userData.id);
        this.userName.set(`${userData.first_name} ${userData.last_name}`);
        this.userProfilePic.set(userData.profile_picture_url || userData.profile_picture);
        
        this.getMensagens();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  postEnterNegotiationRoom(roomId: string): void {
    this.isLoading.set(true);
    
    const payload = {
      id: roomId
    };
    
    this.authService.postEnterNegotiationRoom(payload).subscribe({
      next: (response) => {
        this.router.navigate(['app/mensagens'], { queryParams: { roomId: roomId } });
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  getAllRooms() {
    this.authService.getAllRooms().subscribe({
      next: (response: RoomsResponse) => {
        if (response && response.data) {
          this.todasAsSalas.set(response.data);
        } else {
          this.todasAsSalas.set([]);
        }
      },
    });
  }

  alterarAba(aba: string): void {
    this.salasSelecionadas.set(aba);
    
    if (aba === 'recentes') {
      this.getMensagens();
    } else if (aba === 'todas') {
      this.getAllRooms();
    }
  }
}