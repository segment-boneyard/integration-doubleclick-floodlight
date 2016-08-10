'use strict';

/**
 * Module dependencies.
 */

var Track = require('segmentio-facade').Track;
var extend = require('extend');

/**
 * Map identify.
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

exports.identify = function(identify){
  return identify;
};

/**
 * Map group.
 *
 * @param {Group} group
 * @return {Object}
 * @api private
 */

exports.group = function(group){
  return group;
};

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track) {
  return track;
};

/**
 * Map page.
 *
 * @param {Page} page
 * @return {Object}
 * @api private
 */

exports.page = function(page) {
  return page;
};

/**
 * Map screen.
 *
 * @param {Screen} screen
 * @return {Object}
 * @api private
 */

exports.screen = function(screen) {
  return screen;
};


/**
 * Map alias.
 *
 * @param {Alias} alias
 * @return {Object}
 * @api private
 */

exports.alias = function(alias){
  return alias;
};
