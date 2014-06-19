/**
 * phant-reaper
 * https://github.com/sparkfun/phant-reaper
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var util = require('util');

/**** app prototype ****/
var app = Reaper.prototype;

/**** Expose Reaper ****/
exports = module.exports = Reaper;

function PhantStream(options) {

  if (! (this instanceof Reaper)) {
    return new Reaper(options);
  }

  util._extend(this, options || {});

}

app.age = 7; // days
app.metadata = false;
app.storage = false;
