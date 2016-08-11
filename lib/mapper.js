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
  var device = track.device();
  var adTrackingEnabled = device.adTrackingEnabled;
  var options = track.options('DoubleClick Floodlight');
  var copaCompliant = options.copaCompliant;
  var events = settings.events;
  var eventName = track.event();
  var mappedEvent;

  events.forEach(function(event){
  	if (event.key === eventName){
  		mappedEvent = event.value;
  	}
  });
  // Generate random number as shown by Google in their docs
  // https://support.google.com/dcm/partner/answer/2837459?hl=en&ref_topic=3540316
  var ord = Math.random()*10000000000000000000;
  var payload = {
  	dc_rdid: device.advertisingId,
  	src: settings.source,
  	cat: mappedEvent.cat,
  	type: mappedEvent.type,
  	ord: ord,
  	tag_for_child_directed_treatment: copaCompliant ? 1 : 0,
  	dc_lat: adTrackingEnabled ? 1 : 0
  };

  return payload;
};
