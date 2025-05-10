import { Component, signal } from '@angular/core';
import { IMensagens } from '../../interface/IMensagens.interface';

@Component({
  selector: 'app-sdbr-mensagens',
  imports: [],
  templateUrl: './sdbr-mensagens.component.html',
  styleUrl: './sdbr-mensagens.component.css'
})
export class SdbrMensagensComponent {
  public arrayMensagens = signal<IMensagens[]>([
    {
      src: "https://avatars.githubusercontent.com/u/143122763?v=4",
      name: "Gabriel de Oliveira",
      mensagen: "Frango com catupiry é mó bom",
    },
    {
      src: "https://avatars.githubusercontent.com/u/147005428?v=4",
      name: "Gabriel Cardoso",
      mensagen: "E fazer o PI?",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Dilma_Rousseff_fevereiro_2011_3-B.jpg",
      name: "Dilma Rusbé",
      mensagen: "R$ 350 para estocar 1 litro de vento",
    },
  ])
}
