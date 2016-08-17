/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Floodlight`
 */

var Floodlight = module.exports = integration('DoubleClick Floodlight')
  .endpoint('https://ad.doubleclick.net/ddm/activity/')
  .channels(['server'])
  .retries(3);

// Ensure there's an Advertiser Id and Ad Tracking is enabled
Floodlight.ensure(function(msg){
  var device = msg.proxy('context.device') || {};
  if (!device.advertisingId) return this.invalid('All calls must have an Advertising Id.');
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

Floodlight.prototype.track = function(track, done){
  var body = mapper.track(track, this.settings);

  return this
    .get(body)
    .end(this.handle(done));
};
