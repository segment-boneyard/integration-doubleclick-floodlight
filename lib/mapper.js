'use strict';

/**
 * Module dependencies.
 */

var Track = require('segmentio-facade').Track;
var extend = require('extend');

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track, settings){
  console.log('a',track);
  var device = track.device();
  // var event = this.map(settings.events.key, track.event());
  console.log('hm', event);
  if (!event) return this.invalid("Event must be mapped in Integration Settings.");

  var payload = {
  	// dc_rdid: device.advertisingId
  };

  //dc_rdid
  //src
  //cat
  //type
  //ord
  //u1,u2...
  //tag_for_child_directed_treatment
  //dc_lat
  delete track.obj.timestamp;
  return track.obj;
};
