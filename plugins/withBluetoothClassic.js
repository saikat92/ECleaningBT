const { withInfoPlist } = require('expo/config-plugins');

module.exports = function withBluetoothClassic(config) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.NSBluetoothAlwaysUsageDescription = 
      'Allow Bluetooth access to connect to E-Cleaning devices';
    mod.modResults.NSBluetoothPeripheralUsageDescription = 
      'Allow Bluetooth access to connect to E-Cleaning devices';
    mod.modResults.UIBackgroundModes = ['bluetooth-central'];
    return mod;
  });
};