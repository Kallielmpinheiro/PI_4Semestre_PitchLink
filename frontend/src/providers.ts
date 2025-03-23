const prefix = '/api'

export const api = {

    list: prefix + '/users',
    save: prefix + '/full-profile',
    check: prefix + '/check-auth'

}

export const socialAccounts = {

    logout: '/accounts/logout',
    google: '/accounts/google/login/',
    linkedin: '/accounts/oidc/linkedin-server/login/?process=login'

}