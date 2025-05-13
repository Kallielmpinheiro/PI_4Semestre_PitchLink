export interface UserProfile {
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    data_nasc?: string;
    categorias?: string[];
    profile_picture?: string | null;
    profile_picture_url?: string | null;
    provedores?: {
      'linkedin-server'?: {
        given_name?: string;
        family_name?: string;
        url_imagem_perfil?: string;
      };
      'google'?: {
        given_name?: string;
        name?: string;
        picture?: string;
      };
    };
  }
  
  export interface ProfileFormData {
    email: string;
    first_name: string;
    last_name: string;
    data_nasc: string | null;
    categories: string[];
    profile_picture: string | null;
  }