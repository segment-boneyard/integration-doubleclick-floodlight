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
        // ignoring `ord` since it is randomly generated
        test.maps('app-install', settings, { ignored: 'ord' });
      });

      it('should not send unmapped events', function(){
        test.maps('unmapped', settings);
      });
    });
  });

  describe('track', function(){
    it('should track application installed correctly', function(done){
      var json = test.fixture('app-install');
      var output = json.output;
      // stubbing the random cachebuster for testing
      // this gets multiplied by 10000000000000000000 so will hardcode ord
      sinon.stub(Math, 'random').returns(0.27005030284556764);

      var expectedPath = '/ddm/activity/'
        + 'dc_rdid=' + output.dc_rdid
        + ';src=' + output.src
        + ';cat=' + output.cat
        + ';type=' + output.type
        + ';ord=' + '2700503028455676400' 
        + ';tag_for_child_directed_treatment=' + output.tag_for_child_directed_treatment
        + ';dc_lat=' + output.dc_lat;

      test
        .track(json.input)
        .expects(200)
        .set('User-Agent', output.userAgent)
        .end(function(err, res){
          if (err) throw err;
          // we don't use query params so making sure the endpoint
          // which includes the payload is correct
          assert(res[0].req.path === expectedPath);
          done();
        });
    });

    it('should set copa compliance', function(done) {
      var json = test.fixture('app-install');

      // set integration option
      json.input.integrations = {
        'DoubleClick Floodlight': {
          copaCompliant: true 
        }
      };
      var output = json.output;
      var expectedPath = '/ddm/activity/'
        + 'dc_rdid=' + output.dc_rdid
        + ';src=' + output.src
        + ';cat=' + output.cat
        + ';type=' + output.type
        + ';ord=' + '2700503028455676400' 
        + ';tag_for_child_directed_treatment=1' 
        + ';dc_lat=' + output.dc_lat;

      test
        .track(json.input)
        .expects(200)
        .set('User-Agent', output.userAgent)
        .end(function(err, res){
          if (err) throw err;
          assert(res[0].req.path === expectedPath);
          done();
        });
    });
  });
});
