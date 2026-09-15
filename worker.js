import {initial,play,outcome} from '../public/rules.js';
export default {async fetch(request,env){const url=new URL(request.url);if(!/^\/ws\/[A-Z0-9]{4,12}$/.test(url.pathname))return new Response('Not found',{status:404});if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});const code=url.pathname.slice(4);return env.ROOM.getByName(code).fetch(request)}};
export class ChessRoom {
 constructor(ctx,env){this.ctx=ctx;this.env=env}
 async state(){return await this.ctx.storage.get('game')||{position:initial(),white:null,black:null,revision:0}}
 send(ws,type,payload){try{ws.send(JSON.stringify({type,payload}))}catch{}}
 broadcast(type,payload){for(const ws of this.ctx.getWebSockets())this.send(ws,type,payload)}
 async fetch(request){const url=new URL(request.url),token=url.searchParams.get('token');if(!token||! /^[a-f0-9]{32}$/.test(token))return new Response('Invalid identity',{status:400});
 const [client,server]=Object.values(new WebSocketPair());const game=await this.state();let role='watch';if(game.white===token)role='white';else if(game.black===token)role='black';else if(!game.white){game.white=token;role='white'}else if(!game.black){game.black=token;role='black'}
 if(role!=='watch'){await this.ctx.storage.put('game',game);for(const old of this.ctx.getWebSockets()){const a=old.deserializeAttachment();if(a?.token===token){try{old.close(4000,'Reconnected')}catch{}}}}
 this.ctx.acceptWebSocket(server);server.serializeAttachment({token,role});this.send(server,'welcome',{role,position:game.position,revision:game.revision,white:!!game.white,black:!!game.black,outcome:outcome(game.position)});this.broadcast('presence',{white:!!game.white,black:!!game.black});return new Response(null,{status:101,webSocket:client})}
 async webSocketMessage(ws,message){let data;try{data=JSON.parse(message);if(!data||typeof data.type!=='string'||!data.payload||typeof data.payload!=='object')throw Error()}catch{this.send(ws,'error',{message:'Invalid message'});return}
 const identity=ws.deserializeAttachment(),game=await this.state();
 if(data.type==='move'){const expected=game.position.turn==='w'?'white':'black';if(identity.role!==expected||game[expected]!==identity.token){this.send(ws,'error',{message:'Not your turn'});return}if(outcome(game.position)==='checkmate'||outcome(game.position)==='stalemate'){this.send(ws,'error',{message:'Game is over'});return}const m=data.payload;if(!Number.isInteger(m.from)||!Number.isInteger(m.to)||m.from<0||m.from>63||m.to<0||m.to>63||m.promotion!==undefined&&!['q','r','b','n'].includes(m.promotion)){this.send(ws,'error',{message:'Invalid move'});return}try{game.position=play(game.position,m)}catch{this.send(ws,'error',{message:'Illegal move'});return}game.revision++;await this.ctx.storage.put('game',game);this.broadcast('state',{position:game.position,revision:game.revision,outcome:outcome(game.position)});return}
 if(data.type==='newGame'){if(identity.role==='watch'||game[identity.role]!==identity.token){this.send(ws,'error',{message:'Only players may start a new game'});return}game.position=initial();game.revision++;await this.ctx.storage.put('game',game);this.broadcast('state',{position:game.position,revision:game.revision,outcome:'playing'});return}
 this.send(ws,'error',{message:'Unknown message type'})
 }
 webSocketClose(){} webSocketError(){}
}
