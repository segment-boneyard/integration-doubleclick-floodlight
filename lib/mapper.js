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
  var userAgent = getUserAgent(track);

  // will only send data for mapped events
  var events = settings.events;
  var eventName = track.event();
  var mappedEvent;

  events.forEach(function(event){
    if (event.key === eventName){
      mappedEvent = event.value;
    }
  });

  if (!mappedEvent) return {};

  // Generate random number as shown by Google in their docs
  // https://support.google.com/dcm/partner/answer/2837459?hl=en&ref_topic=3540316
  var cacheBuster = Math.random() * 10000000000000000000;
  var payload = {
    dc_rdid: device.advertisingId,
    src: settings.source,
    cat: mappedEvent.cat,
    type: mappedEvent.type,
    ord: cacheBuster,
    tag_for_child_directed_treatment: copaCompliant ? 1 : 0,
    dc_lat: adTrackingEnabled ? 1 : 0,
    userAgent: userAgent
  };

  return payload;
};

/**
 * Get userAgent string
 *
 * @param {Track} track
 * @return {String} userAgent
 * @api private
 */

function getUserAgent(track) {
  var ua = '';
  var osName = track.proxy('context.os.name');
  var osVersion = track.proxy('context.os.version');
  var deviceModel = track.proxy('context.device.model');
  var deviceManufacturer = track.proxy('context.device.manufacturer');
  var locale = track.proxy('context.locale');

  // Android library already collects userAgent
  if (track.userAgent()) {
    ua = track.userAgent();
  } else if (osName && osVersion && deviceModel && deviceManufacturer && locale) {
    ua = 'Segment/1.0 (' + osName + '; CPU ' + deviceModel +'; ' + locale + ') ' + deviceManufacturer + '; Version ' + osVersion;
  }

  return ua;
}
