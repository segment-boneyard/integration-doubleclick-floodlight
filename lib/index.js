/**
 * Module dependencies.
 */

var Batch = require('batch');
var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Floodlight`
 */

var Floodlight = module.exports = integration('DoubleClick Floodlight')
  .endpoint('https://ad.doubleclick.net/ddm/activity/')
  .channels(['server'])
  .mapper(mapper)
  .retries(3);

/**
 * Ensure there's an Advertiser Id and Ad Tracking is enabled
 */


Floodlight.ensure(function(msg){
  var device = msg.proxy('context.device') || {};
  if (!device.advertisingId) return this.invalid('All calls must have an Advertising Id.');
  if (!device.adTrackingEnabled) return this.invalid('All calls must have Ad Tracking Enabled.');
  return;
});

/**
 * Track.
 *
 * https://segment.com/docs/spec/track/
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Floodlight.prototype.track = function(track, cb) {
  var self = this;
  
  var body = {
    event: track.event(),
    properties: track.properties(),
    token: this.settings.token
  };

  self
    .post(endpoint)
    .set('User-Agent', 'Segment.io/1.0.0')
    .query(body)
    .end(self.handle(cb));
};
