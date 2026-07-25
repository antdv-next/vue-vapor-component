import { createApp, createVaporApp, vaporInteropPlugin } from 'vue'

import RouterApp from './RouterApp.vue'
import { createRouter } from './routes'
import VaporHost from './VaporHost.vue'

createApp(RouterApp).use(vaporInteropPlugin).use(createRouter()).mount('#app')

createVaporApp(VaporHost).mount('#vapor')
