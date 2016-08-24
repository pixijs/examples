/* */ 
var $ = require('./$'),
    document = $.g.document,
    isObject = $.isObject,
    is = isObject(document) && isObject(document.createElement);
module.exports = function(it) {
  return is ? document.createElement(it) : {};
};
