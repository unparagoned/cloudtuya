# cloudtuya
Tuya control over the cloud
Just using your email and pass used on the Tuya/Smart Life app.


###

#### Example Script showing how to use cloudtuya

```
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
  testId = deviceData[0].id || "10000000000";
  debug(`device data ${deviceData} and ${deviceData[0].id} id or all ${deviceData[1].name}`);
  
  // Connect to cloud api and get access token.
  const tokens = await api.login();
  debug(`Token ${JSON.stringify(tokens)}`);
  
  // Get all devices registered on the Tuya app
  let devices = await api.find();
  debug(`devices ${JSON.stringify(devices)}`);

  // Save device to device.json
  saveDataToFile(devices);

  // Get state of a single device
  let deviceStates = await api.state({ devId: testId });
  const state = deviceStates['testId'];
  debug(`testId ${testId}  has value ${state}`);
  debug(`devices ${JSON.stringify(deviceStates)}`);
  
  // Turn device with testId off.
  devices = await api.setState({
    devId: testId,
    setState: 'Off',
  });
  debug(`devices ${JSON.stringify(devices)}`);
  ```
