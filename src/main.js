import { createApp } from 'vue'
import App from './App.vue'

import VueGridLayout from 'vue-grid-layout'

const app = createApp(App)

app.use(VueGridLayout)

app.mount('#app')
