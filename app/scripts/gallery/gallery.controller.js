(function () {
  'use strict';

  /** @ngInject */
  angular
    .module('app.gallery')
    .controller('GalleryController', GalleryController);

  GalleryController.$inject = [
    '$q', 'CONFIG', '$rootScope',
    'preloaderService', 'trackGAEvents',
    'siActivityIndicator', '$state',
    '$timeout'
  ];

  function GalleryController(
    $q, CONFIG, $rootScope,
    preloader, GA,
    siAi, $state, $t
  ){
    var vm = this;
    vm.app = new Shake({
      threshold: 5,
      timeout: 0
    });
    vm.initialized = false;

    ion.sound({
      sounds: [
        {name: 'beer_can_opening'},
        {name: 'bell_ring'}
      ],
      volume: 0.5,
      path: 'assets/audios/',
      preload: true,
      ready_callback: function (obj) {
      }
    });

    // Start listening to shake event
    vm.app.start();

    // 'preload' object that holds
    // defs map and promises array.
    // ADD any promise to preload.promises
    // array that should be fulfilled while
    // preload is animating.
    var preload = {
      'defs': {}
    };

    preload.promises = [
      (preload.defs.images = $q.defer()).promise
    ];

    // Start SI ActivityIndicator;
    siAi.start();

    // Pass image list to preloadService
    // with 'preload.defs.images.resolve' as callback.
    preloader.bind(
      CONFIG.preload.galleryImages,
      {
        'complete': preload.defs.images.resolve
      }
    );
    
    // When all preload promises are resolved
    $q.all(preload.promises)
      .then(function() {
        // Tracking only load for GA 
        // in EA we dont track it as Origin
        // takes care of that
        GA.record('[Load]');
        siAi.stop();
      });

    vm.init = function (){
      ion.sound.play('beer_can_opening');
      vm.initialized = true;

      window.addEventListener('shake', function(){
        $('.gallery').removeClass('animated shake');
        $('.gallery').css('background-color', '#'+Math.floor(Math.random()*16777215).toString(16));
        
        setTimeout(function(){ 
          $('.gallery').addClass('animated shake');
          ion.sound.play('bell_ring');
        }, 10);
        }, false);
    };

    vm.playSound = function(){
      ion.sound.play('bell_ring');
    };
  }

})();
