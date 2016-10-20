(function () {
  'use strict';

  /** @ngInject */
  angular
    .module('app.core')
    .factory('$sbPlayer', sbPlayer)
    .run(initAnalytics)
    .config(configure);

  function sbPlayer() {
    // assumes $sbPlayer has already been loaded on the page
    return window.$sbPlayer;
  }

  initAnalytics.$inject = [
    'Angularytics', 'CONFIG',
    '$location', 'OriginAPI'
  ];

  /** @ngInject */
  function initAnalytics(
    Angularytics, CONFIG,
    $location, OriginAPI
  ){
    // Override AdId if found
    var adId = $location.search().adId;

    // Init GA
    ga('create', CONFIG.analytics.ga.id);
    Angularytics.init();

    // Init EA
    if((typeof CONFIG.analytics.ea) !== 'undefined' &&
        (CONFIG.analytics.ea !== null)){

      // Init Origin API
      OriginAPI.init({
        adId : adId ? adId : CONFIG.analytics.ea.id,
        placement : CONFIG.analytics.ea.placement
      });
    }
  }

  configure.$inject = [
    '$stateProvider', '$urlRouterProvider',
    'AngularyticsProvider', '$provide'
  ];

  /** @ngInject */
  function configure(
    $stateProvider, $urlRouterProvider,
    AngularyticsProvider, $provide
  ){

    function parse(val) {
      var result = false, tmp = [];
      location.search.substr(1).split('&').forEach(function (item) {
          tmp = item.split('=');
          if(tmp[0] === val){
            result = decodeURIComponent(tmp[1]);
          }
      });
      return result;
    }

    AngularyticsProvider.setEventHandlers(['GoogleUniversal']);

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');

    // Now set up the states
    $stateProvider

      .state('gallery', {
        url: '/',
        templateUrl: 'scripts/gallery/gallery.html',
        controller: 'GalleryController',
        controllerAs: 'gallery'
      })
      .state('resolve', {
        url: '/resolve',
        templateUrl: 'scripts/resolve/resolve.html',
        controller: 'ResolveController',
        controllerAs: 'resolve'
      });

    $provide.constant('CONFIG', {

      // Set here your analytics data
      'analytics': {

        // Google Analytics
        // Don't change the id, we are always tracking internally
        // to Integration Marketing Account
        // Change the category according to the name of
        // your project
        'ga' : {
          'id': 'UA-12310597-137',
          'category':'[TEST] Mobile Overlay - Shake Unit'
        },

        // Evolve Analytics
        // For now... we can only track events sent
        // from iframes living inside origin
        // Set the id of the origin product you created
        // For placement, use overthepage for overlays,
        // or inpage
        // In case you don't need EA (standalone) set it to null
        // 'ea' :  null
        'ea': {
         'id' : 2009,
         'placement' : 'overthepage'
        }
      },

      'preload': {
        'galleryImages': [
          'assets/images/secret_life_of_pets_duke.jpg'
        ],
        'resolveImages': [
          'assets/images/angular.png'
        ]
      },

      'settings': {
        
        'gallery':{},
        'resolve': {
          'video': {
            'widget' : 'sidh101', // widget to use
            'type' : 'video', // video or playlist
            'id' : 1658647, // video or playlist id
            'size': {
              'width': '320',
              'height': '420'
            },
            'autoplay' : true,
            'muted': false,
            'thumbnails' : false,
            'quality': 'sd'
          }
        }
      }

    });
  }

})();
