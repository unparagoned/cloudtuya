/**
 * Example script using cloudtuya to connect, get states an change them
 */


const debug = require('debug')('cloudtuya');
const fs = require('fs');
const CloudTuya = require('./cloudtuya');

const name = 'cloudtuya';

debug('booting %s', name);

function print(msg) {
  // eslint-disable-next-line no-console
  console.log(msg);
}
// Load local files
let apiKeys = {};
let deviceData = {};
try{
  apiKeys = require('./keys.json') || {};
  deviceData = require('./devices.json') || {};
} catch(err) {
  debug('keys.json or devices.json are missing.');
}
/**
 * Save Data Such a Devices to file
 * @param {Object} data to save
 * @param {String} [file="./devices.json"] to save to
 */
function saveDataToFile(data, file = './devices.json') {
  debug(`Data ${JSON.stringify(data)}`);
  fs.writeFile(file, JSON.stringify(data), (err) => {
    if(err) {
      return debug(err);
    }
    debug(`The file ${file} was saved!`);
    return(file);
  });
}


async function main() {
  // Load from keys.json
  const api = new CloudTuya({
    userName: apiKeys.userName,
    password: apiKeys.password,
    bizType: apiKeys.bizType,
    countryCode: apiKeys.countryCode,
    region: apiKeys.region,
  });

  // Test device read from devics.json saved at the end.
  const testId = deviceData[0].id || '10000000000';
  debug(`device data ${deviceData} and ${deviceData[0].id} id or all ${deviceData[1].name}`);

  // Connect to cloud api and get access token.
  const tokens = await api.login();
  print(`Token ${JSON.stringify(tokens)}`);

  // Get all devices registered on the Tuya app
  let devices = await api.find();
  print(`devices ${JSON.stringify(devices)}`);

  // Save device to device.json
  saveDataToFile(devices);

  // Get state of a single device
  const deviceStates = await api.state(testId);
  const state = deviceStates.testId;
  debug(`testId ${testId}  has value ${state}`);
  print(`Status ${JSON.stringify(deviceStates)}`);

  // Turn device with testId off.
  devices = await api.setState(testId, 'Off');
  print(`state ${JSON.stringify(devices)}`);
}
main();
