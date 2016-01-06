angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $timeout, $http, $cordovaDialogs, $cordovaBLE, $ionicPlatform, $localstorage) {



  $scope.startBtScan = function(){
                  console.log('START THE BT SCAN')
                  $scope.bluetoothCollect = [];
                  ble.startScan($scope.isAndroid ? [] : $scope.beacons,

                  function(device){ // found a device
                      console.log('device id = '+device.id+' device name = '+device.name);
                      //var adData = new Uint8Array(device.advertising)
                      //console.dir('device addata = '+adData.uuid);
                      var advertising = new Uint8Array(device.advertising);
                      console.log(JSON.stringify(advertising));

                      if($scope.isAndroid){
                          
                          for (var i = 0; i < $scope.beaconsAndroid.length; i++) {
                            // Does this device match list of our beacons?
                            if($scope.beaconsAndroid[i][0] == device.id){ // found one of our beacons!!! -- logic goes here...
                              console.log('found our beacon! RSSI = '+device.rssi);

                              // add to list of 'connected items' - so we can delete if stop being found 
                              $scope.bluetoothCollect.push(device);
                              console.log('found device now  $scope.bluetoothCollect = '+$scope.bluetoothCollect);
                            }
                          };                          
                      }
                      else { // iphone
                        $scope.bluetoothCollect.push(device); // because of $scope.beacons will only capture the beacons we want
                      }

                      
                  }, 
                  function(){ // failure
                      // doesn't matter?
                      console.log('failed to find device');
                  });
                  $timeout(function(){
                          
                      console.log('reached timeout $scope.bluetoothCollect = '+$scope.bluetoothCollect);
                      $scope.stopBtScan();

                  },5000);   
       

  };

  $scope.stopBtScan = function(){
            
                  ble.stopScan(
                      function() { 

                        // sort data here, then start scan again
                        console.log('stopping scan, bluetooth list = '+$scope.bluetooth);
                        console.log('stopping scan, bluetoothCollect = '+$scope.bluetoothCollect);
                        if($scope.bluetoothCollect.length > 0){
                          $scope.bluetooth = [];
                          $scope.bluetooth = $scope.bluetoothCollect;
                          $scope.user.newValue = true;

                          // find the closest beacon
                          var lowest;
                          for (var i = 0; i < $scope.bluetooth.length; i++) {
                            if(i == 0 || $scope.bluetooth[i].rssi > lowest.rssi){
                              lowest = $scope.bluetooth[i]; // lowest device object
                              console.log('LOWEST DEVICE ID = '+$scope.bluetooth[i].id);
                            }
                          };
                          var whichBeaconSet = [];
                          whichBeaconSet = $scope.isAndroid ? $scope.beaconsAndroid : $scope.beaconsIphone;
                          for (var i = 0; i < whichBeaconSet.length; i++) {
                            if(lowest.id == whichBeaconSet[i][0]){
                              $scope.user.newRoom = whichBeaconSet[i][1];
                              console.log('THE ROOM = '+whichBeaconSet[i][1]);
                            }
                          };

                          $http.post('http://192.168.2.78:3000/api/office', $scope.user)
                              .success(function(data) {
                                 
                                  console.log('data from callback = '+data.present);
                          
                                  $scope.officePerson.present = data.present;
                                  $scope.startBtScan();
                              })
                              .error(function(data) {
                                  console.log('Error: ' + data);
                                  $scope.startBtScan();
                              });                          
                          
                        }
                        else {
                          $scope.bluetooth = [];
                          $scope.user.newValue = false;
                          $scope.user.newRoom = '';
                          $scope.startBtScan();
                        }
                        $scope.$apply();

                               
                        console.log('$scope.officePerson.present = '+$scope.officePerson.present);
                        //if($scope.officePerson.present !== $scope.user.newValue){ // if these aren't the same then we need to update the DB. -- only so we're not constantly posting, no sweat




                        //}
                        //$timeout(function(){
               
                            

                        //},100);


                      },
                      function() { console.log("stopScan failed"); }
                  );

  };



  $ionicPlatform.ready(function() { // scan for BLE

          $scope.isIOS = ionic.Platform.isIOS();
          $scope.isAndroid = ionic.Platform.isAndroid();        
                                   
          $scope.bluetooth = [
                              {"advertising":{},"id":"C1:BE:84:E5:18:8D","rssi":-0,"name":"Fake-Bean"},
                              {"advertising":{},"id":"C2:BE:84:E5:18:8D","rssi":-0,"name":"Fake-Bean"}
                            ];
          
          $scope.user = {'name' : '', 'newValue' : false, 'newRoom' : ''}; // setup user info

          $scope.allOffice = {};

          $scope.user.name = $localstorage.get('name', 'Please enter your name'); // store name, if nothing entered yet then ...          
          

          $http.get('http://192.168.2.78:3000/api/officesingle/'+$scope.user.name) // get emploee for this phone
              .success(function(data)                        {

                    //console.log('data success - person present = '+data.present);
                    $scope.officePerson = data;
                    $scope.user.newValue = data.present; // get latest 'present' value ready for comparison
                       
              })
              .error(function(data) {
                    console.log('Error reading db: ' + data);
              });


              
          $http.get('http://192.168.2.78:3000/api/office') // get all employees
              .success(function(data) {
                       
                    $scope.allOffice = data;

                       
              })
              .error(function(data) {
                    console.log('Error reading db: ' + data);
              });
              
          

          
          $scope.beacons = ["A495FF10-C5B1-4B44-B512-1370F02D74DE"]; // list of beacons that should be available -- UUID same for all??
          $scope.beaconsAndroid = [["C4:BE:84:E5:18:8D", "Small Conf"], ["C4:BE:84:E5:18:DF", "Large Conf"]]; // list of beacons that should be available -- UUID same for all?? b1 = C4:BE:84:E5:18:8D : b2 = C4:BE:84:E5:18:DF
          $scope.beaconsIphone = [["0671D000-A758-D6DD-ECFC-C42AE60CBC0B", "Large Conf"], ["8E24A717-78D9-8CF7-E728-E7F674FF4ED4", "Small Conf"]]; // list of beacons that should be available -- UUID same for all?? b1 = C4:BE:84:E5:18:8D : b2 = C4:BE:84:E5:18:DF
          $scope.bluetoothCollect = [];
                           
                           
          $cordovaBLE.isEnabled().then(

            function() {
                console.log('BLE IS ENABLED');
                $scope.startBtScan();

            },

            function() {
                $scope.user.newValue = false; // set by default - changes if Alloy beacon detected
                $cordovaDialogs.alert("Bluetooth LE is NOT enabled", "Bluetooth LE", "Oops!");
            }
          
          );


          $scope.confirmName = function(){ // pressing submit confirms the name...

            console.log('NAME IS.... = '+$scope.user.name);



            $localstorage.set('name', $scope.user.name);

          

            $http.get('http://192.168.2.78:3000/api/officesingle/'+$scope.user.name) // get emploee for this phone
                .success(function(data)                        {

                      //console.log('data success - person present = '+data.present);
                      $scope.officePerson = data;
                      $scope.user.newValue = data.present; // get latest 'present' value ready for comparison
                         
                })
                .error(function(data) {
                      console.log('Error reading db: ' + data);
                });       
                

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
