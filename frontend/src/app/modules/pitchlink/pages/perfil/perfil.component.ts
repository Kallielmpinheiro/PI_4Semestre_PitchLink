import { Component, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})

export class PerfilComponent {
  /*
   -- FALTA MESTRE KALIEL CRIAR TODOS ENDPOINTS DE IMAGEM
   -- CRIAR BOTAO DE REMOVER FOTO
   -- CRIAR FORMS    
  */

  imageUser: WritableSignal<string | null | ArrayBuffer> = signal(null)

  changePhoto(event: Event) {
    const inputImageUser = event.target as HTMLInputElement

    if (inputImageUser.files && inputImageUser.files[0]) {
      const file = inputImageUser.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        this.imageUser.set(reader.result)
        inputImageUser.value = ""
      }

      reader.readAsDataURL(file)
    }
  }

  removePhoto() {
    this.imageUser.set(null)
  }
}
