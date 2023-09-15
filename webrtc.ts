import { RTCPeerConnection } from 'rtcpeerconnection'

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// var RTCPeerConnection = require('rtcpeerconnection');

const pc = new RTCPeerConnection(servers);

// Get candidates for caller, save to db
pc.onicecandidate = (event) => {
  event.candidate && offerCandidates.add(event.candidate.toJSON());
};

// Create offer
const offerDescription = await pc.createOffer();
await pc.setLocalDescription(offerDescription);

const offer = {
  sdp: offerDescription.sdp,
  type: offerDescription.type,
};

console.log(offer);
