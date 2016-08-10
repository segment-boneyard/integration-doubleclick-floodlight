var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var Floodlight = require('..');
var mapper = require('../lib/mapper');

describe('DoubleClick Floodlight', function(){
  var settings;
  var floodlight;
  var test;

  beforeEach(function(){
    settings = {
      appId: '654757884637545',
      appEvents: { 'Levelled Up': 'fb_mobile_level_achieved' }
    };
  });

  beforeEach(function(){
    floodlight = new Floodlight(settings);
    test = Test(floodlight, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('DoubleClick Floodlight')
      .endpoint('https://ad.doubleclick.net/ddm/activity/')
      .channels(['server']);
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Character Upgraded',
        timestamp: new Date(),
        context: {
          app: {
            namespace: 'com.Segment.testApp',
            version: 1.0
          },
          device: {
            type: 'ios',
            advertisingId: '123456',
            adTrackingEnabled: 1
          }
        }
      };
    });

    it('should be invalid when .advertisingId is missing', function(){
      delete msg.context.device.advertisingId;
      test.invalid(msg, settings);
    });

    it('should be invalid when advertisingEnabled is false', function(){
      delete msg.context.device.adTrackingEnabled;
      test.invalid(msg, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){
    describe('track', function(){
      it.skip('should map application installed', function(){
        test.maps('app-install');
      });
    });
  });

  describe('track', function(){

    it.skip('should track application installed correctly', function(done){
      var json = test.fixture('app-install');
      test
        .track(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });
  });
});