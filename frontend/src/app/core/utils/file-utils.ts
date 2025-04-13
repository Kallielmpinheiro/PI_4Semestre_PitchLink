import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileUtils {

  readAsDataURL(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Falha ao ler o arquivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  arrayBufferToBase64(buffer: ArrayBuffer, mimeType = 'image/jpeg'): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return `data:${mimeType};base64,${window.btoa(binary)}`;
  }
}