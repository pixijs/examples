/* */ 
var $ = require('./$'),
    $def = require('./$.def'),
    core = $.core,
    formatRegExp = /\b\w\w?\b/g,
    flexioRegExp = /:(.*)\|(.*)$/,
    locales = {},
    current = 'en',
    SECONDS = 'Seconds',
    MINUTES = 'Minutes',
    HOURS = 'Hours',
    DATE = 'Date',
    MONTH = 'Month',
    YEAR = 'FullYear';
function lz(num) {
  return num > 9 ? num : '0' + num;
}
function createFormat(prefix) {
  return function(template, locale) {
    var that = this,
        dict = locales[$.has(locales, locale) ? locale : current];
    function get(unit) {
      return that[prefix + unit]();
    }
    return String(template).replace(formatRegExp, function(part) {
      switch (part) {
        case 's':
          return get(SECONDS);
        case 'ss':
          return lz(get(SECONDS));
        case 'm':
          return get(MINUTES);
        case 'mm':
          return lz(get(MINUTES));
        case 'h':
          return get(HOURS);
        case 'hh':
          return lz(get(HOURS));
        case 'D':
          return get(DATE);
        case 'DD':
          return lz(get(DATE));
        case 'W':
          return dict[0][get('Day')];
        case 'N':
          return get(MONTH) + 1;
        case 'NN':
          return lz(get(MONTH) + 1);
        case 'M':
          return dict[2][get(MONTH)];
        case 'MM':
          return dict[1][get(MONTH)];
        case 'Y':
          return get(YEAR);
        case 'YY':
          return lz(get(YEAR) % 100);
      }
      return part;
    });
  };
}
function addLocale(lang, locale) {
  function split(index) {
    var result = [];
    $.each.call(locale.months.split(','), function(it) {
      result.push(it.replace(flexioRegExp, '$' + index));
    });
    return result;
  }
  locales[lang] = [locale.weekdays.split(','), split(1), split(2)];
  return core;
}
$def($def.P + $def.F, DATE, {
  format: createFormat('get'),
  formatUTC: createFormat('getUTC')
});
addLocale(current, {
  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
  months: 'January,February,March,April,May,June,July,August,September,October,November,December'
});
addLocale('ru', {
  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' + 'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
});
core.locale = function(locale) {
  return $.has(locales, locale) ? current = locale : current;
};
core.addLocale = addLocale;
