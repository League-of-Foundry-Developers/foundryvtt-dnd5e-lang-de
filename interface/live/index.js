import * as fs from 'fs';
import fs__default, { readdirSync, statSync } from 'fs';
import require$$0$1, { resolve, join, normalize, dirname } from 'path';
import { format as format$1, fileURLToPath } from 'url';
import buffer from 'buffer';
import tty from 'tty';
import util, { types } from 'util';
import require$$2 from 'net';
import zlib from 'zlib';
import http from 'http';
import https from 'https';
import Stream, { pipeline, PassThrough } from 'stream';
import { randomBytes } from 'crypto';
import * as app from './app.js';

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var charset = preferredCharsets;
var preferredCharsets_1 = preferredCharsets;

/**
 * Module variables.
 * @private
 */

var simpleCharsetRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Charset header.
 * @private
 */

function parseAcceptCharset(accept) {
  var accepts = accept.split(',');

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var charset = parseCharset(accepts[i].trim(), i);

    if (charset) {
      accepts[j++] = charset;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a charset from the Accept-Charset header.
 * @private
 */

function parseCharset(str, i) {
  var match = simpleCharsetRegExp.exec(str);
  if (!match) return null;

  var charset = match[1];
  var q = 1;
  if (match[2]) {
    var params = match[2].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    charset: charset,
    q: q,
    i: i
  };
}

/**
 * Get the priority of a charset.
 * @private
 */

function getCharsetPriority(charset, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$3(charset, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the charset.
 * @private
 */

function specify$3(charset, spec, index) {
  var s = 0;
  if(spec.charset.toLowerCase() === charset.toLowerCase()){
    s |= 1;
  } else if (spec.charset !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}

/**
 * Get the preferred charsets from an Accept-Charset header.
 * @public
 */

function preferredCharsets(accept, provided) {
  // RFC 2616 sec 14.2: no header = *
  var accepts = parseAcceptCharset(accept === undefined ? '*' : accept || '');

  if (!provided) {
    // sorted list of all charsets
    return accepts
      .filter(isQuality$3)
      .sort(compareSpecs$3)
      .map(getFullCharset);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getCharsetPriority(type, accepts, index);
  });

  // sorted list of accepted charsets
  return priorities.filter(isQuality$3).sort(compareSpecs$3).map(function getCharset(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$3(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full charset string.
 * @private
 */

function getFullCharset(spec) {
  return spec.charset;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$3(spec) {
  return spec.q > 0;
}
charset.preferredCharsets = preferredCharsets_1;

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var encoding = preferredEncodings;
var preferredEncodings_1 = preferredEncodings;

/**
 * Module variables.
 * @private
 */

var simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Encoding header.
 * @private
 */

function parseAcceptEncoding(accept) {
  var accepts = accept.split(',');
  var hasIdentity = false;
  var minQuality = 1;

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var encoding = parseEncoding(accepts[i].trim(), i);

    if (encoding) {
      accepts[j++] = encoding;
      hasIdentity = hasIdentity || specify$2('identity', encoding);
      minQuality = Math.min(minQuality, encoding.q || 1);
    }
  }

  if (!hasIdentity) {
    /*
     * If identity doesn't explicitly appear in the accept-encoding header,
     * it's added to the list of acceptable encoding with the lowest q
     */
    accepts[j++] = {
      encoding: 'identity',
      q: minQuality,
      i: i
    };
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse an encoding from the Accept-Encoding header.
 * @private
 */

function parseEncoding(str, i) {
  var match = simpleEncodingRegExp.exec(str);
  if (!match) return null;

  var encoding = match[1];
  var q = 1;
  if (match[2]) {
    var params = match[2].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].trim().split('=');
      if (p[0] === 'q') {
        q = parseFloat(p[1]);
        break;
      }
    }
  }

  return {
    encoding: encoding,
    q: q,
    i: i
  };
}

/**
 * Get the priority of an encoding.
 * @private
 */

function getEncodingPriority(encoding, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$2(encoding, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the encoding.
 * @private
 */

function specify$2(encoding, spec, index) {
  var s = 0;
  if(spec.encoding.toLowerCase() === encoding.toLowerCase()){
    s |= 1;
  } else if (spec.encoding !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}
/**
 * Get the preferred encodings from an Accept-Encoding header.
 * @public
 */

function preferredEncodings(accept, provided) {
  var accepts = parseAcceptEncoding(accept || '');

  if (!provided) {
    // sorted list of all encodings
    return accepts
      .filter(isQuality$2)
      .sort(compareSpecs$2)
      .map(getFullEncoding);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getEncodingPriority(type, accepts, index);
  });

  // sorted list of accepted encodings
  return priorities.filter(isQuality$2).sort(compareSpecs$2).map(function getEncoding(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$2(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full encoding string.
 * @private
 */

function getFullEncoding(spec) {
  return spec.encoding;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$2(spec) {
  return spec.q > 0;
}
encoding.preferredEncodings = preferredEncodings_1;

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var language = preferredLanguages;
var preferredLanguages_1 = preferredLanguages;

/**
 * Module variables.
 * @private
 */

var simpleLanguageRegExp = /^\s*([^\s\-;]+)(?:-([^\s;]+))?\s*(?:;(.*))?$/;

/**
 * Parse the Accept-Language header.
 * @private
 */

function parseAcceptLanguage(accept) {
  var accepts = accept.split(',');

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var language = parseLanguage(accepts[i].trim(), i);

    if (language) {
      accepts[j++] = language;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a language from the Accept-Language header.
 * @private
 */

function parseLanguage(str, i) {
  var match = simpleLanguageRegExp.exec(str);
  if (!match) return null;

  var prefix = match[1],
    suffix = match[2],
    full = prefix;

  if (suffix) full += "-" + suffix;

  var q = 1;
  if (match[3]) {
    var params = match[3].split(';');
    for (var j = 0; j < params.length; j++) {
      var p = params[j].split('=');
      if (p[0] === 'q') q = parseFloat(p[1]);
    }
  }

  return {
    prefix: prefix,
    suffix: suffix,
    q: q,
    i: i,
    full: full
  };
}

/**
 * Get the priority of a language.
 * @private
 */

function getLanguagePriority(language, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify$1(language, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the language.
 * @private
 */

function specify$1(language, spec, index) {
  var p = parseLanguage(language);
  if (!p) return null;
  var s = 0;
  if(spec.full.toLowerCase() === p.full.toLowerCase()){
    s |= 4;
  } else if (spec.prefix.toLowerCase() === p.full.toLowerCase()) {
    s |= 2;
  } else if (spec.full.toLowerCase() === p.prefix.toLowerCase()) {
    s |= 1;
  } else if (spec.full !== '*' ) {
    return null
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s
  }
}
/**
 * Get the preferred languages from an Accept-Language header.
 * @public
 */

function preferredLanguages(accept, provided) {
  // RFC 2616 sec 14.4: no header = *
  var accepts = parseAcceptLanguage(accept === undefined ? '*' : accept || '');

  if (!provided) {
    // sorted list of all languages
    return accepts
      .filter(isQuality$1)
      .sort(compareSpecs$1)
      .map(getFullLanguage);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getLanguagePriority(type, accepts, index);
  });

  // sorted list of accepted languages
  return priorities.filter(isQuality$1).sort(compareSpecs$1).map(function getLanguage(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs$1(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full language string.
 * @private
 */

function getFullLanguage(spec) {
  return spec.full;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality$1(spec) {
  return spec.q > 0;
}
language.preferredLanguages = preferredLanguages_1;

/**
 * negotiator
 * Copyright(c) 2012 Isaac Z. Schlueter
 * Copyright(c) 2014 Federico Romero
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var mediaType = preferredMediaTypes;
var preferredMediaTypes_1 = preferredMediaTypes;

/**
 * Module variables.
 * @private
 */

var simpleMediaTypeRegExp = /^\s*([^\s\/;]+)\/([^;\s]+)\s*(?:;(.*))?$/;

/**
 * Parse the Accept header.
 * @private
 */

function parseAccept(accept) {
  var accepts = splitMediaTypes(accept);

  for (var i = 0, j = 0; i < accepts.length; i++) {
    var mediaType = parseMediaType(accepts[i].trim(), i);

    if (mediaType) {
      accepts[j++] = mediaType;
    }
  }

  // trim accepts
  accepts.length = j;

  return accepts;
}

/**
 * Parse a media type from the Accept header.
 * @private
 */

function parseMediaType(str, i) {
  var match = simpleMediaTypeRegExp.exec(str);
  if (!match) return null;

  var params = Object.create(null);
  var q = 1;
  var subtype = match[2];
  var type = match[1];

  if (match[3]) {
    var kvps = splitParameters(match[3]).map(splitKeyValuePair);

    for (var j = 0; j < kvps.length; j++) {
      var pair = kvps[j];
      var key = pair[0].toLowerCase();
      var val = pair[1];

      // get the value, unwrapping quotes
      var value = val && val[0] === '"' && val[val.length - 1] === '"'
        ? val.substr(1, val.length - 2)
        : val;

      if (key === 'q') {
        q = parseFloat(value);
        break;
      }

      // store parameter
      params[key] = value;
    }
  }

  return {
    type: type,
    subtype: subtype,
    params: params,
    q: q,
    i: i
  };
}

/**
 * Get the priority of a media type.
 * @private
 */

function getMediaTypePriority(type, accepted, index) {
  var priority = {o: -1, q: 0, s: 0};

  for (var i = 0; i < accepted.length; i++) {
    var spec = specify(type, accepted[i], index);

    if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
      priority = spec;
    }
  }

  return priority;
}

/**
 * Get the specificity of the media type.
 * @private
 */

function specify(type, spec, index) {
  var p = parseMediaType(type);
  var s = 0;

  if (!p) {
    return null;
  }

  if(spec.type.toLowerCase() == p.type.toLowerCase()) {
    s |= 4;
  } else if(spec.type != '*') {
    return null;
  }

  if(spec.subtype.toLowerCase() == p.subtype.toLowerCase()) {
    s |= 2;
  } else if(spec.subtype != '*') {
    return null;
  }

  var keys = Object.keys(spec.params);
  if (keys.length > 0) {
    if (keys.every(function (k) {
      return spec.params[k] == '*' || (spec.params[k] || '').toLowerCase() == (p.params[k] || '').toLowerCase();
    })) {
      s |= 1;
    } else {
      return null
    }
  }

  return {
    i: index,
    o: spec.i,
    q: spec.q,
    s: s,
  }
}

/**
 * Get the preferred media types from an Accept header.
 * @public
 */

function preferredMediaTypes(accept, provided) {
  // RFC 2616 sec 14.2: no header = */*
  var accepts = parseAccept(accept === undefined ? '*/*' : accept || '');

  if (!provided) {
    // sorted list of all types
    return accepts
      .filter(isQuality)
      .sort(compareSpecs)
      .map(getFullType);
  }

  var priorities = provided.map(function getPriority(type, index) {
    return getMediaTypePriority(type, accepts, index);
  });

  // sorted list of accepted types
  return priorities.filter(isQuality).sort(compareSpecs).map(function getType(priority) {
    return provided[priorities.indexOf(priority)];
  });
}

/**
 * Compare two specs.
 * @private
 */

function compareSpecs(a, b) {
  return (b.q - a.q) || (b.s - a.s) || (a.o - b.o) || (a.i - b.i) || 0;
}

/**
 * Get full type string.
 * @private
 */

function getFullType(spec) {
  return spec.type + '/' + spec.subtype;
}

/**
 * Check if a spec has any quality.
 * @private
 */

function isQuality(spec) {
  return spec.q > 0;
}

/**
 * Count the number of quotes in a string.
 * @private
 */

function quoteCount(string) {
  var count = 0;
  var index = 0;

  while ((index = string.indexOf('"', index)) !== -1) {
    count++;
    index++;
  }

  return count;
}

/**
 * Split a key value pair.
 * @private
 */

function splitKeyValuePair(str) {
  var index = str.indexOf('=');
  var key;
  var val;

  if (index === -1) {
    key = str;
  } else {
    key = str.substr(0, index);
    val = str.substr(index + 1);
  }

  return [key, val];
}

/**
 * Split an Accept header into media types.
 * @private
 */

function splitMediaTypes(accept) {
  var accepts = accept.split(',');

  for (var i = 1, j = 0; i < accepts.length; i++) {
    if (quoteCount(accepts[j]) % 2 == 0) {
      accepts[++j] = accepts[i];
    } else {
      accepts[j] += ',' + accepts[i];
    }
  }

  // trim accepts
  accepts.length = j + 1;

  return accepts;
}

/**
 * Split a string of parameters.
 * @private
 */

function splitParameters(str) {
  var parameters = str.split(';');

  for (var i = 1, j = 0; i < parameters.length; i++) {
    if (quoteCount(parameters[j]) % 2 == 0) {
      parameters[++j] = parameters[i];
    } else {
      parameters[j] += ';' + parameters[i];
    }
  }

  // trim parameters
  parameters.length = j + 1;

  for (var i = 0; i < parameters.length; i++) {
    parameters[i] = parameters[i].trim();
  }

  return parameters;
}
mediaType.preferredMediaTypes = preferredMediaTypes_1;

/*!
 * negotiator
 * Copyright(c) 2012 Federico Romero
 * Copyright(c) 2012-2014 Isaac Z. Schlueter
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Cached loaded submodules.
 * @private
 */

var modules = Object.create(null);

/**
 * Module exports.
 * @public
 */

var negotiator = Negotiator;
var Negotiator_1 = Negotiator;

/**
 * Create a Negotiator instance from a request.
 * @param {object} request
 * @public
 */

function Negotiator(request) {
  if (!(this instanceof Negotiator)) {
    return new Negotiator(request);
  }

  this.request = request;
}

Negotiator.prototype.charset = function charset(available) {
  var set = this.charsets(available);
  return set && set[0];
};

Negotiator.prototype.charsets = function charsets(available) {
  var preferredCharsets = loadModule('charset').preferredCharsets;
  return preferredCharsets(this.request.headers['accept-charset'], available);
};

Negotiator.prototype.encoding = function encoding(available) {
  var set = this.encodings(available);
  return set && set[0];
};

Negotiator.prototype.encodings = function encodings(available) {
  var preferredEncodings = loadModule('encoding').preferredEncodings;
  return preferredEncodings(this.request.headers['accept-encoding'], available);
};

Negotiator.prototype.language = function language(available) {
  var set = this.languages(available);
  return set && set[0];
};

Negotiator.prototype.languages = function languages(available) {
  var preferredLanguages = loadModule('language').preferredLanguages;
  return preferredLanguages(this.request.headers['accept-language'], available);
};

Negotiator.prototype.mediaType = function mediaType(available) {
  var set = this.mediaTypes(available);
  return set && set[0];
};

Negotiator.prototype.mediaTypes = function mediaTypes(available) {
  var preferredMediaTypes = loadModule('mediaType').preferredMediaTypes;
  return preferredMediaTypes(this.request.headers.accept, available);
};

// Backwards compatibility
Negotiator.prototype.preferredCharset = Negotiator.prototype.charset;
Negotiator.prototype.preferredCharsets = Negotiator.prototype.charsets;
Negotiator.prototype.preferredEncoding = Negotiator.prototype.encoding;
Negotiator.prototype.preferredEncodings = Negotiator.prototype.encodings;
Negotiator.prototype.preferredLanguage = Negotiator.prototype.language;
Negotiator.prototype.preferredLanguages = Negotiator.prototype.languages;
Negotiator.prototype.preferredMediaType = Negotiator.prototype.mediaType;
Negotiator.prototype.preferredMediaTypes = Negotiator.prototype.mediaTypes;

/**
 * Load the given module.
 * @private
 */

function loadModule(moduleName) {
  var module = modules[moduleName];

  if (module !== undefined) {
    return module;
  }

  // This uses a switch for static require analysis
  switch (moduleName) {
    case 'charset':
      module = charset;
      break;
    case 'encoding':
      module = encoding;
      break;
    case 'language':
      module = language;
      break;
    case 'mediaType':
      module = mediaType;
      break;
    default:
      throw new Error('Cannot find module \'' + moduleName + '\'');
  }

  // Store to prevent invoking require()
  modules[moduleName] = module;

  return module;
}
negotiator.Negotiator = Negotiator_1;

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var require$$0 = {
	"application/1d-interleaved-parityfec": {
	source: "iana"
},
	"application/3gpdash-qoe-report+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/3gpp-ims+xml": {
	source: "iana",
	compressible: true
},
	"application/a2l": {
	source: "iana"
},
	"application/activemessage": {
	source: "iana"
},
	"application/activity+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-directory+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcost+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcostparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointprop+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointpropparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-error+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamcontrol+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamparams+json": {
	source: "iana",
	compressible: true
},
	"application/aml": {
	source: "iana"
},
	"application/andrew-inset": {
	source: "iana",
	extensions: [
		"ez"
	]
},
	"application/applefile": {
	source: "iana"
},
	"application/applixware": {
	source: "apache",
	extensions: [
		"aw"
	]
},
	"application/atf": {
	source: "iana"
},
	"application/atfx": {
	source: "iana"
},
	"application/atom+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atom"
	]
},
	"application/atomcat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomcat"
	]
},
	"application/atomdeleted+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomdeleted"
	]
},
	"application/atomicmail": {
	source: "iana"
},
	"application/atomsvc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomsvc"
	]
},
	"application/atsc-dwd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dwd"
	]
},
	"application/atsc-dynamic-event-message": {
	source: "iana"
},
	"application/atsc-held+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"held"
	]
},
	"application/atsc-rdt+json": {
	source: "iana",
	compressible: true
},
	"application/atsc-rsat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsat"
	]
},
	"application/atxml": {
	source: "iana"
},
	"application/auth-policy+xml": {
	source: "iana",
	compressible: true
},
	"application/bacnet-xdd+zip": {
	source: "iana",
	compressible: false
},
	"application/batch-smtp": {
	source: "iana"
},
	"application/bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/beep+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/calendar+json": {
	source: "iana",
	compressible: true
},
	"application/calendar+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xcs"
	]
},
	"application/call-completion": {
	source: "iana"
},
	"application/cals-1840": {
	source: "iana"
},
	"application/captive+json": {
	source: "iana",
	compressible: true
},
	"application/cbor": {
	source: "iana"
},
	"application/cbor-seq": {
	source: "iana"
},
	"application/cccex": {
	source: "iana"
},
	"application/ccmp+xml": {
	source: "iana",
	compressible: true
},
	"application/ccxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ccxml"
	]
},
	"application/cdfx+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdfx"
	]
},
	"application/cdmi-capability": {
	source: "iana",
	extensions: [
		"cdmia"
	]
},
	"application/cdmi-container": {
	source: "iana",
	extensions: [
		"cdmic"
	]
},
	"application/cdmi-domain": {
	source: "iana",
	extensions: [
		"cdmid"
	]
},
	"application/cdmi-object": {
	source: "iana",
	extensions: [
		"cdmio"
	]
},
	"application/cdmi-queue": {
	source: "iana",
	extensions: [
		"cdmiq"
	]
},
	"application/cdni": {
	source: "iana"
},
	"application/cea": {
	source: "iana"
},
	"application/cea-2018+xml": {
	source: "iana",
	compressible: true
},
	"application/cellml+xml": {
	source: "iana",
	compressible: true
},
	"application/cfw": {
	source: "iana"
},
	"application/clr": {
	source: "iana"
},
	"application/clue+xml": {
	source: "iana",
	compressible: true
},
	"application/clue_info+xml": {
	source: "iana",
	compressible: true
},
	"application/cms": {
	source: "iana"
},
	"application/cnrp+xml": {
	source: "iana",
	compressible: true
},
	"application/coap-group+json": {
	source: "iana",
	compressible: true
},
	"application/coap-payload": {
	source: "iana"
},
	"application/commonground": {
	source: "iana"
},
	"application/conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/cose": {
	source: "iana"
},
	"application/cose-key": {
	source: "iana"
},
	"application/cose-key-set": {
	source: "iana"
},
	"application/cpl+xml": {
	source: "iana",
	compressible: true
},
	"application/csrattrs": {
	source: "iana"
},
	"application/csta+xml": {
	source: "iana",
	compressible: true
},
	"application/cstadata+xml": {
	source: "iana",
	compressible: true
},
	"application/csvm+json": {
	source: "iana",
	compressible: true
},
	"application/cu-seeme": {
	source: "apache",
	extensions: [
		"cu"
	]
},
	"application/cwt": {
	source: "iana"
},
	"application/cybercash": {
	source: "iana"
},
	"application/dart": {
	compressible: true
},
	"application/dash+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpd"
	]
},
	"application/dashdelta": {
	source: "iana"
},
	"application/davmount+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"davmount"
	]
},
	"application/dca-rft": {
	source: "iana"
},
	"application/dcd": {
	source: "iana"
},
	"application/dec-dx": {
	source: "iana"
},
	"application/dialog-info+xml": {
	source: "iana",
	compressible: true
},
	"application/dicom": {
	source: "iana"
},
	"application/dicom+json": {
	source: "iana",
	compressible: true
},
	"application/dicom+xml": {
	source: "iana",
	compressible: true
},
	"application/dii": {
	source: "iana"
},
	"application/dit": {
	source: "iana"
},
	"application/dns": {
	source: "iana"
},
	"application/dns+json": {
	source: "iana",
	compressible: true
},
	"application/dns-message": {
	source: "iana"
},
	"application/docbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dbk"
	]
},
	"application/dots+cbor": {
	source: "iana"
},
	"application/dskpp+xml": {
	source: "iana",
	compressible: true
},
	"application/dssc+der": {
	source: "iana",
	extensions: [
		"dssc"
	]
},
	"application/dssc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdssc"
	]
},
	"application/dvcs": {
	source: "iana"
},
	"application/ecmascript": {
	source: "iana",
	compressible: true,
	extensions: [
		"es",
		"ecma"
	]
},
	"application/edi-consent": {
	source: "iana"
},
	"application/edi-x12": {
	source: "iana",
	compressible: false
},
	"application/edifact": {
	source: "iana",
	compressible: false
},
	"application/efi": {
	source: "iana"
},
	"application/elm+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/elm+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.cap+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/emergencycalldata.comment+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.control+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.deviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.ecall.msd": {
	source: "iana"
},
	"application/emergencycalldata.providerinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.serviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.subscriberinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.veds+xml": {
	source: "iana",
	compressible: true
},
	"application/emma+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emma"
	]
},
	"application/emotionml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emotionml"
	]
},
	"application/encaprtp": {
	source: "iana"
},
	"application/epp+xml": {
	source: "iana",
	compressible: true
},
	"application/epub+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"epub"
	]
},
	"application/eshop": {
	source: "iana"
},
	"application/exi": {
	source: "iana",
	extensions: [
		"exi"
	]
},
	"application/expect-ct-report+json": {
	source: "iana",
	compressible: true
},
	"application/fastinfoset": {
	source: "iana"
},
	"application/fastsoap": {
	source: "iana"
},
	"application/fdt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fdt"
	]
},
	"application/fhir+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fhir+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fido.trusted-apps+json": {
	compressible: true
},
	"application/fits": {
	source: "iana"
},
	"application/flexfec": {
	source: "iana"
},
	"application/font-sfnt": {
	source: "iana"
},
	"application/font-tdpfr": {
	source: "iana",
	extensions: [
		"pfr"
	]
},
	"application/font-woff": {
	source: "iana",
	compressible: false
},
	"application/framework-attributes+xml": {
	source: "iana",
	compressible: true
},
	"application/geo+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"geojson"
	]
},
	"application/geo+json-seq": {
	source: "iana"
},
	"application/geopackage+sqlite3": {
	source: "iana"
},
	"application/geoxacml+xml": {
	source: "iana",
	compressible: true
},
	"application/gltf-buffer": {
	source: "iana"
},
	"application/gml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"gml"
	]
},
	"application/gpx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"gpx"
	]
},
	"application/gxf": {
	source: "apache",
	extensions: [
		"gxf"
	]
},
	"application/gzip": {
	source: "iana",
	compressible: false,
	extensions: [
		"gz"
	]
},
	"application/h224": {
	source: "iana"
},
	"application/held+xml": {
	source: "iana",
	compressible: true
},
	"application/hjson": {
	extensions: [
		"hjson"
	]
},
	"application/http": {
	source: "iana"
},
	"application/hyperstudio": {
	source: "iana",
	extensions: [
		"stk"
	]
},
	"application/ibe-key-request+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pkg-reply+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pp-data": {
	source: "iana"
},
	"application/iges": {
	source: "iana"
},
	"application/im-iscomposing+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/index": {
	source: "iana"
},
	"application/index.cmd": {
	source: "iana"
},
	"application/index.obj": {
	source: "iana"
},
	"application/index.response": {
	source: "iana"
},
	"application/index.vnd": {
	source: "iana"
},
	"application/inkml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ink",
		"inkml"
	]
},
	"application/iotp": {
	source: "iana"
},
	"application/ipfix": {
	source: "iana",
	extensions: [
		"ipfix"
	]
},
	"application/ipp": {
	source: "iana"
},
	"application/isup": {
	source: "iana"
},
	"application/its+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"its"
	]
},
	"application/java-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"jar",
		"war",
		"ear"
	]
},
	"application/java-serialized-object": {
	source: "apache",
	compressible: false,
	extensions: [
		"ser"
	]
},
	"application/java-vm": {
	source: "apache",
	compressible: false,
	extensions: [
		"class"
	]
},
	"application/javascript": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"js",
		"mjs"
	]
},
	"application/jf2feed+json": {
	source: "iana",
	compressible: true
},
	"application/jose": {
	source: "iana"
},
	"application/jose+json": {
	source: "iana",
	compressible: true
},
	"application/jrd+json": {
	source: "iana",
	compressible: true
},
	"application/jscalendar+json": {
	source: "iana",
	compressible: true
},
	"application/json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"json",
		"map"
	]
},
	"application/json-patch+json": {
	source: "iana",
	compressible: true
},
	"application/json-seq": {
	source: "iana"
},
	"application/json5": {
	extensions: [
		"json5"
	]
},
	"application/jsonml+json": {
	source: "apache",
	compressible: true,
	extensions: [
		"jsonml"
	]
},
	"application/jwk+json": {
	source: "iana",
	compressible: true
},
	"application/jwk-set+json": {
	source: "iana",
	compressible: true
},
	"application/jwt": {
	source: "iana"
},
	"application/kpml-request+xml": {
	source: "iana",
	compressible: true
},
	"application/kpml-response+xml": {
	source: "iana",
	compressible: true
},
	"application/ld+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"jsonld"
	]
},
	"application/lgr+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lgr"
	]
},
	"application/link-format": {
	source: "iana"
},
	"application/load-control+xml": {
	source: "iana",
	compressible: true
},
	"application/lost+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lostxml"
	]
},
	"application/lostsync+xml": {
	source: "iana",
	compressible: true
},
	"application/lpf+zip": {
	source: "iana",
	compressible: false
},
	"application/lxf": {
	source: "iana"
},
	"application/mac-binhex40": {
	source: "iana",
	extensions: [
		"hqx"
	]
},
	"application/mac-compactpro": {
	source: "apache",
	extensions: [
		"cpt"
	]
},
	"application/macwriteii": {
	source: "iana"
},
	"application/mads+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mads"
	]
},
	"application/manifest+json": {
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"webmanifest"
	]
},
	"application/marc": {
	source: "iana",
	extensions: [
		"mrc"
	]
},
	"application/marcxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mrcx"
	]
},
	"application/mathematica": {
	source: "iana",
	extensions: [
		"ma",
		"nb",
		"mb"
	]
},
	"application/mathml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mathml"
	]
},
	"application/mathml-content+xml": {
	source: "iana",
	compressible: true
},
	"application/mathml-presentation+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-associated-procedure-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-deregister+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-envelope+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-protection-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-reception-report+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-schedule+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-user-service-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbox": {
	source: "iana",
	extensions: [
		"mbox"
	]
},
	"application/media-policy-dataset+xml": {
	source: "iana",
	compressible: true
},
	"application/media_control+xml": {
	source: "iana",
	compressible: true
},
	"application/mediaservercontrol+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mscml"
	]
},
	"application/merge-patch+json": {
	source: "iana",
	compressible: true
},
	"application/metalink+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"metalink"
	]
},
	"application/metalink4+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"meta4"
	]
},
	"application/mets+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mets"
	]
},
	"application/mf4": {
	source: "iana"
},
	"application/mikey": {
	source: "iana"
},
	"application/mipc": {
	source: "iana"
},
	"application/mmt-aei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"maei"
	]
},
	"application/mmt-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musd"
	]
},
	"application/mods+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mods"
	]
},
	"application/moss-keys": {
	source: "iana"
},
	"application/moss-signature": {
	source: "iana"
},
	"application/mosskey-data": {
	source: "iana"
},
	"application/mosskey-request": {
	source: "iana"
},
	"application/mp21": {
	source: "iana",
	extensions: [
		"m21",
		"mp21"
	]
},
	"application/mp4": {
	source: "iana",
	extensions: [
		"mp4s",
		"m4p"
	]
},
	"application/mpeg4-generic": {
	source: "iana"
},
	"application/mpeg4-iod": {
	source: "iana"
},
	"application/mpeg4-iod-xmt": {
	source: "iana"
},
	"application/mrb-consumer+xml": {
	source: "iana",
	compressible: true
},
	"application/mrb-publish+xml": {
	source: "iana",
	compressible: true
},
	"application/msc-ivr+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msc-mixer+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msword": {
	source: "iana",
	compressible: false,
	extensions: [
		"doc",
		"dot"
	]
},
	"application/mud+json": {
	source: "iana",
	compressible: true
},
	"application/multipart-core": {
	source: "iana"
},
	"application/mxf": {
	source: "iana",
	extensions: [
		"mxf"
	]
},
	"application/n-quads": {
	source: "iana",
	extensions: [
		"nq"
	]
},
	"application/n-triples": {
	source: "iana",
	extensions: [
		"nt"
	]
},
	"application/nasdata": {
	source: "iana"
},
	"application/news-checkgroups": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-groupinfo": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-transmission": {
	source: "iana"
},
	"application/nlsml+xml": {
	source: "iana",
	compressible: true
},
	"application/node": {
	source: "iana",
	extensions: [
		"cjs"
	]
},
	"application/nss": {
	source: "iana"
},
	"application/ocsp-request": {
	source: "iana"
},
	"application/ocsp-response": {
	source: "iana"
},
	"application/octet-stream": {
	source: "iana",
	compressible: false,
	extensions: [
		"bin",
		"dms",
		"lrf",
		"mar",
		"so",
		"dist",
		"distz",
		"pkg",
		"bpk",
		"dump",
		"elc",
		"deploy",
		"exe",
		"dll",
		"deb",
		"dmg",
		"iso",
		"img",
		"msi",
		"msp",
		"msm",
		"buffer"
	]
},
	"application/oda": {
	source: "iana",
	extensions: [
		"oda"
	]
},
	"application/odm+xml": {
	source: "iana",
	compressible: true
},
	"application/odx": {
	source: "iana"
},
	"application/oebps-package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"opf"
	]
},
	"application/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogx"
	]
},
	"application/omdoc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"omdoc"
	]
},
	"application/onenote": {
	source: "apache",
	extensions: [
		"onetoc",
		"onetoc2",
		"onetmp",
		"onepkg"
	]
},
	"application/opc-nodeset+xml": {
	source: "iana",
	compressible: true
},
	"application/oscore": {
	source: "iana"
},
	"application/oxps": {
	source: "iana",
	extensions: [
		"oxps"
	]
},
	"application/p2p-overlay+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"relo"
	]
},
	"application/parityfec": {
	source: "iana"
},
	"application/passport": {
	source: "iana"
},
	"application/patch-ops-error+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xer"
	]
},
	"application/pdf": {
	source: "iana",
	compressible: false,
	extensions: [
		"pdf"
	]
},
	"application/pdx": {
	source: "iana"
},
	"application/pem-certificate-chain": {
	source: "iana"
},
	"application/pgp-encrypted": {
	source: "iana",
	compressible: false,
	extensions: [
		"pgp"
	]
},
	"application/pgp-keys": {
	source: "iana"
},
	"application/pgp-signature": {
	source: "iana",
	extensions: [
		"asc",
		"sig"
	]
},
	"application/pics-rules": {
	source: "apache",
	extensions: [
		"prf"
	]
},
	"application/pidf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pidf-diff+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pkcs10": {
	source: "iana",
	extensions: [
		"p10"
	]
},
	"application/pkcs12": {
	source: "iana"
},
	"application/pkcs7-mime": {
	source: "iana",
	extensions: [
		"p7m",
		"p7c"
	]
},
	"application/pkcs7-signature": {
	source: "iana",
	extensions: [
		"p7s"
	]
},
	"application/pkcs8": {
	source: "iana",
	extensions: [
		"p8"
	]
},
	"application/pkcs8-encrypted": {
	source: "iana"
},
	"application/pkix-attr-cert": {
	source: "iana",
	extensions: [
		"ac"
	]
},
	"application/pkix-cert": {
	source: "iana",
	extensions: [
		"cer"
	]
},
	"application/pkix-crl": {
	source: "iana",
	extensions: [
		"crl"
	]
},
	"application/pkix-pkipath": {
	source: "iana",
	extensions: [
		"pkipath"
	]
},
	"application/pkixcmp": {
	source: "iana",
	extensions: [
		"pki"
	]
},
	"application/pls+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pls"
	]
},
	"application/poc-settings+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/postscript": {
	source: "iana",
	compressible: true,
	extensions: [
		"ai",
		"eps",
		"ps"
	]
},
	"application/ppsp-tracker+json": {
	source: "iana",
	compressible: true
},
	"application/problem+json": {
	source: "iana",
	compressible: true
},
	"application/problem+xml": {
	source: "iana",
	compressible: true
},
	"application/provenance+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"provx"
	]
},
	"application/prs.alvestrand.titrax-sheet": {
	source: "iana"
},
	"application/prs.cww": {
	source: "iana",
	extensions: [
		"cww"
	]
},
	"application/prs.cyn": {
	source: "iana",
	charset: "7-BIT"
},
	"application/prs.hpub+zip": {
	source: "iana",
	compressible: false
},
	"application/prs.nprend": {
	source: "iana"
},
	"application/prs.plucker": {
	source: "iana"
},
	"application/prs.rdf-xml-crypt": {
	source: "iana"
},
	"application/prs.xsf+xml": {
	source: "iana",
	compressible: true
},
	"application/pskc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pskcxml"
	]
},
	"application/pvd+json": {
	source: "iana",
	compressible: true
},
	"application/qsig": {
	source: "iana"
},
	"application/raml+yaml": {
	compressible: true,
	extensions: [
		"raml"
	]
},
	"application/raptorfec": {
	source: "iana"
},
	"application/rdap+json": {
	source: "iana",
	compressible: true
},
	"application/rdf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rdf",
		"owl"
	]
},
	"application/reginfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rif"
	]
},
	"application/relax-ng-compact-syntax": {
	source: "iana",
	extensions: [
		"rnc"
	]
},
	"application/remote-printing": {
	source: "iana"
},
	"application/reputon+json": {
	source: "iana",
	compressible: true
},
	"application/resource-lists+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rl"
	]
},
	"application/resource-lists-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rld"
	]
},
	"application/rfc+xml": {
	source: "iana",
	compressible: true
},
	"application/riscos": {
	source: "iana"
},
	"application/rlmi+xml": {
	source: "iana",
	compressible: true
},
	"application/rls-services+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rs"
	]
},
	"application/route-apd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rapd"
	]
},
	"application/route-s-tsid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sls"
	]
},
	"application/route-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rusd"
	]
},
	"application/rpki-ghostbusters": {
	source: "iana",
	extensions: [
		"gbr"
	]
},
	"application/rpki-manifest": {
	source: "iana",
	extensions: [
		"mft"
	]
},
	"application/rpki-publication": {
	source: "iana"
},
	"application/rpki-roa": {
	source: "iana",
	extensions: [
		"roa"
	]
},
	"application/rpki-updown": {
	source: "iana"
},
	"application/rsd+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rsd"
	]
},
	"application/rss+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rss"
	]
},
	"application/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"application/rtploopback": {
	source: "iana"
},
	"application/rtx": {
	source: "iana"
},
	"application/samlassertion+xml": {
	source: "iana",
	compressible: true
},
	"application/samlmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/sarif+json": {
	source: "iana",
	compressible: true
},
	"application/sbe": {
	source: "iana"
},
	"application/sbml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sbml"
	]
},
	"application/scaip+xml": {
	source: "iana",
	compressible: true
},
	"application/scim+json": {
	source: "iana",
	compressible: true
},
	"application/scvp-cv-request": {
	source: "iana",
	extensions: [
		"scq"
	]
},
	"application/scvp-cv-response": {
	source: "iana",
	extensions: [
		"scs"
	]
},
	"application/scvp-vp-request": {
	source: "iana",
	extensions: [
		"spq"
	]
},
	"application/scvp-vp-response": {
	source: "iana",
	extensions: [
		"spp"
	]
},
	"application/sdp": {
	source: "iana",
	extensions: [
		"sdp"
	]
},
	"application/secevent+jwt": {
	source: "iana"
},
	"application/senml+cbor": {
	source: "iana"
},
	"application/senml+json": {
	source: "iana",
	compressible: true
},
	"application/senml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"senmlx"
	]
},
	"application/senml-etch+cbor": {
	source: "iana"
},
	"application/senml-etch+json": {
	source: "iana",
	compressible: true
},
	"application/senml-exi": {
	source: "iana"
},
	"application/sensml+cbor": {
	source: "iana"
},
	"application/sensml+json": {
	source: "iana",
	compressible: true
},
	"application/sensml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sensmlx"
	]
},
	"application/sensml-exi": {
	source: "iana"
},
	"application/sep+xml": {
	source: "iana",
	compressible: true
},
	"application/sep-exi": {
	source: "iana"
},
	"application/session-info": {
	source: "iana"
},
	"application/set-payment": {
	source: "iana"
},
	"application/set-payment-initiation": {
	source: "iana",
	extensions: [
		"setpay"
	]
},
	"application/set-registration": {
	source: "iana"
},
	"application/set-registration-initiation": {
	source: "iana",
	extensions: [
		"setreg"
	]
},
	"application/sgml": {
	source: "iana"
},
	"application/sgml-open-catalog": {
	source: "iana"
},
	"application/shf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"shf"
	]
},
	"application/sieve": {
	source: "iana",
	extensions: [
		"siv",
		"sieve"
	]
},
	"application/simple-filter+xml": {
	source: "iana",
	compressible: true
},
	"application/simple-message-summary": {
	source: "iana"
},
	"application/simplesymbolcontainer": {
	source: "iana"
},
	"application/sipc": {
	source: "iana"
},
	"application/slate": {
	source: "iana"
},
	"application/smil": {
	source: "iana"
},
	"application/smil+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"smi",
		"smil"
	]
},
	"application/smpte336m": {
	source: "iana"
},
	"application/soap+fastinfoset": {
	source: "iana"
},
	"application/soap+xml": {
	source: "iana",
	compressible: true
},
	"application/sparql-query": {
	source: "iana",
	extensions: [
		"rq"
	]
},
	"application/sparql-results+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"srx"
	]
},
	"application/spirits-event+xml": {
	source: "iana",
	compressible: true
},
	"application/sql": {
	source: "iana"
},
	"application/srgs": {
	source: "iana",
	extensions: [
		"gram"
	]
},
	"application/srgs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"grxml"
	]
},
	"application/sru+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sru"
	]
},
	"application/ssdl+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ssdl"
	]
},
	"application/ssml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ssml"
	]
},
	"application/stix+json": {
	source: "iana",
	compressible: true
},
	"application/swid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"swidtag"
	]
},
	"application/tamp-apex-update": {
	source: "iana"
},
	"application/tamp-apex-update-confirm": {
	source: "iana"
},
	"application/tamp-community-update": {
	source: "iana"
},
	"application/tamp-community-update-confirm": {
	source: "iana"
},
	"application/tamp-error": {
	source: "iana"
},
	"application/tamp-sequence-adjust": {
	source: "iana"
},
	"application/tamp-sequence-adjust-confirm": {
	source: "iana"
},
	"application/tamp-status-query": {
	source: "iana"
},
	"application/tamp-status-response": {
	source: "iana"
},
	"application/tamp-update": {
	source: "iana"
},
	"application/tamp-update-confirm": {
	source: "iana"
},
	"application/tar": {
	compressible: true
},
	"application/taxii+json": {
	source: "iana",
	compressible: true
},
	"application/td+json": {
	source: "iana",
	compressible: true
},
	"application/tei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tei",
		"teicorpus"
	]
},
	"application/tetra_isi": {
	source: "iana"
},
	"application/thraud+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tfi"
	]
},
	"application/timestamp-query": {
	source: "iana"
},
	"application/timestamp-reply": {
	source: "iana"
},
	"application/timestamped-data": {
	source: "iana",
	extensions: [
		"tsd"
	]
},
	"application/tlsrpt+gzip": {
	source: "iana"
},
	"application/tlsrpt+json": {
	source: "iana",
	compressible: true
},
	"application/tnauthlist": {
	source: "iana"
},
	"application/toml": {
	compressible: true,
	extensions: [
		"toml"
	]
},
	"application/trickle-ice-sdpfrag": {
	source: "iana"
},
	"application/trig": {
	source: "iana"
},
	"application/ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttml"
	]
},
	"application/tve-trigger": {
	source: "iana"
},
	"application/tzif": {
	source: "iana"
},
	"application/tzif-leap": {
	source: "iana"
},
	"application/ubjson": {
	compressible: false,
	extensions: [
		"ubj"
	]
},
	"application/ulpfec": {
	source: "iana"
},
	"application/urc-grpsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/urc-ressheet+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsheet"
	]
},
	"application/urc-targetdesc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"td"
	]
},
	"application/urc-uisocketdesc+xml": {
	source: "iana",
	compressible: true
},
	"application/vcard+json": {
	source: "iana",
	compressible: true
},
	"application/vcard+xml": {
	source: "iana",
	compressible: true
},
	"application/vemmi": {
	source: "iana"
},
	"application/vividence.scriptfile": {
	source: "apache"
},
	"application/vnd.1000minds.decision-model+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"1km"
	]
},
	"application/vnd.3gpp-prose+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3ch+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-v2x-local-service-information": {
	source: "iana"
},
	"application/vnd.3gpp.access-transfer-events+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.bsf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gmop+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.interworking-data": {
	source: "iana"
},
	"application/vnd.3gpp.mc-signalling-ear": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-payload": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-signalling": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-floor-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-signed+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-init-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-transmission-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mid-call+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.pic-bw-large": {
	source: "iana",
	extensions: [
		"plb"
	]
},
	"application/vnd.3gpp.pic-bw-small": {
	source: "iana",
	extensions: [
		"psb"
	]
},
	"application/vnd.3gpp.pic-bw-var": {
	source: "iana",
	extensions: [
		"pvb"
	]
},
	"application/vnd.3gpp.sms": {
	source: "iana"
},
	"application/vnd.3gpp.sms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-ext+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.state-and-event-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ussd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.bcmcsinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.sms": {
	source: "iana"
},
	"application/vnd.3gpp2.tcap": {
	source: "iana",
	extensions: [
		"tcap"
	]
},
	"application/vnd.3lightssoftware.imagescal": {
	source: "iana"
},
	"application/vnd.3m.post-it-notes": {
	source: "iana",
	extensions: [
		"pwn"
	]
},
	"application/vnd.accpac.simply.aso": {
	source: "iana",
	extensions: [
		"aso"
	]
},
	"application/vnd.accpac.simply.imp": {
	source: "iana",
	extensions: [
		"imp"
	]
},
	"application/vnd.acucobol": {
	source: "iana",
	extensions: [
		"acu"
	]
},
	"application/vnd.acucorp": {
	source: "iana",
	extensions: [
		"atc",
		"acutc"
	]
},
	"application/vnd.adobe.air-application-installer-package+zip": {
	source: "apache",
	compressible: false,
	extensions: [
		"air"
	]
},
	"application/vnd.adobe.flash.movie": {
	source: "iana"
},
	"application/vnd.adobe.formscentral.fcdt": {
	source: "iana",
	extensions: [
		"fcdt"
	]
},
	"application/vnd.adobe.fxp": {
	source: "iana",
	extensions: [
		"fxp",
		"fxpl"
	]
},
	"application/vnd.adobe.partial-upload": {
	source: "iana"
},
	"application/vnd.adobe.xdp+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdp"
	]
},
	"application/vnd.adobe.xfdf": {
	source: "iana",
	extensions: [
		"xfdf"
	]
},
	"application/vnd.aether.imp": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata-pagedef": {
	source: "iana"
},
	"application/vnd.afpc.cmoca-cmresource": {
	source: "iana"
},
	"application/vnd.afpc.foca-charset": {
	source: "iana"
},
	"application/vnd.afpc.foca-codedfont": {
	source: "iana"
},
	"application/vnd.afpc.foca-codepage": {
	source: "iana"
},
	"application/vnd.afpc.modca": {
	source: "iana"
},
	"application/vnd.afpc.modca-cmtable": {
	source: "iana"
},
	"application/vnd.afpc.modca-formdef": {
	source: "iana"
},
	"application/vnd.afpc.modca-mediummap": {
	source: "iana"
},
	"application/vnd.afpc.modca-objectcontainer": {
	source: "iana"
},
	"application/vnd.afpc.modca-overlay": {
	source: "iana"
},
	"application/vnd.afpc.modca-pagesegment": {
	source: "iana"
},
	"application/vnd.ah-barcode": {
	source: "iana"
},
	"application/vnd.ahead.space": {
	source: "iana",
	extensions: [
		"ahead"
	]
},
	"application/vnd.airzip.filesecure.azf": {
	source: "iana",
	extensions: [
		"azf"
	]
},
	"application/vnd.airzip.filesecure.azs": {
	source: "iana",
	extensions: [
		"azs"
	]
},
	"application/vnd.amadeus+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.amazon.ebook": {
	source: "apache",
	extensions: [
		"azw"
	]
},
	"application/vnd.amazon.mobi8-ebook": {
	source: "iana"
},
	"application/vnd.americandynamics.acc": {
	source: "iana",
	extensions: [
		"acc"
	]
},
	"application/vnd.amiga.ami": {
	source: "iana",
	extensions: [
		"ami"
	]
},
	"application/vnd.amundsen.maze+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.android.ota": {
	source: "iana"
},
	"application/vnd.android.package-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"apk"
	]
},
	"application/vnd.anki": {
	source: "iana"
},
	"application/vnd.anser-web-certificate-issue-initiation": {
	source: "iana",
	extensions: [
		"cii"
	]
},
	"application/vnd.anser-web-funds-transfer-initiation": {
	source: "apache",
	extensions: [
		"fti"
	]
},
	"application/vnd.antix.game-component": {
	source: "iana",
	extensions: [
		"atx"
	]
},
	"application/vnd.apache.thrift.binary": {
	source: "iana"
},
	"application/vnd.apache.thrift.compact": {
	source: "iana"
},
	"application/vnd.apache.thrift.json": {
	source: "iana"
},
	"application/vnd.api+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.aplextor.warrp+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apothekende.reservation+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apple.installer+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpkg"
	]
},
	"application/vnd.apple.keynote": {
	source: "iana",
	extensions: [
		"key"
	]
},
	"application/vnd.apple.mpegurl": {
	source: "iana",
	extensions: [
		"m3u8"
	]
},
	"application/vnd.apple.numbers": {
	source: "iana",
	extensions: [
		"numbers"
	]
},
	"application/vnd.apple.pages": {
	source: "iana",
	extensions: [
		"pages"
	]
},
	"application/vnd.apple.pkpass": {
	compressible: false,
	extensions: [
		"pkpass"
	]
},
	"application/vnd.arastra.swi": {
	source: "iana"
},
	"application/vnd.aristanetworks.swi": {
	source: "iana",
	extensions: [
		"swi"
	]
},
	"application/vnd.artisan+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.artsquare": {
	source: "iana"
},
	"application/vnd.astraea-software.iota": {
	source: "iana",
	extensions: [
		"iota"
	]
},
	"application/vnd.audiograph": {
	source: "iana",
	extensions: [
		"aep"
	]
},
	"application/vnd.autopackage": {
	source: "iana"
},
	"application/vnd.avalon+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.avistar+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.balsamiq.bmml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmml"
	]
},
	"application/vnd.balsamiq.bmpr": {
	source: "iana"
},
	"application/vnd.banana-accounting": {
	source: "iana"
},
	"application/vnd.bbf.usp.error": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bekitzur-stech+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bint.med-content": {
	source: "iana"
},
	"application/vnd.biopax.rdf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.blink-idb-value-wrapper": {
	source: "iana"
},
	"application/vnd.blueice.multipass": {
	source: "iana",
	extensions: [
		"mpm"
	]
},
	"application/vnd.bluetooth.ep.oob": {
	source: "iana"
},
	"application/vnd.bluetooth.le.oob": {
	source: "iana"
},
	"application/vnd.bmi": {
	source: "iana",
	extensions: [
		"bmi"
	]
},
	"application/vnd.bpf": {
	source: "iana"
},
	"application/vnd.bpf3": {
	source: "iana"
},
	"application/vnd.businessobjects": {
	source: "iana",
	extensions: [
		"rep"
	]
},
	"application/vnd.byu.uapi+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cab-jscript": {
	source: "iana"
},
	"application/vnd.canon-cpdl": {
	source: "iana"
},
	"application/vnd.canon-lips": {
	source: "iana"
},
	"application/vnd.capasystems-pg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cendio.thinlinc.clientconf": {
	source: "iana"
},
	"application/vnd.century-systems.tcp_stream": {
	source: "iana"
},
	"application/vnd.chemdraw+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdxml"
	]
},
	"application/vnd.chess-pgn": {
	source: "iana"
},
	"application/vnd.chipnuts.karaoke-mmd": {
	source: "iana",
	extensions: [
		"mmd"
	]
},
	"application/vnd.ciedi": {
	source: "iana"
},
	"application/vnd.cinderella": {
	source: "iana",
	extensions: [
		"cdy"
	]
},
	"application/vnd.cirpack.isdn-ext": {
	source: "iana"
},
	"application/vnd.citationstyles.style+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"csl"
	]
},
	"application/vnd.claymore": {
	source: "iana",
	extensions: [
		"cla"
	]
},
	"application/vnd.cloanto.rp9": {
	source: "iana",
	extensions: [
		"rp9"
	]
},
	"application/vnd.clonk.c4group": {
	source: "iana",
	extensions: [
		"c4g",
		"c4d",
		"c4f",
		"c4p",
		"c4u"
	]
},
	"application/vnd.cluetrust.cartomobile-config": {
	source: "iana",
	extensions: [
		"c11amc"
	]
},
	"application/vnd.cluetrust.cartomobile-config-pkg": {
	source: "iana",
	extensions: [
		"c11amz"
	]
},
	"application/vnd.coffeescript": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet-template": {
	source: "iana"
},
	"application/vnd.collection+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.doc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.next+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.comicbook+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.comicbook-rar": {
	source: "iana"
},
	"application/vnd.commerce-battelle": {
	source: "iana"
},
	"application/vnd.commonspace": {
	source: "iana",
	extensions: [
		"csp"
	]
},
	"application/vnd.contact.cmsg": {
	source: "iana",
	extensions: [
		"cdbcmsg"
	]
},
	"application/vnd.coreos.ignition+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cosmocaller": {
	source: "iana",
	extensions: [
		"cmc"
	]
},
	"application/vnd.crick.clicker": {
	source: "iana",
	extensions: [
		"clkx"
	]
},
	"application/vnd.crick.clicker.keyboard": {
	source: "iana",
	extensions: [
		"clkk"
	]
},
	"application/vnd.crick.clicker.palette": {
	source: "iana",
	extensions: [
		"clkp"
	]
},
	"application/vnd.crick.clicker.template": {
	source: "iana",
	extensions: [
		"clkt"
	]
},
	"application/vnd.crick.clicker.wordbank": {
	source: "iana",
	extensions: [
		"clkw"
	]
},
	"application/vnd.criticaltools.wbs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wbs"
	]
},
	"application/vnd.cryptii.pipe+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.crypto-shade-file": {
	source: "iana"
},
	"application/vnd.cryptomator.encrypted": {
	source: "iana"
},
	"application/vnd.ctc-posml": {
	source: "iana",
	extensions: [
		"pml"
	]
},
	"application/vnd.ctct.ws+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cups-pdf": {
	source: "iana"
},
	"application/vnd.cups-postscript": {
	source: "iana"
},
	"application/vnd.cups-ppd": {
	source: "iana",
	extensions: [
		"ppd"
	]
},
	"application/vnd.cups-raster": {
	source: "iana"
},
	"application/vnd.cups-raw": {
	source: "iana"
},
	"application/vnd.curl": {
	source: "iana"
},
	"application/vnd.curl.car": {
	source: "apache",
	extensions: [
		"car"
	]
},
	"application/vnd.curl.pcurl": {
	source: "apache",
	extensions: [
		"pcurl"
	]
},
	"application/vnd.cyan.dean.root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cybank": {
	source: "iana"
},
	"application/vnd.cyclonedx+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cyclonedx+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.d2l.coursepackage1p0+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.d3m-dataset": {
	source: "iana"
},
	"application/vnd.d3m-problem": {
	source: "iana"
},
	"application/vnd.dart": {
	source: "iana",
	compressible: true,
	extensions: [
		"dart"
	]
},
	"application/vnd.data-vision.rdz": {
	source: "iana",
	extensions: [
		"rdz"
	]
},
	"application/vnd.datapackage+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dataresource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dbf": {
	source: "iana",
	extensions: [
		"dbf"
	]
},
	"application/vnd.debian.binary-package": {
	source: "iana"
},
	"application/vnd.dece.data": {
	source: "iana",
	extensions: [
		"uvf",
		"uvvf",
		"uvd",
		"uvvd"
	]
},
	"application/vnd.dece.ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uvt",
		"uvvt"
	]
},
	"application/vnd.dece.unspecified": {
	source: "iana",
	extensions: [
		"uvx",
		"uvvx"
	]
},
	"application/vnd.dece.zip": {
	source: "iana",
	extensions: [
		"uvz",
		"uvvz"
	]
},
	"application/vnd.denovo.fcselayout-link": {
	source: "iana",
	extensions: [
		"fe_launch"
	]
},
	"application/vnd.desmume.movie": {
	source: "iana"
},
	"application/vnd.dir-bi.plate-dl-nosuffix": {
	source: "iana"
},
	"application/vnd.dm.delegation+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dna": {
	source: "iana",
	extensions: [
		"dna"
	]
},
	"application/vnd.document+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dolby.mlp": {
	source: "apache",
	extensions: [
		"mlp"
	]
},
	"application/vnd.dolby.mobile.1": {
	source: "iana"
},
	"application/vnd.dolby.mobile.2": {
	source: "iana"
},
	"application/vnd.doremir.scorecloud-binary-document": {
	source: "iana"
},
	"application/vnd.dpgraph": {
	source: "iana",
	extensions: [
		"dpg"
	]
},
	"application/vnd.dreamfactory": {
	source: "iana",
	extensions: [
		"dfac"
	]
},
	"application/vnd.drive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ds-keypoint": {
	source: "apache",
	extensions: [
		"kpxx"
	]
},
	"application/vnd.dtg.local": {
	source: "iana"
},
	"application/vnd.dtg.local.flash": {
	source: "iana"
},
	"application/vnd.dtg.local.html": {
	source: "iana"
},
	"application/vnd.dvb.ait": {
	source: "iana",
	extensions: [
		"ait"
	]
},
	"application/vnd.dvb.dvbisl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.dvbj": {
	source: "iana"
},
	"application/vnd.dvb.esgcontainer": {
	source: "iana"
},
	"application/vnd.dvb.ipdcdftnotifaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess2": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgpdd": {
	source: "iana"
},
	"application/vnd.dvb.ipdcroaming": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-base": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-enhancement": {
	source: "iana"
},
	"application/vnd.dvb.notif-aggregate-root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-container+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-generic+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-msglist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-response+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-init+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.pfr": {
	source: "iana"
},
	"application/vnd.dvb.service": {
	source: "iana",
	extensions: [
		"svc"
	]
},
	"application/vnd.dxr": {
	source: "iana"
},
	"application/vnd.dynageo": {
	source: "iana",
	extensions: [
		"geo"
	]
},
	"application/vnd.dzr": {
	source: "iana"
},
	"application/vnd.easykaraoke.cdgdownload": {
	source: "iana"
},
	"application/vnd.ecdis-update": {
	source: "iana"
},
	"application/vnd.ecip.rlp": {
	source: "iana"
},
	"application/vnd.ecowin.chart": {
	source: "iana",
	extensions: [
		"mag"
	]
},
	"application/vnd.ecowin.filerequest": {
	source: "iana"
},
	"application/vnd.ecowin.fileupdate": {
	source: "iana"
},
	"application/vnd.ecowin.series": {
	source: "iana"
},
	"application/vnd.ecowin.seriesrequest": {
	source: "iana"
},
	"application/vnd.ecowin.seriesupdate": {
	source: "iana"
},
	"application/vnd.efi.img": {
	source: "iana"
},
	"application/vnd.efi.iso": {
	source: "iana"
},
	"application/vnd.emclient.accessrequest+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.enliven": {
	source: "iana",
	extensions: [
		"nml"
	]
},
	"application/vnd.enphase.envoy": {
	source: "iana"
},
	"application/vnd.eprints.data+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.epson.esf": {
	source: "iana",
	extensions: [
		"esf"
	]
},
	"application/vnd.epson.msf": {
	source: "iana",
	extensions: [
		"msf"
	]
},
	"application/vnd.epson.quickanime": {
	source: "iana",
	extensions: [
		"qam"
	]
},
	"application/vnd.epson.salt": {
	source: "iana",
	extensions: [
		"slt"
	]
},
	"application/vnd.epson.ssf": {
	source: "iana",
	extensions: [
		"ssf"
	]
},
	"application/vnd.ericsson.quickcall": {
	source: "iana"
},
	"application/vnd.espass-espass+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.eszigno3+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"es3",
		"et3"
	]
},
	"application/vnd.etsi.aoc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.asic-e+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.asic-s+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.cug+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvcommand+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-bc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-cod+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-npvr+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvservice+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsync+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mcid+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mheg5": {
	source: "iana"
},
	"application/vnd.etsi.overload-control-policy-dataset+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.pstn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.sci+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.simservs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.timestamp-token": {
	source: "iana"
},
	"application/vnd.etsi.tsl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.tsl.der": {
	source: "iana"
},
	"application/vnd.eudora.data": {
	source: "iana"
},
	"application/vnd.evolv.ecig.profile": {
	source: "iana"
},
	"application/vnd.evolv.ecig.settings": {
	source: "iana"
},
	"application/vnd.evolv.ecig.theme": {
	source: "iana"
},
	"application/vnd.exstream-empower+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.exstream-package": {
	source: "iana"
},
	"application/vnd.ezpix-album": {
	source: "iana",
	extensions: [
		"ez2"
	]
},
	"application/vnd.ezpix-package": {
	source: "iana",
	extensions: [
		"ez3"
	]
},
	"application/vnd.f-secure.mobile": {
	source: "iana"
},
	"application/vnd.fastcopy-disk-image": {
	source: "iana"
},
	"application/vnd.fdf": {
	source: "iana",
	extensions: [
		"fdf"
	]
},
	"application/vnd.fdsn.mseed": {
	source: "iana",
	extensions: [
		"mseed"
	]
},
	"application/vnd.fdsn.seed": {
	source: "iana",
	extensions: [
		"seed",
		"dataless"
	]
},
	"application/vnd.ffsns": {
	source: "iana"
},
	"application/vnd.ficlab.flb+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.filmit.zfc": {
	source: "iana"
},
	"application/vnd.fints": {
	source: "iana"
},
	"application/vnd.firemonkeys.cloudcell": {
	source: "iana"
},
	"application/vnd.flographit": {
	source: "iana",
	extensions: [
		"gph"
	]
},
	"application/vnd.fluxtime.clip": {
	source: "iana",
	extensions: [
		"ftc"
	]
},
	"application/vnd.font-fontforge-sfd": {
	source: "iana"
},
	"application/vnd.framemaker": {
	source: "iana",
	extensions: [
		"fm",
		"frame",
		"maker",
		"book"
	]
},
	"application/vnd.frogans.fnc": {
	source: "iana",
	extensions: [
		"fnc"
	]
},
	"application/vnd.frogans.ltf": {
	source: "iana",
	extensions: [
		"ltf"
	]
},
	"application/vnd.fsc.weblaunch": {
	source: "iana",
	extensions: [
		"fsc"
	]
},
	"application/vnd.fujitsu.oasys": {
	source: "iana",
	extensions: [
		"oas"
	]
},
	"application/vnd.fujitsu.oasys2": {
	source: "iana",
	extensions: [
		"oa2"
	]
},
	"application/vnd.fujitsu.oasys3": {
	source: "iana",
	extensions: [
		"oa3"
	]
},
	"application/vnd.fujitsu.oasysgp": {
	source: "iana",
	extensions: [
		"fg5"
	]
},
	"application/vnd.fujitsu.oasysprs": {
	source: "iana",
	extensions: [
		"bh2"
	]
},
	"application/vnd.fujixerox.art-ex": {
	source: "iana"
},
	"application/vnd.fujixerox.art4": {
	source: "iana"
},
	"application/vnd.fujixerox.ddd": {
	source: "iana",
	extensions: [
		"ddd"
	]
},
	"application/vnd.fujixerox.docuworks": {
	source: "iana",
	extensions: [
		"xdw"
	]
},
	"application/vnd.fujixerox.docuworks.binder": {
	source: "iana",
	extensions: [
		"xbd"
	]
},
	"application/vnd.fujixerox.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujixerox.hbpl": {
	source: "iana"
},
	"application/vnd.fut-misnet": {
	source: "iana"
},
	"application/vnd.futoin+cbor": {
	source: "iana"
},
	"application/vnd.futoin+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.fuzzysheet": {
	source: "iana",
	extensions: [
		"fzs"
	]
},
	"application/vnd.genomatix.tuxedo": {
	source: "iana",
	extensions: [
		"txd"
	]
},
	"application/vnd.gentics.grd+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geo+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geocube+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.geogebra.file": {
	source: "iana",
	extensions: [
		"ggb"
	]
},
	"application/vnd.geogebra.slides": {
	source: "iana"
},
	"application/vnd.geogebra.tool": {
	source: "iana",
	extensions: [
		"ggt"
	]
},
	"application/vnd.geometry-explorer": {
	source: "iana",
	extensions: [
		"gex",
		"gre"
	]
},
	"application/vnd.geonext": {
	source: "iana",
	extensions: [
		"gxt"
	]
},
	"application/vnd.geoplan": {
	source: "iana",
	extensions: [
		"g2w"
	]
},
	"application/vnd.geospace": {
	source: "iana",
	extensions: [
		"g3w"
	]
},
	"application/vnd.gerber": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt-response": {
	source: "iana"
},
	"application/vnd.gmx": {
	source: "iana",
	extensions: [
		"gmx"
	]
},
	"application/vnd.google-apps.document": {
	compressible: false,
	extensions: [
		"gdoc"
	]
},
	"application/vnd.google-apps.presentation": {
	compressible: false,
	extensions: [
		"gslides"
	]
},
	"application/vnd.google-apps.spreadsheet": {
	compressible: false,
	extensions: [
		"gsheet"
	]
},
	"application/vnd.google-earth.kml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"kml"
	]
},
	"application/vnd.google-earth.kmz": {
	source: "iana",
	compressible: false,
	extensions: [
		"kmz"
	]
},
	"application/vnd.gov.sk.e-form+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.gov.sk.e-form+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.gov.sk.xmldatacontainer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.grafeq": {
	source: "iana",
	extensions: [
		"gqf",
		"gqs"
	]
},
	"application/vnd.gridmp": {
	source: "iana"
},
	"application/vnd.groove-account": {
	source: "iana",
	extensions: [
		"gac"
	]
},
	"application/vnd.groove-help": {
	source: "iana",
	extensions: [
		"ghf"
	]
},
	"application/vnd.groove-identity-message": {
	source: "iana",
	extensions: [
		"gim"
	]
},
	"application/vnd.groove-injector": {
	source: "iana",
	extensions: [
		"grv"
	]
},
	"application/vnd.groove-tool-message": {
	source: "iana",
	extensions: [
		"gtm"
	]
},
	"application/vnd.groove-tool-template": {
	source: "iana",
	extensions: [
		"tpl"
	]
},
	"application/vnd.groove-vcard": {
	source: "iana",
	extensions: [
		"vcg"
	]
},
	"application/vnd.hal+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hal+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"hal"
	]
},
	"application/vnd.handheld-entertainment+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zmm"
	]
},
	"application/vnd.hbci": {
	source: "iana",
	extensions: [
		"hbci"
	]
},
	"application/vnd.hc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hcl-bireports": {
	source: "iana"
},
	"application/vnd.hdt": {
	source: "iana"
},
	"application/vnd.heroku+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hhe.lesson-player": {
	source: "iana",
	extensions: [
		"les"
	]
},
	"application/vnd.hp-hpgl": {
	source: "iana",
	extensions: [
		"hpgl"
	]
},
	"application/vnd.hp-hpid": {
	source: "iana",
	extensions: [
		"hpid"
	]
},
	"application/vnd.hp-hps": {
	source: "iana",
	extensions: [
		"hps"
	]
},
	"application/vnd.hp-jlyt": {
	source: "iana",
	extensions: [
		"jlt"
	]
},
	"application/vnd.hp-pcl": {
	source: "iana",
	extensions: [
		"pcl"
	]
},
	"application/vnd.hp-pclxl": {
	source: "iana",
	extensions: [
		"pclxl"
	]
},
	"application/vnd.httphone": {
	source: "iana"
},
	"application/vnd.hydrostatix.sof-data": {
	source: "iana",
	extensions: [
		"sfd-hdstx"
	]
},
	"application/vnd.hyper+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyper-item+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyperdrive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hzn-3d-crossword": {
	source: "iana"
},
	"application/vnd.ibm.afplinedata": {
	source: "iana"
},
	"application/vnd.ibm.electronic-media": {
	source: "iana"
},
	"application/vnd.ibm.minipay": {
	source: "iana",
	extensions: [
		"mpy"
	]
},
	"application/vnd.ibm.modcap": {
	source: "iana",
	extensions: [
		"afp",
		"listafp",
		"list3820"
	]
},
	"application/vnd.ibm.rights-management": {
	source: "iana",
	extensions: [
		"irm"
	]
},
	"application/vnd.ibm.secure-container": {
	source: "iana",
	extensions: [
		"sc"
	]
},
	"application/vnd.iccprofile": {
	source: "iana",
	extensions: [
		"icc",
		"icm"
	]
},
	"application/vnd.ieee.1905": {
	source: "iana"
},
	"application/vnd.igloader": {
	source: "iana",
	extensions: [
		"igl"
	]
},
	"application/vnd.imagemeter.folder+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.imagemeter.image+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.immervision-ivp": {
	source: "iana",
	extensions: [
		"ivp"
	]
},
	"application/vnd.immervision-ivu": {
	source: "iana",
	extensions: [
		"ivu"
	]
},
	"application/vnd.ims.imsccv1p1": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p2": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p3": {
	source: "iana"
},
	"application/vnd.ims.lis.v2.result+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy.id+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings.simple+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.informedcontrol.rms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.informix-visionary": {
	source: "iana"
},
	"application/vnd.infotech.project": {
	source: "iana"
},
	"application/vnd.infotech.project+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.innopath.wamp.notification": {
	source: "iana"
},
	"application/vnd.insors.igm": {
	source: "iana",
	extensions: [
		"igm"
	]
},
	"application/vnd.intercon.formnet": {
	source: "iana",
	extensions: [
		"xpw",
		"xpx"
	]
},
	"application/vnd.intergeo": {
	source: "iana",
	extensions: [
		"i2g"
	]
},
	"application/vnd.intertrust.digibox": {
	source: "iana"
},
	"application/vnd.intertrust.nncp": {
	source: "iana"
},
	"application/vnd.intu.qbo": {
	source: "iana",
	extensions: [
		"qbo"
	]
},
	"application/vnd.intu.qfx": {
	source: "iana",
	extensions: [
		"qfx"
	]
},
	"application/vnd.iptc.g2.catalogitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.conceptitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.knowledgeitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.packageitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.planningitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ipunplugged.rcprofile": {
	source: "iana",
	extensions: [
		"rcprofile"
	]
},
	"application/vnd.irepository.package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"irp"
	]
},
	"application/vnd.is-xpr": {
	source: "iana",
	extensions: [
		"xpr"
	]
},
	"application/vnd.isac.fcs": {
	source: "iana",
	extensions: [
		"fcs"
	]
},
	"application/vnd.iso11783-10+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.jam": {
	source: "iana",
	extensions: [
		"jam"
	]
},
	"application/vnd.japannet-directory-service": {
	source: "iana"
},
	"application/vnd.japannet-jpnstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-payment-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-registration": {
	source: "iana"
},
	"application/vnd.japannet-registration-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-setstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-verification": {
	source: "iana"
},
	"application/vnd.japannet-verification-wakeup": {
	source: "iana"
},
	"application/vnd.jcp.javame.midlet-rms": {
	source: "iana",
	extensions: [
		"rms"
	]
},
	"application/vnd.jisp": {
	source: "iana",
	extensions: [
		"jisp"
	]
},
	"application/vnd.joost.joda-archive": {
	source: "iana",
	extensions: [
		"joda"
	]
},
	"application/vnd.jsk.isdn-ngn": {
	source: "iana"
},
	"application/vnd.kahootz": {
	source: "iana",
	extensions: [
		"ktz",
		"ktr"
	]
},
	"application/vnd.kde.karbon": {
	source: "iana",
	extensions: [
		"karbon"
	]
},
	"application/vnd.kde.kchart": {
	source: "iana",
	extensions: [
		"chrt"
	]
},
	"application/vnd.kde.kformula": {
	source: "iana",
	extensions: [
		"kfo"
	]
},
	"application/vnd.kde.kivio": {
	source: "iana",
	extensions: [
		"flw"
	]
},
	"application/vnd.kde.kontour": {
	source: "iana",
	extensions: [
		"kon"
	]
},
	"application/vnd.kde.kpresenter": {
	source: "iana",
	extensions: [
		"kpr",
		"kpt"
	]
},
	"application/vnd.kde.kspread": {
	source: "iana",
	extensions: [
		"ksp"
	]
},
	"application/vnd.kde.kword": {
	source: "iana",
	extensions: [
		"kwd",
		"kwt"
	]
},
	"application/vnd.kenameaapp": {
	source: "iana",
	extensions: [
		"htke"
	]
},
	"application/vnd.kidspiration": {
	source: "iana",
	extensions: [
		"kia"
	]
},
	"application/vnd.kinar": {
	source: "iana",
	extensions: [
		"kne",
		"knp"
	]
},
	"application/vnd.koan": {
	source: "iana",
	extensions: [
		"skp",
		"skd",
		"skt",
		"skm"
	]
},
	"application/vnd.kodak-descriptor": {
	source: "iana",
	extensions: [
		"sse"
	]
},
	"application/vnd.las": {
	source: "iana"
},
	"application/vnd.las.las+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.las.las+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lasxml"
	]
},
	"application/vnd.laszip": {
	source: "iana"
},
	"application/vnd.leap+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.liberty-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.llamagraphics.life-balance.desktop": {
	source: "iana",
	extensions: [
		"lbd"
	]
},
	"application/vnd.llamagraphics.life-balance.exchange+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lbe"
	]
},
	"application/vnd.logipipe.circuit+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.loom": {
	source: "iana"
},
	"application/vnd.lotus-1-2-3": {
	source: "iana",
	extensions: [
		"123"
	]
},
	"application/vnd.lotus-approach": {
	source: "iana",
	extensions: [
		"apr"
	]
},
	"application/vnd.lotus-freelance": {
	source: "iana",
	extensions: [
		"pre"
	]
},
	"application/vnd.lotus-notes": {
	source: "iana",
	extensions: [
		"nsf"
	]
},
	"application/vnd.lotus-organizer": {
	source: "iana",
	extensions: [
		"org"
	]
},
	"application/vnd.lotus-screencam": {
	source: "iana",
	extensions: [
		"scm"
	]
},
	"application/vnd.lotus-wordpro": {
	source: "iana",
	extensions: [
		"lwp"
	]
},
	"application/vnd.macports.portpkg": {
	source: "iana",
	extensions: [
		"portpkg"
	]
},
	"application/vnd.mapbox-vector-tile": {
	source: "iana"
},
	"application/vnd.marlin.drm.actiontoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.conftoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.license+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.mdcf": {
	source: "iana"
},
	"application/vnd.mason+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.maxmind.maxmind-db": {
	source: "iana"
},
	"application/vnd.mcd": {
	source: "iana",
	extensions: [
		"mcd"
	]
},
	"application/vnd.medcalcdata": {
	source: "iana",
	extensions: [
		"mc1"
	]
},
	"application/vnd.mediastation.cdkey": {
	source: "iana",
	extensions: [
		"cdkey"
	]
},
	"application/vnd.meridian-slingshot": {
	source: "iana"
},
	"application/vnd.mfer": {
	source: "iana",
	extensions: [
		"mwf"
	]
},
	"application/vnd.mfmp": {
	source: "iana",
	extensions: [
		"mfm"
	]
},
	"application/vnd.micro+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.micrografx.flo": {
	source: "iana",
	extensions: [
		"flo"
	]
},
	"application/vnd.micrografx.igx": {
	source: "iana",
	extensions: [
		"igx"
	]
},
	"application/vnd.microsoft.portable-executable": {
	source: "iana"
},
	"application/vnd.microsoft.windows.thumbnail-cache": {
	source: "iana"
},
	"application/vnd.miele+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.mif": {
	source: "iana",
	extensions: [
		"mif"
	]
},
	"application/vnd.minisoft-hp3000-save": {
	source: "iana"
},
	"application/vnd.mitsubishi.misty-guard.trustweb": {
	source: "iana"
},
	"application/vnd.mobius.daf": {
	source: "iana",
	extensions: [
		"daf"
	]
},
	"application/vnd.mobius.dis": {
	source: "iana",
	extensions: [
		"dis"
	]
},
	"application/vnd.mobius.mbk": {
	source: "iana",
	extensions: [
		"mbk"
	]
},
	"application/vnd.mobius.mqy": {
	source: "iana",
	extensions: [
		"mqy"
	]
},
	"application/vnd.mobius.msl": {
	source: "iana",
	extensions: [
		"msl"
	]
},
	"application/vnd.mobius.plc": {
	source: "iana",
	extensions: [
		"plc"
	]
},
	"application/vnd.mobius.txf": {
	source: "iana",
	extensions: [
		"txf"
	]
},
	"application/vnd.mophun.application": {
	source: "iana",
	extensions: [
		"mpn"
	]
},
	"application/vnd.mophun.certificate": {
	source: "iana",
	extensions: [
		"mpc"
	]
},
	"application/vnd.motorola.flexsuite": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.adsi": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.fis": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.gotap": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.kmr": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.ttc": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.wem": {
	source: "iana"
},
	"application/vnd.motorola.iprm": {
	source: "iana"
},
	"application/vnd.mozilla.xul+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xul"
	]
},
	"application/vnd.ms-3mfdocument": {
	source: "iana"
},
	"application/vnd.ms-artgalry": {
	source: "iana",
	extensions: [
		"cil"
	]
},
	"application/vnd.ms-asf": {
	source: "iana"
},
	"application/vnd.ms-cab-compressed": {
	source: "iana",
	extensions: [
		"cab"
	]
},
	"application/vnd.ms-color.iccprofile": {
	source: "apache"
},
	"application/vnd.ms-excel": {
	source: "iana",
	compressible: false,
	extensions: [
		"xls",
		"xlm",
		"xla",
		"xlc",
		"xlt",
		"xlw"
	]
},
	"application/vnd.ms-excel.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlam"
	]
},
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsb"
	]
},
	"application/vnd.ms-excel.sheet.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsm"
	]
},
	"application/vnd.ms-excel.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"xltm"
	]
},
	"application/vnd.ms-fontobject": {
	source: "iana",
	compressible: true,
	extensions: [
		"eot"
	]
},
	"application/vnd.ms-htmlhelp": {
	source: "iana",
	extensions: [
		"chm"
	]
},
	"application/vnd.ms-ims": {
	source: "iana",
	extensions: [
		"ims"
	]
},
	"application/vnd.ms-lrm": {
	source: "iana",
	extensions: [
		"lrm"
	]
},
	"application/vnd.ms-office.activex+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-officetheme": {
	source: "iana",
	extensions: [
		"thmx"
	]
},
	"application/vnd.ms-opentype": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-outlook": {
	compressible: false,
	extensions: [
		"msg"
	]
},
	"application/vnd.ms-package.obfuscated-opentype": {
	source: "apache"
},
	"application/vnd.ms-pki.seccat": {
	source: "apache",
	extensions: [
		"cat"
	]
},
	"application/vnd.ms-pki.stl": {
	source: "apache",
	extensions: [
		"stl"
	]
},
	"application/vnd.ms-playready.initiator+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-powerpoint": {
	source: "iana",
	compressible: false,
	extensions: [
		"ppt",
		"pps",
		"pot"
	]
},
	"application/vnd.ms-powerpoint.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppam"
	]
},
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
	source: "iana",
	extensions: [
		"pptm"
	]
},
	"application/vnd.ms-powerpoint.slide.macroenabled.12": {
	source: "iana",
	extensions: [
		"sldm"
	]
},
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppsm"
	]
},
	"application/vnd.ms-powerpoint.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"potm"
	]
},
	"application/vnd.ms-printdevicecapabilities+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-printing.printticket+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-printschematicket+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-project": {
	source: "iana",
	extensions: [
		"mpp",
		"mpt"
	]
},
	"application/vnd.ms-tnef": {
	source: "iana"
},
	"application/vnd.ms-windows.devicepairing": {
	source: "iana"
},
	"application/vnd.ms-windows.nwprinting.oob": {
	source: "iana"
},
	"application/vnd.ms-windows.printerpairing": {
	source: "iana"
},
	"application/vnd.ms-windows.wsd.oob": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-resp": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-resp": {
	source: "iana"
},
	"application/vnd.ms-word.document.macroenabled.12": {
	source: "iana",
	extensions: [
		"docm"
	]
},
	"application/vnd.ms-word.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"dotm"
	]
},
	"application/vnd.ms-works": {
	source: "iana",
	extensions: [
		"wps",
		"wks",
		"wcm",
		"wdb"
	]
},
	"application/vnd.ms-wpl": {
	source: "iana",
	extensions: [
		"wpl"
	]
},
	"application/vnd.ms-xpsdocument": {
	source: "iana",
	compressible: false,
	extensions: [
		"xps"
	]
},
	"application/vnd.msa-disk-image": {
	source: "iana"
},
	"application/vnd.mseq": {
	source: "iana",
	extensions: [
		"mseq"
	]
},
	"application/vnd.msign": {
	source: "iana"
},
	"application/vnd.multiad.creator": {
	source: "iana"
},
	"application/vnd.multiad.creator.cif": {
	source: "iana"
},
	"application/vnd.music-niff": {
	source: "iana"
},
	"application/vnd.musician": {
	source: "iana",
	extensions: [
		"mus"
	]
},
	"application/vnd.muvee.style": {
	source: "iana",
	extensions: [
		"msty"
	]
},
	"application/vnd.mynfc": {
	source: "iana",
	extensions: [
		"taglet"
	]
},
	"application/vnd.ncd.control": {
	source: "iana"
},
	"application/vnd.ncd.reference": {
	source: "iana"
},
	"application/vnd.nearst.inv+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nebumind.line": {
	source: "iana"
},
	"application/vnd.nervana": {
	source: "iana"
},
	"application/vnd.netfpx": {
	source: "iana"
},
	"application/vnd.neurolanguage.nlu": {
	source: "iana",
	extensions: [
		"nlu"
	]
},
	"application/vnd.nimn": {
	source: "iana"
},
	"application/vnd.nintendo.nitro.rom": {
	source: "iana"
},
	"application/vnd.nintendo.snes.rom": {
	source: "iana"
},
	"application/vnd.nitf": {
	source: "iana",
	extensions: [
		"ntf",
		"nitf"
	]
},
	"application/vnd.noblenet-directory": {
	source: "iana",
	extensions: [
		"nnd"
	]
},
	"application/vnd.noblenet-sealer": {
	source: "iana",
	extensions: [
		"nns"
	]
},
	"application/vnd.noblenet-web": {
	source: "iana",
	extensions: [
		"nnw"
	]
},
	"application/vnd.nokia.catalogs": {
	source: "iana"
},
	"application/vnd.nokia.conml+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.conml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.iptv.config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.isds-radio-presets": {
	source: "iana"
},
	"application/vnd.nokia.landmark+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.landmark+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.landmarkcollection+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.n-gage.ac+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ac"
	]
},
	"application/vnd.nokia.n-gage.data": {
	source: "iana",
	extensions: [
		"ngdat"
	]
},
	"application/vnd.nokia.n-gage.symbian.install": {
	source: "iana",
	extensions: [
		"n-gage"
	]
},
	"application/vnd.nokia.ncd": {
	source: "iana"
},
	"application/vnd.nokia.pcd+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.pcd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.radio-preset": {
	source: "iana",
	extensions: [
		"rpst"
	]
},
	"application/vnd.nokia.radio-presets": {
	source: "iana",
	extensions: [
		"rpss"
	]
},
	"application/vnd.novadigm.edm": {
	source: "iana",
	extensions: [
		"edm"
	]
},
	"application/vnd.novadigm.edx": {
	source: "iana",
	extensions: [
		"edx"
	]
},
	"application/vnd.novadigm.ext": {
	source: "iana",
	extensions: [
		"ext"
	]
},
	"application/vnd.ntt-local.content-share": {
	source: "iana"
},
	"application/vnd.ntt-local.file-transfer": {
	source: "iana"
},
	"application/vnd.ntt-local.ogw_remote-access": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_remote": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_tcp_stream": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.chart": {
	source: "iana",
	extensions: [
		"odc"
	]
},
	"application/vnd.oasis.opendocument.chart-template": {
	source: "iana",
	extensions: [
		"otc"
	]
},
	"application/vnd.oasis.opendocument.database": {
	source: "iana",
	extensions: [
		"odb"
	]
},
	"application/vnd.oasis.opendocument.formula": {
	source: "iana",
	extensions: [
		"odf"
	]
},
	"application/vnd.oasis.opendocument.formula-template": {
	source: "iana",
	extensions: [
		"odft"
	]
},
	"application/vnd.oasis.opendocument.graphics": {
	source: "iana",
	compressible: false,
	extensions: [
		"odg"
	]
},
	"application/vnd.oasis.opendocument.graphics-template": {
	source: "iana",
	extensions: [
		"otg"
	]
},
	"application/vnd.oasis.opendocument.image": {
	source: "iana",
	extensions: [
		"odi"
	]
},
	"application/vnd.oasis.opendocument.image-template": {
	source: "iana",
	extensions: [
		"oti"
	]
},
	"application/vnd.oasis.opendocument.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"odp"
	]
},
	"application/vnd.oasis.opendocument.presentation-template": {
	source: "iana",
	extensions: [
		"otp"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"ods"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet-template": {
	source: "iana",
	extensions: [
		"ots"
	]
},
	"application/vnd.oasis.opendocument.text": {
	source: "iana",
	compressible: false,
	extensions: [
		"odt"
	]
},
	"application/vnd.oasis.opendocument.text-master": {
	source: "iana",
	extensions: [
		"odm"
	]
},
	"application/vnd.oasis.opendocument.text-template": {
	source: "iana",
	extensions: [
		"ott"
	]
},
	"application/vnd.oasis.opendocument.text-web": {
	source: "iana",
	extensions: [
		"oth"
	]
},
	"application/vnd.obn": {
	source: "iana"
},
	"application/vnd.ocf+cbor": {
	source: "iana"
},
	"application/vnd.oci.image.manifest.v1+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oftn.l10n+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessdownload+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessstreaming+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.cspg-hexbinary": {
	source: "iana"
},
	"application/vnd.oipf.dae.svg+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.dae.xhtml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.mippvcontrolmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.pae.gem": {
	source: "iana"
},
	"application/vnd.oipf.spdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.spdlist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.ueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.userprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.olpc-sugar": {
	source: "iana",
	extensions: [
		"xo"
	]
},
	"application/vnd.oma-scws-config": {
	source: "iana"
},
	"application/vnd.oma-scws-http-request": {
	source: "iana"
},
	"application/vnd.oma-scws-http-response": {
	source: "iana"
},
	"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.drm-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.imd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.ltkm": {
	source: "iana"
},
	"application/vnd.oma.bcast.notification+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.provisioningtrigger": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgboot": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgdd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sgdu": {
	source: "iana"
},
	"application/vnd.oma.bcast.simple-symbol-container": {
	source: "iana"
},
	"application/vnd.oma.bcast.smartcard-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sprov+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.stkm": {
	source: "iana"
},
	"application/vnd.oma.cab-address-book+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-feature-handler+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-pcc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-subs-invite+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-user-prefs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.dcd": {
	source: "iana"
},
	"application/vnd.oma.dcdc": {
	source: "iana"
},
	"application/vnd.oma.dd2+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dd2"
	]
},
	"application/vnd.oma.drm.risd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.group-usage-list+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+cbor": {
	source: "iana"
},
	"application/vnd.oma.lwm2m+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+tlv": {
	source: "iana"
},
	"application/vnd.oma.pal+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.detailed-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.final-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.groups+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.invocation-descriptor+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.optimized-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.push": {
	source: "iana"
},
	"application/vnd.oma.scidm.messages+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.xcap-directory+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.omads-email+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-file+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-folder+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omaloc-supl-init": {
	source: "iana"
},
	"application/vnd.onepager": {
	source: "iana"
},
	"application/vnd.onepagertamp": {
	source: "iana"
},
	"application/vnd.onepagertamx": {
	source: "iana"
},
	"application/vnd.onepagertat": {
	source: "iana"
},
	"application/vnd.onepagertatp": {
	source: "iana"
},
	"application/vnd.onepagertatx": {
	source: "iana"
},
	"application/vnd.openblox.game+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"obgx"
	]
},
	"application/vnd.openblox.game-binary": {
	source: "iana"
},
	"application/vnd.openeye.oeb": {
	source: "iana"
},
	"application/vnd.openofficeorg.extension": {
	source: "apache",
	extensions: [
		"oxt"
	]
},
	"application/vnd.openstreetmap.data+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osm"
	]
},
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawing+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"pptx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide": {
	source: "iana",
	extensions: [
		"sldx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
	source: "iana",
	extensions: [
		"ppsx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.template": {
	source: "iana",
	extensions: [
		"potx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"xlsx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
	source: "iana",
	extensions: [
		"xltx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.theme+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.vmldrawing": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
	source: "iana",
	compressible: false,
	extensions: [
		"docx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
	source: "iana",
	extensions: [
		"dotx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.core-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.relationships+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oracle.resource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.orange.indata": {
	source: "iana"
},
	"application/vnd.osa.netdeploy": {
	source: "iana"
},
	"application/vnd.osgeo.mapguide.package": {
	source: "iana",
	extensions: [
		"mgp"
	]
},
	"application/vnd.osgi.bundle": {
	source: "iana"
},
	"application/vnd.osgi.dp": {
	source: "iana",
	extensions: [
		"dp"
	]
},
	"application/vnd.osgi.subsystem": {
	source: "iana",
	extensions: [
		"esa"
	]
},
	"application/vnd.otps.ct-kip+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oxli.countgraph": {
	source: "iana"
},
	"application/vnd.pagerduty+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.palm": {
	source: "iana",
	extensions: [
		"pdb",
		"pqa",
		"oprc"
	]
},
	"application/vnd.panoply": {
	source: "iana"
},
	"application/vnd.paos.xml": {
	source: "iana"
},
	"application/vnd.patentdive": {
	source: "iana"
},
	"application/vnd.patientecommsdoc": {
	source: "iana"
},
	"application/vnd.pawaafile": {
	source: "iana",
	extensions: [
		"paw"
	]
},
	"application/vnd.pcos": {
	source: "iana"
},
	"application/vnd.pg.format": {
	source: "iana",
	extensions: [
		"str"
	]
},
	"application/vnd.pg.osasli": {
	source: "iana",
	extensions: [
		"ei6"
	]
},
	"application/vnd.piaccess.application-licence": {
	source: "iana"
},
	"application/vnd.picsel": {
	source: "iana",
	extensions: [
		"efif"
	]
},
	"application/vnd.pmi.widget": {
	source: "iana",
	extensions: [
		"wg"
	]
},
	"application/vnd.poc.group-advertisement+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.pocketlearn": {
	source: "iana",
	extensions: [
		"plf"
	]
},
	"application/vnd.powerbuilder6": {
	source: "iana",
	extensions: [
		"pbd"
	]
},
	"application/vnd.powerbuilder6-s": {
	source: "iana"
},
	"application/vnd.powerbuilder7": {
	source: "iana"
},
	"application/vnd.powerbuilder7-s": {
	source: "iana"
},
	"application/vnd.powerbuilder75": {
	source: "iana"
},
	"application/vnd.powerbuilder75-s": {
	source: "iana"
},
	"application/vnd.preminet": {
	source: "iana"
},
	"application/vnd.previewsystems.box": {
	source: "iana",
	extensions: [
		"box"
	]
},
	"application/vnd.proteus.magazine": {
	source: "iana",
	extensions: [
		"mgz"
	]
},
	"application/vnd.psfs": {
	source: "iana"
},
	"application/vnd.publishare-delta-tree": {
	source: "iana",
	extensions: [
		"qps"
	]
},
	"application/vnd.pvi.ptid1": {
	source: "iana",
	extensions: [
		"ptid"
	]
},
	"application/vnd.pwg-multiplexed": {
	source: "iana"
},
	"application/vnd.pwg-xhtml-print+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.qualcomm.brew-app-res": {
	source: "iana"
},
	"application/vnd.quarantainenet": {
	source: "iana"
},
	"application/vnd.quark.quarkxpress": {
	source: "iana",
	extensions: [
		"qxd",
		"qxt",
		"qwd",
		"qwt",
		"qxl",
		"qxb"
	]
},
	"application/vnd.quobject-quoxdocument": {
	source: "iana"
},
	"application/vnd.radisys.moml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-stream+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-base+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-detect+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-group+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-speech+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-transform+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.rainstor.data": {
	source: "iana"
},
	"application/vnd.rapid": {
	source: "iana"
},
	"application/vnd.rar": {
	source: "iana",
	extensions: [
		"rar"
	]
},
	"application/vnd.realvnc.bed": {
	source: "iana",
	extensions: [
		"bed"
	]
},
	"application/vnd.recordare.musicxml": {
	source: "iana",
	extensions: [
		"mxl"
	]
},
	"application/vnd.recordare.musicxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musicxml"
	]
},
	"application/vnd.renlearn.rlprint": {
	source: "iana"
},
	"application/vnd.restful+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.rig.cryptonote": {
	source: "iana",
	extensions: [
		"cryptonote"
	]
},
	"application/vnd.rim.cod": {
	source: "apache",
	extensions: [
		"cod"
	]
},
	"application/vnd.rn-realmedia": {
	source: "apache",
	extensions: [
		"rm"
	]
},
	"application/vnd.rn-realmedia-vbr": {
	source: "apache",
	extensions: [
		"rmvb"
	]
},
	"application/vnd.route66.link66+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"link66"
	]
},
	"application/vnd.rs-274x": {
	source: "iana"
},
	"application/vnd.ruckus.download": {
	source: "iana"
},
	"application/vnd.s3sms": {
	source: "iana"
},
	"application/vnd.sailingtracker.track": {
	source: "iana",
	extensions: [
		"st"
	]
},
	"application/vnd.sar": {
	source: "iana"
},
	"application/vnd.sbm.cid": {
	source: "iana"
},
	"application/vnd.sbm.mid2": {
	source: "iana"
},
	"application/vnd.scribus": {
	source: "iana"
},
	"application/vnd.sealed.3df": {
	source: "iana"
},
	"application/vnd.sealed.csf": {
	source: "iana"
},
	"application/vnd.sealed.doc": {
	source: "iana"
},
	"application/vnd.sealed.eml": {
	source: "iana"
},
	"application/vnd.sealed.mht": {
	source: "iana"
},
	"application/vnd.sealed.net": {
	source: "iana"
},
	"application/vnd.sealed.ppt": {
	source: "iana"
},
	"application/vnd.sealed.tiff": {
	source: "iana"
},
	"application/vnd.sealed.xls": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.html": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.pdf": {
	source: "iana"
},
	"application/vnd.seemail": {
	source: "iana",
	extensions: [
		"see"
	]
},
	"application/vnd.seis+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.sema": {
	source: "iana",
	extensions: [
		"sema"
	]
},
	"application/vnd.semd": {
	source: "iana",
	extensions: [
		"semd"
	]
},
	"application/vnd.semf": {
	source: "iana",
	extensions: [
		"semf"
	]
},
	"application/vnd.shade-save-file": {
	source: "iana"
},
	"application/vnd.shana.informed.formdata": {
	source: "iana",
	extensions: [
		"ifm"
	]
},
	"application/vnd.shana.informed.formtemplate": {
	source: "iana",
	extensions: [
		"itp"
	]
},
	"application/vnd.shana.informed.interchange": {
	source: "iana",
	extensions: [
		"iif"
	]
},
	"application/vnd.shana.informed.package": {
	source: "iana",
	extensions: [
		"ipk"
	]
},
	"application/vnd.shootproof+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shopkick+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shp": {
	source: "iana"
},
	"application/vnd.shx": {
	source: "iana"
},
	"application/vnd.sigrok.session": {
	source: "iana"
},
	"application/vnd.simtech-mindmapper": {
	source: "iana",
	extensions: [
		"twd",
		"twds"
	]
},
	"application/vnd.siren+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.smaf": {
	source: "iana",
	extensions: [
		"mmf"
	]
},
	"application/vnd.smart.notebook": {
	source: "iana"
},
	"application/vnd.smart.teacher": {
	source: "iana",
	extensions: [
		"teacher"
	]
},
	"application/vnd.snesdev-page-table": {
	source: "iana"
},
	"application/vnd.software602.filler.form+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fo"
	]
},
	"application/vnd.software602.filler.form-xml-zip": {
	source: "iana"
},
	"application/vnd.solent.sdkm+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sdkm",
		"sdkd"
	]
},
	"application/vnd.spotfire.dxp": {
	source: "iana",
	extensions: [
		"dxp"
	]
},
	"application/vnd.spotfire.sfs": {
	source: "iana",
	extensions: [
		"sfs"
	]
},
	"application/vnd.sqlite3": {
	source: "iana"
},
	"application/vnd.sss-cod": {
	source: "iana"
},
	"application/vnd.sss-dtf": {
	source: "iana"
},
	"application/vnd.sss-ntf": {
	source: "iana"
},
	"application/vnd.stardivision.calc": {
	source: "apache",
	extensions: [
		"sdc"
	]
},
	"application/vnd.stardivision.draw": {
	source: "apache",
	extensions: [
		"sda"
	]
},
	"application/vnd.stardivision.impress": {
	source: "apache",
	extensions: [
		"sdd"
	]
},
	"application/vnd.stardivision.math": {
	source: "apache",
	extensions: [
		"smf"
	]
},
	"application/vnd.stardivision.writer": {
	source: "apache",
	extensions: [
		"sdw",
		"vor"
	]
},
	"application/vnd.stardivision.writer-global": {
	source: "apache",
	extensions: [
		"sgl"
	]
},
	"application/vnd.stepmania.package": {
	source: "iana",
	extensions: [
		"smzip"
	]
},
	"application/vnd.stepmania.stepchart": {
	source: "iana",
	extensions: [
		"sm"
	]
},
	"application/vnd.street-stream": {
	source: "iana"
},
	"application/vnd.sun.wadl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wadl"
	]
},
	"application/vnd.sun.xml.calc": {
	source: "apache",
	extensions: [
		"sxc"
	]
},
	"application/vnd.sun.xml.calc.template": {
	source: "apache",
	extensions: [
		"stc"
	]
},
	"application/vnd.sun.xml.draw": {
	source: "apache",
	extensions: [
		"sxd"
	]
},
	"application/vnd.sun.xml.draw.template": {
	source: "apache",
	extensions: [
		"std"
	]
},
	"application/vnd.sun.xml.impress": {
	source: "apache",
	extensions: [
		"sxi"
	]
},
	"application/vnd.sun.xml.impress.template": {
	source: "apache",
	extensions: [
		"sti"
	]
},
	"application/vnd.sun.xml.math": {
	source: "apache",
	extensions: [
		"sxm"
	]
},
	"application/vnd.sun.xml.writer": {
	source: "apache",
	extensions: [
		"sxw"
	]
},
	"application/vnd.sun.xml.writer.global": {
	source: "apache",
	extensions: [
		"sxg"
	]
},
	"application/vnd.sun.xml.writer.template": {
	source: "apache",
	extensions: [
		"stw"
	]
},
	"application/vnd.sus-calendar": {
	source: "iana",
	extensions: [
		"sus",
		"susp"
	]
},
	"application/vnd.svd": {
	source: "iana",
	extensions: [
		"svd"
	]
},
	"application/vnd.swiftview-ics": {
	source: "iana"
},
	"application/vnd.sycle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.symbian.install": {
	source: "apache",
	extensions: [
		"sis",
		"sisx"
	]
},
	"application/vnd.syncml+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xsm"
	]
},
	"application/vnd.syncml.dm+wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"bdm"
	]
},
	"application/vnd.syncml.dm+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xdm"
	]
},
	"application/vnd.syncml.dm.notification": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"ddf"
	]
},
	"application/vnd.syncml.dmtnds+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmtnds+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.syncml.ds.notification": {
	source: "iana"
},
	"application/vnd.tableschema+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tao.intent-module-archive": {
	source: "iana",
	extensions: [
		"tao"
	]
},
	"application/vnd.tcpdump.pcap": {
	source: "iana",
	extensions: [
		"pcap",
		"cap",
		"dmp"
	]
},
	"application/vnd.think-cell.ppttc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tmd.mediaflex.api+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.tml": {
	source: "iana"
},
	"application/vnd.tmobile-livetv": {
	source: "iana",
	extensions: [
		"tmo"
	]
},
	"application/vnd.tri.onesource": {
	source: "iana"
},
	"application/vnd.trid.tpt": {
	source: "iana",
	extensions: [
		"tpt"
	]
},
	"application/vnd.triscape.mxs": {
	source: "iana",
	extensions: [
		"mxs"
	]
},
	"application/vnd.trueapp": {
	source: "iana",
	extensions: [
		"tra"
	]
},
	"application/vnd.truedoc": {
	source: "iana"
},
	"application/vnd.ubisoft.webplayer": {
	source: "iana"
},
	"application/vnd.ufdl": {
	source: "iana",
	extensions: [
		"ufd",
		"ufdl"
	]
},
	"application/vnd.uiq.theme": {
	source: "iana",
	extensions: [
		"utz"
	]
},
	"application/vnd.umajin": {
	source: "iana",
	extensions: [
		"umj"
	]
},
	"application/vnd.unity": {
	source: "iana",
	extensions: [
		"unityweb"
	]
},
	"application/vnd.uoml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uoml"
	]
},
	"application/vnd.uplanet.alert": {
	source: "iana"
},
	"application/vnd.uplanet.alert-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.channel": {
	source: "iana"
},
	"application/vnd.uplanet.channel-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.list": {
	source: "iana"
},
	"application/vnd.uplanet.list-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.signal": {
	source: "iana"
},
	"application/vnd.uri-map": {
	source: "iana"
},
	"application/vnd.valve.source.material": {
	source: "iana"
},
	"application/vnd.vcx": {
	source: "iana",
	extensions: [
		"vcx"
	]
},
	"application/vnd.vd-study": {
	source: "iana"
},
	"application/vnd.vectorworks": {
	source: "iana"
},
	"application/vnd.vel+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.verimatrix.vcas": {
	source: "iana"
},
	"application/vnd.veryant.thin": {
	source: "iana"
},
	"application/vnd.ves.encrypted": {
	source: "iana"
},
	"application/vnd.vidsoft.vidconference": {
	source: "iana"
},
	"application/vnd.visio": {
	source: "iana",
	extensions: [
		"vsd",
		"vst",
		"vss",
		"vsw"
	]
},
	"application/vnd.visionary": {
	source: "iana",
	extensions: [
		"vis"
	]
},
	"application/vnd.vividence.scriptfile": {
	source: "iana"
},
	"application/vnd.vsf": {
	source: "iana",
	extensions: [
		"vsf"
	]
},
	"application/vnd.wap.sic": {
	source: "iana"
},
	"application/vnd.wap.slc": {
	source: "iana"
},
	"application/vnd.wap.wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"wbxml"
	]
},
	"application/vnd.wap.wmlc": {
	source: "iana",
	extensions: [
		"wmlc"
	]
},
	"application/vnd.wap.wmlscriptc": {
	source: "iana",
	extensions: [
		"wmlsc"
	]
},
	"application/vnd.webturbo": {
	source: "iana",
	extensions: [
		"wtb"
	]
},
	"application/vnd.wfa.dpp": {
	source: "iana"
},
	"application/vnd.wfa.p2p": {
	source: "iana"
},
	"application/vnd.wfa.wsc": {
	source: "iana"
},
	"application/vnd.windows.devicepairing": {
	source: "iana"
},
	"application/vnd.wmc": {
	source: "iana"
},
	"application/vnd.wmf.bootstrap": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica.package": {
	source: "iana"
},
	"application/vnd.wolfram.player": {
	source: "iana",
	extensions: [
		"nbp"
	]
},
	"application/vnd.wordperfect": {
	source: "iana",
	extensions: [
		"wpd"
	]
},
	"application/vnd.wqd": {
	source: "iana",
	extensions: [
		"wqd"
	]
},
	"application/vnd.wrq-hp3000-labelled": {
	source: "iana"
},
	"application/vnd.wt.stf": {
	source: "iana",
	extensions: [
		"stf"
	]
},
	"application/vnd.wv.csp+wbxml": {
	source: "iana"
},
	"application/vnd.wv.csp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.wv.ssp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xacml+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.xara": {
	source: "iana",
	extensions: [
		"xar"
	]
},
	"application/vnd.xfdl": {
	source: "iana",
	extensions: [
		"xfdl"
	]
},
	"application/vnd.xfdl.webform": {
	source: "iana"
},
	"application/vnd.xmi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xmpie.cpkg": {
	source: "iana"
},
	"application/vnd.xmpie.dpkg": {
	source: "iana"
},
	"application/vnd.xmpie.plan": {
	source: "iana"
},
	"application/vnd.xmpie.ppkg": {
	source: "iana"
},
	"application/vnd.xmpie.xlim": {
	source: "iana"
},
	"application/vnd.yamaha.hv-dic": {
	source: "iana",
	extensions: [
		"hvd"
	]
},
	"application/vnd.yamaha.hv-script": {
	source: "iana",
	extensions: [
		"hvs"
	]
},
	"application/vnd.yamaha.hv-voice": {
	source: "iana",
	extensions: [
		"hvp"
	]
},
	"application/vnd.yamaha.openscoreformat": {
	source: "iana",
	extensions: [
		"osf"
	]
},
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osfpvg"
	]
},
	"application/vnd.yamaha.remote-setup": {
	source: "iana"
},
	"application/vnd.yamaha.smaf-audio": {
	source: "iana",
	extensions: [
		"saf"
	]
},
	"application/vnd.yamaha.smaf-phrase": {
	source: "iana",
	extensions: [
		"spf"
	]
},
	"application/vnd.yamaha.through-ngn": {
	source: "iana"
},
	"application/vnd.yamaha.tunnel-udpencap": {
	source: "iana"
},
	"application/vnd.yaoweme": {
	source: "iana"
},
	"application/vnd.yellowriver-custom-menu": {
	source: "iana",
	extensions: [
		"cmp"
	]
},
	"application/vnd.youtube.yt": {
	source: "iana"
},
	"application/vnd.zul": {
	source: "iana",
	extensions: [
		"zir",
		"zirz"
	]
},
	"application/vnd.zzazz.deck+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zaz"
	]
},
	"application/voicexml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"vxml"
	]
},
	"application/voucher-cms+json": {
	source: "iana",
	compressible: true
},
	"application/vq-rtcpxr": {
	source: "iana"
},
	"application/wasm": {
	compressible: true,
	extensions: [
		"wasm"
	]
},
	"application/watcherinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/webpush-options+json": {
	source: "iana",
	compressible: true
},
	"application/whoispp-query": {
	source: "iana"
},
	"application/whoispp-response": {
	source: "iana"
},
	"application/widget": {
	source: "iana",
	extensions: [
		"wgt"
	]
},
	"application/winhlp": {
	source: "apache",
	extensions: [
		"hlp"
	]
},
	"application/wita": {
	source: "iana"
},
	"application/wordperfect5.1": {
	source: "iana"
},
	"application/wsdl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wsdl"
	]
},
	"application/wspolicy+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wspolicy"
	]
},
	"application/x-7z-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"7z"
	]
},
	"application/x-abiword": {
	source: "apache",
	extensions: [
		"abw"
	]
},
	"application/x-ace-compressed": {
	source: "apache",
	extensions: [
		"ace"
	]
},
	"application/x-amf": {
	source: "apache"
},
	"application/x-apple-diskimage": {
	source: "apache",
	extensions: [
		"dmg"
	]
},
	"application/x-arj": {
	compressible: false,
	extensions: [
		"arj"
	]
},
	"application/x-authorware-bin": {
	source: "apache",
	extensions: [
		"aab",
		"x32",
		"u32",
		"vox"
	]
},
	"application/x-authorware-map": {
	source: "apache",
	extensions: [
		"aam"
	]
},
	"application/x-authorware-seg": {
	source: "apache",
	extensions: [
		"aas"
	]
},
	"application/x-bcpio": {
	source: "apache",
	extensions: [
		"bcpio"
	]
},
	"application/x-bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/x-bittorrent": {
	source: "apache",
	extensions: [
		"torrent"
	]
},
	"application/x-blorb": {
	source: "apache",
	extensions: [
		"blb",
		"blorb"
	]
},
	"application/x-bzip": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz"
	]
},
	"application/x-bzip2": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz2",
		"boz"
	]
},
	"application/x-cbr": {
	source: "apache",
	extensions: [
		"cbr",
		"cba",
		"cbt",
		"cbz",
		"cb7"
	]
},
	"application/x-cdlink": {
	source: "apache",
	extensions: [
		"vcd"
	]
},
	"application/x-cfs-compressed": {
	source: "apache",
	extensions: [
		"cfs"
	]
},
	"application/x-chat": {
	source: "apache",
	extensions: [
		"chat"
	]
},
	"application/x-chess-pgn": {
	source: "apache",
	extensions: [
		"pgn"
	]
},
	"application/x-chrome-extension": {
	extensions: [
		"crx"
	]
},
	"application/x-cocoa": {
	source: "nginx",
	extensions: [
		"cco"
	]
},
	"application/x-compress": {
	source: "apache"
},
	"application/x-conference": {
	source: "apache",
	extensions: [
		"nsc"
	]
},
	"application/x-cpio": {
	source: "apache",
	extensions: [
		"cpio"
	]
},
	"application/x-csh": {
	source: "apache",
	extensions: [
		"csh"
	]
},
	"application/x-deb": {
	compressible: false
},
	"application/x-debian-package": {
	source: "apache",
	extensions: [
		"deb",
		"udeb"
	]
},
	"application/x-dgc-compressed": {
	source: "apache",
	extensions: [
		"dgc"
	]
},
	"application/x-director": {
	source: "apache",
	extensions: [
		"dir",
		"dcr",
		"dxr",
		"cst",
		"cct",
		"cxt",
		"w3d",
		"fgd",
		"swa"
	]
},
	"application/x-doom": {
	source: "apache",
	extensions: [
		"wad"
	]
},
	"application/x-dtbncx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ncx"
	]
},
	"application/x-dtbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dtb"
	]
},
	"application/x-dtbresource+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"res"
	]
},
	"application/x-dvi": {
	source: "apache",
	compressible: false,
	extensions: [
		"dvi"
	]
},
	"application/x-envoy": {
	source: "apache",
	extensions: [
		"evy"
	]
},
	"application/x-eva": {
	source: "apache",
	extensions: [
		"eva"
	]
},
	"application/x-font-bdf": {
	source: "apache",
	extensions: [
		"bdf"
	]
},
	"application/x-font-dos": {
	source: "apache"
},
	"application/x-font-framemaker": {
	source: "apache"
},
	"application/x-font-ghostscript": {
	source: "apache",
	extensions: [
		"gsf"
	]
},
	"application/x-font-libgrx": {
	source: "apache"
},
	"application/x-font-linux-psf": {
	source: "apache",
	extensions: [
		"psf"
	]
},
	"application/x-font-pcf": {
	source: "apache",
	extensions: [
		"pcf"
	]
},
	"application/x-font-snf": {
	source: "apache",
	extensions: [
		"snf"
	]
},
	"application/x-font-speedo": {
	source: "apache"
},
	"application/x-font-sunos-news": {
	source: "apache"
},
	"application/x-font-type1": {
	source: "apache",
	extensions: [
		"pfa",
		"pfb",
		"pfm",
		"afm"
	]
},
	"application/x-font-vfont": {
	source: "apache"
},
	"application/x-freearc": {
	source: "apache",
	extensions: [
		"arc"
	]
},
	"application/x-futuresplash": {
	source: "apache",
	extensions: [
		"spl"
	]
},
	"application/x-gca-compressed": {
	source: "apache",
	extensions: [
		"gca"
	]
},
	"application/x-glulx": {
	source: "apache",
	extensions: [
		"ulx"
	]
},
	"application/x-gnumeric": {
	source: "apache",
	extensions: [
		"gnumeric"
	]
},
	"application/x-gramps-xml": {
	source: "apache",
	extensions: [
		"gramps"
	]
},
	"application/x-gtar": {
	source: "apache",
	extensions: [
		"gtar"
	]
},
	"application/x-gzip": {
	source: "apache"
},
	"application/x-hdf": {
	source: "apache",
	extensions: [
		"hdf"
	]
},
	"application/x-httpd-php": {
	compressible: true,
	extensions: [
		"php"
	]
},
	"application/x-install-instructions": {
	source: "apache",
	extensions: [
		"install"
	]
},
	"application/x-iso9660-image": {
	source: "apache",
	extensions: [
		"iso"
	]
},
	"application/x-java-archive-diff": {
	source: "nginx",
	extensions: [
		"jardiff"
	]
},
	"application/x-java-jnlp-file": {
	source: "apache",
	compressible: false,
	extensions: [
		"jnlp"
	]
},
	"application/x-javascript": {
	compressible: true
},
	"application/x-keepass2": {
	extensions: [
		"kdbx"
	]
},
	"application/x-latex": {
	source: "apache",
	compressible: false,
	extensions: [
		"latex"
	]
},
	"application/x-lua-bytecode": {
	extensions: [
		"luac"
	]
},
	"application/x-lzh-compressed": {
	source: "apache",
	extensions: [
		"lzh",
		"lha"
	]
},
	"application/x-makeself": {
	source: "nginx",
	extensions: [
		"run"
	]
},
	"application/x-mie": {
	source: "apache",
	extensions: [
		"mie"
	]
},
	"application/x-mobipocket-ebook": {
	source: "apache",
	extensions: [
		"prc",
		"mobi"
	]
},
	"application/x-mpegurl": {
	compressible: false
},
	"application/x-ms-application": {
	source: "apache",
	extensions: [
		"application"
	]
},
	"application/x-ms-shortcut": {
	source: "apache",
	extensions: [
		"lnk"
	]
},
	"application/x-ms-wmd": {
	source: "apache",
	extensions: [
		"wmd"
	]
},
	"application/x-ms-wmz": {
	source: "apache",
	extensions: [
		"wmz"
	]
},
	"application/x-ms-xbap": {
	source: "apache",
	extensions: [
		"xbap"
	]
},
	"application/x-msaccess": {
	source: "apache",
	extensions: [
		"mdb"
	]
},
	"application/x-msbinder": {
	source: "apache",
	extensions: [
		"obd"
	]
},
	"application/x-mscardfile": {
	source: "apache",
	extensions: [
		"crd"
	]
},
	"application/x-msclip": {
	source: "apache",
	extensions: [
		"clp"
	]
},
	"application/x-msdos-program": {
	extensions: [
		"exe"
	]
},
	"application/x-msdownload": {
	source: "apache",
	extensions: [
		"exe",
		"dll",
		"com",
		"bat",
		"msi"
	]
},
	"application/x-msmediaview": {
	source: "apache",
	extensions: [
		"mvb",
		"m13",
		"m14"
	]
},
	"application/x-msmetafile": {
	source: "apache",
	extensions: [
		"wmf",
		"wmz",
		"emf",
		"emz"
	]
},
	"application/x-msmoney": {
	source: "apache",
	extensions: [
		"mny"
	]
},
	"application/x-mspublisher": {
	source: "apache",
	extensions: [
		"pub"
	]
},
	"application/x-msschedule": {
	source: "apache",
	extensions: [
		"scd"
	]
},
	"application/x-msterminal": {
	source: "apache",
	extensions: [
		"trm"
	]
},
	"application/x-mswrite": {
	source: "apache",
	extensions: [
		"wri"
	]
},
	"application/x-netcdf": {
	source: "apache",
	extensions: [
		"nc",
		"cdf"
	]
},
	"application/x-ns-proxy-autoconfig": {
	compressible: true,
	extensions: [
		"pac"
	]
},
	"application/x-nzb": {
	source: "apache",
	extensions: [
		"nzb"
	]
},
	"application/x-perl": {
	source: "nginx",
	extensions: [
		"pl",
		"pm"
	]
},
	"application/x-pilot": {
	source: "nginx",
	extensions: [
		"prc",
		"pdb"
	]
},
	"application/x-pkcs12": {
	source: "apache",
	compressible: false,
	extensions: [
		"p12",
		"pfx"
	]
},
	"application/x-pkcs7-certificates": {
	source: "apache",
	extensions: [
		"p7b",
		"spc"
	]
},
	"application/x-pkcs7-certreqresp": {
	source: "apache",
	extensions: [
		"p7r"
	]
},
	"application/x-pki-message": {
	source: "iana"
},
	"application/x-rar-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"rar"
	]
},
	"application/x-redhat-package-manager": {
	source: "nginx",
	extensions: [
		"rpm"
	]
},
	"application/x-research-info-systems": {
	source: "apache",
	extensions: [
		"ris"
	]
},
	"application/x-sea": {
	source: "nginx",
	extensions: [
		"sea"
	]
},
	"application/x-sh": {
	source: "apache",
	compressible: true,
	extensions: [
		"sh"
	]
},
	"application/x-shar": {
	source: "apache",
	extensions: [
		"shar"
	]
},
	"application/x-shockwave-flash": {
	source: "apache",
	compressible: false,
	extensions: [
		"swf"
	]
},
	"application/x-silverlight-app": {
	source: "apache",
	extensions: [
		"xap"
	]
},
	"application/x-sql": {
	source: "apache",
	extensions: [
		"sql"
	]
},
	"application/x-stuffit": {
	source: "apache",
	compressible: false,
	extensions: [
		"sit"
	]
},
	"application/x-stuffitx": {
	source: "apache",
	extensions: [
		"sitx"
	]
},
	"application/x-subrip": {
	source: "apache",
	extensions: [
		"srt"
	]
},
	"application/x-sv4cpio": {
	source: "apache",
	extensions: [
		"sv4cpio"
	]
},
	"application/x-sv4crc": {
	source: "apache",
	extensions: [
		"sv4crc"
	]
},
	"application/x-t3vm-image": {
	source: "apache",
	extensions: [
		"t3"
	]
},
	"application/x-tads": {
	source: "apache",
	extensions: [
		"gam"
	]
},
	"application/x-tar": {
	source: "apache",
	compressible: true,
	extensions: [
		"tar"
	]
},
	"application/x-tcl": {
	source: "apache",
	extensions: [
		"tcl",
		"tk"
	]
},
	"application/x-tex": {
	source: "apache",
	extensions: [
		"tex"
	]
},
	"application/x-tex-tfm": {
	source: "apache",
	extensions: [
		"tfm"
	]
},
	"application/x-texinfo": {
	source: "apache",
	extensions: [
		"texinfo",
		"texi"
	]
},
	"application/x-tgif": {
	source: "apache",
	extensions: [
		"obj"
	]
},
	"application/x-ustar": {
	source: "apache",
	extensions: [
		"ustar"
	]
},
	"application/x-virtualbox-hdd": {
	compressible: true,
	extensions: [
		"hdd"
	]
},
	"application/x-virtualbox-ova": {
	compressible: true,
	extensions: [
		"ova"
	]
},
	"application/x-virtualbox-ovf": {
	compressible: true,
	extensions: [
		"ovf"
	]
},
	"application/x-virtualbox-vbox": {
	compressible: true,
	extensions: [
		"vbox"
	]
},
	"application/x-virtualbox-vbox-extpack": {
	compressible: false,
	extensions: [
		"vbox-extpack"
	]
},
	"application/x-virtualbox-vdi": {
	compressible: true,
	extensions: [
		"vdi"
	]
},
	"application/x-virtualbox-vhd": {
	compressible: true,
	extensions: [
		"vhd"
	]
},
	"application/x-virtualbox-vmdk": {
	compressible: true,
	extensions: [
		"vmdk"
	]
},
	"application/x-wais-source": {
	source: "apache",
	extensions: [
		"src"
	]
},
	"application/x-web-app-manifest+json": {
	compressible: true,
	extensions: [
		"webapp"
	]
},
	"application/x-www-form-urlencoded": {
	source: "iana",
	compressible: true
},
	"application/x-x509-ca-cert": {
	source: "iana",
	extensions: [
		"der",
		"crt",
		"pem"
	]
},
	"application/x-x509-ca-ra-cert": {
	source: "iana"
},
	"application/x-x509-next-ca-cert": {
	source: "iana"
},
	"application/x-xfig": {
	source: "apache",
	extensions: [
		"fig"
	]
},
	"application/x-xliff+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/x-xpinstall": {
	source: "apache",
	compressible: false,
	extensions: [
		"xpi"
	]
},
	"application/x-xz": {
	source: "apache",
	extensions: [
		"xz"
	]
},
	"application/x-zmachine": {
	source: "apache",
	extensions: [
		"z1",
		"z2",
		"z3",
		"z4",
		"z5",
		"z6",
		"z7",
		"z8"
	]
},
	"application/x400-bp": {
	source: "iana"
},
	"application/xacml+xml": {
	source: "iana",
	compressible: true
},
	"application/xaml+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xaml"
	]
},
	"application/xcap-att+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xav"
	]
},
	"application/xcap-caps+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xca"
	]
},
	"application/xcap-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdf"
	]
},
	"application/xcap-el+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xel"
	]
},
	"application/xcap-error+xml": {
	source: "iana",
	compressible: true
},
	"application/xcap-ns+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xns"
	]
},
	"application/xcon-conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/xcon-conference-info-diff+xml": {
	source: "iana",
	compressible: true
},
	"application/xenc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xenc"
	]
},
	"application/xhtml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xhtml",
		"xht"
	]
},
	"application/xhtml-voice+xml": {
	source: "apache",
	compressible: true
},
	"application/xliff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml",
		"xsl",
		"xsd",
		"rng"
	]
},
	"application/xml-dtd": {
	source: "iana",
	compressible: true,
	extensions: [
		"dtd"
	]
},
	"application/xml-external-parsed-entity": {
	source: "iana"
},
	"application/xml-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/xmpp+xml": {
	source: "iana",
	compressible: true
},
	"application/xop+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xop"
	]
},
	"application/xproc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xpl"
	]
},
	"application/xslt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xsl",
		"xslt"
	]
},
	"application/xspf+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xspf"
	]
},
	"application/xv+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mxml",
		"xhvml",
		"xvml",
		"xvm"
	]
},
	"application/yang": {
	source: "iana",
	extensions: [
		"yang"
	]
},
	"application/yang-data+json": {
	source: "iana",
	compressible: true
},
	"application/yang-data+xml": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+json": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/yin+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"yin"
	]
},
	"application/zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"zip"
	]
},
	"application/zlib": {
	source: "iana"
},
	"application/zstd": {
	source: "iana"
},
	"audio/1d-interleaved-parityfec": {
	source: "iana"
},
	"audio/32kadpcm": {
	source: "iana"
},
	"audio/3gpp": {
	source: "iana",
	compressible: false,
	extensions: [
		"3gpp"
	]
},
	"audio/3gpp2": {
	source: "iana"
},
	"audio/aac": {
	source: "iana"
},
	"audio/ac3": {
	source: "iana"
},
	"audio/adpcm": {
	source: "apache",
	extensions: [
		"adp"
	]
},
	"audio/amr": {
	source: "iana",
	extensions: [
		"amr"
	]
},
	"audio/amr-wb": {
	source: "iana"
},
	"audio/amr-wb+": {
	source: "iana"
},
	"audio/aptx": {
	source: "iana"
},
	"audio/asc": {
	source: "iana"
},
	"audio/atrac-advanced-lossless": {
	source: "iana"
},
	"audio/atrac-x": {
	source: "iana"
},
	"audio/atrac3": {
	source: "iana"
},
	"audio/basic": {
	source: "iana",
	compressible: false,
	extensions: [
		"au",
		"snd"
	]
},
	"audio/bv16": {
	source: "iana"
},
	"audio/bv32": {
	source: "iana"
},
	"audio/clearmode": {
	source: "iana"
},
	"audio/cn": {
	source: "iana"
},
	"audio/dat12": {
	source: "iana"
},
	"audio/dls": {
	source: "iana"
},
	"audio/dsr-es201108": {
	source: "iana"
},
	"audio/dsr-es202050": {
	source: "iana"
},
	"audio/dsr-es202211": {
	source: "iana"
},
	"audio/dsr-es202212": {
	source: "iana"
},
	"audio/dv": {
	source: "iana"
},
	"audio/dvi4": {
	source: "iana"
},
	"audio/eac3": {
	source: "iana"
},
	"audio/encaprtp": {
	source: "iana"
},
	"audio/evrc": {
	source: "iana"
},
	"audio/evrc-qcp": {
	source: "iana"
},
	"audio/evrc0": {
	source: "iana"
},
	"audio/evrc1": {
	source: "iana"
},
	"audio/evrcb": {
	source: "iana"
},
	"audio/evrcb0": {
	source: "iana"
},
	"audio/evrcb1": {
	source: "iana"
},
	"audio/evrcnw": {
	source: "iana"
},
	"audio/evrcnw0": {
	source: "iana"
},
	"audio/evrcnw1": {
	source: "iana"
},
	"audio/evrcwb": {
	source: "iana"
},
	"audio/evrcwb0": {
	source: "iana"
},
	"audio/evrcwb1": {
	source: "iana"
},
	"audio/evs": {
	source: "iana"
},
	"audio/flexfec": {
	source: "iana"
},
	"audio/fwdred": {
	source: "iana"
},
	"audio/g711-0": {
	source: "iana"
},
	"audio/g719": {
	source: "iana"
},
	"audio/g722": {
	source: "iana"
},
	"audio/g7221": {
	source: "iana"
},
	"audio/g723": {
	source: "iana"
},
	"audio/g726-16": {
	source: "iana"
},
	"audio/g726-24": {
	source: "iana"
},
	"audio/g726-32": {
	source: "iana"
},
	"audio/g726-40": {
	source: "iana"
},
	"audio/g728": {
	source: "iana"
},
	"audio/g729": {
	source: "iana"
},
	"audio/g7291": {
	source: "iana"
},
	"audio/g729d": {
	source: "iana"
},
	"audio/g729e": {
	source: "iana"
},
	"audio/gsm": {
	source: "iana"
},
	"audio/gsm-efr": {
	source: "iana"
},
	"audio/gsm-hr-08": {
	source: "iana"
},
	"audio/ilbc": {
	source: "iana"
},
	"audio/ip-mr_v2.5": {
	source: "iana"
},
	"audio/isac": {
	source: "apache"
},
	"audio/l16": {
	source: "iana"
},
	"audio/l20": {
	source: "iana"
},
	"audio/l24": {
	source: "iana",
	compressible: false
},
	"audio/l8": {
	source: "iana"
},
	"audio/lpc": {
	source: "iana"
},
	"audio/melp": {
	source: "iana"
},
	"audio/melp1200": {
	source: "iana"
},
	"audio/melp2400": {
	source: "iana"
},
	"audio/melp600": {
	source: "iana"
},
	"audio/mhas": {
	source: "iana"
},
	"audio/midi": {
	source: "apache",
	extensions: [
		"mid",
		"midi",
		"kar",
		"rmi"
	]
},
	"audio/mobile-xmf": {
	source: "iana",
	extensions: [
		"mxmf"
	]
},
	"audio/mp3": {
	compressible: false,
	extensions: [
		"mp3"
	]
},
	"audio/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"m4a",
		"mp4a"
	]
},
	"audio/mp4a-latm": {
	source: "iana"
},
	"audio/mpa": {
	source: "iana"
},
	"audio/mpa-robust": {
	source: "iana"
},
	"audio/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpga",
		"mp2",
		"mp2a",
		"mp3",
		"m2a",
		"m3a"
	]
},
	"audio/mpeg4-generic": {
	source: "iana"
},
	"audio/musepack": {
	source: "apache"
},
	"audio/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"oga",
		"ogg",
		"spx",
		"opus"
	]
},
	"audio/opus": {
	source: "iana"
},
	"audio/parityfec": {
	source: "iana"
},
	"audio/pcma": {
	source: "iana"
},
	"audio/pcma-wb": {
	source: "iana"
},
	"audio/pcmu": {
	source: "iana"
},
	"audio/pcmu-wb": {
	source: "iana"
},
	"audio/prs.sid": {
	source: "iana"
},
	"audio/qcelp": {
	source: "iana"
},
	"audio/raptorfec": {
	source: "iana"
},
	"audio/red": {
	source: "iana"
},
	"audio/rtp-enc-aescm128": {
	source: "iana"
},
	"audio/rtp-midi": {
	source: "iana"
},
	"audio/rtploopback": {
	source: "iana"
},
	"audio/rtx": {
	source: "iana"
},
	"audio/s3m": {
	source: "apache",
	extensions: [
		"s3m"
	]
},
	"audio/scip": {
	source: "iana"
},
	"audio/silk": {
	source: "apache",
	extensions: [
		"sil"
	]
},
	"audio/smv": {
	source: "iana"
},
	"audio/smv-qcp": {
	source: "iana"
},
	"audio/smv0": {
	source: "iana"
},
	"audio/sofa": {
	source: "iana"
},
	"audio/sp-midi": {
	source: "iana"
},
	"audio/speex": {
	source: "iana"
},
	"audio/t140c": {
	source: "iana"
},
	"audio/t38": {
	source: "iana"
},
	"audio/telephone-event": {
	source: "iana"
},
	"audio/tetra_acelp": {
	source: "iana"
},
	"audio/tetra_acelp_bb": {
	source: "iana"
},
	"audio/tone": {
	source: "iana"
},
	"audio/tsvcis": {
	source: "iana"
},
	"audio/uemclip": {
	source: "iana"
},
	"audio/ulpfec": {
	source: "iana"
},
	"audio/usac": {
	source: "iana"
},
	"audio/vdvi": {
	source: "iana"
},
	"audio/vmr-wb": {
	source: "iana"
},
	"audio/vnd.3gpp.iufp": {
	source: "iana"
},
	"audio/vnd.4sb": {
	source: "iana"
},
	"audio/vnd.audiokoz": {
	source: "iana"
},
	"audio/vnd.celp": {
	source: "iana"
},
	"audio/vnd.cisco.nse": {
	source: "iana"
},
	"audio/vnd.cmles.radio-events": {
	source: "iana"
},
	"audio/vnd.cns.anp1": {
	source: "iana"
},
	"audio/vnd.cns.inf1": {
	source: "iana"
},
	"audio/vnd.dece.audio": {
	source: "iana",
	extensions: [
		"uva",
		"uvva"
	]
},
	"audio/vnd.digital-winds": {
	source: "iana",
	extensions: [
		"eol"
	]
},
	"audio/vnd.dlna.adts": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.1": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.2": {
	source: "iana"
},
	"audio/vnd.dolby.mlp": {
	source: "iana"
},
	"audio/vnd.dolby.mps": {
	source: "iana"
},
	"audio/vnd.dolby.pl2": {
	source: "iana"
},
	"audio/vnd.dolby.pl2x": {
	source: "iana"
},
	"audio/vnd.dolby.pl2z": {
	source: "iana"
},
	"audio/vnd.dolby.pulse.1": {
	source: "iana"
},
	"audio/vnd.dra": {
	source: "iana",
	extensions: [
		"dra"
	]
},
	"audio/vnd.dts": {
	source: "iana",
	extensions: [
		"dts"
	]
},
	"audio/vnd.dts.hd": {
	source: "iana",
	extensions: [
		"dtshd"
	]
},
	"audio/vnd.dts.uhd": {
	source: "iana"
},
	"audio/vnd.dvb.file": {
	source: "iana"
},
	"audio/vnd.everad.plj": {
	source: "iana"
},
	"audio/vnd.hns.audio": {
	source: "iana"
},
	"audio/vnd.lucent.voice": {
	source: "iana",
	extensions: [
		"lvp"
	]
},
	"audio/vnd.ms-playready.media.pya": {
	source: "iana",
	extensions: [
		"pya"
	]
},
	"audio/vnd.nokia.mobile-xmf": {
	source: "iana"
},
	"audio/vnd.nortel.vbk": {
	source: "iana"
},
	"audio/vnd.nuera.ecelp4800": {
	source: "iana",
	extensions: [
		"ecelp4800"
	]
},
	"audio/vnd.nuera.ecelp7470": {
	source: "iana",
	extensions: [
		"ecelp7470"
	]
},
	"audio/vnd.nuera.ecelp9600": {
	source: "iana",
	extensions: [
		"ecelp9600"
	]
},
	"audio/vnd.octel.sbc": {
	source: "iana"
},
	"audio/vnd.presonus.multitrack": {
	source: "iana"
},
	"audio/vnd.qcelp": {
	source: "iana"
},
	"audio/vnd.rhetorex.32kadpcm": {
	source: "iana"
},
	"audio/vnd.rip": {
	source: "iana",
	extensions: [
		"rip"
	]
},
	"audio/vnd.rn-realaudio": {
	compressible: false
},
	"audio/vnd.sealedmedia.softseal.mpeg": {
	source: "iana"
},
	"audio/vnd.vmx.cvsd": {
	source: "iana"
},
	"audio/vnd.wave": {
	compressible: false
},
	"audio/vorbis": {
	source: "iana",
	compressible: false
},
	"audio/vorbis-config": {
	source: "iana"
},
	"audio/wav": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/wave": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"weba"
	]
},
	"audio/x-aac": {
	source: "apache",
	compressible: false,
	extensions: [
		"aac"
	]
},
	"audio/x-aiff": {
	source: "apache",
	extensions: [
		"aif",
		"aiff",
		"aifc"
	]
},
	"audio/x-caf": {
	source: "apache",
	compressible: false,
	extensions: [
		"caf"
	]
},
	"audio/x-flac": {
	source: "apache",
	extensions: [
		"flac"
	]
},
	"audio/x-m4a": {
	source: "nginx",
	extensions: [
		"m4a"
	]
},
	"audio/x-matroska": {
	source: "apache",
	extensions: [
		"mka"
	]
},
	"audio/x-mpegurl": {
	source: "apache",
	extensions: [
		"m3u"
	]
},
	"audio/x-ms-wax": {
	source: "apache",
	extensions: [
		"wax"
	]
},
	"audio/x-ms-wma": {
	source: "apache",
	extensions: [
		"wma"
	]
},
	"audio/x-pn-realaudio": {
	source: "apache",
	extensions: [
		"ram",
		"ra"
	]
},
	"audio/x-pn-realaudio-plugin": {
	source: "apache",
	extensions: [
		"rmp"
	]
},
	"audio/x-realaudio": {
	source: "nginx",
	extensions: [
		"ra"
	]
},
	"audio/x-tta": {
	source: "apache"
},
	"audio/x-wav": {
	source: "apache",
	extensions: [
		"wav"
	]
},
	"audio/xm": {
	source: "apache",
	extensions: [
		"xm"
	]
},
	"chemical/x-cdx": {
	source: "apache",
	extensions: [
		"cdx"
	]
},
	"chemical/x-cif": {
	source: "apache",
	extensions: [
		"cif"
	]
},
	"chemical/x-cmdf": {
	source: "apache",
	extensions: [
		"cmdf"
	]
},
	"chemical/x-cml": {
	source: "apache",
	extensions: [
		"cml"
	]
},
	"chemical/x-csml": {
	source: "apache",
	extensions: [
		"csml"
	]
},
	"chemical/x-pdb": {
	source: "apache"
},
	"chemical/x-xyz": {
	source: "apache",
	extensions: [
		"xyz"
	]
},
	"font/collection": {
	source: "iana",
	extensions: [
		"ttc"
	]
},
	"font/otf": {
	source: "iana",
	compressible: true,
	extensions: [
		"otf"
	]
},
	"font/sfnt": {
	source: "iana"
},
	"font/ttf": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttf"
	]
},
	"font/woff": {
	source: "iana",
	extensions: [
		"woff"
	]
},
	"font/woff2": {
	source: "iana",
	extensions: [
		"woff2"
	]
},
	"image/aces": {
	source: "iana",
	extensions: [
		"exr"
	]
},
	"image/apng": {
	compressible: false,
	extensions: [
		"apng"
	]
},
	"image/avci": {
	source: "iana"
},
	"image/avcs": {
	source: "iana"
},
	"image/avif": {
	source: "iana",
	compressible: false,
	extensions: [
		"avif"
	]
},
	"image/bmp": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/cgm": {
	source: "iana",
	extensions: [
		"cgm"
	]
},
	"image/dicom-rle": {
	source: "iana",
	extensions: [
		"drle"
	]
},
	"image/emf": {
	source: "iana",
	extensions: [
		"emf"
	]
},
	"image/fits": {
	source: "iana",
	extensions: [
		"fits"
	]
},
	"image/g3fax": {
	source: "iana",
	extensions: [
		"g3"
	]
},
	"image/gif": {
	source: "iana",
	compressible: false,
	extensions: [
		"gif"
	]
},
	"image/heic": {
	source: "iana",
	extensions: [
		"heic"
	]
},
	"image/heic-sequence": {
	source: "iana",
	extensions: [
		"heics"
	]
},
	"image/heif": {
	source: "iana",
	extensions: [
		"heif"
	]
},
	"image/heif-sequence": {
	source: "iana",
	extensions: [
		"heifs"
	]
},
	"image/hej2k": {
	source: "iana",
	extensions: [
		"hej2"
	]
},
	"image/hsj2": {
	source: "iana",
	extensions: [
		"hsj2"
	]
},
	"image/ief": {
	source: "iana",
	extensions: [
		"ief"
	]
},
	"image/jls": {
	source: "iana",
	extensions: [
		"jls"
	]
},
	"image/jp2": {
	source: "iana",
	compressible: false,
	extensions: [
		"jp2",
		"jpg2"
	]
},
	"image/jpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpeg",
		"jpg",
		"jpe"
	]
},
	"image/jph": {
	source: "iana",
	extensions: [
		"jph"
	]
},
	"image/jphc": {
	source: "iana",
	extensions: [
		"jhc"
	]
},
	"image/jpm": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpm"
	]
},
	"image/jpx": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpx",
		"jpf"
	]
},
	"image/jxr": {
	source: "iana",
	extensions: [
		"jxr"
	]
},
	"image/jxra": {
	source: "iana",
	extensions: [
		"jxra"
	]
},
	"image/jxrs": {
	source: "iana",
	extensions: [
		"jxrs"
	]
},
	"image/jxs": {
	source: "iana",
	extensions: [
		"jxs"
	]
},
	"image/jxsc": {
	source: "iana",
	extensions: [
		"jxsc"
	]
},
	"image/jxsi": {
	source: "iana",
	extensions: [
		"jxsi"
	]
},
	"image/jxss": {
	source: "iana",
	extensions: [
		"jxss"
	]
},
	"image/ktx": {
	source: "iana",
	extensions: [
		"ktx"
	]
},
	"image/ktx2": {
	source: "iana",
	extensions: [
		"ktx2"
	]
},
	"image/naplps": {
	source: "iana"
},
	"image/pjpeg": {
	compressible: false
},
	"image/png": {
	source: "iana",
	compressible: false,
	extensions: [
		"png"
	]
},
	"image/prs.btif": {
	source: "iana",
	extensions: [
		"btif"
	]
},
	"image/prs.pti": {
	source: "iana",
	extensions: [
		"pti"
	]
},
	"image/pwg-raster": {
	source: "iana"
},
	"image/sgi": {
	source: "apache",
	extensions: [
		"sgi"
	]
},
	"image/svg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"svg",
		"svgz"
	]
},
	"image/t38": {
	source: "iana",
	extensions: [
		"t38"
	]
},
	"image/tiff": {
	source: "iana",
	compressible: false,
	extensions: [
		"tif",
		"tiff"
	]
},
	"image/tiff-fx": {
	source: "iana",
	extensions: [
		"tfx"
	]
},
	"image/vnd.adobe.photoshop": {
	source: "iana",
	compressible: true,
	extensions: [
		"psd"
	]
},
	"image/vnd.airzip.accelerator.azv": {
	source: "iana",
	extensions: [
		"azv"
	]
},
	"image/vnd.cns.inf2": {
	source: "iana"
},
	"image/vnd.dece.graphic": {
	source: "iana",
	extensions: [
		"uvi",
		"uvvi",
		"uvg",
		"uvvg"
	]
},
	"image/vnd.djvu": {
	source: "iana",
	extensions: [
		"djvu",
		"djv"
	]
},
	"image/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"image/vnd.dwg": {
	source: "iana",
	extensions: [
		"dwg"
	]
},
	"image/vnd.dxf": {
	source: "iana",
	extensions: [
		"dxf"
	]
},
	"image/vnd.fastbidsheet": {
	source: "iana",
	extensions: [
		"fbs"
	]
},
	"image/vnd.fpx": {
	source: "iana",
	extensions: [
		"fpx"
	]
},
	"image/vnd.fst": {
	source: "iana",
	extensions: [
		"fst"
	]
},
	"image/vnd.fujixerox.edmics-mmr": {
	source: "iana",
	extensions: [
		"mmr"
	]
},
	"image/vnd.fujixerox.edmics-rlc": {
	source: "iana",
	extensions: [
		"rlc"
	]
},
	"image/vnd.globalgraphics.pgb": {
	source: "iana"
},
	"image/vnd.microsoft.icon": {
	source: "iana",
	extensions: [
		"ico"
	]
},
	"image/vnd.mix": {
	source: "iana"
},
	"image/vnd.mozilla.apng": {
	source: "iana"
},
	"image/vnd.ms-dds": {
	extensions: [
		"dds"
	]
},
	"image/vnd.ms-modi": {
	source: "iana",
	extensions: [
		"mdi"
	]
},
	"image/vnd.ms-photo": {
	source: "apache",
	extensions: [
		"wdp"
	]
},
	"image/vnd.net-fpx": {
	source: "iana",
	extensions: [
		"npx"
	]
},
	"image/vnd.pco.b16": {
	source: "iana",
	extensions: [
		"b16"
	]
},
	"image/vnd.radiance": {
	source: "iana"
},
	"image/vnd.sealed.png": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.gif": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.jpg": {
	source: "iana"
},
	"image/vnd.svf": {
	source: "iana"
},
	"image/vnd.tencent.tap": {
	source: "iana",
	extensions: [
		"tap"
	]
},
	"image/vnd.valve.source.texture": {
	source: "iana",
	extensions: [
		"vtf"
	]
},
	"image/vnd.wap.wbmp": {
	source: "iana",
	extensions: [
		"wbmp"
	]
},
	"image/vnd.xiff": {
	source: "iana",
	extensions: [
		"xif"
	]
},
	"image/vnd.zbrush.pcx": {
	source: "iana",
	extensions: [
		"pcx"
	]
},
	"image/webp": {
	source: "apache",
	extensions: [
		"webp"
	]
},
	"image/wmf": {
	source: "iana",
	extensions: [
		"wmf"
	]
},
	"image/x-3ds": {
	source: "apache",
	extensions: [
		"3ds"
	]
},
	"image/x-cmu-raster": {
	source: "apache",
	extensions: [
		"ras"
	]
},
	"image/x-cmx": {
	source: "apache",
	extensions: [
		"cmx"
	]
},
	"image/x-freehand": {
	source: "apache",
	extensions: [
		"fh",
		"fhc",
		"fh4",
		"fh5",
		"fh7"
	]
},
	"image/x-icon": {
	source: "apache",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/x-jng": {
	source: "nginx",
	extensions: [
		"jng"
	]
},
	"image/x-mrsid-image": {
	source: "apache",
	extensions: [
		"sid"
	]
},
	"image/x-ms-bmp": {
	source: "nginx",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/x-pcx": {
	source: "apache",
	extensions: [
		"pcx"
	]
},
	"image/x-pict": {
	source: "apache",
	extensions: [
		"pic",
		"pct"
	]
},
	"image/x-portable-anymap": {
	source: "apache",
	extensions: [
		"pnm"
	]
},
	"image/x-portable-bitmap": {
	source: "apache",
	extensions: [
		"pbm"
	]
},
	"image/x-portable-graymap": {
	source: "apache",
	extensions: [
		"pgm"
	]
},
	"image/x-portable-pixmap": {
	source: "apache",
	extensions: [
		"ppm"
	]
},
	"image/x-rgb": {
	source: "apache",
	extensions: [
		"rgb"
	]
},
	"image/x-tga": {
	source: "apache",
	extensions: [
		"tga"
	]
},
	"image/x-xbitmap": {
	source: "apache",
	extensions: [
		"xbm"
	]
},
	"image/x-xcf": {
	compressible: false
},
	"image/x-xpixmap": {
	source: "apache",
	extensions: [
		"xpm"
	]
},
	"image/x-xwindowdump": {
	source: "apache",
	extensions: [
		"xwd"
	]
},
	"message/cpim": {
	source: "iana"
},
	"message/delivery-status": {
	source: "iana"
},
	"message/disposition-notification": {
	source: "iana",
	extensions: [
		"disposition-notification"
	]
},
	"message/external-body": {
	source: "iana"
},
	"message/feedback-report": {
	source: "iana"
},
	"message/global": {
	source: "iana",
	extensions: [
		"u8msg"
	]
},
	"message/global-delivery-status": {
	source: "iana",
	extensions: [
		"u8dsn"
	]
},
	"message/global-disposition-notification": {
	source: "iana",
	extensions: [
		"u8mdn"
	]
},
	"message/global-headers": {
	source: "iana",
	extensions: [
		"u8hdr"
	]
},
	"message/http": {
	source: "iana",
	compressible: false
},
	"message/imdn+xml": {
	source: "iana",
	compressible: true
},
	"message/news": {
	source: "iana"
},
	"message/partial": {
	source: "iana",
	compressible: false
},
	"message/rfc822": {
	source: "iana",
	compressible: true,
	extensions: [
		"eml",
		"mime"
	]
},
	"message/s-http": {
	source: "iana"
},
	"message/sip": {
	source: "iana"
},
	"message/sipfrag": {
	source: "iana"
},
	"message/tracking-status": {
	source: "iana"
},
	"message/vnd.si.simp": {
	source: "iana"
},
	"message/vnd.wfa.wsc": {
	source: "iana",
	extensions: [
		"wsc"
	]
},
	"model/3mf": {
	source: "iana",
	extensions: [
		"3mf"
	]
},
	"model/e57": {
	source: "iana"
},
	"model/gltf+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"gltf"
	]
},
	"model/gltf-binary": {
	source: "iana",
	compressible: true,
	extensions: [
		"glb"
	]
},
	"model/iges": {
	source: "iana",
	compressible: false,
	extensions: [
		"igs",
		"iges"
	]
},
	"model/mesh": {
	source: "iana",
	compressible: false,
	extensions: [
		"msh",
		"mesh",
		"silo"
	]
},
	"model/mtl": {
	source: "iana",
	extensions: [
		"mtl"
	]
},
	"model/obj": {
	source: "iana",
	extensions: [
		"obj"
	]
},
	"model/stl": {
	source: "iana",
	extensions: [
		"stl"
	]
},
	"model/vnd.collada+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dae"
	]
},
	"model/vnd.dwf": {
	source: "iana",
	extensions: [
		"dwf"
	]
},
	"model/vnd.flatland.3dml": {
	source: "iana"
},
	"model/vnd.gdl": {
	source: "iana",
	extensions: [
		"gdl"
	]
},
	"model/vnd.gs-gdl": {
	source: "apache"
},
	"model/vnd.gs.gdl": {
	source: "iana"
},
	"model/vnd.gtw": {
	source: "iana",
	extensions: [
		"gtw"
	]
},
	"model/vnd.moml+xml": {
	source: "iana",
	compressible: true
},
	"model/vnd.mts": {
	source: "iana",
	extensions: [
		"mts"
	]
},
	"model/vnd.opengex": {
	source: "iana",
	extensions: [
		"ogex"
	]
},
	"model/vnd.parasolid.transmit.binary": {
	source: "iana",
	extensions: [
		"x_b"
	]
},
	"model/vnd.parasolid.transmit.text": {
	source: "iana",
	extensions: [
		"x_t"
	]
},
	"model/vnd.rosette.annotated-data-model": {
	source: "iana"
},
	"model/vnd.sap.vds": {
	source: "iana",
	extensions: [
		"vds"
	]
},
	"model/vnd.usdz+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"usdz"
	]
},
	"model/vnd.valve.source.compiled-map": {
	source: "iana",
	extensions: [
		"bsp"
	]
},
	"model/vnd.vtu": {
	source: "iana",
	extensions: [
		"vtu"
	]
},
	"model/vrml": {
	source: "iana",
	compressible: false,
	extensions: [
		"wrl",
		"vrml"
	]
},
	"model/x3d+binary": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3db",
		"x3dbz"
	]
},
	"model/x3d+fastinfoset": {
	source: "iana",
	extensions: [
		"x3db"
	]
},
	"model/x3d+vrml": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3dv",
		"x3dvz"
	]
},
	"model/x3d+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"x3d",
		"x3dz"
	]
},
	"model/x3d-vrml": {
	source: "iana",
	extensions: [
		"x3dv"
	]
},
	"multipart/alternative": {
	source: "iana",
	compressible: false
},
	"multipart/appledouble": {
	source: "iana"
},
	"multipart/byteranges": {
	source: "iana"
},
	"multipart/digest": {
	source: "iana"
},
	"multipart/encrypted": {
	source: "iana",
	compressible: false
},
	"multipart/form-data": {
	source: "iana",
	compressible: false
},
	"multipart/header-set": {
	source: "iana"
},
	"multipart/mixed": {
	source: "iana"
},
	"multipart/multilingual": {
	source: "iana"
},
	"multipart/parallel": {
	source: "iana"
},
	"multipart/related": {
	source: "iana",
	compressible: false
},
	"multipart/report": {
	source: "iana"
},
	"multipart/signed": {
	source: "iana",
	compressible: false
},
	"multipart/vnd.bint.med-plus": {
	source: "iana"
},
	"multipart/voice-message": {
	source: "iana"
},
	"multipart/x-mixed-replace": {
	source: "iana"
},
	"text/1d-interleaved-parityfec": {
	source: "iana"
},
	"text/cache-manifest": {
	source: "iana",
	compressible: true,
	extensions: [
		"appcache",
		"manifest"
	]
},
	"text/calendar": {
	source: "iana",
	extensions: [
		"ics",
		"ifb"
	]
},
	"text/calender": {
	compressible: true
},
	"text/cmd": {
	compressible: true
},
	"text/coffeescript": {
	extensions: [
		"coffee",
		"litcoffee"
	]
},
	"text/cql": {
	source: "iana"
},
	"text/cql-expression": {
	source: "iana"
},
	"text/cql-identifier": {
	source: "iana"
},
	"text/css": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"css"
	]
},
	"text/csv": {
	source: "iana",
	compressible: true,
	extensions: [
		"csv"
	]
},
	"text/csv-schema": {
	source: "iana"
},
	"text/directory": {
	source: "iana"
},
	"text/dns": {
	source: "iana"
},
	"text/ecmascript": {
	source: "iana"
},
	"text/encaprtp": {
	source: "iana"
},
	"text/enriched": {
	source: "iana"
},
	"text/fhirpath": {
	source: "iana"
},
	"text/flexfec": {
	source: "iana"
},
	"text/fwdred": {
	source: "iana"
},
	"text/gff3": {
	source: "iana"
},
	"text/grammar-ref-list": {
	source: "iana"
},
	"text/html": {
	source: "iana",
	compressible: true,
	extensions: [
		"html",
		"htm",
		"shtml"
	]
},
	"text/jade": {
	extensions: [
		"jade"
	]
},
	"text/javascript": {
	source: "iana",
	compressible: true
},
	"text/jcr-cnd": {
	source: "iana"
},
	"text/jsx": {
	compressible: true,
	extensions: [
		"jsx"
	]
},
	"text/less": {
	compressible: true,
	extensions: [
		"less"
	]
},
	"text/markdown": {
	source: "iana",
	compressible: true,
	extensions: [
		"markdown",
		"md"
	]
},
	"text/mathml": {
	source: "nginx",
	extensions: [
		"mml"
	]
},
	"text/mdx": {
	compressible: true,
	extensions: [
		"mdx"
	]
},
	"text/mizar": {
	source: "iana"
},
	"text/n3": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"n3"
	]
},
	"text/parameters": {
	source: "iana",
	charset: "UTF-8"
},
	"text/parityfec": {
	source: "iana"
},
	"text/plain": {
	source: "iana",
	compressible: true,
	extensions: [
		"txt",
		"text",
		"conf",
		"def",
		"list",
		"log",
		"in",
		"ini"
	]
},
	"text/provenance-notation": {
	source: "iana",
	charset: "UTF-8"
},
	"text/prs.fallenstein.rst": {
	source: "iana"
},
	"text/prs.lines.tag": {
	source: "iana",
	extensions: [
		"dsc"
	]
},
	"text/prs.prop.logic": {
	source: "iana"
},
	"text/raptorfec": {
	source: "iana"
},
	"text/red": {
	source: "iana"
},
	"text/rfc822-headers": {
	source: "iana"
},
	"text/richtext": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtx"
	]
},
	"text/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"text/rtp-enc-aescm128": {
	source: "iana"
},
	"text/rtploopback": {
	source: "iana"
},
	"text/rtx": {
	source: "iana"
},
	"text/sgml": {
	source: "iana",
	extensions: [
		"sgml",
		"sgm"
	]
},
	"text/shaclc": {
	source: "iana"
},
	"text/shex": {
	extensions: [
		"shex"
	]
},
	"text/slim": {
	extensions: [
		"slim",
		"slm"
	]
},
	"text/spdx": {
	source: "iana",
	extensions: [
		"spdx"
	]
},
	"text/strings": {
	source: "iana"
},
	"text/stylus": {
	extensions: [
		"stylus",
		"styl"
	]
},
	"text/t140": {
	source: "iana"
},
	"text/tab-separated-values": {
	source: "iana",
	compressible: true,
	extensions: [
		"tsv"
	]
},
	"text/troff": {
	source: "iana",
	extensions: [
		"t",
		"tr",
		"roff",
		"man",
		"me",
		"ms"
	]
},
	"text/turtle": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"ttl"
	]
},
	"text/ulpfec": {
	source: "iana"
},
	"text/uri-list": {
	source: "iana",
	compressible: true,
	extensions: [
		"uri",
		"uris",
		"urls"
	]
},
	"text/vcard": {
	source: "iana",
	compressible: true,
	extensions: [
		"vcard"
	]
},
	"text/vnd.a": {
	source: "iana"
},
	"text/vnd.abc": {
	source: "iana"
},
	"text/vnd.ascii-art": {
	source: "iana"
},
	"text/vnd.curl": {
	source: "iana",
	extensions: [
		"curl"
	]
},
	"text/vnd.curl.dcurl": {
	source: "apache",
	extensions: [
		"dcurl"
	]
},
	"text/vnd.curl.mcurl": {
	source: "apache",
	extensions: [
		"mcurl"
	]
},
	"text/vnd.curl.scurl": {
	source: "apache",
	extensions: [
		"scurl"
	]
},
	"text/vnd.debian.copyright": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.dmclientscript": {
	source: "iana"
},
	"text/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"text/vnd.esmertec.theme-descriptor": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.ficlab.flt": {
	source: "iana"
},
	"text/vnd.fly": {
	source: "iana",
	extensions: [
		"fly"
	]
},
	"text/vnd.fmi.flexstor": {
	source: "iana",
	extensions: [
		"flx"
	]
},
	"text/vnd.gml": {
	source: "iana"
},
	"text/vnd.graphviz": {
	source: "iana",
	extensions: [
		"gv"
	]
},
	"text/vnd.hans": {
	source: "iana"
},
	"text/vnd.hgl": {
	source: "iana"
},
	"text/vnd.in3d.3dml": {
	source: "iana",
	extensions: [
		"3dml"
	]
},
	"text/vnd.in3d.spot": {
	source: "iana",
	extensions: [
		"spot"
	]
},
	"text/vnd.iptc.newsml": {
	source: "iana"
},
	"text/vnd.iptc.nitf": {
	source: "iana"
},
	"text/vnd.latex-z": {
	source: "iana"
},
	"text/vnd.motorola.reflex": {
	source: "iana"
},
	"text/vnd.ms-mediapackage": {
	source: "iana"
},
	"text/vnd.net2phone.commcenter.command": {
	source: "iana"
},
	"text/vnd.radisys.msml-basic-layout": {
	source: "iana"
},
	"text/vnd.senx.warpscript": {
	source: "iana"
},
	"text/vnd.si.uricatalogue": {
	source: "iana"
},
	"text/vnd.sosi": {
	source: "iana"
},
	"text/vnd.sun.j2me.app-descriptor": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"jad"
	]
},
	"text/vnd.trolltech.linguist": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.wap.si": {
	source: "iana"
},
	"text/vnd.wap.sl": {
	source: "iana"
},
	"text/vnd.wap.wml": {
	source: "iana",
	extensions: [
		"wml"
	]
},
	"text/vnd.wap.wmlscript": {
	source: "iana",
	extensions: [
		"wmls"
	]
},
	"text/vtt": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"vtt"
	]
},
	"text/x-asm": {
	source: "apache",
	extensions: [
		"s",
		"asm"
	]
},
	"text/x-c": {
	source: "apache",
	extensions: [
		"c",
		"cc",
		"cxx",
		"cpp",
		"h",
		"hh",
		"dic"
	]
},
	"text/x-component": {
	source: "nginx",
	extensions: [
		"htc"
	]
},
	"text/x-fortran": {
	source: "apache",
	extensions: [
		"f",
		"for",
		"f77",
		"f90"
	]
},
	"text/x-gwt-rpc": {
	compressible: true
},
	"text/x-handlebars-template": {
	extensions: [
		"hbs"
	]
},
	"text/x-java-source": {
	source: "apache",
	extensions: [
		"java"
	]
},
	"text/x-jquery-tmpl": {
	compressible: true
},
	"text/x-lua": {
	extensions: [
		"lua"
	]
},
	"text/x-markdown": {
	compressible: true,
	extensions: [
		"mkd"
	]
},
	"text/x-nfo": {
	source: "apache",
	extensions: [
		"nfo"
	]
},
	"text/x-opml": {
	source: "apache",
	extensions: [
		"opml"
	]
},
	"text/x-org": {
	compressible: true,
	extensions: [
		"org"
	]
},
	"text/x-pascal": {
	source: "apache",
	extensions: [
		"p",
		"pas"
	]
},
	"text/x-processing": {
	compressible: true,
	extensions: [
		"pde"
	]
},
	"text/x-sass": {
	extensions: [
		"sass"
	]
},
	"text/x-scss": {
	extensions: [
		"scss"
	]
},
	"text/x-setext": {
	source: "apache",
	extensions: [
		"etx"
	]
},
	"text/x-sfv": {
	source: "apache",
	extensions: [
		"sfv"
	]
},
	"text/x-suse-ymp": {
	compressible: true,
	extensions: [
		"ymp"
	]
},
	"text/x-uuencode": {
	source: "apache",
	extensions: [
		"uu"
	]
},
	"text/x-vcalendar": {
	source: "apache",
	extensions: [
		"vcs"
	]
},
	"text/x-vcard": {
	source: "apache",
	extensions: [
		"vcf"
	]
},
	"text/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml"
	]
},
	"text/xml-external-parsed-entity": {
	source: "iana"
},
	"text/yaml": {
	extensions: [
		"yaml",
		"yml"
	]
},
	"video/1d-interleaved-parityfec": {
	source: "iana"
},
	"video/3gpp": {
	source: "iana",
	extensions: [
		"3gp",
		"3gpp"
	]
},
	"video/3gpp-tt": {
	source: "iana"
},
	"video/3gpp2": {
	source: "iana",
	extensions: [
		"3g2"
	]
},
	"video/av1": {
	source: "iana"
},
	"video/bmpeg": {
	source: "iana"
},
	"video/bt656": {
	source: "iana"
},
	"video/celb": {
	source: "iana"
},
	"video/dv": {
	source: "iana"
},
	"video/encaprtp": {
	source: "iana"
},
	"video/ffv1": {
	source: "iana"
},
	"video/flexfec": {
	source: "iana"
},
	"video/h261": {
	source: "iana",
	extensions: [
		"h261"
	]
},
	"video/h263": {
	source: "iana",
	extensions: [
		"h263"
	]
},
	"video/h263-1998": {
	source: "iana"
},
	"video/h263-2000": {
	source: "iana"
},
	"video/h264": {
	source: "iana",
	extensions: [
		"h264"
	]
},
	"video/h264-rcdo": {
	source: "iana"
},
	"video/h264-svc": {
	source: "iana"
},
	"video/h265": {
	source: "iana"
},
	"video/iso.segment": {
	source: "iana",
	extensions: [
		"m4s"
	]
},
	"video/jpeg": {
	source: "iana",
	extensions: [
		"jpgv"
	]
},
	"video/jpeg2000": {
	source: "iana"
},
	"video/jpm": {
	source: "apache",
	extensions: [
		"jpm",
		"jpgm"
	]
},
	"video/mj2": {
	source: "iana",
	extensions: [
		"mj2",
		"mjp2"
	]
},
	"video/mp1s": {
	source: "iana"
},
	"video/mp2p": {
	source: "iana"
},
	"video/mp2t": {
	source: "iana",
	extensions: [
		"ts"
	]
},
	"video/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"mp4",
		"mp4v",
		"mpg4"
	]
},
	"video/mp4v-es": {
	source: "iana"
},
	"video/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpeg",
		"mpg",
		"mpe",
		"m1v",
		"m2v"
	]
},
	"video/mpeg4-generic": {
	source: "iana"
},
	"video/mpv": {
	source: "iana"
},
	"video/nv": {
	source: "iana"
},
	"video/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogv"
	]
},
	"video/parityfec": {
	source: "iana"
},
	"video/pointer": {
	source: "iana"
},
	"video/quicktime": {
	source: "iana",
	compressible: false,
	extensions: [
		"qt",
		"mov"
	]
},
	"video/raptorfec": {
	source: "iana"
},
	"video/raw": {
	source: "iana"
},
	"video/rtp-enc-aescm128": {
	source: "iana"
},
	"video/rtploopback": {
	source: "iana"
},
	"video/rtx": {
	source: "iana"
},
	"video/scip": {
	source: "iana"
},
	"video/smpte291": {
	source: "iana"
},
	"video/smpte292m": {
	source: "iana"
},
	"video/ulpfec": {
	source: "iana"
},
	"video/vc1": {
	source: "iana"
},
	"video/vc2": {
	source: "iana"
},
	"video/vnd.cctv": {
	source: "iana"
},
	"video/vnd.dece.hd": {
	source: "iana",
	extensions: [
		"uvh",
		"uvvh"
	]
},
	"video/vnd.dece.mobile": {
	source: "iana",
	extensions: [
		"uvm",
		"uvvm"
	]
},
	"video/vnd.dece.mp4": {
	source: "iana"
},
	"video/vnd.dece.pd": {
	source: "iana",
	extensions: [
		"uvp",
		"uvvp"
	]
},
	"video/vnd.dece.sd": {
	source: "iana",
	extensions: [
		"uvs",
		"uvvs"
	]
},
	"video/vnd.dece.video": {
	source: "iana",
	extensions: [
		"uvv",
		"uvvv"
	]
},
	"video/vnd.directv.mpeg": {
	source: "iana"
},
	"video/vnd.directv.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dlna.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dvb.file": {
	source: "iana",
	extensions: [
		"dvb"
	]
},
	"video/vnd.fvt": {
	source: "iana",
	extensions: [
		"fvt"
	]
},
	"video/vnd.hns.video": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsavc": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsmpeg2": {
	source: "iana"
},
	"video/vnd.motorola.video": {
	source: "iana"
},
	"video/vnd.motorola.videop": {
	source: "iana"
},
	"video/vnd.mpegurl": {
	source: "iana",
	extensions: [
		"mxu",
		"m4u"
	]
},
	"video/vnd.ms-playready.media.pyv": {
	source: "iana",
	extensions: [
		"pyv"
	]
},
	"video/vnd.nokia.interleaved-multimedia": {
	source: "iana"
},
	"video/vnd.nokia.mp4vr": {
	source: "iana"
},
	"video/vnd.nokia.videovoip": {
	source: "iana"
},
	"video/vnd.objectvideo": {
	source: "iana"
},
	"video/vnd.radgamettools.bink": {
	source: "iana"
},
	"video/vnd.radgamettools.smacker": {
	source: "iana"
},
	"video/vnd.sealed.mpeg1": {
	source: "iana"
},
	"video/vnd.sealed.mpeg4": {
	source: "iana"
},
	"video/vnd.sealed.swf": {
	source: "iana"
},
	"video/vnd.sealedmedia.softseal.mov": {
	source: "iana"
},
	"video/vnd.uvvu.mp4": {
	source: "iana",
	extensions: [
		"uvu",
		"uvvu"
	]
},
	"video/vnd.vivo": {
	source: "iana",
	extensions: [
		"viv"
	]
},
	"video/vnd.youtube.yt": {
	source: "iana"
},
	"video/vp8": {
	source: "iana"
},
	"video/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"webm"
	]
},
	"video/x-f4v": {
	source: "apache",
	extensions: [
		"f4v"
	]
},
	"video/x-fli": {
	source: "apache",
	extensions: [
		"fli"
	]
},
	"video/x-flv": {
	source: "apache",
	compressible: false,
	extensions: [
		"flv"
	]
},
	"video/x-m4v": {
	source: "apache",
	extensions: [
		"m4v"
	]
},
	"video/x-matroska": {
	source: "apache",
	compressible: false,
	extensions: [
		"mkv",
		"mk3d",
		"mks"
	]
},
	"video/x-mng": {
	source: "apache",
	extensions: [
		"mng"
	]
},
	"video/x-ms-asf": {
	source: "apache",
	extensions: [
		"asf",
		"asx"
	]
},
	"video/x-ms-vob": {
	source: "apache",
	extensions: [
		"vob"
	]
},
	"video/x-ms-wm": {
	source: "apache",
	extensions: [
		"wm"
	]
},
	"video/x-ms-wmv": {
	source: "apache",
	compressible: false,
	extensions: [
		"wmv"
	]
},
	"video/x-ms-wmx": {
	source: "apache",
	extensions: [
		"wmx"
	]
},
	"video/x-ms-wvx": {
	source: "apache",
	extensions: [
		"wvx"
	]
},
	"video/x-msvideo": {
	source: "apache",
	extensions: [
		"avi"
	]
},
	"video/x-sgi-movie": {
	source: "apache",
	extensions: [
		"movie"
	]
},
	"video/x-smv": {
	source: "apache",
	extensions: [
		"smv"
	]
},
	"x-conference/x-cooltalk": {
	source: "apache",
	extensions: [
		"ice"
	]
},
	"x-shader/x-fragment": {
	compressible: true
},
	"x-shader/x-vertex": {
	compressible: true
}
};

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

