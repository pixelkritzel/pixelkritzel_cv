const Handlebars = require('handlebars');
const marked = require('marked');
const markedRenderer = new marked.Renderer();

markedRenderer.paragraph = function (text) {
  return text;
};

marked.setOptions({
  renderer: markedRenderer,
});

module.exports = () => {
  Handlebars.registerHelper('iterateObject', function (title, context, options) {
    var HTML = '';
    const field = context[title];
    const keys = Object.keys(field);
    const indexOfTitle = keys.indexOf('title');
    keys.splice(indexOfTitle, 1);
    const isYears = keys.every((key) => key.match(/(\d{4}(\s*-\s*\d{4})*)/));
    const sortedKeys = keys.sort((a, b) => b.substring(0, 4) - a.substring(0, 4));
    sortedKeys.forEach((key) => {
      if (field.hasOwnProperty(key)) {
        if (Array.isArray(field[key])) {
          HTML += options.inverse({ key, arr: field[key] });
        } else {
          HTML += options.fn({ key, value: field[key] });
        }
      }
    });
    return HTML;
  });

  Handlebars.registerHelper('m', function (text, options) {
    return options.fn ? marked(options.fn()) : marked(text);
  });

  Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {
    if (arguments.length < 3) throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || '==';

    var operators = {
      '==': function (l, r) {
        return l == r;
      },
      '===': function (l, r) {
        return l === r;
      },
      '!=': function (l, r) {
        return l != r;
      },
      '<': function (l, r) {
        return l < r;
      },
      '>': function (l, r) {
        return l > r;
      },
      '<=': function (l, r) {
        return l <= r;
      },
      '>=': function (l, r) {
        return l >= r;
      },
      typeof: function (l, r) {
        return typeof l == r;
      },
    };

    if (!operators[operator])
      throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

    var result = operators[operator](lvalue, rvalue);

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('debug', function (optionalValue) {
    console.log('Current Context');
    console.log('====================');
    console.log(this);

    if (optionalValue) {
      console.log('Value');
      console.log('====================');
      console.log(optionalValue);
    }
  });

  Handlebars.registerHelper('formatYears', function (start, end) {
    return start === end ? start : start + ' - ' + end;
  });

  Handlebars.registerHelper('byLanguage', function (language, german, english) {
    return language === 'de' ? german : english;
  });
};
