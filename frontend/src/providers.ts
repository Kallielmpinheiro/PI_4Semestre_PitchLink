import { createComponent, createNgModuleRef } from "@angular/core"

const prefix = '/api'

export const api = {

    save: prefix + '/full-profile',
    check: prefix + '/check-auth',
    DTO : prefix + '/obter-perfil-social-usuario',
    logout: prefix + '/logout',
    image : prefix + '/get-image',
    postCreateInnovation: prefix + '/post-create-innovation', 
    getInnovation: prefix + '/get-innovation',
    postSearchInnovation: prefix + '/post-search-innovation',
    getUser: prefix + '/get-perfil',
    createRoom: prefix + '/create-room',
    sendMessage: prefix + '/send-message',
    getNegociacao: prefix + '/get-negotiation-room',
    postCreateProposalInnovation: prefix+ "/post-create-proposal-innovation",
    getProposalInnovations: prefix + '/get-proposal-innovations',
    postSearchProposalInnovations: prefix + '/post-search-proposal-innovations',
    userProposalsInnovations : prefix + '/get-user-proposals-innovations',
}

export const socialAccounts = {

    google: '/accounts/google/login/',
    linkedin: '/accounts/oidc/linkedin-server/login/?process=login'
    
}