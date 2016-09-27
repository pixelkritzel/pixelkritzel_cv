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
};