/**
 * Module exports.
 */

var mimeDb = require$$0;

/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

var mimeTypes = createCommonjsModule(function (module, exports) {

/**
 * Module dependencies.
 * @private
 */


var extname = require$$0$1.extname;

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;

/**
 * Module exports.
 * @public
 */

exports.charset = charset;
exports.charsets = { lookup: charset };
exports.contentType = contentType;
exports.extension = extension;
exports.extensions = Object.create(null);
exports.lookup = lookup;
exports.types = Object.create(null);

// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types);

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type);
  var mime = match && mimeDb[match[1].toLowerCase()];

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str;

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime);
    if (charset) mime += '; charset=' + charset.toLowerCase();
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type);

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()];

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1);

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana'];

  Object.keys(mimeDb).forEach(function forEachMimeType (type) {
    var mime = mimeDb[type];
    var exts = mime.extensions;

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i];

      if (types[extension]) {
        var from = preference.indexOf(mimeDb[types[extension]].source);
        var to = preference.indexOf(mime.source);

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type;
    }
  });
}
});

/*!
 * accepts
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */




/**
 * Module exports.
 * @public
 */

var accepts = Accepts;

/**
 * Create a new Accepts object for the given req.
 *
 * @param {object} req
 * @public
 */

function Accepts (req) {
  if (!(this instanceof Accepts)) {
    return new Accepts(req)
  }

  this.headers = req.headers;
  this.negotiator = new negotiator(req);
}

