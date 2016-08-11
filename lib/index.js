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
  .mapper(mapper)
  .ensure('settings.source')
  .retries(3);

/**
 * Ensure there's an Advertiser Id
 */

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

Floodlight.prototype.track = function(payload, done){
  // FL wants you to send the parameters as an endpoint delimited by semi-colons rather than get query params
  var endpoint = [
   'dc_rdid=' + payload.dc_rdid,
   'src=' + payload.src,
   'cat=' + payload.cat,
   'type=' + payload.type,
   'ord=' + payload.ord,
   'tag_for_child_directed_treatment=' + payload.tag_for_child_directed_treatment,
   'dc_lat=' + payload.dc_lat
  ];

  endpoint = endpoint.join(';');

  return this
    .get(endpoint)
    // Set device user agent
    // .set('User-Agent', )
    .end(this.handle(done));
};
