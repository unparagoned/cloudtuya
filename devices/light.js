const BaseDevice = require('./baseDevice');

class Light extends BaseDevice {
  /* Brightness */
  async supportsBrightness(){
    return await this.supportsFeature('brightness');
  }
  async getBrightness(){
    // Converts string to number and calculates to percentage
    return JSON.parse((await this.getSkills())['brightness']) / 255;
  }
  async setBrightness(value) {
    return await this._api.setState({
      devId: this._deviceId,
      command: 'brightnessSet',
      setState: value,
    });
  }


  /* Color*/
  async supportsColor(){
    return await this.supportsFeature('color');
  }
  async getColor(){
    return (await this.getSkills())['color'];
  }

  /* Color Temperatur */
  async supportsColorTemperatur(){
    return await this.supportsFeature('color_temp');
  }
  async getColorTemperatur(){
    return (await this.getSkills())['color_temp'];
  }
}
module.exports = Light;
