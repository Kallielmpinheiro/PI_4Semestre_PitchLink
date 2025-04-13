import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtils {

  formatToLocalDate(apiDate: string | undefined): string {
    if (!apiDate) return '';
    
    try {
      const [year, month, day] = apiDate.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.error(e);
    }
    
    return '';
  }
  
  formatToApiDate(localDate: string): string | null {
    if (!localDate || localDate.trim() === '') {
      return null;
    }
    
    try {
      const cleanedDate = localDate.replace(/\D/g, '');
      
      const day = cleanedDate.substring(0, 2);
      const month = cleanedDate.substring(2, 4);
      const year = cleanedDate.substring(4, 8);
      
      if (day && month && year) {
        const formattedDate = `${year}-${month}-${day}`;
        
        const dateObj = new Date(formattedDate);
        if (isNaN(dateObj.getTime())) {
          return null;
        }
        
        return formattedDate;
      }
    } catch (e) {
      console.error(e);
    }
    
    return null;
  }
}