/**
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single mime type string
 * such as "application/json", the extension name
 * such as "json" or an array `["json", "html", "text/plain"]`. When a list
 * or array is given the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     this.types('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     this.types('html');
 *     // => "html"
 *     this.types('text/html');
 *     // => "text/html"
 *     this.types('json', 'text');
 *     // => "json"
 *     this.types('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     this.types('image/png');
 *     this.types('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     this.types(['html', 'json']);
 *     this.types('html', 'json');
 *     // => "json"
 *
 * @param {String|Array} types...
 * @return {String|Array|Boolean}
 * @public
 */

Accepts.prototype.type =
Accepts.prototype.types = function (types_) {
  var types = types_;

  // support flattened arguments
  if (types && !Array.isArray(types)) {
    types = new Array(arguments.length);
    for (var i = 0; i < types.length; i++) {
      types[i] = arguments[i];
    }
  }

  // no types, return all requested types
  if (!types || types.length === 0) {
    return this.negotiator.mediaTypes()
  }

  // no accept header, return first given type
  if (!this.headers.accept) {
    return types[0]
  }

  var mimes = types.map(extToMime);
  var accepts = this.negotiator.mediaTypes(mimes.filter(validMime));
  var first = accepts[0];

  return first
    ? types[mimes.indexOf(first)]
    : false
};

