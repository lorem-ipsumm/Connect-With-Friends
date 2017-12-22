angular.module('main').controller('gameController',function($scope,$rootScope){

    $scope.indicator = document.getElementsByClassName("indicator")[0];
    $scope.shareMessage = document.getElementById("share");
    $scope.connection;
    $scope.message = document.getElementsByClassName('message')[0];
    $scope.id = "loading";
    $scope.map = [
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0]
    ];

    

    
    //Set shareable id
    $scope.id = $rootScope.id;

    //Set Colors
    if($rootScope.color == 'red')
        $scope.indicator.style.backgroundColor = "#ff6868";                       
    else
        $scope.indicator.style.backgroundColor = "#fffc82";
    
    //Slide indicator
    $scope.spotHovered = function(x){
        $scope.indicator.style.transform = "translateX(" + 80*(x-1) +"px)";
    };


    //Game Loop?
    $scope.playGame = function(){
        if($rootScope.turn == true){
            $scope.message.innerHTML = "IT'S YOUR TURN!";
        }else{
            $scope.message.innerHTML = "IT'S YOUR FRIENDS TURN!";
        }
    }

    
    //If user loads from the game page go through everything from the home page
    if($rootScope.playing == false || $rootScope.playing == undefined){
        $rootScope.socket = io('https://connect-with-friends.herokuapp.com' , {secure: true, rejectUnauthorized: false});
        
        $rootScope.socket.on('get-id',function(data){
            $rootScope.id = data;
            $scope.id = $rootScope.id;
            $scope.$apply();
        });

        //Gets id of guest
        $rootScope.socket.on('request',function(data){
            //If host is not in a game, allow game request
            if($rootScope.playing == false || $rootScope.playing == undefined){
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
                $rootScope.socket.emit('request',[$rootScope.id,data,turn,color]);
                $scope.initializeListeners();
                $scope.playGame();
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
        
    }

    $scope.initializeListeners = function(){
        //Run when friend's turn is over
        //Data = [x,y]

        
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
        });
        
        
    }
    
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

                    
                    var win = $scope.checkWin();
                    
                    if(win > 0){
                        
                        $scope.message.innerHTML = "YOU WON! :)";
                        $rootScope.socket.emit('win',[x,i,$rootScope.friend]);
                        break;
                    }
                    

                    $rootScope.socket.emit('turn-over',[x,i,$rootScope.friend]);
                    $rootScope.turn = false;
                    $scope.playGame();
                    
                    
                        
                    
                    
                    break;
                }
            }
            if(win == 0 && $rootScope.playing == true)
                $scope.playGame();
        }
    };

    
    


    /*
    
    

    
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


    


    $scope.spotHovered = function(x){
        $scope.indicator.style.transform = "translateX(" + 80*(x-1) +"px)";
    };

    
    $scope.peer.on('open', function(id) {
        $scope.id = id;
        $scope.$apply();
    });
    
    


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
        
    }


    //Game Loop
    $scope.playGame = function(){
        if($rootScope.color == "red")
            $scope.indicator.style.backgroundColor = "#ff6868";
        else
            $scope.indicator.style.backgroundColor = "#fffc82";
        
        

        if($rootScope.turn){
            message.innerHTML = "IT'S YOUR TURN!";
        }else{
            message.innerHTML = "IT'S YOUR FRIENDS TURN!";
        }

    };


    //Host Connection
    $scope.peer.on('connection',function(connection){
        $rootScope.connection = connection;
        $rootScope.connection.on('data',function(data){
            if(data == "play request"){
                $scope.chooseTurn = Math.floor(Math.random() * (3-1) + 1);
                if($scope.chooseTurn == 2){
                    $rootScope.turn = false;
                    $rootScope.color = 'red';
                }else{
                    $rootScope.turn = true;
                    $rootScope.color = 'yellow'
                }
    
                $rootScope.connection.send($scope.chooseTurn);
                $rootScope.playing = true;
                console.log("host ready");
                $scope.playGame();
            }else if(Array.isArray(data) && data[0] != "win"){
                $scope.updateGame(data);
                
                $rootScope.turn = true;
                $scope.playGame();
            }else if(data[0] == "win"){
                var data = data[1];
                $scope.updateGame(data);
                message.innerHTML = "YOU LOST! :(";
                $rootScope.playing = false;
                $scope.$apply();
            }
        });
    });

    //Guest
    if($rootScope.playing == true){
        $scope.playGame();
        $rootScope.connection.on('data',function(data){
            if(Array.isArray(data) && data[0] != "win"){
                $scope.updateGame(data);
                $rootScope.turn = true;
                $scope.playGame();
            }else if(data[0] == "win"){
                var data = data[1];
                $scope.updateGame(data);
                console.log("game");
                message.innerHTML = "YOU LOST! :(";
                $rootScope.playing = false;
                $scope.$apply();
            }
        });
    }

    */
});