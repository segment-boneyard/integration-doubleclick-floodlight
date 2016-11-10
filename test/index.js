var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var sinon = require('sinon');
var Floodlight = require('..');
var mapper = require('../lib/mapper');

describe('DoubleClick Floodlight', function(){
  var settings;
  var floodlight;
  var test;
  var baseEndpoint = 'https://ad.doubleclick.net/ddm/activity/';

  beforeEach(function(){
    settings = {
      source: '654757884637545',
      events: [
        {
          key: 'Application Installed',
          value: {
            event: 'Application Installed',
            cat: 'activityTag',
            type: 'groupTag',
            customVariable: [{
              key: 'version',
              value: 'u1'
            }]
          }
        },
        {
          key: 'Rick and Morty Season 3 is the only hope we have',
          value: {
            event: 'Rick and Morty Season 3 is the only hope we have',
            cat: 'wubbalubbadubdub',
            type: 'noType',
            customVariable: []
          }
        },
        {
          key: 'Rick and Morty Season 3 is the only hope we have',
          value: {
            event: 'Rick and Morty Season 3 is the only hope we have',
            cat: 'showmewhatyougottttt',
            type: 'noType',
            customVariable: []
          }
        }
      ]
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
    before(function(){
      // stubbing the random cachebuster for testing
      // this gets multiplied by 10000000000000000000 so will hardcode ord
      sinon.stub(Math, 'random').returns(0.27005030284556764);
    });

    describe('track', function(){
      it('should map application installed', function(){
        test.maps('app-install', settings);
      });

      it('should not send unmapped events', function(){
        test.maps('unmapped', settings);
      });
    });
  });

  describe('track', function(){
    it('should track application installed correctly', function(done){
      var json = test.fixture('app-install');
      var expectedUrl = baseEndpoint + json.output.endpoints[0];

      test
        .track(json.input)
        .expects(200)
        .set('User-Agent', json.output.userAgent)
        .end(function(err, res){
          if (err) throw err;
          // we don't use query params so making sure the endpoint
          // which includes the payload is correct
          assert.strictEqual(res[0].request.url, expectedUrl);
          done();
        });
    });

    it('should send properties as custom variables', function(done){
      var json = test.fixture('custom-track');
      var expectedUrl = baseEndpoint + json.output.endpoints[0];

      test
        .track(json.input)
        .expects(200)
        .set('User-Agent', json.output.userAgent)
        .end(function(err, res){
          if (err) throw err;
          // we don't use query params so making sure the endpoint
          // which includes the payload is correct
          assert.strictEqual(res[0].request.url, expectedUrl);
          done();
        });
    });

    it('should set copa compliance', function(done){
      var json = test.fixture('app-install-copa');
      var expectedUrl = baseEndpoint + json.output.endpoints[0];

      // set integration option
      json.input.integrations = {
        'DoubleClick Floodlight': {
          copaCompliant: true
        }
      };

      test
        .track(json.input)
        .expects(200)
        .set('User-Agent', json.output.userAgent)
        .end(function(err, res){
          if (err) throw err;
          assert.strictEqual(res[0].request.url, expectedUrl);
          done();
        });
    });

    it('should send multiple requests if multiple tags are mapped for an event', function(){
      var json = test.fixture('multiple-track');
      var expectedUrl1 = baseEndpoint + json.output.endpoints[0];
      var expectedUrl2 = baseEndpoint + json.output.endpoints[1];

      test
        .track(json.input)
        .set('User-Agent', json.output.userAgent)
        .requests(2);

      test
        .request(0)
        .expects(200)
        .end(function(err, res){
          if (err) throw err;
          assert.strictequal(res[0].request.url, expectedurl1);
          done();
        });

      test
        .request(1)
        .expects(200)
        .end(function(err, res){
          if (err) throw err;
          assert.strictequal(res[0].request.url, expectedurl2);
          done();
        });
    });

    it('should not send any requests for unmapped events', function(done){
      var json = test.fixture('app-install');
      json.input.event = 'I love Kanye';

      test
        .track(json.input)
        .requests(0)
        .end(done);
    });
  });
});
