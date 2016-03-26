'use strict';

var esprima = require('esprima');
var gutil = require('gulp-util');
var through = require('through2');

var PluginError = gutil.PluginError;
var blockPartern = new RegExp('<!--[\\[\\(]if target (.*?)[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->', 'g');


function conditionalParser(target, expression) {
  switch (expression.type) {
    case 'LogicalExpression':
      if (expression.operator !== '||') { // we only compare one variable so && is useless
        throw new Error('Syntax not supported');
      }
      return conditionalParser(target, expression.left) || conditionalParser(target, expression.right);
    case 'UnaryExpression':
      if (expression.operator !== '!') {
        throw new Error('Syntax not supported');
      }
      return !conditionalParser(target, expression.argument);
    case 'Identifier':
      return target === expression.name;
    default:
      throw new Error('Syntax not supported');
  }
}

function processContent(content, target) {
  return new Buffer(content.replace(blockPartern, function(match, $1, $2, $3) {
    // check if it's really targeted
    if (!conditionalParser(target, esprima.parse($1).body[0].expression)) {
      return '';
    } else {
      return $3;
    }
  }));
}

module.exports = function targetHtml(target) {
  var stream = through.obj(function(file, enc, callback) {

    if (file.isNull()) {
      // Do nothing if no contents
    }

    if (file.isStream()) {
      throw new PluginError('targetHTML', 'Does not support stream content!');
    }

    if (file.isBuffer()) {
      gutil.log('[targetHTML]', 'processing', file.path);
      file.contents = processContent(file.contents.toString('utf-8'), target);
    }

    this.push(file);
    return callback();
  });

  // returning the file stream
  return stream;
};