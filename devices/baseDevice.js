class BaseDevice {
  constructor(options) {
    if(!options.api){
      throw new Error('Please pass the Tuya API');
    }
    this._api = options.api;

    if(!options.deviceId){
      throw new Error('Please pass the Tuya API');
    }
    this._deviceId = options.deviceId;
  }

  async turnOn() {
    return await this._api.setState({
      devId: this._deviceId,
      setState: 'On',
    });
  }
  async turnOff() {
    return await this._api.setState({
      devId: this._deviceId,
      setState: 'Off',
    });
  }
}
module.exports = BaseDevice;
