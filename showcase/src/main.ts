import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import BasicGraph from './pages/BasicGraph.vue'
import CurvedLinks from './pages/CurvedLinks.vue'
import CustomNodes from './pages/CustomNodes.vue'
import DragAndPin from './pages/DragAndPin.vue'
import Forces from './pages/Forces.vue'
import Home from './pages/Home.vue'
import Kitchen from './pages/Kitchen.vue'
import Labels from './pages/Labels.vue'
import Screenshot from './pages/Screenshot.vue'
import Selection from './pages/Selection.vue'
import Styling from './pages/Styling.vue'
import ZoomPan from './pages/ZoomPan.vue'

const router = createRouter({
  history: createWebHistory('/neo-vue3-d3-network/'),
  routes: [
    { path: '/', component: Home },
    { path: '/basic', component: BasicGraph },
    { path: '/drag-pin', component: DragAndPin },
    { path: '/zoom', component: ZoomPan },
    { path: '/styling', component: Styling },
    { path: '/labels', component: Labels },
    { path: '/curved-links', component: CurvedLinks },
    { path: '/selection', component: Selection },
    { path: '/custom-nodes', component: CustomNodes },
    { path: '/forces', component: Forces },
    { path: '/screenshot', component: Screenshot },
    { path: '/kitchen', component: Kitchen },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
