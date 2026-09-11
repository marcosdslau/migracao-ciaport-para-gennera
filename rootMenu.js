const menu = [
    {
        icon: 'mdi-view-dashboard',
        option: 'CockPit',
        route: '/admin',
        onlyMaster: true,
        actions: []
    },
    {
        icon: 'mdi-account-cog',
        option: 'Gestão de Usuários',
        route: '/manager/users',
        onlyMaster: true,
        actions: []
    },
    {
        icon: 'mdi-wrench-cog',
        option: 'Configurações',
        route: '/manager/configs',
        onlyMaster: true,
        actions: []
    },
    {
        icon: 'mdi-account',
        option: 'Pessoas',
        route: '/manager/persons',
        onlyMaster: true,
        actions: []
    },
    {
        icon: 'mdi-clock',
        option: 'Registros',
        route: '/manager/clocks',
        onlyMaster: true,
        actions: []
    },
    // {
    //     icon: 'mdi-domain',
    //     option: 'Instituição',
    //     route: '/institutions/:idInstitution',
    //     onlyMaster: false,
    //     actions: [
    //         {
    //             action: 'read',
    //             onlyMaster: false,
    //             method: 'GET',
    //             routes: ['/institutions', '/institutions/:idInstitution', '/institutions/:idInstitution/layouts', '/dashboards/institutions/:idInstitution/tasksautomaticyear/:year', '/currents/notifications']
    //         },
    //         {
    //             action: 'organization',
    //             onlyMaster: false,
    //             method: 'GET',
    //             routes: ['/institutions/:idInstitution']
    //         },
    //         {
    //             action: 'getUserInstitution',
    //             onlyMaster: false,
    //             method: 'GET',
    //             routes: ['/institutions/:idInstitution/users/:idUser/allusers', '/institutions/:idInstitution/groups']
    //         },
    //         {
    //             action: 'setUserInstitution',
    //             onlyMaster: false,
    //             method: 'POST',
    //             routes: ['/institutions/:idInstitution/users/:idUser/groups/:idGroupPermission/organization']
    //         },
    //     ]
    // },
]

module.exports = menu;