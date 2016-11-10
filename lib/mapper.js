'use strict';

/**
 * Module dependencies.
 */

var Track = require('segmentio-facade').Track;
var extend = require('extend');
var each = require('@ndhoule/each');
var foldl = require('@ndhoule/foldl');

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track, settings){
  // will only send data for mapped events
  var tags = settings.events;
  var eventName = track.event();
  var mappedEvents = [];

  each(function(tag){
    if (tag.key === eventName) mappedEvents.push(tag);
  }, tags);

  // Exit if not mapped
  if (!mappedEvents.length) return {};

  var device = track.device();
  var properties = track.properties();
  var adTrackingEnabled = device.adTrackingEnabled;
  var options = track.options('DoubleClick Floodlight');
  var copaCompliant = options.copaCompliant;
  var ret = { 
    userAgent: getUserAgent(track),
    endpoints: []
  };

  var tags = foldl(function(conversions, tag){
    // Required params. These should already be validated at the app level but just in case
    if (!tag.value.event || !tag.value.cat || !tag.value.type) return conversions;

    // Find matching properties if any
    var matchedVariables = {};

    each(function(variable){
      var segmentProp = variable.key;
      var floodlightProp = variable.value;
      var segmentPropValue = properties[segmentProp];

      if (segmentPropValue) matchedVariables[floodlightProp] = segmentPropValue;
    }, tag.value.customVariable);

    var cacheBuster = Math.random() * 10000000000000000000;
    var tagParams = {
      dc_rdid: device.advertisingId,
      src: settings.source,
      type: tag.value.type,
      cat: tag.value.cat,
      ord: cacheBuster,
      tag_for_child_directed_treatment: copaCompliant ? 1 : 0,
      dc_lat: adTrackingEnabled ? 1 : 0,
      customVariables: matchedVariables
    };

    conversions.push(tagParams);

    return conversions;
  }, [], mappedEvents);

  // For each tag, we need to render the GET endpoint with query params
  each(function(tag){
    var endpoint = [
      'dc_rdid=' + tag.dc_rdid,
      'src=' + tag.src,
      'cat=' + tag.cat,
      'type=' + tag.type,
      'ord=' + tag.ord,
      'tag_for_child_directed_treatment=' + tag.tag_for_child_directed_treatment,
      'dc_lat=' + tag.dc_lat
    ].join(';');

    each(function(val, key){
      // Render each matched custom variable
      var param = ';' + key + '=' + val;
      endpoint += param;
    }, tag.customVariables);

    ret.endpoints.push(endpoint);
  }, tags);

  return ret;
};

/**
 * Get userAgent string
 *
 * @param {Track} track
 * @return {String} userAgent
 * @api private
 */

function getUserAgent(track){
  var ua = '';
  var osName = track.proxy('context.os.name');
  var osVersion = track.proxy('context.os.version');
  var deviceModel = track.proxy('context.device.model');
  var deviceManufacturer = track.proxy('context.device.manufacturer');
  var locale = track.proxy('context.locale');

  // Android library already collects userAgent
  if (track.userAgent()){
    ua = track.userAgent();
  } else if (osName && osVersion && deviceModel && deviceManufacturer && locale) {
    ua = 'Segment/1.0 (' + osName + '; CPU ' + deviceModel +'; ' + locale + ') ' + deviceManufacturer + '; Version ' + osVersion;
  }

  return ua;
}
