const Handlebars = require('handlebars');
const marked = require('marked');


module.exports = () => {
  Handlebars.registerHelper('iterateObject', function(title, context, options) {
    var HTML = '';
    const field = context[title];
    for (const key in field) {
      if( field.hasOwnProperty(key) && key !== 'title') {
        if (Array.isArray(field[key])) {
          HTML += options.inverse({ key, arr: field[key]});  
        } else {
          HTML += options.fn({ key, value: field[key]});
        }
      }
    }
    return HTML;
  });

  Handlebars.registerHelper('m', function(text, options) {
    return options.fn ? marked(options.fn()) : marked(text);
  });

  Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});
};