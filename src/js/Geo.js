export default class Geo {
  static navi = navigator.geolocation;

  static isEnable = true;

  static getLocation(success, error) {
    Geo.navi.getCurrentPosition(success, error);
  }
}
