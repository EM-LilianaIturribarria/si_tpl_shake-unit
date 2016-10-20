(function () {
  'use strict';

  angular
    .module('app.common')
    .directive('siSbVideo', siSbVideo);

  siSbVideo.$inject = [
    '$timeout', '$sbPlayer',
    '$q', 'CONFIG',
    'trackEAEvents'
  ];

  /** @ngInject */
  function siSbVideo(
    $timeout, $sbPlayer,
    $q, CONFIG, EA
  ) {

    return {

      restrict: 'E', // [A]ttribute,[E]lement,[C]lass
      templateUrl: 'scripts/common/directives/sb-video/sb-video.html',
      controller: 'SbVideoController',
      controllerAs: 'vm',
      replace: true,
      link: link,
      scope : {
        video : '=',
        api: '='
      }
    };

    function link(scope, element, attrs) {
      var vm = scope;
      vm.first = true;
      var api = scope.api;
      vm.siVideo = null;
      vm.videoId = vm.video.widget + '_' + vm.video.id;
      vm.settings = {
        'sbFeed' : {
          'partnerId' : '515',
          'cname' : 'si-general',
          'type' : vm.video.type,
          'contentId' : vm.video.id
        },
        'style' : vm.video.size,
        'override' : {
          'clip' : {}
        }
      };
      vm.video.thumbs = null;
      scope.activeThumb = 0;
      var def = $q.defer();
      var ready = $q.defer();

      angular.extend(api,{
        'onVideoReady' : function(callback) {
          ready.promise.finally(callback);
          return this;
        },
        'play' : function() {
          $timeout(vm.siVideo.play, 0);
          return this;
        }
      });

      // Insert Origin AdId if needed
      if(CONFIG.analytics.ea !== null){

        vm.settings.override = {
          'originAdId': CONFIG.analytics.ea.id,
          'clip': {}
        };
      }

      // Override Autoplay if requested
      if(typeof vm.video.autoplay !== 'undefined'){
        vm.settings.override.clip.autoPlay = vm.video.autoplay;
      }

      vm.init = function(){
        // Create Video
        vm.siVideo = $sbPlayer(vm.videoId, vm.settings);

        // Catch Events

        // On Load
        vm.siVideo.onLoad(function(){
          var self = this;
          vm.video.thumbs = vm.video.thumbnails ? self.getActivePlaylist() : null;

          // Override Mute if requested
          if(typeof vm.video.muted !== 'undefined'){

            if(vm.video.muted){
              self.mute();
            }else{
              self.unmute();
            }
          }

          // Override Video Quality
          if(typeof vm.video.quality !== 'undefined'){
            var quality = self.getSbVideoQuality();

            if(vm.video.quality === 'hd' && !quality){
              $timeout(self.qualityToggle, 500);
            }else if(vm.video.quality === 'sd' && quality){
              $timeout(self.qualityToggle, 500);
            }
          }

          $timeout(function(){
            api.callback();
          }, 50);

          vm.$apply();
        });

        vm.siVideo.onPause(function(){
          EA.record('SB Video', 'Pause');
        });

        vm.siVideo.onVP25(function(){
          EA.record('SB Video', 'VP_25');
        });
        vm.siVideo.onVP50(function(){
          EA.record('SB Video', 'VP_50');
        });
        vm.siVideo.onVP75(function(){
          EA.record('SB Video', 'VP_75');
        });

        vm.siVideo.onEnd(function(){
          var self = this;
          var ended = false;
          EA.record('SB Video', 'Finish');

          if(vm.video.type === 'playlist'){
            if((self.getActiveIndex() + 1) === vm.video.thumbs.length){
              ended = true;
            }else{
              scope.activeThumb = (self.getActiveIndex() + 1);
              scope.$apply();
            }
          }else{
            ended = true;
          }

          if(ended){
            def.resolve();

            if(vm.api){
              vm.api.onComplete();
            }
          }
        });

        vm.siVideo.onMouseOver(function(){
          EA.record('SB Video', 'Hover');
        });

        vm.siVideo.onMute(function(){
          if(!vm.first){
            EA.record('SB Video', 'Mute');
          }
        });

        vm.siVideo.onUnmute(function(){
          if(!vm.first){
            EA.record('SB Video', 'Unmute');
          }
        });

        vm.siVideo.onFullscreen(function(){
          EA.record('SB Video', 'Fullscreen');
        });

        vm.siVideo.onResume(function(){
          if(vm.first){
            EA.record('SB Video', 'Start');
          }else{
            EA.record('SB Video', 'Resume');
          }
          vm.first = false;
        });

        vm.siVideo.onSeek(function(){
          EA.record('SB Video', 'Seek');
        });

        vm.siVideo.onClick(function(){
          EA.record('SB Video', 'Click');
        });
      };

      // Everything ready? Init()
      $timeout(function(){
        vm.init();
      });

      scope.onThumbClicked = function(i){
        scope.activeThumb = i;
        vm.siVideo.play(scope.activeThumb + 1);
      };
    }
  }

})();
