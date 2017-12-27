angular.module('main').controller('directController',function($scope,$rootScope){
    $scope.url = window.location.href;
    $scope.shareCode = ($scope.url).substring($scope.url.indexOf('#!/')+3);
    $rootScope.socket = io('https://connect-with-friends.herokuapp.com', {secure: true, rejectUnauthorized: false});
    
    //Request to play with user with specified id
    $rootScope.socket.emit('request',$scope.shareCode);
    
    //Is called when host responds to guest
    $rootScope.socket.on('request',function(data){
        $rootScope.playing = true;
        $rootScope.requested = true;
        $rootScope.id = data[1];
        //If the data is an array, setup match
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
            
            
            document.location.href = "../#!/game"; 
        }else if(data[0] == false){
            $scope.message.innerHTML = "It Looks Like Your Friend Is Busy :/";
        }
    });
});