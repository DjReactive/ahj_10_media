export default class AudioVideo {
  constructor() {
    this.lastURL = null;
    this.callback = null;
    this.type = 'audio';
  }

  initEvents() {
    this.recorder.addEventListener('dataavailable', (e) => {
      this.chunks.push(e.data);
    });
    this.recorder.addEventListener('stop', () => {
      const blob = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' });
      const url = URL.createObjectURL(blob);
      const media = `
      <video class="${this.type}" src="${url}" controls>
        <p>Ваш браузер не поддерживает HTML5 видео. Используйте <a href="${url}">ссылку </a> для доступа.</p>
      </video>`;
      // audio.src = url;
      this.callback(media);
    });
  }

  start(type) {
    this.type = type;
    (async () => {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: (type === 'video'),
      });
      this.recorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.initEvents();
      this.recorder.start();
    })();
  }

  stop(callback) {
    this.callback = callback;
    this.recorder.stop();

    this.lastURL = null;
    this.stream.getTracks().forEach((track) => track.stop());
  }
}
