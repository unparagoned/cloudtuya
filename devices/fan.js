const BaseDevice = require('./baseDevice');

class Fan extends BaseDevice {
  async setSpeed(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'windSpeedSet',
      setState: value,
    });
  }

}
module.exports = Fan;
