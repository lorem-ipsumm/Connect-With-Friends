angular.module('main').controller('homeController',function($scope,$rootScope){
    $scope.input;
    $rootScope.playing = false;
    $rootScope.requested = false;
    $scope.message = document.getElementsByClassName('info-message')[0];

    $scope.keyPressed = function(e){
        if(e.key == "Enter"){
            $rootScope.socket = io('https://connect-with-friends.herokuapp.com', {secure: true, rejectUnauthorized: false});
            
            //Request to play with user with specified id
            $rootScope.socket.emit('request',$scope.input);
            
            //Is called when host responds to guest
            $rootScope.socket.on('request',function(data){
                console.log(data);
                //If the data is an array, setup match
                //Data = guestId
                //[hostId,guestId,hostTurn,color]
                if(data[0] != false){
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
                }else if(data[0] == false){
                    $scope.message.innerHTML = "It Looks Like Your Friend Is Busy :/";
                }
            });
            
            
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
            console.log(data);
            if($rootScope.requested == false){
                $rootScope.requested = true;
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
            }else{
                $rootScope.socket.emit('request',[false,data]);
            }
        })
    }
    
    /*
    var functionBasedDelay = anime({
        targets: '.letter',
        translateY: 5,
        rotate: 360,
        direction: 'alternate',
        loop: true,
      });
    */
      
});