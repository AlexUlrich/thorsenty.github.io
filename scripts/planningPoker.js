(function(window, angular, undefined) {

  var firebase = new Firebase("https://sweltering-torch-73.firebaseio.com/");

  angular.module('thorsent', ['ngRoute', 'ngMaterial', 'firebase'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/', {
          controller: 'LandingCtrl',
          templateUrl: '/planning-poker/landing.html'
        })
        .when('/:roomId/', {
          controller: 'RoomCtrl',
          templateUrl: '/planning-poker/room.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    }])

    .factory('Room', ['$firebase', function($firebase) {
      return function(roomId) {
        var ref = firebase.child('rooms').child(roomId);
        return $firebase(ref).$asObject();
      };
    }])

    .factory('RoomHelper', ['$q', function($q) {
      return {
        checkIfRoomExists: function(roomId) {
          var deferred = $q.defer();

          firebase.child('rooms').child(roomId).once('value', function(snapshot) {
            exists = (snapshot.val() !== null);
            deferred.resolve(exists);
          });

          return deferred.promise;
        },

        randomRoomId: function() {
          return Math.floor((Math.random() * 99900000) + 100000).toString();
        }
      };
    }])

    .controller("LandingCtrl", ["$scope", "$location", "$firebase", "RoomHelper", function($scope, $location, $firebase, RoomHelper) {
      
      var fb_rooms = $firebase(firebase.child('rooms'));

      $scope.joinRoom = function() {
        $location.path("/"+$scope.roomId);
      };

      $scope.newRoom = function() {
        var newRoomId = RoomHelper.randomRoomId();
        var fb_newRoom = $firebase(firebase.child('rooms').child(newRoomId));
        fb_newRoom.$set({roomId: newRoomId});
        $location.path("/"+newRoomId);
      };
    }])

    .controller("RoomCtrl", ["$scope", "$routeParams", "$location", "Room", "RoomHelper", function($scope, $routeParams, $location, Room, RoomHelper) {
      var roomId = $routeParams.roomId;
      RoomHelper.checkIfRoomExists(roomId).then(function(exists) {
        if (exists) {
          $scope.room = Room(roomId);
        } else {
          $location.path("/");
        }
      });
    }]);

  function checkIfRoomExists(roomId) {
    var exists = false;
    return firebase.child('rooms').child(roomId).once('value', function(snapshot) {
      exists = (snapshot.val() !== null);
    });
  }

})(window, window.angular);
