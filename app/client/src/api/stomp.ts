import { Client, Message } from '@stomp/stompjs';

// 클라이언트 생성, 8081 포트(messenger app)으로 연결
const client = new Client();
client.brokerURL = 'ws://localhost:8081/ws';

console.log(client.brokerURL);