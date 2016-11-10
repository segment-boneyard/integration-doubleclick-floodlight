/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');
var each = require('@ndhoule/each');
var Batch = require('batch');

/**
 * Expose `Floodlight`
 */

var Floodlight = module.exports = integration('DoubleClick Floodlight')
  .endpoint('https://ad.doubleclick.net/ddm/activity/')
  .channels(['server'])
  .mapper(mapper)
  .ensure('settings.source')
  .retries(3);

/**
 * Ensure there's an Advertiser Id
 */

Floodlight.ensure(function(msg){
  var device = msg.proxy('context.device') || {};
  if (!device.advertisingId) return this.invalid('Mobile data must have an Advertising Id.');
  return;
});

/**
 * Track.
 *
 * https://segment.com/docs/spec/track/
 *
 * @param {Object} ret
 * @param {Function} fn
 * @api private
 */

Floodlight.prototype.track = function(ret, done){
  // If no events were mapped, noop
  if (!ret.endpoints) return done();
  var batch = new Batch;
  var self = this;

  // integration-worker doesn't handle multiple errors so much immediatley invoke callback upon first error
  // Rest of requests in the batch will still send but their responses will be ignored
  batch.throws(true);

  each(function(endpoint){
    batch.push(function(done){
      self
        .get(endpoint)
        .set('User-Agent', ret.userAgent)
        .end(self.handle(done));
    });
  }, ret.endpoints);

  // Flush
  batch.end(done);
};

