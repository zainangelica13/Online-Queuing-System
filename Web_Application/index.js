require('babel-polyfill');
require('webrtc-adapter');

var Instascan = {
  Scanner: require('./newdesign/insta/src/scanner'),
  Camera: require('./newdesign/insta/src/camera')
};

module.exports = Instascan;
