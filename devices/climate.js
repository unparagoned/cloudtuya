const BaseDevice = require('./baseDevice');

class Climate extends BaseDevice {
  async setTemperatur(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'temperatureSet',
      setState: value,
    });
  }
  async setFanMode(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'windSpeedSet',
      setState: value,
    });
  }
  async setOperationMode(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'modeSet',
      setState: value,
    });
  }
}
module.exports = Climate;
