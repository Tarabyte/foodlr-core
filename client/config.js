(function(win){
  var ng = ['angular'],
      jq = ['jquery'],
      config;

  win.require = config = {
    baseUrl: '.',
    paths: {
      jquery: 'vendor/jquery/dist/jquery',
      angular: 'vendor/angular/angular',

      ngResource: 'vendor/angular-resource/angular-resource',
      ngMessages: 'vendor/angular-messages/angular-messages',
      ngSanitize: 'vendor/textAngular/dist/textAngular-sanitize.min',

      'ui.router': 'vendor/angular-ui-router/release/angular-ui-router',
      'ui.select': 'vendor/angular-ui-select/dist/select',
      'angular-file-upload': 'vendor/angular-file-upload/dist/angular-file-upload',
      textAngular: 'vendor/textAngular/dist/textAngular.umd',
      rangy: 'vendor/textAngular/dist/textAngular-rangy.min',
      'rangy/lib/rangy-selectionsaverestore': 'vendor/rangy/rangy-selectionsaverestore.min',
      'rangy/lib/rangy-core': 'vendor/rangy/rangy-core',


      growl: 'vendor/angular-growl-v2/build/angular-growl',

      dropdown: 'vendor/bootstrap/js/dropdown',

      lbServices: 'src/lb-services',
      templates: 'src/templates/templates'
    },
    name: 'main',
    shim: {
      angular: {deps: jq, exports: 'angular'},

      ngMessages: ng,
      ngResource: ng,
      ngSanitize: ng,

      'ui.router': ng,
      'ui.select': ng,
      textAngular: ng.concat(['ngSanitize']),

      'angular-file-upload': {
        deps: ng,
        exports: 'angularFileUpload'
      },

      lbServices: ng.concat(['ngResource']),

      growl: ng,

      dropdown: jq
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = config;
  }
}(Function('return this;')()));
