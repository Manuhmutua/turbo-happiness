<script lang="ts">
import { ref } from 'vue'

const localVideoStream = ref();
const remoteVideoStream = ref();

const peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun1.l.google.com:19302' },
    {'urls': 'stun:stun2.l.google.com:19302' },
    {'urls': 'stun:stun3.l.google.com:19302' }
  ]
};

let localStream: any;
let peerConnection = new RTCPeerConnection(peerConnectionConfig);
// let remoteVideo;
// let serverConnection;
let uuid: any;

export default {
  data() {
    return {
      message: '',
      messages: [],
      localVideoStream,
      remoteVideoStream,
      videoSource: null,
      updatePaused: null
    };
  },
  sockets: {
    connect() {
      console.log('Connected to server');
    },
    'message'(val: any) {
      // this.messages.push(val);
      console.log(val)
      this.gotMessageFromServer(val)
      // console.log('got remote stream');
      // remoteVideoStream.value = val;
    }
  },
  computed: {
    
  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== '') {
        this.$socket.client.emit('message', this.message);
        this.message = '';
      }
    },
    async gotMessageFromServer(message) {
      if(!peerConnection) this.start(false);

      console.log(message);
      const signal = JSON.parse(message);

      // Ignore messages from ourself
      if(signal.uuid == uuid) return;

      if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          // Only create answers in response to offers
          if(signal.sdp.type !== 'offer') return;

          peerConnection.createAnswer().then(this.createdDescription).catch(this.errorHandler);
        }).catch(this.errorHandler);
      } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
      }
    },
    start(isCaller) {
      peerConnection.onicecandidate = this.gotIceCandidate;
      peerConnection.ontrack = this.gotRemoteStream;

      for(const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream);
      }

      if(isCaller) {
        peerConnection.createOffer().then(this.createdDescription).catch(this.errorHandler);
      }
    },
    createdDescription(description) {
    
      console.log('got description');
      
      peerConnection.setLocalDescription(description).then(() => {
        const sessionDescription = peerConnection.localDescription;
        this.$socket.client.send(JSON.stringify({'sdp': sessionDescription, 'uuid': uuid}));
      }).catch(this.errorHandler);

    },
    errorHandler(error) {
      console.log(error);
    },
    createUUID() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }

      return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    },
    gotIceCandidate(event) {
      if(event.candidate != null) {
        this.$socket.client.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
      }
    },
    gotRemoteStream(event) {
      console.log('got remote stream');
      remoteVideoStream.value = event.streams[0];
    },
    async pageReady() {
      uuid = this.createUUID();

      this.$socket.client.onmessage = this.gotMessageFromServer;

      const constraints = {
        video: true,
        audio: true,
      };

      if(!navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support getUserMedia API');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = stream;
        localVideoStream.value = stream;   
      } catch(error) {
        this.errorHandler(error);
      }
    }
  },
  async beforeMount() {
    await this.pageReady()
  }
};
</script>

<template>

  <!-- <div id="app">
    <h1>Vue.js Socket.io Chat</h1>
    <input v-model="message" @keyup.enter="sendMessage">
    <button @click="sendMessage">Send</button>
    <ul>
      <li v-for="msg in messages" :key="msg">{{ msg }}</li>
    </ul>
  </div> -->

  <video :srcObject="localVideoStream" autoplay playsinline muted style="width:40%;"></video>
  <video :srcObject="remoteVideoStream" autoplay playsinline style="width:40%;"></video>

  <div style="margin-top: 10px;">
    Open this page in a second browser window then click below to start the WebRTC connection.
  </div>

  <div style="margin-top: 10px;">
    <input type="button" id="start" @click="start(true)" value="Start WebRTC">
  </div>

</template>
