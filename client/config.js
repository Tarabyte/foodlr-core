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
      'angular-file-upload': 'vendor/angular-file-upload/angular-file-upload',
      textAngular: 'vendor/textAngular/dist/textAngular.min',
      rangy: 'vendor/textAngular/dist/textAngular-rangy.min',

      lbServices: 'src/lb-services',

      growl: 'vendor/angular-growl-v2/build/angular-growl',

      dropdown: 'vendor/bootstrap/js/dropdown'
    },
    name: 'main',
    shim: {
      angular: {deps: jq, exports: 'angular'},

      ngMessages: ng,
      ngResource: ng,
      ngSanitize: ng,

      'ui.router': ng,
      'ui.select': ng,
      textAngular: ng.concat(['ngSanitize', 'rangy']),

      lbServices: ng.concat(['ngResource']),

      growl: ng,

      dropdown: jq
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = config;
  }
}(Function('return this;')()));
