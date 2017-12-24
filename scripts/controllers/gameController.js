angular.module('main').controller('gameController',function($scope,$rootScope){
    $scope.indicator = document.getElementsByClassName("indicator")[0];
    $scope.shareMessage = document.getElementById("share");
    $scope.shareCode = document.getElementsByClassName('share-code')[0];
    $scope.message = document.getElementsByClassName('message')[0];
    $scope.board = document.getElementsByClassName('board')[0];
    $scope.id = "loading";
    $scope.map = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ];

    
    //Slide indicator
    $scope.spotHovered = function(x,e){
        //This is temporary and only looks like it works.
        $scope.indicator.style.transform = "translateX(" + ($scope.indicator.clientWidth*(7/5.45))*(x-1) +"px)";
    };


    //Game Loop?
    $scope.playGame = function(){
        if($rootScope.turn == true){
            $scope.message.innerHTML = "YOUR TURN!";
            if($rootScope.color == "red")
                $scope.message.style.color = "#ff6868";
            else
                $scope.message.style.color = "#fffc82";
            
        }else{
            $scope.message.innerHTML = "YOUR FRIEND'S TURN!";
            if($rootScope.color == "red")
                $scope.message.style.color = "#fffc82";
            else
                $scope.message.style.color = "#ff6868";
        }
    }

    
    //If user loads from the game page, go through everything from the home page
    if($rootScope.playing == false || $rootScope.playing == undefined){
        $rootScope.socket = io('https://connect-with-friends.herokuapp.com' , {secure: true, rejectUnauthorized: false});
        

        //Request id from server
        $rootScope.socket.emit('get-id',null);

        //Server sends id
        $rootScope.socket.on('get-id',function(data){
            $rootScope.id = data;
            $scope.shareCode.innerHTML = data;
        });


        //Gets id of guest
        $rootScope.socket.on('request',function(data){
            //If host is not in a game, allow game request
            if($rootScope.requested == false || $rootScope.requested == undefined){
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

                
                $scope.playing = true;
                $rootScope.friend = data;
                $scope.initializeListeners();
                $scope.playGame();
                $rootScope.socket.emit('request',[$rootScope.id,data,turn,color]);
            }else{
                $rootScope.socket.emit('request',[false,data]);
            }
        })
    };


    $scope.checkWin = function(){
        var width = 7;
        var height = 6;
        for(var i = 0; i < height; i++){
            for(var j = 0;j < width; j++){
                if($scope.map[i][j] == 0)
                    continue;

                var color = $scope.map[i][j];

                if(
                    j+3 < width &&
                    $scope.map[i][j+1] == color &&
                    $scope.map[i][j+2] == color &&
                    $scope.map[i][j+3] == color)
                    return color;
                
                if(i+3 < height){
                    if(
                        $scope.map[i+1][j] == color &&
                        $scope.map[i+2][j] == color &&
                        $scope.map[i+3][j] == color)
                        return color;

                    if(
                        $scope.map[i+1][j+1] == color &&
                        $scope.map[i+2][j+2] == color &&
                        $scope.map[i+3][j+3] == color)
                        return color;

                    if(
                        $scope.map[i+1][j-1] == color &&
                        $scope.map[i+2][j-2] == color &&
                        $scope.map[i+3][j-3] == color)
                        return color;
                        
                }
            }
        }
        return 0;
    };
    

    //Update game array and client board
    $scope.updateGame = function(data){
        
        var x = data[0];
        var y = data[1];
        
        if($rootScope.color == 'red'){
            document.getElementById((x+1) + "-" + (y+1)).style.backgroundColor = "#fffc82";
            $scope.map[y][x] = 2;
        }else{
            
            document.getElementById((x+1) + "-" + (y+1)).style.backgroundColor = "#ff6868";
            $scope.map[y][x] = 1;
        }
        $scope.friendPlacement.play();
    }


    //Initialize Listeners and other things
    $scope.initializeListeners = function(){
        //$scope.shareMessage.style.opacity = "0";
        $scope.userPlacement = new Audio('assets/userPlacement.wav');
        $scope.friendPlacement = new Audio('assets/friendPlacement.wav');
        if($rootScope.color == 'red')
            $scope.indicator.style.backgroundColor = "#ff6868";                       
        else
            $scope.indicator.style.backgroundColor = "#fffc82";

        
        $rootScope.socket.on('turn-over',function(data){
            $rootScope.turn = true;
            $scope.updateGame([data[0],data[1]]);
            $scope.playGame();
        });

        $rootScope.socket.on('win',function(data){
            $rootScope.turn = false;
            $rootScope.playing = false;
            
            $scope.updateGame([data[0],data[1]]);
            $scope.message.innerHTML = "YOU LOST :(";
            $scope.resetVariables();
        });

        $rootScope.socket.on('leave',function(data){
            $scope.message.innerHTML = "YOUR FRIEND DISCONNECTED :(";
            $rootScope.turn = false;
            $rootScope.playing = false;
        });

        
        
        
        
    }
    
    //Reset all important variables
    $scope.resetVariables = function(){
        $rootScope.turn = false;
        //$rootScope.color = undefined;
        $rootScope.playing = false;
        $rootScope.friend = undefined;
        $rootScope.id = undefined;
        $rootScope.socket = undefined;
        
    };

    //Guest entry point
    if($rootScope.playing == true){
        $scope.initializeListeners();
        $scope.playGame();
    }
    

    $scope.spotClicked = function(el){
        //[y][x]
        //0 = Blank
        //1 = Red
        //2 = Yellow
        if($rootScope.turn){
            
            var id = el.target.id;
            var x = id.substring(0,1) - 1;
            var y = id.substring(2) - 1;
            var win = 0;

            //Placing pieces
            for(var i = 5; i >= 0; i--){
                if($scope.map[i][x] == 0){
                    if($rootScope.color == 'red'){
                        document.getElementById((x+1) + "-" + (i+1)).style.backgroundColor = "#ff6868";
                        $scope.map[i][x] = 1;                        
                    }else{
                        document.getElementById((x+1) + "-" + (i+1)).style.backgroundColor = "#fffc82";
                        $scope.map[i][x] = 2;
                    }
                    $scope.userPlacement.play();

                    
                    var win = $scope.checkWin();
                    
                    if(win > 0){
                        
                        $scope.message.innerHTML = "YOU WON! :)";
                        $rootScope.socket.emit('win',[x,i,$rootScope.friend]);
                        $scope.resetVariables();
                        break;
                    }
                    

                    $rootScope.socket.emit('turn-over',[x,i,$rootScope.friend]);
                    $rootScope.turn = false;
                    $scope.playGame();
                    
                    
                        
                    
                    
                    break;
                }
                //$rootScope.socket.emit('tie',[x,i,$rootScope.friend]);
            }
            if(win == 0 && $rootScope.playing == true)
                $scope.playGame();
        }
    };

    //Notify friend when opponent disconnects
    window.onbeforeunload = function(){
        $rootScope.socket.emit('leave',$rootScope.friend);
    };
});