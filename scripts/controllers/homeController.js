angular.module('main').controller('homeController',function($scope,$rootScope){
    $scope.input;
    $rootScope.playing = false;

    $scope.keyPressed = function(e){
        if(e.key == "Enter"){
            $rootScope.socket = io('https://connect-with-friends.herokuapp.com', {secure: true, rejectUnauthorized: false});
            
            //Request to play with user with specified id
            $rootScope.socket.emit('request',$scope.input);
            
            //Is called when host responds to guest
            $rootScope.socket.on('request',function(data){
                //If the data is an array, setup match
                //Data = guestId
                //[hostId,guestId,hostTurn,color]
                if(Array.isArray(data)){
                    $rootScope.friend = data[0];
                    if(data[2] == true)
                        $rootScope.turn = false;
                    else
                        $rootScope.turn = true;

                    if(data[3] == 1)
                        $rootScope.color = 'yellow';
                    else
                        $rootScope.color = 'red';
                    
                        $rootScope.playing = true;
                    document.location.href = "../#!/game";
                }else if(data == false){
                    console.log("This player is busy!");
                }
            });
            
            document.getElementsByClassName("loading-wrapper")[0].style.display = "flex";
            
            /*$rootScope.connection = $scope.peer.connect($scope.input);
            $rootScope.connection.on('open', function(){
                $rootScope.connection.send("play request");
            });

            $rootScope.connection.on('data',function(data){
                if(data == 2 || data == 1){
                    if(data == 2){
                        $rootScope.turn = true;
                        $rootScope.color = 'yellow';
                    }else{
                        $rootScope.turn = false;
                        $rootScope.color = 'red';
                    }
                    console.log("guest ready");
                    $rootScope.playing = true;
                    document.location.href = "../#!/game";
                }
            });
            */
        }
    }


    $rootScope.newGame = function(){
        $rootScope.socket = io('https://connect-with-friends.herokuapp.com', {secure: true, rejectUnauthorized: false});
        //globalAgent.options.rejectUnauthorized = false; 
        $rootScope.socket.on('get-id',function(data){
            $rootScope.id = data;
            document.location.href = "../#!/game";
        });

        //Gets id of guest
        $rootScope.socket.on('request',function(data){
            //If host is not in a game, allow game request
            if($rootScope.playing == false){
                var chooseTurn = Math.floor(Math.random() * (3-1) + 1);
                var color = Math.floor(Math.random() * (3-1) + 1);
                var color = "yellow";

                if(chooseTurn == 1){
                    turn = true;
                    $rootScope.turn = true;
                }else{
                    turn = false;
                    $rootScope.turn = false;
                }
                if(color == 1)
                    $rootScope.color = "red";
                else
                    $rootScope.color = "yellow";

                
                
                $rootScope.socket.emit('request',[$rootScope.id,data,turn,color]);
            }
        })
    }
    
    var functionBasedDelay = anime({
        targets: '.letter',
        translateY: 5,
        rotate: 360,
        direction: 'alternate',
        loop: true,
      });
      
});