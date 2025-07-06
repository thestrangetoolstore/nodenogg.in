import './css/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { app as nodenoggin } from './state/app'
import App from './App.vue'
import router from './router'
import pkg from '../package.json'
import { preventPinchZoom } from './utils/preventPinchZoom'

const app = createApp(App)

// app.config.warnHandler = nodenoggin.telemetry.catch
// app.config.errorHandler = nodenoggin.telemetry.catch

console.log(pkg.version)

app.use(createPinia())
app.use(router)

// Initialize pinch zoom prevention
preventPinchZoom()

app.mount('#app')
