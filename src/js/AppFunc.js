export default class AppFunc {
  static getFormatedDate(date) {
    const nDate = new Date(date);
    return `${AppFunc.formatDateNumber(nDate.getDate())}`
    + `.${AppFunc.formatDateNumber(nDate.getMonth() + 1)}`
    + `.${AppFunc.formatDateNumber(nDate.getFullYear())}`
    + ` ${AppFunc.formatDateNumber(nDate.getHours())}`
    + `:${AppFunc.formatDateNumber(nDate.getMinutes())}`;
  }

  static formatDateNumber(number) {
    return String(number).padStart(2, '0');
  }

  static newElement(tag, attrObj) {
    const el = document.createElement(tag);
    for (const key of Object.keys(attrObj)) el.setAttribute(key, attrObj[key]);
    return el;
  }

  // loc - location data { latitude, longitude }
  static getFormatLocation(loc) {
    if (!loc) return null;
    return `[${loc.latitude}, ${loc.longitude}]`;
  }

  static formatTime(seconds) {
    const min = Math.trunc(seconds / 60);
    const sec = seconds - (min * 60);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  static validLocation(location) {
    if (!/^-?\d+\.[0-9]{3,5},\s*-?\d+\.[0-9]{3,5}$/.test(location)
    && !/^\[-?\d+\.[0-9]{3,5},\s*-?\d+\.[0-9]{3,5}\]$/.test(location)) { return { error: 'Неверно разделены или указаны координаты' }; }

    const array = (!/\[.+,.+\]/.test(location)) ? location.split(',') : JSON.parse(location);
    const latitude = Number(array[0]);
    const longitude = Number(array[1]);

    return { latitude, longitude };
  }
}
