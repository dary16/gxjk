import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [{
            path: '*',
            redirect: '/login'
        }, {
            path: '/login',
            name: 'login',
            component: () =>
                import('./views/login.vue')
        }, {
            path: '/index',
            name: 'index',
            component: () =>
                import('./views/index.vue')
        }, {
            path: '/changePassword',
            name: 'changePassword',
            component: () =>
                import('./views/changePassword.vue')
        }, {
            path: '/charts',
            name: 'charts',
            component: () =>
                import('./views/charts.vue')
        },
        {
            path: '/dispatchPolice',
            name: 'dispatchPolice',
            component: () =>
                import('./views/dispatchPolice/main.vue'),
            children: [{
                path: '/dispatchPoliceList',
                name: 'dispatchPoliceList',
                component: () =>
                    import('./views/dispatchPolice/list.vue')
            }]
        },
        {
            path: '/unfinishedDetails',
            name: 'unfinishedDetails',
            component: () =>
                import('./views/dispatchPolice/unfinishedDetails.vue')
        },
        {
            path: '/finishedDetails',
            name: 'finishedDetails',
            component: () =>
                import('./views/dispatchPolice/finishedDetails.vue')
        },
        {
            path: '/map',
            name: 'map',
            component: () =>
                import('./views/dispatchPolice/map.vue')
        },
        {
            path: '/result',
            name: 'result',
            component: () =>
                import('./views/dispatchPolice/result.vue')
        },
        {
            path: '/selectPerson',
            name: 'selectPerson',
            component: () =>
                import('./views/systemWarning/selectPerson.vue')
        },
        {
            path: '/systemWarning',
            name: 'systemWarning',
            component: () =>
                import('./views/systemWarning/main.vue'),
            children: [{
                path: '/systemWarningList',
                name: 'systemWarningList',
                component: () =>
                    import('./views/systemWarning/list.vue')
            }]
        },
        {
            path: '/systemWarningInfo',
            name: 'systemWarningInfo',
            component: () =>
                import('./views/systemWarning/info.vue')
        },
        {
            path: '/systemWarningFinishedDetails',
            name: 'systemWarningFinishedDetails',
            component: () =>
                import('./views/systemWarning/finishedDetails.vue')
        },
        {
            path: '/selectPerson',
            name: 'selectPerson',
            component: () =>
                import('./views/systemWarning/selectPerson.vue')
        },
        {
            path: '/handlingFault',
            name: 'handlingFault',
            component: () =>
                import('./views/handlingFault/main.vue'),
            children: [{
                path: '/handlingFaultList',
                name: 'handlingFaultList',
                component: () =>
                    import('./views/handlingFault/list.vue')
            }]
        },
        {
            path: '/handlingFaultMessage',
            name: 'handlingFaultMessage',
            component: () =>
                import('./views/handlingFault/faultMessage.vue')
        },
        {
            path: '/foundFault',
            name: 'foundFault',
            component: () =>
                import('./views/foundFault/main.vue'),
            children: [{
                path: '/foundFaultList',
                name: 'foundFaultList',
                component: () =>
                    import('./views/foundFault/list.vue')
            }]
        },
        {
            path: '/foundFaultMessage',
            name: 'foundFaultMessage',
            component: () =>
                import('./views/foundFault/faultMessage.vue')
        }
    ]
})