/**
 * Return accepted encodings or best fit based on `encodings`.
 *
 * Given `Accept-Encoding: gzip, deflate`
 * an array sorted by quality is returned:
 *
 *     ['gzip', 'deflate']
 *
 * @param {String|Array} encodings...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.encoding =
Accepts.prototype.encodings = function (encodings_) {
  var encodings = encodings_;

  // support flattened arguments
  if (encodings && !Array.isArray(encodings)) {
    encodings = new Array(arguments.length);
    for (var i = 0; i < encodings.length; i++) {
      encodings[i] = arguments[i];
    }
  }

  // no encodings, return all requested encodings
  if (!encodings || encodings.length === 0) {
    return this.negotiator.encodings()
  }

  return this.negotiator.encodings(encodings)[0] || false
};

/**
 * Return accepted charsets or best fit based on `charsets`.
 *
 * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
 * an array sorted by quality is returned:
 *
 *     ['utf-8', 'utf-7', 'iso-8859-1']
 *
 * @param {String|Array} charsets...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.charset =
Accepts.prototype.charsets = function (charsets_) {
  var charsets = charsets_;

  // support flattened arguments
  if (charsets && !Array.isArray(charsets)) {
    charsets = new Array(arguments.length);
    for (var i = 0; i < charsets.length; i++) {
      charsets[i] = arguments[i];
    }
  }

  // no charsets, return all requested charsets
  if (!charsets || charsets.length === 0) {
    return this.negotiator.charsets()
  }

  return this.negotiator.charsets(charsets)[0] || false
};

/**
 * Return accepted languages or best fit based on `langs`.
 *
 * Given `Accept-Language: en;q=0.8, es, pt`
 * an array sorted by quality is returned:
 *
 *     ['es', 'pt', 'en']
 *
 * @param {String|Array} langs...
 * @return {Array|String}
 * @public
 */

