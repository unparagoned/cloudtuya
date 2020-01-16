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

  async isOn(){
    return JSON.parse((await this.getSkills())['state']);
  }

  async getSkills() {
    var state = await this._api.find({
      devId: this._deviceId
    });
    return state && state[0] && state[0].data;
  }

  async supportsFeature(feature){
    var skills = await this.getSkills();
    return !!skills[feature];
  }
}
module.exports = BaseDevice;
