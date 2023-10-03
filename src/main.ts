import './assets/main.css'
import "bootstrap/dist/css/bootstrap.min.css"

import VueSocketIOExt from 'vue-socket.io-extended';
import { io } from 'socket.io-client';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const socket = io('http://localhost:3000/');

const app = createApp(App)

app.use(VueSocketIOExt, socket);

app.use(createPinia())
app.use(router)

app.mount('#app')
