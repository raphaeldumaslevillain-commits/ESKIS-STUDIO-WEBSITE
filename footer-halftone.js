/* Adapted from the user-supplied Halftone Wordmark Footer, using the actual ESKIS SVG mask. */
export const dotRadius=(coverage,gap)=>Math.sqrt(Math.max(0,Math.min(1,coverage)))*gap*.56;
export function springStep(x,y,vx,vy,hx,hy,px,py,r){
  const dx=x-px,dy=y-py,d2=dx*dx+dy*dy;
  if(r>0&&d2<r*r){const d=Math.sqrt(d2)+.001,f=(1-d/r)*2.6;vx+=dx/d*f;vy+=dy/d*f}
  vx=(vx+(hx-x)*.05)*.84;vy=(vy+(hy-y)*.05)*.84;
  return[x+vx,y+vy,vx,vy];
}
function rgb(value){
  const m=value.trim().match(/^#([a-f\d]{6})$/i);return m?[0,2,4].map(n=>parseInt(m[1].slice(n,n+2),16)):[242,239,231];
}
for(const root of document.querySelectorAll('[data-halftone-footer]'))mount(root);
function mount(root){
  const mark=root.querySelector('.hwf-mark'),canvas=mark.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),logo=new Image();
  let w=0,h=0,dpr=1,dots=new Float32Array(0),px=-1e5,py=-1e5,frame=0,last=0,visible=false,ready=false,ring={x:0,y:0,time:-1e5},ink=[242,239,231],warm=[255,168,104];
  function colors(){const s=getComputedStyle(root);ink=rgb(s.getPropertyValue('--hwf-ink'));warm=rgb(s.getPropertyValue('--hwf-warm'))}
  function layout(){
    if(!ready)return;
    const rect=mark.getBoundingClientRect();w=Math.max(1,Math.round(rect.width));h=Math.max(1,Math.round(rect.height));dpr=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const mask=document.createElement('canvas');mask.width=w;mask.height=h;const m=mask.getContext('2d',{willReadFrequently:true});if(!m)return;
    const width=w*1.025,height=width*115.4/316.08;
    m.drawImage(logo,(w-width)/2,h-height+height*.10,width,height);
    const pixels=m.getImageData(0,0,w,h).data,gap=Math.max(4.5,w/230),temp=[];
    for(let y=0;y<h;y+=gap)for(let x=0;x<w;x+=gap){
      let sum=0;
      for(let sy=0;sy<3;sy++)for(let sx=0;sx<3;sx++){
        const a=Math.min(w-1,Math.floor(x+(sx+.5)*gap/3)),b=Math.min(h-1,Math.floor(y+(sy+.5)*gap/3));sum+=pixels[(b*w+a)*4+3];
      }
      const coverage=sum/(9*255);if(coverage<.06)continue;
      const hx=x+gap/2,hy=y+gap/2;temp.push(hx,hy,0,0,hx,hy,dotRadius(coverage,gap));
    }
    dots=new Float32Array(temp);colors();root.classList.add('hwf-ready');wake();
  }
  function draw(now){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);let moving=false;
    const age=now-ring.time,ringR=age*.9,r=reduced.matches?0:Math.min(100,w*.15);
    for(let j=0;j<dots.length;j+=7){
      let x=dots[j],y=dots[j+1],vx=dots[j+2],vy=dots[j+3];const hx=dots[j+4],hy=dots[j+5];
      if(!reduced.matches){
        if(age<900){const dx=hx-ring.x,dy=hy-ring.y,d=Math.hypot(dx,dy)+.001,band=1-Math.min(1,Math.abs(d-ringR)/26);if(band>0){const f=band*3.2*(1-age/900);vx+=dx/d*f;vy+=dy/d*f}}
        [x,y,vx,vy]=springStep(x,y,vx,vy,hx,hy,px,py,r);
        if(Math.abs(vx)+Math.abs(vy)>.02||Math.abs(x-hx)+Math.abs(y-hy)>.05)moving=true;
        else{x=hx;y=hy;vx=vy=0}
      }else{x=hx;y=hy;vx=vy=0}
      dots[j]=x;dots[j+1]=y;dots[j+2]=vx;dots[j+3]=vy;
      const heat=Math.min(1,Math.hypot(x-hx,y-hy)/28),c=ink.map((n,i)=>Math.round(n+(warm[i]-n)*heat));
      ctx.fillStyle=`rgb(${c.join(',')})`;ctx.beginPath();ctx.arc(x,y,dots[j+6],0,Math.PI*2);ctx.fill();
    }
    return !reduced.matches&&(moving||age<900||px>-1e4);
  }
  function loop(now){frame=0;if(!visible||document.hidden)return;if(last&&now-last<14){frame=requestAnimationFrame(loop);return}last=now;if(draw(now))frame=requestAnimationFrame(loop)}
  function wake(){if(!frame&&ready&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop)}}
  function local(e){const r=canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
  mark.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;[px,py]=local(e);wake()});
  mark.addEventListener('pointerleave',()=>{px=py=-1e5;wake()});
  mark.addEventListener('click',e=>{if(reduced.matches)return;const p=e.detail?local(e):[w/2,h/2];ring={x:p[0],y:p[1],time:performance.now()};wake()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(ready&&!dots.length)layout();wake()}else{cancelAnimationFrame(frame);frame=0;px=py=-1e5}},{rootMargin:'120px'}).observe(mark);
  new ResizeObserver(layout).observe(mark);
  window.addEventListener('eskis:theme',()=>{colors();wake()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else wake()});
  reduced.addEventListener('change',()=>{px=py=-1e5;wake()});
  logo.onload=()=>{ready=true;layout()};logo.src=new URL('assets/logo-light.svg',document.baseURI).href;
}
