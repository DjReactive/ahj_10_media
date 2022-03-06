import Geo from './Geo';
import AudioVideo from './AudioVideo';
import AppFunc from './AppFunc';

export default class Feed {
  constructor() {
    this.coords = null;
    this.manualPos = false;
    this.lastError = {};
    this.post = {};
    this.messages = [];
    this.counter = 0;
    this.timer = 0;
    this.timerId = null;
    this.blockButtons = false;
    this.mediaCtrl = new AudioVideo();
    this.chat = document.getElementById('chat');
    this.feed = this.chat.querySelector('.chat__feed');
    this.control = this.chat.querySelector('.chat__control');
    this.txtArea = document.getElementById('message');
    this.bCtrl = this.control.querySelector('.chat__buttons');
    this.mCtrl = this.control.querySelector('.media__buttons');
    this.modal = document.querySelector('.modal');
  }

  init() {
    const bAudio = this.createButton({ id: 'send-audio', text: '\u{1F3A4}' });
    const bVideo = this.createButton({ id: 'send-video', text: '\u{1F4F9}' });
    const bText = this.createButton({ id: 'send-message', text: '\u{27A4}' });
    const mediaOk = this.createButton({ id: 'accept-media', text: '\u{2713}' }, this.mCtrl);
    const timer = AppFunc.newElement('div', { class: 'timer' });
    this.mCtrl.appendChild(timer);
    const mediaStop = this.createButton({ id: 'cancel-media', text: '\u{2717}' }, this.mCtrl);
    this.mCtrl.classList.add('hidden');

    // events
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || this.txtArea !== document.activeElement) return;
      this.preSending(bText, 'text');
    });
    bText.addEventListener('click', () => this.preSending(bText, 'text'));
    bAudio.addEventListener('click', () => this.preSending(bAudio, 'audio'));
    bVideo.addEventListener('click', () => this.preSending(bVideo, 'video'));
    // accept recording
    mediaOk.addEventListener('click', () => {
      this.switchControl();
      clearInterval(this.timerId);
      this.mediaCtrl.stop((el) => {
        this.post.content = el;
        this.messages.push(this.post);
        this.addPost();
      });
    });
    // cancel recording
    mediaStop.addEventListener('click', () => {
      this.switchControl();
      clearInterval(this.timerId);
      this.mediaCtrl.stop();
    });
    this.txtArea.focus();

    this.setLocation = this.setLocation.bind(this);
    this.showError = this.showError.bind(this);
    Geo.getLocation(this.setLocation, this.showError);
    this.bCtrl.style.top = `${String(Number(this.txtArea.offsetHeight) / 2
    - Number(this.bCtrl.offsetHeight) / 2)}px`;
    this.mCtrl.style.top = `${String(Number(this.txtArea.offsetHeight) / 2
    - Number(this.bCtrl.offsetHeight) / 2)}px`;
  }

  createButton(obj, parent = this.bCtrl) {
    const but = document.createElement('button');
    but.classList.add('send');
    but.setAttribute('id', obj.id);
    but.textContent = obj.text;
    parent.appendChild(but);
    return but;
  }

  switchControl() {
    this.bCtrl.classList.toggle('hidden');
    this.mCtrl.classList.toggle('hidden');
  }

  preSending(button, sendtype) {
    if (this.blockButtons) return;

    // Easy Validator
    if (sendtype === 'text' && this.txtArea.value.length < 1) {
      this.showError('Вы отправляете пустое сообщение');
      return;
    }

    this.send = this.send.bind(this);
    this.addLoader(button, 24);
    if (!Geo.isEnable) this.getModal(sendtype, this.send);
    else {
      new Promise((resolve) => {
        Geo.getLocation((data) => resolve(data));
      }).then((value) => {
        this.setLocation(value);
        this.send({ type: sendtype, location: this.coords });
      });
    }
  }

  send(data) {
    this.post = {};
    this.post.id = this.getId();
    this.post.location = AppFunc.getFormatLocation(data.location);
    this.post.type = data.type;
    this.post.created = Date.now();
    this.removeLoader();
    switch (data.type) {
      case 'text':
        this.post.content = this.txtArea.value;
        this.messages.push(this.post);
        this.addPost(this.post);
        break;
      case 'audio':
      case 'video':
        this.mediaContent(data.type);
        break;
      default:
        break;
    }
  }

  mediaContent(type) {
    this.switchControl();
    const timer = this.mCtrl.querySelector('.timer');
    new Promise((resolve) => resolve(this.mediaCtrl.start(type)))
      .then((err) => {
        if (!err.error) {
          timer.textContent = '00:00';
          this.timer = 0;
          this.timerId = setInterval(() => {
            this.timer += 1;
            timer.textContent = AppFunc.formatTime(this.timer);
          }, 1000);
        } else {
          this.default();
          this.switchControl();
          this.showError(err.message);
        }
      });
  }

  addPost(post = this.post) {
    const msg = document.createElement('div');
    msg.classList.add('feed-message');
    msg.innerHTML = `<div class="feed-message__text">
        <span class="feed-message__content"></span>
        <div class="feed-message__created">${AppFunc.getFormatedDate(post.created)}</div>
      </div>
      <div class="feed-message__location">${post.location}</div>
    `;
    this.feed.insertAdjacentElement('afterbegin', msg);
    const content = msg.querySelector('.feed-message__content');
    content.innerHTML = post.content;
    this.default();
  }

  getId() {
    this.counter += 1; return this.counter;
  }

  default() {
    // reset and scrolling
    this.txtArea.removeAttribute('disabled');
    this.feed.scrollBottom = this.feed.scrollHeight;
    this.txtArea.value = '';
    this.txtArea.focus();
  }

  // callback for accept coords
  getModal(sendtype, callback) {
    this.modal.classList.add('modal__active');
    this.modal.innerHTML = `
    <div class="modal__title">Что-то пошло не так</div>
    <div class="modal__content">
      <span class="modal__message">Вы не разрешили использовать геолокацию,
      поэтому пожалуйста укажите ее вручную.</span>
      <input type="text" class="modal__input" placeholder="[1.2345, -1.2345]">
    </div>
    <div class="modal__control">
      <button class="button accept">OK</button>
      <button class="button cancel">Cancel</button>
    </div>`;

    this.modal.querySelector('.modal__input').value = '[51.50851, -0.12572]';
    this.modal.querySelector('.modal__input').focus();
    const accept = this.modal.querySelector('.accept');
    accept.addEventListener('click', () => {
      const input = this.modal.querySelector('.modal__input');
      const res = AppFunc.validLocation(input.value);
      if (res.error) {
        input.setCustomValidity(res.error);
        input.reportValidity();
        return;
      }
      callback({
        type: sendtype,
        location: {
          latitude: res.latitude,
          longitude: res.longitude,
        },
      });
      this.manualPos = [res.latitude, res.longitude];
      this.closeModal();
    });
    const cancel = this.modal.querySelector('.cancel');
    cancel.addEventListener('click', () => this.closeModal());
  }

  closeModal() {
    this.removeLoader();
    this.txtArea.removeAttribute('disabled');
    this.modal.classList.remove('modal__active');
    this.modal.innerHTML = '';
  }

  showError(message) {
    if (this.lastError.id === message && this.lastError.cdown) return;

    const error = document.createElement('div');
    error.setAttribute('class', 'error error-animation');
    error.textContent = message;
    this.lastError.id = message;
    this.lastError.cdown = true;
    this.chat.appendChild(error);
    error.addEventListener('animationend', (e) => {
      this.lastError.cdown = false;
      setTimeout(() => {
        e.target.remove();
      }, 2000);
    });
  }

  addLoader(button, size = null) {
    this.removeLoader();
    this.blockButtons = true;
    this.txtArea.setAttribute('disabled', true);
    const img = document.createElement('img');
    img.classList.add('loader');
    img.setAttribute('src', 'images/tail-spin.svg');
    if (size) img.style.width = `${size}px`;
    this.loader = {
      element: img,
      replacement: button,
      text: button.textContent,
    };
    button.textContent = '';
    button.appendChild(img);
  }

  isLoader() {
    return !!(this.loader);
  }

  removeLoader() {
    if (this.isLoader()) {
      this.blockButtons = false;
      this.loader.replacement.textContent = this.loader.text;
      this.loader.element.remove(); this.loader = null;
    }
  }

  setLocation(pos) {
    const { latitude, longitude } = pos.coords;
    this.coords = {
      latitude: Number(latitude.toFixed(5)),
      longitude: Number(longitude.toFixed(5)),
    };
  }
}
