const BaseDevice = require('./baseDevice');

class Light extends BaseDevice {
  async setBrightness(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'brightnessSet',
      setState: value,
    });
  }

  async supportsBrightness(){
    return await this.supportsFeature('brightness');
  }
}
module.exports = Light;
