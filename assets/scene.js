/* Eskis sculpture: a true beveled 3D mesh rendered with WebGL2.
 * Liquid simulation adapted from Liquid Sculpture Hero, by Guglielmo Giannattasio.
 * https://21st.dev/@gughigug/components/liquid-sculpture-hero
 * Original engine attribution is retained in liquid-engine.js and Informations.
 */
import { LiquidEngine } from './liquid-engine.js';
const VERTEX=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
uniform vec3 uRotation;
uniform float uAspect;
out vec3 vNormal;
out vec3 vPosition;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
void main(){
 mat3 m=rz(uRotation.z)*ry(uRotation.y)*rx(uRotation.x);
 vec3 p=m*aPosition;
 vPosition=p;vNormal=m*aNormal;
 float d=3.55-p.z,f=2.2,n=.1,far=20.;
 gl_Position=vec4(p.x*f/uAspect,p.y*f,((far+n)/(far-n))*d-2.*far*n/(far-n),d);
}`;
const FRAGMENT=`#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vPosition;
uniform float uLight;
out vec4 color;
void main(){
 vec3 N=normalize(vNormal),V=normalize(vec3(0.,0.,3.55)-vPosition);
 vec3 R=reflect(-V,N);
 float softbox=pow(max(0.,dot(R,normalize(vec3(-.7,.8,1.)))),7.);
 float strip=smoothstep(.02,.08,R.x)-smoothstep(.21,.29,R.x);
 float topbox=pow(max(0.,dot(R,normalize(vec3(.2,1.,-.15)))),12.);
 float lower=pow(max(0.,dot(R,normalize(vec3(.7,-.45,.5)))),18.);
 float fres=pow(1.-max(0.,dot(N,V)),3.);
 float line=pow(max(0.,1.-abs(R.y+.33)*5.),8.);
 vec3 c=vec3(.045,.047,.042)+vec3(1.25,1.22,1.12)*softbox;
 c+=vec3(.68,.69,.64)*strip+vec3(.6,.59,.54)*topbox+vec3(.8,.77,.66)*lower;
 c+=vec3(.35,.36,.33)*fres+vec3(.33,.32,.29)*line;
 c+=vec3(.07,.065,.05)*max(0.,N.y);
 float darkRibbon=smoothstep(-.2,-.12,R.y)*(1.-smoothstep(.02,.09,R.y));
 c*=1.-darkRibbon*.78;
 c=mix(c,c*0.92+vec3(.025),uLight);
 c=pow(c/(vec3(.55)+c),vec3(.4545));
 color=vec4(c,1.);
}`;
function compile(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(message)}return shader;
}
function geometry(){
 const count=144,rings=[[.15,.34],[.35,.33],[.6,.30],[.81,.245],[.94,.165],[1.,.055],[1.,-.055],[.94,-.165],[.81,-.245],[.6,-.30],[.35,-.33],[.15,-.34]];
 const points=[],indices=[];
 for(const [scale,z] of rings)for(let j=0;j<count;j++){
   const a=j/count*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
   points.push(Math.sign(c)*Math.pow(Math.abs(c),2.8)*scale*1.38,Math.sign(s)*Math.pow(Math.abs(s),2.8)*scale*1.38,z);
 }
 for(let r=0;r<rings.length-1;r++)for(let j=0;j<count;j++){
   const a=r*count+j,b=r*count+(j+1)%count,c=(r+1)*count+j,d=(r+1)*count+(j+1)%count;
   indices.push(a,c,d,a,d,b);
 }
 const front=points.length/3;points.push(0,0,.342);const back=points.length/3;points.push(0,0,-.342);
 for(let j=0;j<count;j++){
   indices.push(front,j,(j+1)%count);const r=(rings.length-1)*count;indices.push(back,r+(j+1)%count,r+j);
 }
 const normals=new Float32Array(points.length);
 for(let k=0;k<indices.length;k+=3){
   const ia=indices[k]*3,ib=indices[k+1]*3,ic=indices[k+2]*3;
   const ux=points[ib]-points[ia],uy=points[ib+1]-points[ia+1],uz=points[ib+2]-points[ia+2],vx=points[ic]-points[ia],vy=points[ic+1]-points[ia+1],vz=points[ic+2]-points[ia+2];
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   for(const id of [ia,ib,ic]){normals[id]+=nx;normals[id+1]+=ny;normals[id+2]+=nz}
 }
 for(let i=0;i<normals.length;i+=3){const n=Math.hypot(normals[i],normals[i+1],normals[i+2])||1;normals[i]/=n;normals[i+1]/=n;normals[i+2]/=n}
 return {positions:new Float32Array(points),normals,indices:new Uint16Array(indices)};
}
export function initSculpture(){
 const wrap=document.getElementById('sculpture'),canvas=document.getElementById('sculpture-canvas'),liquidCanvas=document.getElementById('liquid-canvas');
 if(!wrap||!canvas)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)'),buttons=[...document.querySelectorAll('[data-art-mode]')],hint=document.getElementById('art-hint');
 const fallback=()=>{wrap.dataset.ready='false';buttons.forEach(b=>{if(b.dataset.artMode==='liquid')b.disabled=true});if(hint)hint.textContent='Une forme libre. Un regard singulier.'};
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl){fallback();return}
 let program,vs,fs,vao,buffers=[],uniforms;
 try{
   vs=compile(gl,gl.VERTEX_SHADER,VERTEX);fs=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   gl.deleteShader(vs);gl.deleteShader(fs);vao=gl.createVertexArray();gl.bindVertexArray(vao);const mesh=geometry();
   for(const [index,data] of [[0,mesh.positions],[1,mesh.normals]]){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0)}
   const indexBuffer=gl.createBuffer();buffers.push(indexBuffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
   uniforms={rotation:gl.getUniformLocation(program,'uRotation'),aspect:gl.getUniformLocation(program,'uAspect'),light:gl.getUniformLocation(program,'uLight')};
   gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
   let frame=0,visible=true,lost=false,mode='3d',last=0,time=0,px=0,py=0,tx=0,ty=0,liquid=null,liquidFailed=false,imageSequence=0;
   const isLight=()=>document.documentElement.dataset.theme==='light';
   function draw(now=0,force=false){
     if(lost)return;
     if(!force&&(!visible||document.hidden||mode!=='3d')){frame=0;return}
     if(force||now-last>=32||reduce.matches){
       if(!reduce.matches&&!force){time+=Math.min(.05,Math.max(0,(now-last)/1000))}
       last=now;px+=(tx-px)*.045;py+=(ty-py)*.045;
       gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindVertexArray(vao);
       gl.uniform3f(uniforms.rotation,-.28+py*.28,-.32+px*.38+Math.sin(time*.16)*.14,.38+Math.sin(time*.20)*.08);
       gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);gl.uniform1f(uniforms.light,isLight()?1:0);gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
       wrap.dataset.ready='true';
     }
     if(!reduce.matches&&!force)frame=requestAnimationFrame(draw);else frame=0;
   }
   function start(){if(!frame&&visible&&!document.hidden&&mode==='3d'&&!lost){if(reduce.matches)draw(0,true);else{last=performance.now();frame=requestAnimationFrame(draw)}}}
   function stop(){cancelAnimationFrame(frame);frame=0}
   function resize(){
     const rect=wrap.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,coarse.matches?1.25:1.75),budget=Math.min(dpr,Math.sqrt(1700000/Math.max(1,rect.width*rect.height)));
     canvas.width=Math.max(1,Math.round(rect.width*budget));canvas.height=Math.max(1,Math.round(rect.height*budget));
     liquid?.resize(rect.width,rect.height,{x:0,y:0,w:rect.width,h:rect.height});
     draw(0,true);if(mode==='liquid')refreshLiquid();
   }
   function liquidOptions(){return{interactive:!reduce.matches,strength:.82,radius:150,density:coarse.matches?.25:.5,dotSize:1,spread:.8,turbulence:.6,returnSpeed:1.2,streaks:true,restStyle:'image',ambient:false,ambientIntensity:0,speed:1,intro:false,reducedMotion:reduce.matches,bg:isLight()?[.95,.94,.91]:[.09,.09,.08],imgBg:null,liquid:.9}}
   function refreshLiquid(){
     if(!liquid||liquidFailed)return;
     draw(0,true);const serial=++imageSequence,image=new Image();
     image.onload=()=>{
       if(serial!==imageSequence||mode!=='liquid')return;
       try{liquid.setImage(image);const r=wrap.getBoundingClientRect();liquid.resize(r.width,r.height,{x:0,y:0,w:r.width,h:r.height});liquid.setVisible(visible&&!document.hidden);wrap.dataset.mode='liquid'}catch{onLiquidFail()}
     };image.src=canvas.toDataURL('image/png');
   }
   function onLiquidFail(){
     liquidFailed=true;wrap.dataset.mode='3d';mode='3d';buttons.forEach(b=>{const active=b.dataset.artMode==='3d';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));if(!active)b.disabled=true});
     if(hint)hint.textContent='La sculpture 3D reste interactive.';start();
   }
   function setMode(next){
     if(next==='liquid'&&liquidFailed)return;
     mode=next;buttons.forEach(b=>{const active=b.dataset.artMode===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
     if(next==='liquid'){
       stop();
       if(!liquid){try{liquid=new LiquidEngine(liquidCanvas,liquidOptions(),onLiquidFail)}catch{onLiquidFail();return}}
       refreshLiquid();if(hint)hint.textContent=reduce.matches?'Matière figée · animations réduites.':coarse.matches?'Touchez la matière.':'Survolez. La matière vous répond.';
     }else{imageSequence++;liquid?.setVisible(false);wrap.dataset.mode='3d';if(hint)hint.textContent='Une sculpture qui suit votre regard.';start()}
   }
   buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.artMode)));
   const point=e=>{const r=wrap.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top,w:r.width,h:r.height}};
   wrap.addEventListener('pointermove',e=>{const p=point(e);tx=p.x/p.w*2-1;ty=p.y/p.h*2-1;if(mode==='liquid'&&(!coarse.matches||e.buttons))liquid?.pointer('move',p.x,p.y,e.pointerType==='touch')},{passive:true});
   wrap.addEventListener('pointerdown',e=>{if(mode==='liquid'){const p=point(e);liquid?.pointer('down',p.x,p.y,e.pointerType==='touch')}},{passive:true});
   wrap.addEventListener('pointerup',e=>{const p=point(e);liquid?.pointer('up',p.x,p.y,e.pointerType==='touch')},{passive:true});
   wrap.addEventListener('pointerleave',e=>{tx=ty=0;const p=point(e);liquid?.pointer('leave',p.x,p.y,e.pointerType==='touch')},{passive:true});
   const ro=new ResizeObserver(resize);ro.observe(wrap);
   const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(mode==='3d')start();else liquid?.setVisible(!document.hidden)}else{stop();liquid?.setVisible(false)}},{threshold:.02});io.observe(wrap);
   const visibility=()=>{if(document.hidden){stop();liquid?.setVisible(false)}else if(visible){if(mode==='3d')start();else liquid?.setVisible(true)}};document.addEventListener('visibilitychange',visibility);
   window.addEventListener('eskis:theme',()=>{draw(0,true);liquid?.setOptions(liquidOptions());if(mode==='liquid')refreshLiquid()});
   reduce.addEventListener('change',()=>{stop();liquid?.setOptions(liquidOptions());draw(0,true);start()});
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();liquid?.setVisible(false);fallback()});
   window.addEventListener('pagehide',()=>{stop();liquid?.setVisible(false)});
   window.addEventListener('pageshow',visibility);
   resize();start();
 }catch{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(program)gl.deleteProgram(program);fallback()}
}
