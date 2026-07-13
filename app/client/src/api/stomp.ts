import { Client, Message } from '@stomp/stompjs';

// 로그인 후 JWT 토큰 pass, 채널 구독 정보 가져옴
function connectStomp(token: string){
    // 클라이언트 생성, 8081 포트(messenger app)으로 연결
    const client = new Client({brokerURL: 'ws://localhost:8081/ws',
        connectHeaders:{
            Authorization: `Bearer ${token}`
        },
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    // connect, reconnect 시 실행
    client.onConnect = function (frame) {
        // 1. 유저 정보 바탕으로 채널에 subscribe
        // TODO
    };

    client.onStompError = function (frame) {
        console.log('브로커 에러: ' + frame.headers['message']);
        console.log('추가 정보: ' + frame.body);
    }

    client.activate();
}