Accepts.prototype.lang =
Accepts.prototype.langs =
Accepts.prototype.language =
Accepts.prototype.languages = function (languages_) {
  var languages = languages_;

  // support flattened arguments
  if (languages && !Array.isArray(languages)) {
    languages = new Array(arguments.length);
    for (var i = 0; i < languages.length; i++) {
      languages[i] = arguments[i];
    }
  }

  // no languages, return all requested languages
  if (!languages || languages.length === 0) {
    return this.negotiator.languages()
  }

  return this.negotiator.languages(languages)[0] || false
};

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function extToMime (type) {
  return type.indexOf('/') === -1
    ? mimeTypes.lookup(type)
    : type
}

/**
 * Check if mime is valid.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function validMime (type) {
  return typeof type === 'string'
}

/* eslint-disable node/no-deprecated-api */

var safeBuffer = createCommonjsModule(function (module, exports) {
var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
};
});

/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var bytes_1 = bytes;
var format_1 = format;
var parse_1 = parse$4;

/**
 * Module variables.
 * @private
 */

var formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;

var formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;

var map = {
  b:  1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  tb: ((1 << 30) * 1024)
};

var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb)$/i;

/**
 * Convert the given value in bytes into a string or parse to string to an integer in bytes.
 *
 * @param {string|number} value
 * @param {{
 *  case: [string],
 *  decimalPlaces: [number]
 *  fixedDecimals: [boolean]
 *  thousandsSeparator: [string]
 *  unitSeparator: [string]
 *  }} [options] bytes options.
 *
 * @returns {string|number|null}
 */

