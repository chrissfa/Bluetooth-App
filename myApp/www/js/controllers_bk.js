angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $timeout, $http, $cordovaDialogs, $cordovaBLE, $ionicPlatform, $localstorage) {



  $scope.startBtScan = function(){
            $scope.bluetoothCollect = [];
            ble.startScan([],

            function(device){ // found a device
              console.log('found smin = '+device.name+' -- found id smin = '+device.id);
              for (var i = 0; i < $scope.beacons.length; i++) {
                // Does this device match list of our beacons?
                if($scope.beacons[i] == device.id){ // found one of our beacons!!! -- logic goes here...

                  console.log('found our beacon!');
                  
                  // add to list of 'connected items' - so we can delete if stop being found 
                  $scope.bluetoothCollect.push(device);
            
                }
              };
                
            }, 
            function(){ // failure

              // doesn't matter?
            });

            $timeout(function(){
                     console.log('intimeout');
                $scope.stopBtScan();
            },5000);          

  };

  $scope.stopBtScan = function(){
            
                  ble.stopScan(
                      function() { 

                        // sort data here, then start scan again
                        console.log('stopping scan, bluetooth list = '+$scope.bluetooth);

                        if($scope.bluetoothCollect.length > 0){
                          $scope.bluetooth = [];
                          $scope.bluetooth = $scope.bluetoothCollect;
                          $scope.user.newValue = true;
                        }
                        else {
                          $scope.bluetooth = [];
                          $scope.user.newValue = false;
                        }
                        $scope.$apply();

                               
                               console.log('bab = '+$scope.officePerson.present);
                        if($scope.officePerson.present !== $scope.user.newValue){ // if these aren't the same then we need to update the DB.

                              $http.post('http://192.168.2.78:3000/api/office', $scope.user)
                                  .success(function(data) {
                                     
                                      console.log(data);
                             
                                      $scope.officePerson = data;
                                  })
                                  .error(function(data) {
                                      console.log('Error: ' + data);
                                  });



                        }
                        $scope.startBtScan();
                      },
                      function() { console.log("stopScan failed"); }
                  );

  };


  $ionicPlatform.ready(function() { // scan for BLE

                           
          $scope.bluetooth = [
                              {"advertising":{},"id":"C1:BE:84:E5:18:8D","rssi":-0,"name":"Fake-Bean"},
                              {"advertising":{},"id":"C2:BE:84:E5:18:8D","rssi":-0,"name":"Fake-Bean"}
                            ];
          
          $scope.user = {'name' : '', 'newValue' : false}; // setup user info
          
          $http.get('http://192.168.2.78:3000/api/officesingle')
              .success(function(data) {
                       
                       console.log('data loko = '+data.present);
                       $scope.officePerson = data;
                      
                       $scope.user.newValue = data.present; // get latest 'present' value ready for comparison
                       
                       })
              .error(function(data) {
                     console.log('Error reading db: ' + data);
                     });
              
              
          
          $scope.user.name = $localstorage.get('name', '...'); // store name, if nothing entered yet remind user to enter name
          
          
          
          $scope.beacons = ["C4:BE:84:E5:18:8D", "8E24A717-78D9-8CF7-E728-E7F674FF4ED4"]; // list of beacons that should be available
          
          $scope.bluetoothCollect = [];
                           
                           
          $cordovaBLE.isEnabled().then(

            function() {
             
                $scope.startBtScan();

            },

            function() {
                $scope.user.newValue = false; // set by default - changes if Alloy beacon detected
                $cordovaDialogs.alert("Bluetooth LE is NOT enabled", "Bluetooth LE", "Oops!");
            }
          
          );


          $scope.confirmName = function(){ // pressing submit confirms the name

            console.log('NAME IS.... = '+$scope.user.name);
            $localstorage.set('name', $scope.user.name);
          };

  });



})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
