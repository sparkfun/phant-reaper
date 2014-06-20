/**
 * phant-reaper
 * https://github.com/sparkfun/phant-reaper
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var util = require('util'),
    async = require('async');

/**** app prototype ****/
var app = Reaper.prototype;

/**** Expose Reaper ****/
exports = module.exports = Reaper;

function Reaper(options) {

  if (! (this instanceof Reaper)) {
    return new Reaper(options);
  }

  util._extend(this, options || {});

}

app.age = 7 * 24 * 60 * 60 * 1000; // 7 days
app.metadata = false;
app.storage = false;
app.toDelete = [];
app.offset = 0;

app.reap = function(cb) {

  async.doWhilst(
    this.load.bind(this),
    this.check.bind(this),
    this.delete.bind(this, cb)
  );

};

app.check = function() {

  return this.offset;

};

app.load = function(callback) {

  var self = this;

  this.metadata.all(function(err, streams) {

    var now = new Date();

    if(err || ! streams.length) {
      self.offset = 0;
      return callback('done');
    }

    streams.forEach(function(stream) {

      var last = new Date(stream.last_push),
          created = new Date(stream.date);

      // leave it alone if it was created recently
      if ((now.getTime() - created.getTime()) < self.age) {
        return;
      }

      // leave it alone if it has pushed recently
      if ((now.getTime() - last.getTime()) < self.age) {
        return;
      }

      // stale. delete it
      self.toDelete.push(stream.id);

    });

    self.offset += 100;
    callback();

  }, self.offset, 100);

};

app.delete = function(callback, err) {

  var self = this;

  async.each(this.toDelete, function(id, callback) {

    self.metadata.remove(id, function(err) {

      if(err) {
        return callback(err);
      }

      self.storage.clear(id);
      callback();

    });

  }, function(err) {

    if (err) {
      console.log(err);
    } else {
      console.log('Deleted ' + self.toDelete.length + ' unused streams');
    }

    self.offset = 0;
    self.toDelete = [];

    callback();

  });

};
