/* Adapted from Horizon Hero Section by lovesickfromthe6ix, source supplied by the user.
   https://21st.dev/@lovesickfromthe6ix/components/horizon-hero-section
   The star shader, layered landscape, bloom and eased camera are retained and tuned for ESKIS.
   React lifecycle is translated to a static-site module; resources pause outside the chapter. */
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {gsap} from 'gsap';

export function initHorizon(){
  const canvas=document.getElementById('horizon-canvas'),chapter=document.getElementById('horizon');
  if(!canvas||!chapter)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'})}catch{return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.3:1.65));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(65,1,.1,2500);
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.5,.5,.8);composer.addPass(bloom);
  const sky=new THREE.Mesh(new THREE.PlaneGeometry(2800,1800),new THREE.ShaderMaterial({
    uniforms:{time:{value:0},light:{value:0}},depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float time;uniform float light;void main(){
      vec2 p=vUv-vec2(.5,.38);p.x*=1.45;
      float halo=exp(-length(p)*5.8),core=exp(-length(p)*23.);
      float wave=sin(p.x*8.+time*.12)*cos(p.y*5.-time*.1)*.025;
      vec3 dark=vec3(.035,.035,.031)+vec3(.45,.43,.35)*(halo+wave)+vec3(.85,.8,.66)*core;
      vec3 cream=vec3(.88,.86,.80)-vec3(.3,.29,.25)*halo;
      gl_FragColor=vec4(mix(dark,cream,light),1.);
    }`
  }));sky.position.set(0,100,-1000);scene.add(sky);
  const stars=[];
  let seed=7;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  for(let layer=0;layer<3;layer++){
    const count=innerWidth<760?450:900,positions=new Float32Array(count*3),sizes=new Float32Array(count);
    for(let j=0;j<count;j++){positions[j*3]=(random()-.5)*1800;positions[j*3+1]=random()*950-80;positions[j*3+2]=-random()*900-250;sizes[j]=random()*1.1+.3}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('size',new THREE.BufferAttribute(sizes,1));
    const mat=new THREE.ShaderMaterial({uniforms:{time:{value:0},depth:{value:layer},light:{value:0}},
      vertexShader:`attribute float size;uniform float time;uniform float depth;void main(){vec3 pos=position;float angle=time*.005*(1.-depth*.3);mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));pos.xy=rot*pos.xy;vec4 mv=modelViewMatrix*vec4(pos,1.);gl_PointSize=min(3.,size*(380./-mv.z));gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`uniform float light;void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;float opacity=(1.-smoothstep(0.,.5,d))*.6;gl_FragColor=vec4(mix(vec3(.92,.9,.82),vec3(.2),light),opacity);}`,
      transparent:true,blending:THREE.NormalBlending,depthWrite:false});
    const field=new THREE.Points(geo,mat);scene.add(field);stars.push(field);
  }
  const mountains=[];
  for(let layer=0;layer<4;layer++){
    const points=[],distance=-160-layer*160,height=55+layer*17;
    for(let i=0;i<=80;i++){
      const x=(i/80-.5)*2000;
      const valley=-Math.exp(-Math.pow(x/240,2))*55;
      const y=Math.sin(i*.13+layer)*height*.48+Math.sin(i*.37+layer*1.5)*height*.17+random()*10+valley+22;
      points.push(new THREE.Vector2(x,y));
    }
    points.push(new THREE.Vector2(1200,-600),new THREE.Vector2(-1200,-600));
    const geo=new THREE.ShapeGeometry(new THREE.Shape(points));
    const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x171715,side:THREE.DoubleSide}));mesh.position.z=distance;mesh.userData.baseZ=distance;scene.add(mesh);mountains.push(mesh);
  }
  // A low, faceted terrain gives depth to the original silhouette layers.
  const terrainGeo=new THREE.PlaneGeometry(1400,1150,85,75);terrainGeo.rotateX(-Math.PI/2);
  const pos=terrainGeo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),height=(Math.sin(x*.012+z*.006)*14+Math.sin(z*.018+x*.008)*9+Math.cos(x*.023)*5);
    pos.setY(i,height-35-Math.exp(-x*x/30000)*18);
  }terrainGeo.computeVertexNormals();
  const terrain=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x171715,roughness:.8,metalness:.15,flatShading:true}));terrain.position.set(0,-6,-190);scene.add(terrain);
  const ambient=new THREE.AmbientLight(0xf2efe7,.3),sun=new THREE.DirectionalLight(0xfff2d2,2.7);sun.position.set(0,140,-470);scene.add(ambient,sun);
  const target={x:0,y:55,z:200},position={x:0,y:55,z:200};let progress=0,pointerX=0,pointerY=0,visible=true,frame=0,last=0,elapsed=0;
  function applyTheme(){
    const light=document.documentElement.dataset.theme==='light';sky.material.uniforms.light.value=light?1:0;stars.forEach(s=>s.material.uniforms.light.value=light?1:0);
    scene.background=new THREE.Color(light?0xf2efe7:0x171715);
    mountains.forEach((m,i)=>m.material.color.set(light?[0xc8c4b7,0xb9b5a7,0xaaa79a,0x9e9b90][i]:[0x161614,0x25251f,0x34342c,0x4d4a3e][i]));
    terrain.material.color.set(light?0xc7c3b5:0x171715);ambient.intensity=light?1.8:.3;sun.intensity=light?1:2.7;bloom.strength=light?.12:.42;
    requestRender();
  }
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();requestRender()}
  function updateProgress(){const r=chapter.getBoundingClientRect();progress=reduced.matches?0:Math.max(0,Math.min(1,-r.top/Math.max(1,chapter.offsetHeight-innerHeight)));target.z=200-progress*310;target.y=55+progress*35;requestRender()}
  function render(t){
    frame=0;if(!visible||document.hidden)return;
    const dt=last?Math.min((t-last)/1000,.04):.016;last=t;if(!reduced.matches)elapsed+=dt;
    const smoothing=1-Math.exp(-dt*4);
    position.x+=(target.x+pointerX*7-position.x)*smoothing;position.y+=(target.y+pointerY*3-position.y)*smoothing;position.z+=(target.z-position.z)*smoothing;
    camera.position.set(position.x,position.y+(reduced.matches?0:Math.sin(elapsed*.15)*1.5),position.z);camera.lookAt(0,35,-650);
    stars.forEach(s=>s.material.uniforms.time.value=elapsed);sky.material.uniforms.time.value=elapsed;
    mountains.forEach((m,i)=>{m.position.x=reduced.matches?0:Math.sin(elapsed*.08+i)*2*(i+1)});
    composer.render();canvas.classList.add('is-ready');
    if(!reduced.matches)frame=requestAnimationFrame(render);
  }
  function requestRender(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;if(visible)requestRender();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'100px'}).observe(chapter);
  chapter.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduced.matches){pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5}});
  chapter.addEventListener('pointerleave',()=>{pointerX=pointerY=0});
  addEventListener('scroll',updateProgress,{passive:true});addEventListener('eskis:theme',applyTheme);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{last=0;requestRender()}});
  reduced.addEventListener('change',()=>{last=0;elapsed=0;updateProgress();requestRender()});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;canvas.classList.remove('is-ready')});
  resize();applyTheme();updateProgress();
  if(!reduced.matches)gsap.fromTo('.horizon-enter',{y:25,opacity:0},{y:0,opacity:1,duration:1,delay:1,ease:'power3.out'});
  addEventListener('pagehide',e=>{cancelAnimationFrame(frame);frame=0;if(e.persisted)return;scene.traverse(o=>{o.geometry?.dispose();if(o.material)Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose()});composer.dispose();renderer.dispose()});
  addEventListener('pageshow',e=>{if(e.persisted){last=0;requestRender()}});
}
