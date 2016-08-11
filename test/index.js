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
      source: '654757884637545',
      events: [{
        key: 'Application Installed',
        value: {
          cat: 'activityTag',
          type: 'groupTag',
          customVariable: [{
            key: 'version',
            value: 'u1'
          }]

        }
      }]
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
    var settings;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Free El',
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

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){
    describe('track', function(){
      it('should map application installed', function(){
        test.maps('app-install', settings, { ignored: 'ord' });
      });
    });
  });

  describe('track', function(){
    //TODO: How do you test this?
    it.skip('should track application installed correctly', function(done){
      var json = test.fixture('app-install');

      test
        .track(json.input)
        .expects(200)
        .end(done);
    });
  });
});