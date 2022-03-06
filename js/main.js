!function(){"use strict";function t(t,e,s){return e in t?Object.defineProperty(t,e,{value:s,enumerable:!0,configurable:!0,writable:!0}):t[e]=s,t}class e{static getLocation(t){e.navi.getCurrentPosition(t,e.error)}static error(t){t&&(e.isEnable=!1)}}t(e,"navi",navigator.geolocation),t(e,"isEnable",!0);class s{constructor(){this.lastURL=null,this.callback=null,this.type="audio"}initEvents(){this.recorder.addEventListener("dataavailable",(t=>{this.chunks.push(t.data)})),this.recorder.addEventListener("stop",(()=>{const t=new Blob(this.chunks,{type:"audio/ogg; codecs=opus"}),e=URL.createObjectURL(t),s=`\n      <video class="${this.type}" src="${e}" controls>\n        <p>Ваш браузер не поддерживает HTML5 видео. Используйте <a href="${e}">ссылку </a> для доступа.</p>\n      </video>`;this.callback(s)}))}start(t){return this.type=t,(async()=>{try{this.stream=await navigator.mediaDevices.getUserMedia({audio:!0,video:"video"===t}),this.recorder=new MediaRecorder(this.stream),this.chunks=[],this.initEvents(),this.recorder.start()}catch(t){return{error:!0,message:t}}return{error:!1}})()}stop(t){this.callback=t,this.recorder.stop(),this.lastURL=null,this.stream.getTracks().forEach((t=>t.stop()))}}class i{static getFormatedDate(t){const e=new Date(t);return`${i.formatDateNumber(e.getDate())}.${i.formatDateNumber(e.getMonth()+1)}.${i.formatDateNumber(e.getFullYear())} ${i.formatDateNumber(e.getHours())}:${i.formatDateNumber(e.getMinutes())}`}static formatDateNumber(t){return String(t).padStart(2,"0")}static newElement(t,e){const s=document.createElement(t);for(const t of Object.keys(e))s.setAttribute(t,e[t]);return s}static getFormatLocation(t){return t?`[${t.latitude}, ${t.longitude}]`:null}static formatTime(t){const e=Math.trunc(t/60),s=t-60*e;return`${String(e).padStart(2,"0")}:${String(s).padStart(2,"0")}`}static validLocation(t){if(!/^-?\d+\.[0-9]{3,5},\s*-?\d+\.[0-9]{3,5}$/.test(t)&&!/^\[-?\d+\.[0-9]{3,5},\s*-?\d+\.[0-9]{3,5}\]$/.test(t))return{error:"Неверно разделены или указаны координаты"};const e=/\[.+,.+\]/.test(t)?JSON.parse(t):t.split(",");return{latitude:Number(e[0]),longitude:Number(e[1])}}}(new class{constructor(){this.coords=null,this.manualPos=!1,this.lastError={},this.post={},this.messages=[],this.counter=0,this.timer=0,this.timerId=null,this.blockButtons=!1,this.mediaCtrl=new s,this.chat=document.getElementById("chat"),this.feed=this.chat.querySelector(".chat__feed"),this.control=this.chat.querySelector(".chat__control"),this.txtArea=document.getElementById("message"),this.bCtrl=this.control.querySelector(".chat__buttons"),this.mCtrl=this.control.querySelector(".media__buttons"),this.modal=document.querySelector(".modal")}init(){const t=this.createButton({id:"send-audio",text:"🎤"}),s=this.createButton({id:"send-video",text:"📹"}),r=this.createButton({id:"send-message",text:"➤"}),o=this.createButton({id:"accept-media",text:"✓"},this.mCtrl),a=i.newElement("div",{class:"timer"});this.mCtrl.appendChild(a);const n=this.createButton({id:"cancel-media",text:"✗"},this.mCtrl);this.mCtrl.classList.add("hidden"),document.addEventListener("keydown",(t=>{"Enter"===t.key&&this.txtArea===document.activeElement&&this.preSending(r,"text")})),r.addEventListener("click",(()=>this.preSending(r,"text"))),t.addEventListener("click",(()=>this.preSending(t,"audio"))),s.addEventListener("click",(()=>this.preSending(s,"video"))),o.addEventListener("click",(()=>{this.switchControl(),clearInterval(this.timerId),this.mediaCtrl.stop((t=>{this.post.content=t,this.messages.push(this.post),this.addPost()}))})),n.addEventListener("click",(()=>{this.switchControl(),clearInterval(this.timerId),this.mediaCtrl.stop()})),this.txtArea.focus(),this.setLocation=this.setLocation.bind(this),this.showError=this.showError.bind(this),e.getLocation(this.setLocation,this.showError),this.bCtrl.style.top=`${String(Number(this.txtArea.offsetHeight)/2-Number(this.bCtrl.offsetHeight)/2)}px`,this.mCtrl.style.top=`${String(Number(this.txtArea.offsetHeight)/2-Number(this.bCtrl.offsetHeight)/2)}px`}createButton(t,e=this.bCtrl){const s=document.createElement("button");return s.classList.add("send"),s.setAttribute("id",t.id),s.textContent=t.text,e.appendChild(s),s}switchControl(){this.bCtrl.classList.toggle("hidden"),this.mCtrl.classList.toggle("hidden")}preSending(t,s){this.blockButtons||("text"===s&&this.txtArea.value.length<1?this.showError("Вы отправляете пустое сообщение"):(this.send=this.send.bind(this),this.addLoader(t,24),e.isEnable?new Promise((t=>{e.getLocation((e=>t(e)))})).then((t=>{this.setLocation(t),this.send({type:s,location:this.coords})})):this.getModal(s,this.send)))}send(t){switch(this.post={},this.post.id=this.getId(),this.post.location=i.getFormatLocation(t.location),this.post.type=t.type,this.post.created=Date.now(),this.removeLoader(),t.type){case"text":this.post.content=this.txtArea.value,this.messages.push(this.post),this.addPost(this.post);break;case"audio":case"video":this.mediaContent(t.type)}}mediaContent(t){this.switchControl();const e=this.mCtrl.querySelector(".timer");new Promise((e=>e(this.mediaCtrl.start(t)))).then((t=>{t.error?(this.default(),this.switchControl(),this.showError(t.message)):(e.textContent="00:00",this.timer=0,this.timerId=setInterval((()=>{this.timer+=1,e.textContent=i.formatTime(this.timer)}),1e3))}))}addPost(t=this.post){const e=document.createElement("div");e.classList.add("feed-message"),e.innerHTML=`<div class="feed-message__text">\n        <span class="feed-message__content"></span>\n        <div class="feed-message__created">${i.getFormatedDate(t.created)}</div>\n      </div>\n      <div class="feed-message__location">${t.location}</div>\n    `,this.feed.insertAdjacentElement("afterbegin",e),e.querySelector(".feed-message__content").innerHTML=t.content,this.default()}getId(){return this.counter+=1,this.counter}default(){this.txtArea.removeAttribute("disabled"),this.feed.scrollBottom=this.feed.scrollHeight,this.txtArea.value="",this.txtArea.focus()}getModal(t,e){this.modal.classList.add("modal__active"),this.modal.innerHTML='\n    <div class="modal__title">Что-то пошло не так</div>\n    <div class="modal__content">\n      <span class="modal__message">Вы не разрешили использовать геолокацию,\n      поэтому пожалуйста укажите ее вручную.</span>\n      <input type="text" class="modal__input" placeholder="[1.2345, -1.2345]">\n    </div>\n    <div class="modal__control">\n      <button class="button accept">OK</button>\n      <button class="button cancel">Cancel</button>\n    </div>',this.modal.querySelector(".modal__input").value="[51.50851, -0.12572]",this.modal.querySelector(".modal__input").focus(),this.modal.querySelector(".accept").addEventListener("click",(()=>{const s=this.modal.querySelector(".modal__input"),r=i.validLocation(s.value);if(r.error)return s.setCustomValidity(r.error),void s.reportValidity();e({type:t,location:{latitude:r.latitude,longitude:r.longitude}}),this.manualPos=[r.latitude,r.longitude],this.closeModal()})),this.modal.querySelector(".cancel").addEventListener("click",(()=>this.closeModal()))}closeModal(){this.removeLoader(),this.txtArea.removeAttribute("disabled"),this.modal.classList.remove("modal__active"),this.modal.innerHTML=""}showError(t){if(this.lastError.id===t&&this.lastError.cdown)return;const e=document.createElement("div");e.setAttribute("class","error error-animation"),e.textContent=t,this.lastError.id=t,this.lastError.cdown=!0,this.chat.appendChild(e),e.addEventListener("animationend",(t=>{this.lastError.cdown=!1,setTimeout((()=>{t.target.remove()}),2e3)}))}addLoader(t,e=null){this.removeLoader(),this.blockButtons=!0,this.txtArea.setAttribute("disabled",!0);const s=document.createElement("img");s.classList.add("loader"),s.setAttribute("src","images/tail-spin.svg"),e&&(s.style.width=`${e}px`),this.loader={element:s,replacement:t,text:t.textContent},t.textContent="",t.appendChild(s)}isLoader(){return!!this.loader}removeLoader(){this.isLoader()&&(this.blockButtons=!1,this.loader.replacement.textContent=this.loader.text,this.loader.element.remove(),this.loader=null)}setLocation(t){const{latitude:e,longitude:s}=t.coords;this.coords={latitude:Number(e.toFixed(5)),longitude:Number(s.toFixed(5))}}}).init()}();