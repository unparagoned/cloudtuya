/**
 * Example script using cloudtuya to connect, get states an change them
 */

const debug = require('debug')('njstuya');
const CloudTuya = require('./cloudtuya');
const apiKeys = require('./keys.json');

const name = 'njstuya';
debug('booting %s', name);

async function main() {
  const api = new CloudTuya({
    userName: apiKeys.userName,
    password: apiKeys.password,
    bizType: apiKeys.bizType,
    countryCode: apiKeys.countryCode,
    region: apiKeys.region,
  });

  const tokens = await api.login();
  debug(`Token ${JSON.stringify(tokens)}`);
  let devices = await api.state();
  debug(`devices ${JSON.stringify(devices)}`);
  devices = await api.state({ devId: 'xxxx' });
  debug(`devices ${JSON.stringify(devices)}`);
  // const payload = { value: '0' };
  devices = await api.setState({
    devId: 'xxx',
    setState: 'Off',
  });
  debug(`devices ${JSON.stringify(devices)}`);
}
main();