function bytes(value, options) {
  if (typeof value === 'string') {
    return parse$4(value);
  }

  if (typeof value === 'number') {
    return format(value, options);
  }

  return null;
}

/**
 * Format the given value in bytes into a string.
 *
 * If the value is negative, it is kept as such. If it is a float,
 * it is rounded.
 *
 * @param {number} value
 * @param {object} [options]
 * @param {number} [options.decimalPlaces=2]
 * @param {number} [options.fixedDecimals=false]
 * @param {string} [options.thousandsSeparator=]
 * @param {string} [options.unit=]
 * @param {string} [options.unitSeparator=]
 *
 * @returns {string|null}
 * @public
 */

function format(value, options) {
  if (!Number.isFinite(value)) {
    return null;
  }

  var mag = Math.abs(value);
  var thousandsSeparator = (options && options.thousandsSeparator) || '';
  var unitSeparator = (options && options.unitSeparator) || '';
  var decimalPlaces = (options && options.decimalPlaces !== undefined) ? options.decimalPlaces : 2;
  var fixedDecimals = Boolean(options && options.fixedDecimals);
  var unit = (options && options.unit) || '';

  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.tb) {
      unit = 'TB';
    } else if (mag >= map.gb) {
      unit = 'GB';
    } else if (mag >= map.mb) {
      unit = 'MB';
    } else if (mag >= map.kb) {
      unit = 'KB';
    } else {
      unit = 'B';
    }
  }

  var val = value / map[unit.toLowerCase()];
  var str = val.toFixed(decimalPlaces);

  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, '$1');
  }

  if (thousandsSeparator) {
    str = str.replace(formatThousandsRegExp, thousandsSeparator);
  }

  return str + unitSeparator + unit;
}

/**
 * Parse the string value into an integer in bytes.
 *
 * If no unit is given, it is assumed the value is in bytes.
 *
 * @param {number|string} val
 *
 * @returns {number|null}
 * @public
 */

function parse$4(val) {
  if (typeof val === 'number' && !isNaN(val)) {
    return val;
  }

  if (typeof val !== 'string') {
    return null;
  }

  // Test if the string passed is valid
  var results = parseRegExp.exec(val);
  var floatValue;
  var unit = 'b';

  if (!results) {
    // Nothing could be extracted from the given string
    floatValue = parseInt(val, 10);
    unit = 'b';
  } else {
    // Retrieve the value and the unit
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }

  return Math.floor(map[unit] * floatValue);
}
bytes_1.format = format_1;
bytes_1.parse = parse_1;

