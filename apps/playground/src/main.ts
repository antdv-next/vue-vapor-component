import { createApp, createVaporApp, vaporInteropPlugin } from 'vue'

import App from './App.vue'
import VaporApp from './VaporApp.vue'

createApp(App).use(vaporInteropPlugin).mount('#app')
createVaporApp(VaporApp).mount('#vapor')
