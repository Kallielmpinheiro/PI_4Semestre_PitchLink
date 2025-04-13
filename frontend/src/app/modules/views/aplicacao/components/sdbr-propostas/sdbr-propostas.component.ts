import { Component, signal } from '@angular/core';
import { IPropostas } from '../../interface/IPropostas.interface';

@Component({
  selector: 'app-sdbr-propostas',
  imports: [],
  templateUrl: './sdbr-propostas.component.html',
  styleUrl: './sdbr-propostas.component.css'
})
export class SdbrPropostasComponent {
  public arrayPropostas = signal<IPropostas[]>([
    {
      title: "Gabriel de Oliveira",
      src: "https://avatars.githubusercontent.com/u/143122763?v=4"
    },
    {
      title: "Gabriel Cardoso",
      src: "https://avatars.githubusercontent.com/u/147005428?v=4"
    },
    {
      title: "Dilma Rusbé",
      src: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Dilma_Rousseff_fevereiro_2011_3-B.jpg"
    }
  ])
}
