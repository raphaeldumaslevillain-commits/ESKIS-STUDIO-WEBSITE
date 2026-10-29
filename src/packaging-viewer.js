/* Native packaging viewer. Artwork comes exclusively from the supplied project files. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const host of document.querySelectorAll('[data-packaging-viewer]')){
  let initialized=false;
  const visibility=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||initialized)return;
    initialized=true;visibility.disconnect();mount(host);
  },{rootMargin:'250px'});
  visibility.observe(host);
}
async function mount(host){
  const status=host.querySelector('[data-viewer-status]');
  const canvas=host.querySelector('canvas');
  const data=JSON.parse(host.querySelector('[data-model-data]').textContent);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'})}
  catch{status.textContent='La vue 3D n’est pas disponible sur cet appareil.';host.classList.add('viewer-unavailable');return}
  renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;
  renderer.toneMappingExposure=1;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.05,80);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.05);
  scene.environment=environment.texture;
  scene.environmentIntensity=.2;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0xd5cfbf,.65));
  const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.set(3,5,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.5);fill.position.set(-4,2,-3);scene.add(fill);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=!reduced.matches;controls.dampingFactor=.10;controls.enablePan=false;
  controls.minDistance=3.1;controls.maxDistance=11;controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI-.04;
  controls.rotateSpeed=.65;controls.zoomSpeed=.8;
  const [width,height,depth]=data.dimensions;
  const model=new THREE.Group();scene.add(model);
  const plain=new THREE.MeshStandardMaterial({color:data.paper||'#faf7eb',roughness:.5,metalness:.025});
  const loader=new THREE.TextureLoader(),materials=[];
  let frame=0,visible=true,disposed=false;
  function render(){
    frame=0;if(disposed||!visible||document.hidden)return;
    controls.update();renderer.render(scene,camera);
  }
  function requestRender(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render)}
  controls.addEventListener('change',requestRender);
  const startPosition=new THREE.Vector3(...(data.camera||[3.6,2.25,6.2]));
  let interacted=false;
  controls.addEventListener('start',()=>{interacted=true});
  function reset(){
    const yaw=Math.atan2(startPosition.x,startPosition.z),pitch=Math.atan2(startPosition.y,Math.hypot(startPosition.x,startPosition.z));
    const projectedWidth=width*Math.cos(yaw)+depth*Math.sin(yaw);
    const projectedHeight=height*Math.cos(pitch)+(width*Math.sin(yaw)+depth*Math.cos(yaw))*Math.sin(pitch);
    const halfFov=THREE.MathUtils.degToRad(camera.fov/2);
    const distance=Math.max(projectedWidth/(2*Math.tan(halfFov)*camera.aspect),projectedHeight/(2*Math.tan(halfFov)))*1.25+.25;
    controls.maxDistance=Math.max(11,distance*2.3);
    camera.position.copy(startPosition).normalize().multiplyScalar(distance);controls.target.set(0,0,0);controls.update();interacted=false;requestRender();
  }
  try{
    const faceNames=['right','left','top','bottom','front','back'];
    for(const face of faceNames){
      if(!data.faces[face]){materials.push(plain);continue}
      const map=await loader.loadAsync(data.faces[face]);map.colorSpace=THREE.SRGBColorSpace;
      map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      materials.push(new THREE.MeshPhysicalMaterial({map,color:0xffffff,roughness:.86,metalness:0,ior:1.35,specularIntensity:.15}));
    }
    const box=new THREE.Mesh(new RoundedBoxGeometry(width,height,depth,3,.012),materials);model.add(box);
    // A subtle closing fold; unprinted top and bottom remain the supplied paper colour.
    const seamMaterial=new THREE.MeshStandardMaterial({color:data.foldColor||data.paper||'#faf7eb',roughness:.65,metalness:.06});
    const seam=new THREE.Mesh(new THREE.BoxGeometry(width-.025,.008,depth-.02),seamMaterial);
    seam.position.y=height/2-.024;model.add(seam);
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
    const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(128,128,5,128,128,120);
    gradient.addColorStop(0,'rgba(0,0,0,.26)');gradient.addColorStop(.5,'rgba(0,0,0,.11)');gradient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
    const shadowMap=new THREE.CanvasTexture(shadowCanvas);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.4,3.5),new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,opacity:.6}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-height/2-.08;scene.add(shadow);
    const resize=new ResizeObserver(()=>{const r=host.querySelector('.packaging-stage').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(!interacted)reset();else requestRender()});
    resize.observe(host.querySelector('.packaging-stage'));
    reset();host.classList.add('viewer-ready');status.textContent='Vue 3D prête. Glissez pour tourner, utilisez les commandes pour zoomer.';
    host.querySelector('[data-viewer-reset]').addEventListener('click',reset);
    function zoom(multiplier){
      interacted=true;
      const offset=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(offset.length()*multiplier,controls.minDistance,controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();requestRender();
    }
    host.querySelector('[data-viewer-zoom-in]').addEventListener('click',()=>zoom(.84));
    host.querySelector('[data-viewer-zoom-out]').addEventListener('click',()=>zoom(1.18));
    canvas.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
        if(event.key==='ArrowLeft')spherical.theta+=.13;if(event.key==='ArrowRight')spherical.theta-=.13;
        if(event.key==='ArrowUp')spherical.phi-=.13;if(event.key==='ArrowDown')spherical.phi+=.13;
        spherical.phi=THREE.MathUtils.clamp(spherical.phi,.04,Math.PI-.04);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();requestRender();
      }else if(event.key==='+'||event.key==='='){event.preventDefault();zoom(.84)}
      else if(event.key==='-'){event.preventDefault();zoom(1.18)}
      else if(event.key==='Home'){event.preventDefault();reset()}
    });
    const fullscreen=host.querySelector('[data-viewer-fullscreen]');
    if(host.requestFullscreen){fullscreen.addEventListener('click',()=>{if(document.fullscreenElement===host)document.exitFullscreen();else host.requestFullscreen()});document.addEventListener('fullscreenchange',()=>{const active=document.fullscreenElement===host;fullscreen.setAttribute('aria-label',active?'Quitter le plein écran':'Afficher le packaging en plein écran');fullscreen.textContent=active?'Réduire':'Plein écran';requestRender()})}
    else fullscreen.hidden=true;
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;requestRender()},{threshold:.01}).observe(host);
    document.addEventListener('visibilitychange',requestRender);
    reduced.addEventListener('change',()=>{controls.enableDamping=!reduced.matches;requestRender()});
    window.addEventListener('pageshow',requestRender);
    window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(frame);controls.dispose();resize.disconnect();scene.traverse(object=>{object.geometry?.dispose();for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[]){material.map?.dispose();material.dispose()}});environment.dispose();renderer.dispose()});
  }catch{status.textContent='Le packaging n’a pas pu être chargé. Les visuels restent disponibles ci-dessous.';host.classList.add('viewer-unavailable');renderer.dispose()}
}
