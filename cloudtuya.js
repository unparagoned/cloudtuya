/**
 * CloudTuya
 * A module that uses the tuya cloud api, to get and set device states
 * It usues your tuya/smartlife email and pass
 */
const request = require('request');
const debug = require('debug')('cloudtuya');

// DEBUG=* node cloudtuya to enable debug logs
const name = 'cloudtuya';
debug('booting %s', name);
/**
* A CloudTuya object
* @class
* @param {Object} options construction options
* @param {String} [options.region='eu'] region us=Americas, cn=Asia, eu=Europe)
* @param {String} [options.deviceID] ID of device calling API (defaults to a random value)
* @param {String} options.userName App email to login to App on phone
* @param {String} options.password App password
* @param {String} [options.bizType='smart_life'] App business ('tuya' or 'smart_life')
* @param {String} [options.countryCode='44'] Country code (International dialing number)
* */
class CloudTuya {
  constructor(options) {
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
    config.region = (config.region && (config.region.toLowerCase() in ['cn', 'eu', 'us']))
      ? config.region
      : 'eu';
    this.uri = 'https://px1.tuyaeu.com/homeassistant'.replace('eu', config.region);
  }

  /**
   * POSTS request with options arg
   * @param {Object} options request options
   * @param {String} options.uri uri/url
   * @param {String} [options.method='POST'] Request type
   * @param {Object} options.headers Request headers
   * @param {Object} options.json JSON request data OR
   * @param {Object} options.form Form request data
   */
  async post(options) {
    // get token if missing or expired
    if(this.tokens && this.tokens.expires_in < 0) this.getToken();
    // Set to empty object if undefined
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
   * Find devices
   * @param {String} id Get id or find all if missing
   */
  async find(id) {
    // Set options to find devices
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
    // Get devices from request
    const{ payload: { devices } } = await this.post(postConfig);
    this.devices = devices;
    this.currentDevices = devices;
    debug(devices);
    // Check if device is in device list first
    if(id) {
      const matchDevice = await this.devices.filter(device => device.id === id);
      if(matchDevice) this.currentDevices = matchDevice;
    }

    return this.currentDevices;
  }

  /**
   * Converts true/false to ON/OFF
   * @param {boolean} itemState
   */
  static smap(itemState) {
    return(itemState && 'ON') || 'OFF';
  }

  /**
   * Convert text on/off, logic and numbers into 1/0 values
   * @param {String/Boolean/Number} itemState
   */
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
        .includes(itemState.toLowerCase)
        && 1) || 0;
    }
    return itemState;
  }

  /**
   * Gets state of item/s
   * @param {String} id
   */
  async state(id) {
    const devices = await this.find(id);
    const states = {};
    const returnMap = await devices.map((device) => {
      states[device.id] = CloudTuya.smap(device.data.state);
      return states;
    });
    debug(`Return map ${JSON.stringify(returnMap)}`);
    debug(`States: ${states}`);
    return states;
  }

  /**
   * Sets device with id to state
   * @param {String} id Device id to set
   * @param {Number/String} state State to apply
   * @param {String} [cmd='turnOnOff'] Command type: modeSet, temperatureSet, turnOnOff, startStop,
   * windSpeedSet, swingOpen, swingClose, brightnessSet, colorSet, colorTemperatureSet.
   */
  async setState(id, state, cmd) {
    const uri = `${this.uri}/skill`;
    const payload = {
      accessToken: this.accessToken,
      devId: id,
      value: CloudTuya.lmap(state),
    };
    debug(payload);
    const data = {
      header: {
        name: cmd || 'turnOnOff',
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

    return(setProgress.header.code === 'SUCCESS');
  }

  /**
   * login using tuya app email/pass to obtain token to get/set device data
   */
  async login() {
    const uri = `${this.uri}/auth.do`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const postConfig = {
      uri,
      method: 'POST',
      headers,
      form: this.core,
    };
    const tokens = await this.post(postConfig);
    this.tokens = JSON.parse(tokens);
    this.accessToken = this.tokens.access_token;
    debug(this.tokens);
    return this.tokens;
  }

  /**
   *  login alias
   */
  async getToken() {
    return this.login();
  }
}

module.exports = CloudTuya;