/*!
 * compressible
 * Copyright(c) 2013 Jonathan Ong
 * Copyright(c) 2014 Jeremiah Senkpiel
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */



/**
 * Module variables.
 * @private
 */

var COMPRESSIBLE_TYPE_REGEXP = /^text\/|\+(?:json|text|xml)$/i;
var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;

/**
 * Module exports.
 * @public
 */

var compressible_1 = compressible;

/**
 * Checks if a type is compressible.
 *
 * @param {string} type
 * @return {Boolean} compressible
 * @public
 */

function compressible (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // strip parameters
  var match = EXTRACT_TYPE_REGEXP.exec(type);
  var mime = match && match[1].toLowerCase();
  var data = mimeDb[mime];

  // return database information
  if (data && data.compressible !== undefined) {
    return data.compressible
  }

  // fallback to regexp or unknown
  return COMPRESSIBLE_TYPE_REGEXP.test(mime) || undefined
}

/**
 * Helpers.
 */
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse$3(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse$3(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

var debug$1 = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = ms;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

var browser = createCommonjsModule(function (module, exports) {
exports = module.exports = debug$1;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});

/**
 * Module dependencies.
 */

var node = createCommonjsModule(function (module, exports) {
/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug$1;
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = fs__default;
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = require$$2;
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());
});

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

var src$1 = createCommonjsModule(function (module) {
if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = browser;
} else {
  module.exports = node;
}
});

/*!
 * on-headers
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var onHeaders_1 = onHeaders;

/**
 * Create a replacement writeHead method.
 *
 * @param {function} prevWriteHead
 * @param {function} listener
 * @private
 */

function createWriteHead (prevWriteHead, listener) {
  var fired = false;

  // return function with core name and argument list
  return function writeHead (statusCode) {
    // set headers from arguments
    var args = setWriteHeadHeaders.apply(this, arguments);

    // fire listener
    if (!fired) {
      fired = true;
      listener.call(this);

      // pass-along an updated status code
      if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
        args[0] = this.statusCode;
        args.length = 1;
      }
    }

    return prevWriteHead.apply(this, args)
  }
}

/**
 * Execute a listener when a response is about to write headers.
 *
 * @param {object} res
 * @return {function} listener
 * @public
 */

function onHeaders (res, listener) {
  if (!res) {
    throw new TypeError('argument res is required')
  }

  if (typeof listener !== 'function') {
    throw new TypeError('argument listener must be a function')
  }

  res.writeHead = createWriteHead(res.writeHead, listener);
}

/**
 * Set headers contained in array on the response object.
 *
 * @param {object} res
 * @param {array} headers
 * @private
 */

function setHeadersFromArray (res, headers) {
  for (var i = 0; i < headers.length; i++) {
    res.setHeader(headers[i][0], headers[i][1]);
  }
}

/**
 * Set headers contained in object on the response object.
 *
 * @param {object} res
 * @param {object} headers
 * @private
 */

function setHeadersFromObject (res, headers) {
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k) res.setHeader(k, headers[k]);
  }
}

/**
 * Set headers and other properties on the response object.
 *
 * @param {number} statusCode
 * @private
 */

function setWriteHeadHeaders (statusCode) {
  var length = arguments.length;
  var headerIndex = length > 1 && typeof arguments[1] === 'string'
    ? 2
    : 1;

  var headers = length >= headerIndex + 1
    ? arguments[headerIndex]
    : undefined;

  this.statusCode = statusCode;

  if (Array.isArray(headers)) {
    // handle array case
    setHeadersFromArray(this, headers);
  } else if (headers) {
    // handle object case
    setHeadersFromObject(this, headers);
  }

  // copy leading arguments
  var args = new Array(Math.min(length, headerIndex));
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }

  return args
}

/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

var vary_1 = vary;
var append_1 = append;

/**
 * RegExp to match field-name in RFC 7230 sec 3.2
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 */

var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

/**
 * Append a field to a vary header.
 *
 * @param {String} header
 * @param {String|Array} field
 * @return {String}
 * @public
 */

function append (header, field) {
  if (typeof header !== 'string') {
    throw new TypeError('header argument is required')
  }

  if (!field) {
    throw new TypeError('field argument is required')
  }

  // get fields array
  var fields = !Array.isArray(field)
    ? parse$2(String(field))
    : field;

  // assert on invalid field names
  for (var j = 0; j < fields.length; j++) {
    if (!FIELD_NAME_REGEXP.test(fields[j])) {
      throw new TypeError('field argument contains an invalid header name')
    }
  }

  // existing, unspecified vary
  if (header === '*') {
    return header
  }

  // enumerate current values
  var val = header;
  var vals = parse$2(header.toLowerCase());

  // unspecified vary
  if (fields.indexOf('*') !== -1 || vals.indexOf('*') !== -1) {
    return '*'
  }

  for (var i = 0; i < fields.length; i++) {
    var fld = fields[i].toLowerCase();

    // append value (case-preserving)
    if (vals.indexOf(fld) === -1) {
      vals.push(fld);
      val = val
        ? val + ', ' + fields[i]
        : fields[i];
    }
  }

  return val
}

/**
 * Parse a vary header into an array.
 *
 * @param {String} header
 * @return {Array}
 * @private
 */

function parse$2 (header) {
  var end = 0;
  var list = [];
  var start = 0;

  // gather tokens
  for (var i = 0, len = header.length; i < len; i++) {
    switch (header.charCodeAt(i)) {
      case 0x20: /*   */
        if (start === end) {
          start = end = i + 1;
        }
        break
      case 0x2c: /* , */
        list.push(header.substring(start, end));
        start = end = i + 1;
        break
      default:
        end = i + 1;
        break
    }
  }

  // final token
  list.push(header.substring(start, end));

  return list
}

/**
 * Mark that a request is varied on a header field.
 *
 * @param {Object} res
 * @param {String|Array} field
 * @public
 */

function vary (res, field) {
  if (!res || !res.getHeader || !res.setHeader) {
    // quack quack
    throw new TypeError('res argument is required')
  }

  // get existing header
  var val = res.getHeader('Vary') || '';
  var header = Array.isArray(val)
    ? val.join(', ')
    : String(val);

  // set new header
  if ((val = append(header, field))) {
    res.setHeader('Vary', val);
  }
}
vary_1.append = append_1;

/*!
 * compression
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */


var Buffer$1 = safeBuffer.Buffer;


var debug = src$1('compression');




/**
 * Module exports.
 */

var compression_1 = compression;
var filter = shouldCompress;

/**
 * Module variables.
 * @private
 */

var cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/;

/**
 * Compress response data with gzip / deflate.
 *
 * @param {Object} [options]
 * @return {Function} middleware
 * @public
 */

function compression (options) {
  var opts = options || {};

  // options
  var filter = opts.filter || shouldCompress;
  var threshold = bytes_1.parse(opts.threshold);

  if (threshold == null) {
    threshold = 1024;
  }

  return function compression (req, res, next) {
    var ended = false;
    var length;
    var listeners = [];
    var stream;

    var _end = res.end;
    var _on = res.on;
    var _write = res.write;

    // flush
    res.flush = function flush () {
      if (stream) {
        stream.flush();
      }
    };

    // proxy

    res.write = function write (chunk, encoding) {
      if (ended) {
        return false
      }

      if (!this._header) {
        this._implicitHeader();
      }

      return stream
        ? stream.write(toBuffer(chunk, encoding))
        : _write.call(this, chunk, encoding)
    };

    res.end = function end (chunk, encoding) {
      if (ended) {
        return false
      }

      if (!this._header) {
        // estimate the length
        if (!this.getHeader('Content-Length')) {
          length = chunkLength(chunk, encoding);
        }

        this._implicitHeader();
      }

      if (!stream) {
        return _end.call(this, chunk, encoding)
      }

      // mark ended
      ended = true;

      // write Buffer for Node.js 0.8
      return chunk
        ? stream.end(toBuffer(chunk, encoding))
        : stream.end()
    };

    res.on = function on (type, listener) {
      if (!listeners || type !== 'drain') {
        return _on.call(this, type, listener)
      }

      if (stream) {
        return stream.on(type, listener)
      }

      // buffer listeners for future stream
      listeners.push([type, listener]);

      return this
    };

    function nocompress (msg) {
      debug('no compression: %s', msg);
      addListeners(res, _on, listeners);
      listeners = null;
    }

    onHeaders_1(res, function onResponseHeaders () {
      // determine if request is filtered
      if (!filter(req, res)) {
        nocompress('filtered');
        return
      }

      // determine if the entity should be transformed
      if (!shouldTransform(req, res)) {
        nocompress('no transform');
        return
      }

      // vary
      vary_1(res, 'Accept-Encoding');

      // content-length below threshold
      if (Number(res.getHeader('Content-Length')) < threshold || length < threshold) {
        nocompress('size below threshold');
        return
      }

      var encoding = res.getHeader('Content-Encoding') || 'identity';

      // already encoded
      if (encoding !== 'identity') {
        nocompress('already encoded');
        return
      }

      // head
      if (req.method === 'HEAD') {
        nocompress('HEAD request');
        return
      }

      // compression method
      var accept = accepts(req);
      var method = accept.encoding(['gzip', 'deflate', 'identity']);

      // we really don't prefer deflate
      if (method === 'deflate' && accept.encoding(['gzip'])) {
        method = accept.encoding(['gzip', 'identity']);
      }

      // negotiation failed
      if (!method || method === 'identity') {
        nocompress('not acceptable');
        return
      }

      // compression stream
      debug('%s compression', method);
      stream = method === 'gzip'
        ? zlib.createGzip(opts)
        : zlib.createDeflate(opts);

      // add buffered listeners to stream
      addListeners(stream, stream.on, listeners);

      // header fields
      res.setHeader('Content-Encoding', method);
      res.removeHeader('Content-Length');

      // compression
      stream.on('data', function onStreamData (chunk) {
        if (_write.call(res, chunk) === false) {
          stream.pause();
        }
      });

      stream.on('end', function onStreamEnd () {
        _end.call(res);
      });

      _on.call(res, 'drain', function onResponseDrain () {
        stream.resume();
      });
    });

    next();
  }
}

/**
 * Add bufferred listeners to stream
 * @private
 */

function addListeners (stream, on, listeners) {
  for (var i = 0; i < listeners.length; i++) {
    on.apply(stream, listeners[i]);
  }
}

/**
 * Get the length of a given chunk
 */

function chunkLength (chunk, encoding) {
  if (!chunk) {
    return 0
  }

  return !Buffer$1.isBuffer(chunk)
    ? Buffer$1.byteLength(chunk, encoding)
    : chunk.length
}

/**
 * Default filter function.
 * @private
 */

function shouldCompress (req, res) {
  var type = res.getHeader('Content-Type');

  if (type === undefined || !compressible_1(type)) {
    debug('%s not compressible', type);
    return false
  }

  return true
}

/**
 * Determine if the entity should be transformed.
 * @private
 */

function shouldTransform (req, res) {
  var cacheControl = res.getHeader('Cache-Control');

  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl ||
    !cacheControlNoTransformRegExp.test(cacheControl)
}

/**
 * Coerce arguments to Buffer
 * @private
 */

function toBuffer (chunk, encoding) {
  return !Buffer$1.isBuffer(chunk)
    ? Buffer$1.from(chunk, encoding)
    : chunk
}
compression_1.filter = filter;

function parse$1 (str, loose) {
	if (str instanceof RegExp) return { keys:false, pattern:str };
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
		if (c === '*') {
			keys.push('wild');
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
	};
}

class Trouter {
	constructor() {
		this.routes = [];

		this.all = this.add.bind(this, '');
		this.get = this.add.bind(this, 'GET');
		this.head = this.add.bind(this, 'HEAD');
		this.patch = this.add.bind(this, 'PATCH');
		this.options = this.add.bind(this, 'OPTIONS');
		this.connect = this.add.bind(this, 'CONNECT');
		this.delete = this.add.bind(this, 'DELETE');
		this.trace = this.add.bind(this, 'TRACE');
		this.post = this.add.bind(this, 'POST');
		this.put = this.add.bind(this, 'PUT');
	}

	use(route, ...fns) {
		let handlers = [].concat.apply([], fns);
		let { keys, pattern } = parse$1(route, true);
		this.routes.push({ keys, pattern, method:'', handlers });
		return this;
	}

	add(method, route, ...fns) {
		let { keys, pattern } = parse$1(route);
		let handlers = [].concat.apply([], fns);
		this.routes.push({ keys, pattern, method, handlers });
		return this;
	}

	find(method, url) {
		let isHEAD=(method === 'HEAD');
		let i=0, j=0, k, tmp, arr=this.routes;
		let matches=[], params={}, handlers=[];
		for (; i < arr.length; i++) {
			tmp = arr[i];
			if (tmp.method.length === 0 || tmp.method === method || isHEAD && tmp.method === 'GET') {
				if (tmp.keys === false) {
					matches = tmp.pattern.exec(url);
					if (matches === null) continue;
					if (matches.groups !== void 0) for (k in matches.groups) params[k]=matches.groups[k];
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				} else if (tmp.keys.length > 0) {
					matches = tmp.pattern.exec(url);
					if (matches === null) continue;
					for (j=0; j < tmp.keys.length;) params[tmp.keys[j]]=matches[++j];
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				} else if (tmp.pattern.test(url)) {
					tmp.handlers.length > 1 ? (handlers=handlers.concat(tmp.handlers)) : handlers.push(tmp.handlers[0]);
				}
			} // else not a match
		}

		return { params, handlers };
	}
}

function parse(str) {
	let i=0, j=0, k, v;
	let out={}, arr=str.split('&');
	for (; i < arr.length; i++) {
		j = arr[i].indexOf('=');
		v = !!~j && arr[i].substring(j+1) || '';
		k = !!~j ? arr[i].substring(0, j) : arr[i];
		out[k] = out[k] !== void 0 ? [].concat(out[k], v) : v;
	}
	return out;
}

function parser (req, toDecode) {
	let url = req.url;
	if (url == null) return;

	let obj = req._parsedUrl;
	if (obj && obj._raw === url) return obj;

	obj = {
		path: url,
		pathname: url,
		search: null,
		query: null,
		href: url,
		_raw: url
	};

	if (url.length > 1) {
		if (toDecode && !req._decoded && !!~url.indexOf('%', 1)) {
			let nxt = url;
			try { nxt = decodeURIComponent(url); } catch (e) {/* bad */}
			url = req.url = obj.href = obj.path = obj.pathname = obj._raw = nxt;
			req._decoded = true;
		}

		let idx = url.indexOf('?', 1);

		if (idx !== -1) {
			obj.search = url.substring(idx);
			obj.query = obj.search.substring(1);
			obj.pathname = url.substring(0, idx);
			if (toDecode && obj.query.length > 0) {
				obj.query = parse(obj.query);
			}
		}
	}

	return (req._parsedUrl = obj);
}

function onError(err, req, res) {
	let code = (res.statusCode = err.code || err.status || 500);
	if (typeof err === 'string' || Buffer.isBuffer(err)) res.end(err);
	else res.end(err.message || http.STATUS_CODES[code]);
}

const mount = fn => fn instanceof Polka ? fn.attach : fn;

class Polka extends Trouter {
	constructor(opts={}) {
		super();
		this.parse = parser;
		this.server = opts.server;
		this.handler = this.handler.bind(this);
		this.onError = opts.onError || onError; // catch-all handler
		this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code:404 });
		this.attach = (req, res) => setImmediate(this.handler, req, res);
	}

	use(base, ...fns) {
		if (base === '/') {
			super.use(base, fns.map(mount));
		} else if (typeof base === 'function' || base instanceof Polka) {
			super.use('/', [base, ...fns].map(mount));
		} else {
			super.use(base,
				(req, _, next) => {
					if (typeof base === 'string') {
						let len = base.length;
						base.startsWith('/') || len++;
						req.url = req.url.substring(len) || '/';
						req.path = req.path.substring(len) || '/';
					} else {
						req.url = req.url.replace(base, '') || '/';
						req.path = req.path.replace(base, '') || '/';
					}
					if (req.url.charAt(0) !== '/') {
						req.url = '/' + req.url;
					}
					next();
				},
				fns.map(mount),
				(req, _, next) => {
					req.url = req._parsedUrl.href;
					req.path = req._parsedUrl.pathname;
					next();
				}
			);
		}
		return this; // chainable
	}

	listen() {
		(this.server = this.server || http.createServer()).on('request', this.attach);
		this.server.listen.apply(this.server, arguments);
		return this;
	}

	handler(req, res, next) {
		let info = this.parse(req, true);
		let obj = this.find(req.method, req.path=info.pathname);

		req.params = obj.params;
		req.originalUrl = req.originalUrl || req.url;
		req.query = info.query || {};
		req.search = info.search;

		try {
			let i=0, arr=obj.handlers.concat(this.onNoMatch), len=arr.length;
			let loop = () => res.finished || (i < len) && arr[i++](req, res, next);
			next = next || (err => err ? this.onError(err, req, res, next) : loop());
			loop(); // init
		} catch (err) {
			this.onError(err, req, res, next);
		}
	}
}

function polka (opts) {
	return new Polka(opts);
}

function list(dir, callback, pre='') {
	dir = resolve('.', dir);
	let arr = readdirSync(dir);
	let i=0, abs, stats;
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = statSync(abs);
		stats.isDirectory()
			? list(abs, callback, join(pre, arr[i]))
			: callback(join(pre, arr[i]), abs, stats);
	}
}

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (let i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (let type in typeMap) {
    let extensions = typeMap[type].map(function(t) {
      return t.toLowerCase();
    });
    type = type.toLowerCase();

    for (let i = 0; i < extensions.length; i++) {
      const ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] === '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      const ext = extensions[0];
      this._extensions[type] = (ext[0] !== '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  let last = path.replace(/^.*[/\\]/, '').toLowerCase();
  let ext = last.replace(/^.*\./, '').toLowerCase();

  let hasPath = last.length < path.length;
  let hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/ubjson":["ubj"],"application/urc-ressheet+xml":["rsheet"],"application/urc-targetdesc+xml":["td"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["*xsl","xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/amr":["amr"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx","opus"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/avif":["avif"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/ktx2":["ktx2"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/spdx":["spdx"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/iso.segment":["m4s"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

const noop = () => {};

function isMatch(uri, arr) {
	for (let i=0; i < arr.length; i++) {
		if (arr[i].test(uri)) return true;
	}
}

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) {
		uri = uri.substring(0, len);
	}

	let arr=[], tmp=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = extns[i] ? `.${extns[i]}` : '';
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function viaCache(cache, uri, extns) {
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data = cache[arr[i]]) return data;
	}
}

function viaLocal(dir, isEtag, uri, extns) {
	let i=0, arr=toAssume(uri, extns);
	let abs, stats, name, headers;
	for (; i < arr.length; i++) {
		abs = normalize(join(dir, name=arr[i]));
		if (abs.startsWith(dir) && fs.existsSync(abs)) {
			stats = fs.statSync(abs);
			if (stats.isDirectory()) continue;
			headers = toHeaders(name, stats, isEtag);
			headers['Cache-Control'] = isEtag ? 'no-cache' : 'no-store';
			return { abs, stats, headers };
		}
	}
}

function is404(req, res) {
	return (res.statusCode=404,res.end());
}

function send(req, res, file, stats, headers) {
	let code=200, tmp, opts={};
	headers = { ...headers };

	for (let key in headers) {
		tmp = res.getHeader(key);
		if (tmp) headers[key] = tmp;
	}

	if (tmp = res.getHeader('content-type')) {
		headers['Content-Type'] = tmp;
	}

	if (req.headers.range) {
		code = 206;
		let [x, y] = req.headers.range.replace('bytes=', '').split('-');
		let end = opts.end = parseInt(y, 10) || stats.size - 1;
		let start = opts.start = parseInt(x, 10) || 0;

		if (start >= stats.size || end >= stats.size) {
			res.setHeader('Content-Range', `bytes */${stats.size}`);
			res.statusCode = 416;
			return res.end();
		}

		headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
		headers['Content-Length'] = (end - start + 1);
		headers['Accept-Ranges'] = 'bytes';
	}

	res.writeHead(code, headers);
	fs.createReadStream(file, opts).pipe(res);
}

function isEncoding(name, type, headers) {
	headers['Content-Encoding'] = type;
	headers['Content-Type'] = lite.getType(name.replace(/\.([^.]*)$/, '')) || '';
}

function toHeaders(name, stats, isEtag) {
	let headers = {
		'Content-Length': stats.size,
		'Content-Type': lite.getType(name) || '',
		'Last-Modified': stats.mtime.toUTCString(),
	};
	if (isEtag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;
	if (/\.br$/.test(name)) isEncoding(name, 'br', headers);
	if (/\.gz$/.test(name)) isEncoding(name, 'gzip', headers);
	return headers;
}

function sirv (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let setHeaders = opts.setHeaders || noop;

	let extensions = opts.extensions || ['html', 'htm'];
	let gzips = opts.gzip && extensions.map(x => `${x}.gz`).concat('gz');
	let brots = opts.brotli && extensions.map(x => `${x}.br`).concat('br');

	const FILES = {};

	let fallback = '/';
	let isEtag = !!opts.etag;
	let isSPA = !!opts.single;
	if (typeof opts.single === 'string') {
		let idx = opts.single.lastIndexOf('.');
		fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
	}

	let ignores = [];
	if (opts.ignores !== false) {
		ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/); // any extn
		if (opts.dotfiles) ignores.push(/\/\.\w/);
		else ignores.push(/\/\.well-known/);
		[].concat(opts.ignores || []).forEach(x => {
			ignores.push(new RegExp(x, 'i'));
		});
	}

	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';
	else if (cc && opts.maxAge === 0) cc += ',must-revalidate';

	if (!opts.dev) {
		list(dir, (name, abs, stats) => {
			if (/\.well-known[\\+\/]/.test(name)) ; // keep
			else if (!opts.dotfiles && /(^\.|[\\+|\/+]\.)/.test(name)) return;

			let headers = toHeaders(name, stats, isEtag);
			if (cc) headers['Cache-Control'] = cc;

			FILES['/' + name.normalize().replace(/\\+/g, '/')] = { abs, stats, headers };
		});
	}

	let lookup = opts.dev ? viaLocal.bind(0, dir, isEtag) : viaCache.bind(0, FILES);

	return function (req, res, next) {
		let extns = [''];
		let val = req.headers['accept-encoding'] || '';
		if (gzips && val.includes('gzip')) extns.unshift(...gzips);
		if (brots && /(br|brotli)/i.test(val)) extns.unshift(...brots);
		extns.push(...extensions); // [...br, ...gz, orig, ...exts]

		let pathname = req.path || parser(req, true).pathname;
		let data = lookup(pathname, extns) || isSPA && !isMatch(pathname, ignores) && lookup(fallback, extns);
		if (!data) return next ? next() : isNotFound(req, res);

		if (isEtag && req.headers['if-none-match'] === data.headers['ETag']) {
			res.writeHead(304);
			return res.end();
		}

		if (gzips || brots) {
			res.setHeader('Vary', 'Accept-Encoding');
		}

		setHeaders(res, pathname, data.stats);
		send(req, res, data.abs, data.stats, data.headers);
	};
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string | Uint8Array>}
 */
function getRawBody(req) {
	return new Promise((fulfil, reject) => {
		const h = req.headers;

		if (!h['content-type']) {
			fulfil(null);
			return;
		}

		req.on('error', reject);

		const length = Number(h['content-length']);

		/** @type {Uint8Array} */
		let data;

		if (!isNaN(length)) {
			data = new Uint8Array(length);

			let i = 0;

			req.on('data', (chunk) => {
				data.set(chunk, i);
				i += chunk.length;
			});
		} else {
			// https://github.com/jshttp/type-is/blob/c1f4388c71c8a01f79934e68f630ca4a15fffcd6/index.js#L81-L95
			if (h['transfer-encoding'] === undefined) {
				fulfil(null);
				return;
			}

			data = new Uint8Array(0);

			req.on('data', (chunk) => {
				const new_data = new Uint8Array(data.length + chunk.length);
				new_data.set(data);
				new_data.set(chunk, data.length);
				data = new_data;
			});
		}

		req.on('end', () => {
			const [type] = h['content-type'].split(/;\s*/);

			if (type === 'application/octet-stream') {
				fulfil(data);
			}

			const decoder = new TextDecoder(h['content-encoding'] || 'utf-8');
			fulfil(decoder.decode(data));
		});
	});
}

/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @return {Buffer} Buffer instance from Data URI
 * @api public
 */
function dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }
    // strip newlines
    uri = uri.replace(/\r?\n/g, '');
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }
    // remove the "data:" scheme and parse the metadata
    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;
    for (let i = 1; i < meta.length; i++) {
        if (meta[i] === 'base64') {
            base64 = true;
        }
        else {
            typeFull += `;${meta[i]}`;
            if (meta[i].indexOf('charset=') === 0) {
                charset = meta[i].substring(8);
            }
        }
    }
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }
    // get the encoded data portion and decode URI-encoded chars
    const encoding = base64 ? 'base64' : 'ascii';
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = Buffer.from(data, encoding);
    // set `.type` and `.typeFull` properties to MIME type
    buffer.type = type;
    buffer.typeFull = typeFull;
    // set the `.charset` property
    buffer.charset = charset;
    return buffer;
}
var src = dataUriToBuffer;

const {Readable} = Stream;

/**
 * @type {WeakMap<Blob, {type: string, size: number, parts: (Blob | Buffer)[] }>}
 */
const wm = new WeakMap();

async function * read(parts) {
	for (const part of parts) {
		if ('stream' in part) {
			yield * part.stream();
		} else {
			yield part;
		}
	}
}

class Blob {
	/**
	 * The Blob() constructor returns a new Blob object. The content
	 * of the blob consists of the concatenation of the values given
	 * in the parameter array.
	 *
	 * @param {(ArrayBufferLike | ArrayBufferView | Blob | Buffer | string)[]} blobParts
	 * @param {{ type?: string }} [options]
	 */
	constructor(blobParts = [], options = {}) {
		let size = 0;

		const parts = blobParts.map(element => {
			let buffer;
			if (element instanceof Buffer) {
				buffer = element;
			} else if (ArrayBuffer.isView(element)) {
				buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
			} else if (element instanceof ArrayBuffer) {
				buffer = Buffer.from(element);
			} else if (element instanceof Blob) {
				buffer = element;
			} else {
				buffer = Buffer.from(typeof element === 'string' ? element : String(element));
			}

			// eslint-disable-next-line unicorn/explicit-length-check
			size += buffer.length || buffer.size || 0;
			return buffer;
		});

		const type = options.type === undefined ? '' : String(options.type).toLowerCase();

		wm.set(this, {
			type: /[^\u0020-\u007E]/.test(type) ? '' : type,
			size,
			parts
		});
	}

	/**
	 * The Blob interface's size property returns the
	 * size of the Blob in bytes.
	 */
	get size() {
		return wm.get(this).size;
	}

	/**
	 * The type property of a Blob object returns the MIME type of the file.
	 */
	get type() {
		return wm.get(this).type;
	}

	/**
	 * The text() method in the Blob interface returns a Promise
	 * that resolves with a string containing the contents of
	 * the blob, interpreted as UTF-8.
	 *
	 * @return {Promise<string>}
	 */
	async text() {
		return Buffer.from(await this.arrayBuffer()).toString();
	}

	/**
	 * The arrayBuffer() method in the Blob interface returns a
	 * Promise that resolves with the contents of the blob as
	 * binary data contained in an ArrayBuffer.
	 *
	 * @return {Promise<ArrayBuffer>}
	 */
	async arrayBuffer() {
		const data = new Uint8Array(this.size);
		let offset = 0;
		for await (const chunk of this.stream()) {
			data.set(chunk, offset);
			offset += chunk.length;
		}

		return data.buffer;
	}

	/**
	 * The Blob interface's stream() method is difference from native
	 * and uses node streams instead of whatwg streams.
	 *
	 * @returns {Readable} Node readable stream
	 */
	stream() {
		return Readable.from(read(wm.get(this).parts));
	}

	/**
	 * The Blob interface's slice() method creates and returns a
	 * new Blob object which contains data from a subset of the
	 * blob on which it's called.
	 *
	 * @param {number} [start]
	 * @param {number} [end]
	 * @param {string} [type]
	 */
	slice(start = 0, end = this.size, type = '') {
		const {size} = this;

		let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
		let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);

		const span = Math.max(relativeEnd - relativeStart, 0);
		const parts = wm.get(this).parts.values();
		const blobParts = [];
		let added = 0;

		for (const part of parts) {
			const size = ArrayBuffer.isView(part) ? part.byteLength : part.size;
			if (relativeStart && size <= relativeStart) {
				// Skip the beginning and change the relative
				// start & end position as we skip the unwanted parts
				relativeStart -= size;
				relativeEnd -= size;
			} else {
				const chunk = part.slice(relativeStart, Math.min(size, relativeEnd));
				blobParts.push(chunk);
				added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
				relativeStart = 0; // All next sequental parts should start at 0

				// don't add the overflow to new blobParts
				if (added >= span) {
					break;
				}
			}
		}

