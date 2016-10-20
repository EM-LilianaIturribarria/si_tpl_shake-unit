(function () {
  'use strict';

  /** @ngInject */
  angular
    .module('app.resolve')
    .controller('ResolveController', ResolveController);

  ResolveController.$inject = [
    'CONFIG', '$timeout', 'siActivityIndicator'
  ];

  function ResolveController(
    CONFIG, $timeout, siAi
  ){
    var vm = this;
    vm.show = true;
    vm.video = CONFIG.settings.resolve.video;
    vm.api = {
      onComplete: function(){
        $timeout(function(){
          vm.show = false;
        });
      },
      callback: function(){
        $timeout(function(){
          siAi.stop();
        });
      }
    };

    vm.playVideo = function(){
      vm.show = true;
      vm.api.play();
    };
  }

})();
