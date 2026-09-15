// One rules module used by the browser and the authoritative room server.
export const initial = () => ({board:'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split(''),turn:'w',castle:'KQkq',ep:-1});
export const color = p => p === p.toUpperCase() ? 'w' : 'b';
const inside=(x,y)=>x>=0&&x<8&&y>=0&&y<8;
const index=(x,y)=>y*8+x;
const opposite=c=>c==='w'?'b':'w';
export function attacked(s,square,by){
 const b=s.board,x=square%8,y=square>>3;
 for(const dx of [-1,1]){const py=y+(by==='w'?1:-1),px=x+dx;if(inside(px,py)&&b[index(px,py)]===(by==='w'?'P':'p'))return true}
 for(const [dx,dy] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){const px=x+dx,py=y+dy;if(inside(px,py)&&b[index(px,py)]===(by==='w'?'N':'n'))return true}
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){let px=x+dx,py=y+dy,d=1;while(inside(px,py)){const p=b[index(px,py)];if(p!=='.'){if(color(p)===by&&(p.toLowerCase()==='q'||(d===1&&p.toLowerCase()==='k')||((dx===0||dy===0)?p.toLowerCase()==='r':p.toLowerCase()==='b')))return true;break}px+=dx;py+=dy;d++}}
 return false;
}
export function inCheck(s,c){const k=s.board.indexOf(c==='w'?'K':'k');return k<0||attacked(s,k,opposite(c))}
export function apply(s,m){
 const b=s.board.slice(),p=b[m.from],target=b[m.to],c=color(p);b[m.from]='.';b[m.to]=m.promotion?(c==='w'?m.promotion.toUpperCase():m.promotion.toLowerCase()):p;
 if(p.toLowerCase()==='p'&&m.to===s.ep&&target==='.'&&m.from%8!==m.to%8)b[m.to+(c==='w'?8:-8)]='.';
 if(p.toLowerCase()==='k'&&Math.abs(m.to-m.from)===2){const rookFrom=m.to>m.from?m.from+3:m.from-4,rookTo=m.to>m.from?m.from+1:m.from-1;b[rookTo]=b[rookFrom];b[rookFrom]='.'}
 let castle=p.toLowerCase()==='k'?s.castle.replace(c==='w'?/[KQ]/g:/[kq]/g,''):s.castle;
 for(const [sq,right] of [[0,'q'],[7,'k'],[56,'Q'],[63,'K']])if(m.from===sq||m.to===sq)castle=castle.replace(right,'');
 return {board:b,turn:opposite(s.turn),castle,ep:p.toLowerCase()==='p'&&Math.abs(m.to-m.from)===16?(m.to+m.from)/2:-1};
}
export function legalMoves(s){
 const b=s.board,c=s.turn,moves=[];const add=(from,to,extra={})=>{if(!inside(to%8,to>>3))return;const target=b[to];if(target!=='.'&&(color(target)===c||target.toLowerCase()==='k'))return;const p=b[from];if(p.toLowerCase()==='p'&&(to>>3)===(c==='w'?0:7)){for(const promotion of ['q','r','b','n'])moves.push({from,to,promotion,...extra})}else moves.push({from,to,...extra})};
 for(let from=0;from<64;from++){const p=b[from];if(p==='.'||color(p)!==c)continue;const x=from%8,y=from>>3,t=p.toLowerCase();
 if(t==='p'){const dy=c==='w'?-1:1,ny=y+dy;if(inside(x,ny)&&b[index(x,ny)]==='.'){add(from,index(x,ny));const start=c==='w'?6:1;if(y===start&&b[index(x,ny+dy)]==='.')add(from,index(x,ny+dy))}for(const dx of [-1,1]){const nx=x+dx;if(inside(nx,ny)){const to=index(nx,ny);if((b[to]!=='.'&&color(b[to])!==c)||to===s.ep)add(from,to)}}}
 if(t==='n')for(const [dx,dy] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]])if(inside(x+dx,y+dy))add(from,index(x+dx,y+dy));
 if('brq'.includes(t)){const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];for(const [dx,dy] of dirs){if(t==='b'&&(dx===0||dy===0)||t==='r'&&dx!==0&&dy!==0)continue;let nx=x+dx,ny=y+dy;while(inside(nx,ny)){const to=index(nx,ny);if(b[to]!=='.'){if(color(b[to])!==c)add(from,to);break}add(from,to);nx+=dx;ny+=dy}}}
 if(t==='k'){for(const dx of [-1,0,1])for(const dy of [-1,0,1])if((dx||dy)&&inside(x+dx,y+dy))add(from,index(x+dx,y+dy));
 const home=c==='w'?60:4,enemy=opposite(c);if(from===home&&!inCheck(s,c))for(const [right,rook,empty,transit,dest] of (c==='w'? [['K',63,[61,62],61,62],['Q',56,[57,58,59],59,58]]:[['k',7,[5,6],5,6],['q',0,[1,2,3],3,2]])){if(s.castle.includes(right)&&b[rook]===(c==='w'?'R':'r')&&empty.every(i=>b[i]==='.')&&!attacked(s,transit,enemy)&&!attacked(s,dest,enemy))add(from,dest)} }
 }
 return moves.filter(m=>!inCheck(apply(s,m),c));
}
export function play(s,m){const legal=legalMoves(s).find(v=>v.from===m.from&&v.to===m.to&&(v.promotion||'')===(m.promotion||''));if(!legal)throw Error('Illegal move');return apply(s,legal)}
export function outcome(s){const moves=legalMoves(s);return moves.length?inCheck(s,s.turn)?'check':'playing':inCheck(s,s.turn)?'checkmate':'stalemate'}
export function perft(s,depth){if(!depth)return 1;let n=0;for(const m of legalMoves(s))n+=perft(apply(s,m),depth-1);return n}