		const blob = new Blob([], {type: String(type).toLowerCase()});
		Object.assign(wm.get(blob), {size: span, parts: blobParts});

		return blob;
	}

	get [Symbol.toStringTag]() {
		return 'Blob';
	}

	static [Symbol.hasInstance](object) {
		return (
			object &&
			typeof object === 'object' &&
			typeof object.stream === 'function' &&
			object.stream.length === 0 &&
			typeof object.constructor === 'function' &&
			/^(Blob|File)$/.test(object[Symbol.toStringTag])
		);
	}
}

Object.defineProperties(Blob.prototype, {
	size: {enumerable: true},
	type: {enumerable: true},
	slice: {enumerable: true}
});

var fetchBlob = Blob;

class FetchBaseError extends Error {
	constructor(message, type) {
		super(message);
		// Hide custom error implementation details from end-users
		Error.captureStackTrace(this, this.constructor);

		this.type = type;
	}

	get name() {
		return this.constructor.name;
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}
}

/**
 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
*/

/**
 * FetchError interface for operational errors
 */
class FetchError extends FetchBaseError {
	/**
	 * @param  {string} message -      Error message for human
	 * @param  {string} [type] -        Error type for machine
	 * @param  {SystemError} [systemError] - For Node.js system error
	 */
	constructor(message, type, systemError) {
		super(message, type);
		// When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
		if (systemError) {
			// eslint-disable-next-line no-multi-assign
			this.code = this.errno = systemError.code;
			this.erroredSysCall = systemError.syscall;
		}
	}
}

/**
 * Is.js
 *
 * Object type checks.
 */

const NAME = Symbol.toStringTag;

/**
 * Check if `obj` is a URLSearchParams object
 * ref: https://github.com/node-fetch/node-fetch/issues/296#issuecomment-307598143
 *
 * @param  {*} obj
 * @return {boolean}
 */
const isURLSearchParameters = object => {
	return (
		typeof object === 'object' &&
		typeof object.append === 'function' &&
		typeof object.delete === 'function' &&
		typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.has === 'function' &&
		typeof object.set === 'function' &&
		typeof object.sort === 'function' &&
		object[NAME] === 'URLSearchParams'
	);
};

/**
 * Check if `object` is a W3C `Blob` object (which `File` inherits from)
 *
 * @param  {*} obj
 * @return {boolean}
 */
const isBlob = object => {
	return (
		typeof object === 'object' &&
		typeof object.arrayBuffer === 'function' &&
		typeof object.type === 'string' &&
		typeof object.stream === 'function' &&
		typeof object.constructor === 'function' &&
		/^(Blob|File)$/.test(object[NAME])
	);
};

/**
 * Check if `obj` is a spec-compliant `FormData` object
 *
 * @param {*} object
 * @return {boolean}
 */
function isFormData(object) {
	return (
		typeof object === 'object' &&
		typeof object.append === 'function' &&
		typeof object.set === 'function' &&
		typeof object.get === 'function' &&
		typeof object.getAll === 'function' &&
		typeof object.delete === 'function' &&
		typeof object.keys === 'function' &&
		typeof object.values === 'function' &&
		typeof object.entries === 'function' &&
		typeof object.constructor === 'function' &&
		object[NAME] === 'FormData'
	);
}

/**
 * Check if `obj` is an instance of AbortSignal.
 *
 * @param  {*} obj
 * @return {boolean}
 */
const isAbortSignal = object => {
	return (
		typeof object === 'object' &&
		object[NAME] === 'AbortSignal'
	);
};

const carriage = '\r\n';
const dashes = '-'.repeat(2);
const carriageLength = Buffer.byteLength(carriage);

/**
 * @param {string} boundary
 */
const getFooter = boundary => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;

/**
 * @param {string} boundary
 * @param {string} name
 * @param {*} field
 *
 * @return {string}
 */
function getHeader(boundary, name, field) {
	let header = '';

	header += `${dashes}${boundary}${carriage}`;
	header += `Content-Disposition: form-data; name="${name}"`;

	if (isBlob(field)) {
		header += `; filename="${field.name}"${carriage}`;
		header += `Content-Type: ${field.type || 'application/octet-stream'}`;
	}

	return `${header}${carriage.repeat(2)}`;
}

/**
 * @return {string}
 */
const getBoundary = () => randomBytes(8).toString('hex');

/**
 * @param {FormData} form
 * @param {string} boundary
 */
async function * formDataIterator(form, boundary) {
	for (const [name, value] of form) {
		yield getHeader(boundary, name, value);

		if (isBlob(value)) {
			yield * value.stream();
		} else {
			yield value;
		}

		yield carriage;
	}

	yield getFooter(boundary);
}

/**
 * @param {FormData} form
 * @param {string} boundary
 */
function getFormDataLength(form, boundary) {
	let length = 0;

	for (const [name, value] of form) {
		length += Buffer.byteLength(getHeader(boundary, name, value));

		if (isBlob(value)) {
			length += value.size;
		} else {
			length += Buffer.byteLength(String(value));
		}

		length += carriageLength;
	}

	length += Buffer.byteLength(getFooter(boundary));

	return length;
}

const INTERNALS$2 = Symbol('Body internals');

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Body {
	constructor(body, {
		size = 0
	} = {}) {
		let boundary = null;

		if (body === null) {
			// Body is undefined or null
			body = null;
		} else if (isURLSearchParameters(body)) {
		// Body is a URLSearchParams
			body = Buffer.from(body.toString());
		} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (types.isAnyArrayBuffer(body)) {
			// Body is ArrayBuffer
			body = Buffer.from(body);
		} else if (ArrayBuffer.isView(body)) {
			// Body is ArrayBufferView
			body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
		} else if (body instanceof Stream) ; else if (isFormData(body)) {
			// Body is an instance of formdata-node
			boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
			body = Stream.Readable.from(formDataIterator(body, boundary));
		} else {
			// None of the above
			// coerce to string then buffer
			body = Buffer.from(String(body));
		}

		this[INTERNALS$2] = {
			body,
			boundary,
			disturbed: false,
			error: null
		};
		this.size = size;

		if (body instanceof Stream) {
			body.on('error', err => {
				const error = err instanceof FetchBaseError ?
					err :
					new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, 'system', err);
				this[INTERNALS$2].error = error;
			});
		}
	}

	get body() {
		return this[INTERNALS$2].body;
	}

	get bodyUsed() {
		return this[INTERNALS$2].disturbed;
	}

	/**
	 * Decode response as ArrayBuffer
	 *
	 * @return  Promise
	 */
	async arrayBuffer() {
		const {buffer, byteOffset, byteLength} = await consumeBody(this);
		return buffer.slice(byteOffset, byteOffset + byteLength);
	}

	/**
	 * Return raw response as Blob
	 *
	 * @return Promise
	 */
	async blob() {
		const ct = (this.headers && this.headers.get('content-type')) || (this[INTERNALS$2].body && this[INTERNALS$2].body.type) || '';
		const buf = await this.buffer();

		return new fetchBlob([buf], {
			type: ct
		});
	}

	/**
	 * Decode response as json
	 *
	 * @return  Promise
	 */
	async json() {
		const buffer = await consumeBody(this);
		return JSON.parse(buffer.toString());
	}

	/**
	 * Decode response as text
	 *
	 * @return  Promise
	 */
	async text() {
		const buffer = await consumeBody(this);
		return buffer.toString();
	}

	/**
	 * Decode response as buffer (non-spec api)
	 *
	 * @return  Promise
	 */
	buffer() {
		return consumeBody(this);
	}
}

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: {enumerable: true},
	bodyUsed: {enumerable: true},
	arrayBuffer: {enumerable: true},
	blob: {enumerable: true},
	json: {enumerable: true},
	text: {enumerable: true}
});

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return Promise
 */
async function consumeBody(data) {
	if (data[INTERNALS$2].disturbed) {
		throw new TypeError(`body used already for: ${data.url}`);
	}

	data[INTERNALS$2].disturbed = true;

	if (data[INTERNALS$2].error) {
		throw data[INTERNALS$2].error;
	}

	let {body} = data;

	// Body is null
	if (body === null) {
		return Buffer.alloc(0);
	}

	// Body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// Body is buffer
	if (Buffer.isBuffer(body)) {
		return body;
	}

	/* c8 ignore next 3 */
	if (!(body instanceof Stream)) {
		return Buffer.alloc(0);
	}

	// Body is stream
	// get ready to actually consume the body
	const accum = [];
	let accumBytes = 0;

	try {
		for await (const chunk of body) {
			if (data.size > 0 && accumBytes + chunk.length > data.size) {
				const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, 'max-size');
				body.destroy(err);
				throw err;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		}
	} catch (error) {
		if (error instanceof FetchBaseError) {
			throw error;
		} else {
			// Other errors, such as incorrect content-encoding
			throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, 'system', error);
		}
	}

	if (body.readableEnded === true || body._readableState.ended === true) {
		try {
			if (accum.every(c => typeof c === 'string')) {
				return Buffer.from(accum.join(''));
			}

			return Buffer.concat(accum, accumBytes);
		} catch (error) {
			throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, 'system', error);
		}
	} else {
		throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
	}
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed   instance       Response or Request instance
 * @param   String  highWaterMark  highWaterMark for both PassThrough body streams
 * @return  Mixed
 */
const clone = (instance, highWaterMark) => {
	let p1;
	let p2;
	let {body} = instance;

	// Don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// Check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if ((body instanceof Stream) && (typeof body.getBoundary !== 'function')) {
		// Tee instance body
		p1 = new PassThrough({highWaterMark});
		p2 = new PassThrough({highWaterMark});
		body.pipe(p1);
		body.pipe(p2);
		// Set instance body to teed body and return the other teed body
		instance[INTERNALS$2].body = p1;
		body = p2;
	}

	return body;
};

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param {any} body Any options.body input
 * @returns {string | null}
 */
const extractContentType = (body, request) => {
	// Body is null or undefined
	if (body === null) {
		return null;
	}

	// Body is string
	if (typeof body === 'string') {
		return 'text/plain;charset=UTF-8';
	}

	// Body is a URLSearchParams
	if (isURLSearchParameters(body)) {
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	}

	// Body is blob
	if (isBlob(body)) {
		return body.type || null;
	}

	// Body is a Buffer (Buffer, ArrayBuffer or ArrayBufferView)
	if (Buffer.isBuffer(body) || types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
		return null;
	}

	// Detect form data input from form-data module
	if (body && typeof body.getBoundary === 'function') {
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	}

	if (isFormData(body)) {
		return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
	}

	// Body is stream - can't really do much about this
	if (body instanceof Stream) {
		return null;
	}

	// Body constructor defaults other things to string
	return 'text/plain;charset=UTF-8';
};

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param {any} obj.body Body object from the Body instance.
 * @returns {number | null}
 */
const getTotalBytes = request => {
	const {body} = request;

	// Body is null or undefined
	if (body === null) {
		return 0;
	}

	// Body is Blob
	if (isBlob(body)) {
		return body.size;
	}

	// Body is Buffer
	if (Buffer.isBuffer(body)) {
		return body.length;
	}

	// Detect form data input from form-data module
	if (body && typeof body.getLengthSync === 'function') {
		return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
	}

	// Body is a spec-compliant form-data
	if (isFormData(body)) {
		return getFormDataLength(request[INTERNALS$2].boundary);
	}

	// Body is stream
	return null;
};

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param {Stream.Writable} dest The stream to write to.
 * @param obj.body Body object from the Body instance.
 * @returns {void}
 */
const writeToStream = (dest, {body}) => {
	if (body === null) {
		// Body is null
		dest.end();
	} else if (isBlob(body)) {
		// Body is Blob
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// Body is buffer
		dest.write(body);
		dest.end();
	} else {
		// Body is stream
		body.pipe(dest);
	}
};

/**
 * Headers.js
 *
 * Headers class offers convenient helpers
 */

const validateHeaderName = typeof http.validateHeaderName === 'function' ?
	http.validateHeaderName :
	name => {
		if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
			const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
			Object.defineProperty(err, 'code', {value: 'ERR_INVALID_HTTP_TOKEN'});
			throw err;
		}
	};

const validateHeaderValue = typeof http.validateHeaderValue === 'function' ?
	http.validateHeaderValue :
	(name, value) => {
		if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
			const err = new TypeError(`Invalid character in header content ["${name}"]`);
			Object.defineProperty(err, 'code', {value: 'ERR_INVALID_CHAR'});
			throw err;
		}
	};

/**
 * @typedef {Headers | Record<string, string> | Iterable<readonly [string, string]> | Iterable<Iterable<string>>} HeadersInit
 */

/**
 * This Fetch API interface allows you to perform various actions on HTTP request and response headers.
 * These actions include retrieving, setting, adding to, and removing.
 * A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.
 * You can add to this using methods like append() (see Examples.)
 * In all methods of this interface, header names are matched by case-insensitive byte sequence.
 *
 */
class Headers extends URLSearchParams {
	/**
	 * Headers class
	 *
	 * @constructor
	 * @param {HeadersInit} [init] - Response headers
	 */
	constructor(init) {
		// Validate and normalize init object in [name, value(s)][]
		/** @type {string[][]} */
		let result = [];
		if (init instanceof Headers) {
			const raw = init.raw();
			for (const [name, values] of Object.entries(raw)) {
				result.push(...values.map(value => [name, value]));
			}
		} else if (init == null) ; else if (typeof init === 'object' && !types.isBoxedPrimitive(init)) {
			const method = init[Symbol.iterator];
			// eslint-disable-next-line no-eq-null, eqeqeq
			if (method == null) {
				// Record<ByteString, ByteString>
				result.push(...Object.entries(init));
			} else {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// Sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				result = [...init]
					.map(pair => {
						if (
							typeof pair !== 'object' || types.isBoxedPrimitive(pair)
						) {
							throw new TypeError('Each header pair must be an iterable object');
						}

						return [...pair];
					}).map(pair => {
						if (pair.length !== 2) {
							throw new TypeError('Each header pair must be a name/value tuple');
						}

						return [...pair];
					});
			}
		} else {
			throw new TypeError('Failed to construct \'Headers\': The provided value is not of type \'(sequence<sequence<ByteString>> or record<ByteString, ByteString>)');
		}

		// Validate and lowercase
		result =
			result.length > 0 ?
				result.map(([name, value]) => {
					validateHeaderName(name);
					validateHeaderValue(name, String(value));
					return [String(name).toLowerCase(), String(value)];
				}) :
				undefined;

		super(result);

		// Returning a Proxy that will lowercase key names, validate parameters and sort keys
		// eslint-disable-next-line no-constructor-return
		return new Proxy(this, {
			get(target, p, receiver) {
				switch (p) {
					case 'append':
					case 'set':
						return (name, value) => {
							validateHeaderName(name);
							validateHeaderValue(name, String(value));
							return URLSearchParams.prototype[p].call(
								receiver,
								String(name).toLowerCase(),
								String(value)
							);
						};

					case 'delete':
					case 'has':
					case 'getAll':
						return name => {
							validateHeaderName(name);
							return URLSearchParams.prototype[p].call(
								receiver,
								String(name).toLowerCase()
							);
						};

					case 'keys':
						return () => {
							target.sort();
							return new Set(URLSearchParams.prototype.keys.call(target)).keys();
						};

					default:
						return Reflect.get(target, p, receiver);
				}
			}
			/* c8 ignore next */
		});
	}

	get [Symbol.toStringTag]() {
		return this.constructor.name;
	}

	toString() {
		return Object.prototype.toString.call(this);
	}

	get(name) {
		const values = this.getAll(name);
		if (values.length === 0) {
			return null;
		}

		let value = values.join(', ');
		if (/^content-encoding$/i.test(name)) {
			value = value.toLowerCase();
		}

		return value;
	}

	forEach(callback) {
		for (const name of this.keys()) {
			callback(this.get(name), name);
		}
	}

	* values() {
		for (const name of this.keys()) {
			yield this.get(name);
		}
	}

	/**
	 * @type {() => IterableIterator<[string, string]>}
	 */
	* entries() {
		for (const name of this.keys()) {
			yield [name, this.get(name)];
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	/**
	 * Node-fetch non-spec method
	 * returning all headers and their values as array
	 * @returns {Record<string, string[]>}
	 */
	raw() {
		return [...this.keys()].reduce((result, key) => {
			result[key] = this.getAll(key);
			return result;
		}, {});
	}

	/**
	 * For better console.log(headers) and also to convert Headers into Node.js Request compatible format
	 */
	[Symbol.for('nodejs.util.inspect.custom')]() {
		return [...this.keys()].reduce((result, key) => {
			const values = this.getAll(key);
			// Http.request() only supports string as Host header.
			// This hack makes specifying custom Host header possible.
			if (key === 'host') {
				result[key] = values[0];
			} else {
				result[key] = values.length > 1 ? values : values[0];
			}

			return result;
		}, {});
	}
}

/**
 * Re-shaping object for Web IDL tests
 * Only need to do it for overridden methods
 */
Object.defineProperties(
	Headers.prototype,
	['get', 'entries', 'forEach', 'values'].reduce((result, property) => {
		result[property] = {enumerable: true};
		return result;
	}, {})
);

/**
 * Create a Headers object from an http.IncomingMessage.rawHeaders, ignoring those that do
 * not conform to HTTP grammar productions.
 * @param {import('http').IncomingMessage['rawHeaders']} headers
 */
function fromRawHeaders(headers = []) {
	return new Headers(
		headers
			// Split into pairs
			.reduce((result, value, index, array) => {
				if (index % 2 === 0) {
					result.push(array.slice(index, index + 2));
				}

				return result;
			}, [])
			.filter(([name, value]) => {
				try {
					validateHeaderName(name);
					validateHeaderValue(name, String(value));
					return true;
				} catch {
					return false;
				}
			})

	);
}

const redirectStatus = new Set([301, 302, 303, 307, 308]);

/**
 * Redirect code matching
 *
 * @param {number} code - Status code
 * @return {boolean}
 */
const isRedirect = code => {
	return redirectStatus.has(code);
};

/**
 * Response.js
 *
 * Response class provides content decoding
 */

const INTERNALS$1 = Symbol('Response internals');

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response extends Body {
	constructor(body = null, options = {}) {
		super(body, options);

		const status = options.status || 200;
		const headers = new Headers(options.headers);

		if (body !== null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: options.url,
			status,
			statusText: options.statusText || '',
			headers,
			counter: options.counter,
			highWaterMark: options.highWaterMark
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
	 * Convenience property representing if the request ended normally
	 */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	get highWaterMark() {
		return this[INTERNALS$1].highWaterMark;
	}

	/**
	 * Clone this response
	 *
	 * @return  Response
	 */
	clone() {
		return new Response(clone(this, this.highWaterMark), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected,
			size: this.size
		});
	}

	/**
	 * @param {string} url    The URL that the new response is to originate from.
	 * @param {number} status An optional status code for the response (e.g., 302.)
	 * @returns {Response}    A Response object.
	 */
	static redirect(url, status = 302) {
		if (!isRedirect(status)) {
			throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
		}

		return new Response(null, {
			headers: {
				location: new URL(url).toString()
			},
			status
		});
	}

	get [Symbol.toStringTag]() {
		return 'Response';
	}
}

Object.defineProperties(Response.prototype, {
	url: {enumerable: true},
	status: {enumerable: true},
	ok: {enumerable: true},
	redirected: {enumerable: true},
	statusText: {enumerable: true},
	headers: {enumerable: true},
	clone: {enumerable: true}
});

const getSearch = parsedURL => {
	if (parsedURL.search) {
		return parsedURL.search;
	}

	const lastOffset = parsedURL.href.length - 1;
	const hash = parsedURL.hash || (parsedURL.href[lastOffset] === '#' ? '#' : '');
	return parsedURL.href[lastOffset - hash.length] === '?' ? '?' : '';
};

const INTERNALS = Symbol('Request internals');

/**
 * Check if `obj` is an instance of Request.
 *
 * @param  {*} obj
 * @return {boolean}
 */
const isRequest = object => {
	return (
		typeof object === 'object' &&
		typeof object[INTERNALS] === 'object'
	);
};

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request extends Body {
	constructor(input, init = {}) {
		let parsedURL;

		// Normalize input and force URL to be encoded as UTF-8 (https://github.com/node-fetch/node-fetch/issues/245)
		if (isRequest(input)) {
			parsedURL = new URL(input.url);
		} else {
			parsedURL = new URL(input);
			input = {};
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		// eslint-disable-next-line no-eq-null, eqeqeq
		if (((init.body != null || isRequest(input)) && input.body !== null) &&
			(method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		const inputBody = init.body ?
			init.body :
			(isRequest(input) && input.body !== null ?
				clone(input) :
				null);

		super(inputBody, {
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody !== null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody, this);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ?
			input.signal :
			null;
		if ('signal' in init) {
			signal = init.signal;
		}

		if (signal !== null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// Node-fetch-only options
		this.follow = init.follow === undefined ? (input.follow === undefined ? 20 : input.follow) : init.follow;
		this.compress = init.compress === undefined ? (input.compress === undefined ? true : input.compress) : init.compress;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
		this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
		this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;
	}

	get method() {
		return this[INTERNALS].method;
	}

	get url() {
		return format$1(this[INTERNALS].parsedURL);
	}

	get headers() {
		return this[INTERNALS].headers;
	}

	get redirect() {
		return this[INTERNALS].redirect;
	}

	get signal() {
		return this[INTERNALS].signal;
	}

	/**
	 * Clone this request
	 *
	 * @return  Request
	 */
	clone() {
		return new Request(this);
	}

	get [Symbol.toStringTag]() {
		return 'Request';
	}
}

Object.defineProperties(Request.prototype, {
	method: {enumerable: true},
	url: {enumerable: true},
	headers: {enumerable: true},
	redirect: {enumerable: true},
	clone: {enumerable: true},
	signal: {enumerable: true}
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
const getNodeRequestOptions = request => {
	const {parsedURL} = request[INTERNALS];
	const headers = new Headers(request[INTERNALS].headers);

	// Fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body === null && /^(post|put)$/i.test(request.method)) {
		contentLengthValue = '0';
	}

	if (request.body !== null) {
		const totalBytes = getTotalBytes(request);
		// Set Content-Length if totalBytes is a number (that is not NaN)
		if (typeof totalBytes === 'number' && !Number.isNaN(totalBytes)) {
			contentLengthValue = String(totalBytes);
		}
	}

	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate,br');
	}

	let {agent} = request;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	const search = getSearch(parsedURL);

	// Manually spread the URL object instead of spread syntax
	const requestOptions = {
		path: parsedURL.pathname + search,
		pathname: parsedURL.pathname,
		hostname: parsedURL.hostname,
		protocol: parsedURL.protocol,
		port: parsedURL.port,
		hash: parsedURL.hash,
		search: parsedURL.search,
		query: parsedURL.query,
		href: parsedURL.href,
		method: request.method,
		headers: headers[Symbol.for('nodejs.util.inspect.custom')](),
		insecureHTTPParser: request.insecureHTTPParser,
		agent
	};

	return requestOptions;
};

/**
 * AbortError interface for cancelled requests
 */
class AbortError extends FetchBaseError {
	constructor(message, type = 'aborted') {
		super(message, type);
	}
}

/**
 * Index.js
 *
 * a request API compatible with window.fetch
 *
 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
 */

const supportedSchemas = new Set(['data:', 'http:', 'https:']);

/**
 * Fetch function
 *
 * @param   {string | URL | import('./request').default} url - Absolute url or Request instance
 * @param   {*} [options_] - Fetch options
 * @return  {Promise<import('./response').default>}
 */
async function fetch(url, options_) {
	return new Promise((resolve, reject) => {
		// Build request object
		const request = new Request(url, options_);
		const options = getNodeRequestOptions(request);
		if (!supportedSchemas.has(options.protocol)) {
			throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options.protocol.replace(/:$/, '')}" is not supported.`);
		}

		if (options.protocol === 'data:') {
			const data = src(request.url);
			const response = new Response(data, {headers: {'Content-Type': data.typeFull}});
			resolve(response);
			return;
		}

		// Wrap http.request into fetch
		const send = (options.protocol === 'https:' ? https : http).request;
		const {signal} = request;
		let response = null;

		const abort = () => {
			const error = new AbortError('The operation was aborted.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}

			if (!response || !response.body) {
				return;
			}

			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = () => {
			abort();
			finalize();
		};

		// Send request
		const request_ = send(options);

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		const finalize = () => {
			request_.abort();
			if (signal) {
				signal.removeEventListener('abort', abortAndFinalize);
			}
		};

		request_.on('error', err => {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		request_.on('response', response_ => {
			request_.setTimeout(0);
			const headers = fromRawHeaders(response_.rawHeaders);

			// HTTP fetch step 5
			if (isRedirect(response_.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : new URL(location, request.url);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// Node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// Handle corrupted header
							try {
								headers.set('Location', locationURL);
								/* c8 ignore next 3 */
							} catch (error) {
								reject(error);
							}
						}

						break;
					case 'follow': {
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOptions = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (response_.statusCode !== 303 && request.body && options_.body instanceof Stream.Readable) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (response_.statusCode === 303 || ((response_.statusCode === 301 || response_.statusCode === 302) && request.method === 'POST')) {
							requestOptions.method = 'GET';
							requestOptions.body = undefined;
							requestOptions.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOptions)));
						finalize();
						return;
					}
					// Do nothing
				}
			}

			// Prepare response
			response_.once('end', () => {
				if (signal) {
					signal.removeEventListener('abort', abortAndFinalize);
				}
			});

			let body = pipeline(response_, new PassThrough(), error => {
				reject(error);
			});
			// see https://github.com/nodejs/node/pull/29376
			if (process.version < 'v12.10') {
				response_.on('aborted', abortAndFinalize);
			}

			const responseOptions = {
				url: request.url,
				status: response_.statusCode,
				statusText: response_.statusMessage,
				headers,
				size: request.size,
				counter: request.counter,
				highWaterMark: request.highWaterMark
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// For gzip
			if (codings === 'gzip' || codings === 'x-gzip') {
				body = pipeline(body, zlib.createGunzip(zlibOptions), error => {
					reject(error);
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// For deflate
			if (codings === 'deflate' || codings === 'x-deflate') {
				// Handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = pipeline(response_, new PassThrough(), error => {
					reject(error);
				});
				raw.once('data', chunk => {
					// See http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = pipeline(body, zlib.createInflate(), error => {
							reject(error);
						});
					} else {
						body = pipeline(body, zlib.createInflateRaw(), error => {
							reject(error);
						});
					}

					response = new Response(body, responseOptions);
					resolve(response);
				});
				return;
			}

			// For br
			if (codings === 'br') {
				body = pipeline(body, zlib.createBrotliDecompress(), error => {
					reject(error);
				});
				response = new Response(body, responseOptions);
				resolve(response);
				return;
			}

			// Otherwise, use response as-is
			response = new Response(body, responseOptions);
			resolve(response);
		});

		writeToStream(request_, request);
	});
}

// @ts-nocheck

globalThis.fetch = fetch;
globalThis.Response = Response;
globalThis.Request = Request;
globalThis.Headers = Headers;

// App is a dynamic file built from the application layer.

const __dirname = dirname(fileURLToPath(import.meta.url));
const noop_handler = (_req, _res, next) => next();
const paths = {
	assets: join(__dirname, '/assets'),
	prerendered: join(__dirname, '/prerendered')
};

function createServer({ render }) {
	const mutable = (dir) =>
		sirv(dir, {
			etag: true,
			maxAge: 0
		});

	const prerendered_handler = fs__default.existsSync(paths.prerendered)
		? mutable(paths.prerendered)
		: noop_handler;

	const assets_handler = fs__default.existsSync(paths.assets)
		? sirv(paths.assets, {
				maxAge: 31536000,
				immutable: true
		  })
		: noop_handler;

	const server = polka().use(
		compression_1({ threshold: 0 }),
		assets_handler,
		prerendered_handler,
		async (req, res) => {
			const parsed = new URL(req.url || '', 'http://localhost');
			const rendered = await render({
				method: req.method,
				headers: req.headers, // TODO: what about repeated headers, i.e. string[]
				path: parsed.pathname,
				rawBody: await getRawBody(req),
				query: parsed.searchParams
			});

			if (rendered) {
				res.writeHead(rendered.status, rendered.headers);
				res.end(rendered.body);
			} else {
				res.statusCode = 404;
				res.end('Not found');
			}
		}
	);

	return server;
}

const { HOST = '0.0.0.0', PORT = 3000 } = process.env;

const instance = createServer({ render: app.render }).listen(PORT, HOST, (err) => {
	if (err) {
		console.log('error', err);
	} else {
		console.log(`Listening on port ${PORT}`);
	}
});

export { instance };
//# sourceMappingURL=server.js.map
