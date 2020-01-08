# cloudtuya
Tuya control over the cloud

This Node.js API allows you to control your Tuya / Smart Life Devices by just passing your email and password, that you are using in the Tuya/Smart Life app.


## Get Started

- Install [Node.js](http://nodejs.org/)
- Clone repository
- `cd` to repository folder
- Run `npm i`
- Create a `keys.json` file (see example below)
- Run `node example.js`

This example will turn off the first device you've set up in Tuya / Smart Life. Also a `devices.json` file will get created with a list of all your devices and it's current state.


## Example Files

### Example Script showing how to use cloudtuya

Take a look at the `example.js` file, to see how to call the cloudtuya API.

### Example `keys.json`

```
{
"userName": "YOURSMARTLIFEEMAIL",
"password": "YOURSMARTLIFEPASSWORD",
"bizType": "smart_life",
"countryCode": "44",
"region": "eu"
}
```

The following values are available

- **bizType**: *tuya, smart_life*
- **countryCode**: Enter the [country calling code](https://en.wikipedia.org/wiki/List_of_country_calling_codes) from your country, e.g. 44
- **region**: *az*(Americas), *ay*(Asia), *eu*(Europe)
