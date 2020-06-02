const request = require('request');
const debug = require('debug')('cloudtuya');
// A module that uses the tuya cloud api, to get and set device states
// All you need is to put your tuya/smartlife email and pass
// Into the keys.json file
/**
* "userName" : "d@yahoo.com",
*  "password": "yourpassword",
*  "countryCode": "44",
*  "bizType": "smart_life",
*  "region": "EU"
 *
 */


/**
* A TuyaCloud object
* @class
* @param {Object} options construction options
* @param {String} options.key API key
* @param {String} options.secret API secret
* @param {String} [options.region='eu'] region az=Americas, ay=Asia, eu=Europe)
* @param {String} [options.deviceID] ID of device calling API (defaults to a random value)
* @param {String} [options.mode='ANY'] Authorisation method (ANY, KEY, EMAIL)
* @param {String} options.userName App email to login to App on phone
* @param {String} options.password App password
* @param {String} [options.bizType='smart_life'] App business ('tuya' or 'smart_life')
* @param {String} [options.countryCode='44'] Country code (International dialing number)
* */
class CloudTuya {
  constructor(options) {
    // super();
    // Set to empty object if undefined
    const config = (options) || {};
    this.devices = [];
    if(!config.userName || !config.password) {
      throw new Error('Missing loging email/pass');
    } else{
      this.core = {
        userName: config.userName,
        password: config.password,
        countryCode: config.countryCode || '44',
        bizType: config.bizType || 'smart_life',
        from: 'tuya',
      };
    }

    // Specific endpoint where no key/secret required

    const knownRegions = ['az', 'eu', 'ay', 'us'];
    config.region = (config.region && knownRegions.indexOf(config.region.toLowerCase()) !== -1)
      ? config.region.toLowerCase()
      : 'eu';
    this.uri = 'https://px1.tuya' + config.region + '.com/homeassistant';
  }

  /**
   *
   * @param {Object} options requst options
   */
  async post(options) {
    // Set to empty object if undefined
    if(this.tokens && this.tokens.expires_in < 0) this.getToken();
    const config = (options) || {};
    config.method = 'POST';
    return new Promise((resolve, reject) => {
      request(config, (err, response, body) => {
        if(!err && response.statusCode === 200) {
          debug(body);
          resolve(body);
        } else if(err) reject(err);
      });
    });
  }

  /**
   * @param {Object} opbtions
   */
  async find(options) {
    const config = (options) || {};
    // Scan network otherwise or no device id in options
    const uri = `${this.uri}/skill`;
    const data = {
      header: {
        name: 'Discovery',
        namespace: 'discovery',
        payloadVersion: 1,
      },
      payload: {
        accessToken: this.accessToken,
      },
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    const postConfig = {
      uri,
      method: 'POST',
      headers,
      json: data,
    };
    const{ payload: { devices } } = await this.post(postConfig);
    this.devices = devices;
    this.currentDevices = devices;
    debug(devices);
    // Check if device is in device list first
    if(config.id) {
      const matchDevice = await this.devices.filter(device => device.id === config.id);
      if(matchDevice) this.currentDevices = matchDevice;
    }

    return this.currentDevices;
  }

  // Converts true/false to ON/OFF
  static smap(itemState) {
    return(itemState && 'ON') || 'OFF';
  }

  // Convert text on/off, logic and numbers into 1/0 values
  static lmap(itemState) {
    if((typeof itemState === 'number')
      && (itemState === 0
      || itemState === 1)) {
      return itemState;
    }
    if(typeof itemState === typeof true) {
      return(itemState && 1) || 0;
    }
    if(typeof itemState === 'string') {
      return(['on', 'true', '1']
        .includes(itemState.toLowerCase())
        && 1) || 0;
    }
    return itemState;
  }

  updateStatesCache(key, value, states) {
    this.states = (this.states) || {};
    this.states[key] = value;
    // eslint-disable-next-line no-param-reassign
    states[key] = value;
    return states;
  }

  async state(options) {
    let devices = await this.find(options);
    const config = (options) || {};
    debug(`prefilter ${JSON.stringify(devices)}`);
    devices = (config.id) ? devices.filter(device => device.id === config.id) : devices;
    debug(`postfilter ${JSON.stringify(devices)}`);
    const states = {};
    const returnMap = await devices.map(device => this
      .updateStatesCache(device.id, CloudTuya.smap(device.data.state), states));
    debug(`Return map ${JSON.stringify(returnMap)}`);
    debug(states);
    return(states[config.id]) || states;
  }

  async setState(options) {
    const config = (options) || {};
    const payload = (config.payload) || {};
    // Scan network otherwise or no device id in options
    const uri = `${this.uri}/skill`;
    payload.accessToken = this.accessToken;
    payload.devId = config.devId;
    // dsp 1 default
    payload.value = CloudTuya.lmap(config.setState);
    const command = config.command || 'turnOnOff';
    debug(payload);
    const data = {
      header: {
        name: command,
        namespace: 'control',
        payloadVersion: 1,
      },
      payload,
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    const postConfig = {
      uri,
      method: 'POST',
      headers,
      json: data,
    };
    debug(postConfig);
    const setProgress = await this.post(postConfig);
    return setProgress;
  }

  async login(options) {
    const config = options || {};
    const uri = `${this.uri}/auth.do`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    // Set userName pass biz
    const data = config.core || this.core;
    data.from = 'tuya';
    const postConfig = {
      uri,
      method: 'POST',
      headers,
      form: data,
    };

    let tokens = await this.post(postConfig);
    tokens = JSON.parse(tokens);
    this.tokens = tokens;
    this.accessToken = tokens.access_token;
    debug(tokens);

    if(tokens && tokens.responseStatus && tokens.responseStatus === 'error'){
      console.error(tokens.errorMsg);
      return null;
    }

    return tokens;
  }

  async getToken(options) {
    return this.login(options);
  }
}

module.exports = CloudTuya;
