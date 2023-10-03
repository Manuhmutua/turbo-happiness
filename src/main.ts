import './assets/main.css'
import "bootstrap/dist/css/bootstrap.min.css"

import VueSocketIOExt from 'vue-socket.io-extended';
import { io } from 'socket.io-client';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const socket = io('https://33ef-197-248-224-74.ngrok-free.app/');

const app = createApp(App)

app.use(VueSocketIOExt, socket);

app.use(createPinia())
app.use(router)

app.mount('#app')
