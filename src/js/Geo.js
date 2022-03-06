export default class Geo {
  static navi = navigator.geolocation;

  static isEnable = true;

  static getLocation(success) {
    Geo.navi.getCurrentPosition(success, Geo.error);
  }

  static error(err) {
    if (err) Geo.isEnable = false;
  }
}
