/*
 * Liquid Metal Button — adapted from the React component supplied by the owner.
 * Native links/forms remain in control of navigation and submission.
 * Paper Shaders 0.0.81: Apache-2.0, notices shipped in assets/.
 */
import {ShaderMount, liquidMetalFragmentShader} from '@paper-design/shaders';

const buttons = [...document.querySelectorAll('.metal-button')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const states = buttons.map((button,index) => ({button,index,host:button.querySelector('.metal-shader'),ripples:button.querySelector('.metal-ripples'),mount:null,visible:false,hovered:false,focused:false,failed:false,boosted:false,timer:0}));

function eligible(state) {
  const modal=document.querySelector('dialog[open]');
  return state.visible && !document.hidden && !state.button.disabled && !state.button.closest('[inert]') && (!modal || modal.contains(state.button));
}

function dispose(state) {
  state.mount?.dispose();state.mount=null;
  state.button.classList.remove('has-metal-shader');
}

function sync(state) {
  if (!state.host) return;
  const active=eligible(state) && !reduced.matches;
  if (active && !state.mount && !state.failed) {
    try {
      state.mount=new ShaderMount(state.host,liquidMetalFragmentShader,{
        u_repetition:4,u_softness:.5,u_shiftRed:.3,u_shiftBlue:.3,u_distortion:0,u_contour:0,u_angle:45,
        u_scale:8,u_shape:1,u_offsetX:.1,u_offsetY:-.1,u_rotation:0,u_originX:.5,u_originY:.5,
        u_fit:0,u_worldWidth:0,u_worldHeight:0,u_colorBack:[0,0,0,0],u_colorTint:[1,1,1,0],u_isImage:false
      },{alpha:true,antialias:false,powerPreference:'low-power'},0,2000*(state.index+1),1.5,200000);
      state.mount.canvasElement.addEventListener('webglcontextlost',()=>{
        state.failed=true;dispose(state);state.host.replaceChildren();
      },{once:true});
      state.button.classList.add('has-metal-shader');
    } catch {
      state.failed=true;dispose(state);state.host.replaceChildren();
    }
  }
  state.mount?.setSpeed(active ? state.boosted ? 2.4 : state.hovered || state.focused ? 1 : .6 : 0);
}

const syncAll=()=>states.forEach(sync);
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const state=states.find(item=>item.button===entry.target);
  state.visible=entry.isIntersecting;sync(state);
}),{threshold:.01});

states.forEach(state=>{
  const {button}=state;
  observer.observe(button);
  button.addEventListener('pointerenter',()=>{state.hovered=true;sync(state)});
  button.addEventListener('pointerleave',()=>{state.hovered=false;button.classList.remove('is-pressed');sync(state)});
  button.addEventListener('focus',()=>{state.focused=button.matches(':focus-visible');sync(state)});
  button.addEventListener('blur',()=>{state.focused=false;button.classList.remove('is-pressed');sync(state)});
  button.addEventListener('pointerdown',()=>{if(!button.disabled)button.classList.add('is-pressed')});
  button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter')button.classList.add('is-pressed')});
  button.addEventListener('keyup',()=>button.classList.remove('is-pressed'));
  button.addEventListener('click',event=>{
    if(button.disabled || reduced.matches)return;
    clearTimeout(state.timer);state.boosted=true;sync(state);
    state.timer=setTimeout(()=>{state.boosted=false;sync(state)},300);
    const rect=button.getBoundingClientRect(),ripple=document.createElement('span');
    ripple.className='metal-ripple';
    ripple.style.left=`${event.detail===0?rect.width/2:event.clientX-rect.left}px`;
    ripple.style.top=`${event.detail===0?rect.height/2:event.clientY-rect.top}px`;
    state.ripples.append(ripple);
    ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
  });
});

const release=()=>states.forEach(state=>state.button.classList.remove('is-pressed'));
addEventListener('pointerup',release);addEventListener('pointercancel',release);
document.addEventListener('visibilitychange',syncAll);
reduced.addEventListener('change',()=>{
  states.forEach(state=>{if(reduced.matches){dispose(state);state.ripples.replaceChildren();state.button.classList.remove('is-pressed')}sync(state)});
});
const environment=new MutationObserver(syncAll);
[document.body,document.querySelector('main'),...document.querySelectorAll('dialog')].filter(Boolean).forEach(element=>environment.observe(element,{attributes:true,attributeFilter:['class','inert','open']}));
addEventListener('pagehide',event=>states.forEach(state=>{clearTimeout(state.timer);state.boosted=false;if(event.persisted)state.mount?.setSpeed(0);else dispose(state)}));
addEventListener('pageshow',syncAll);
