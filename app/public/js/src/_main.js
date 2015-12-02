angular.module('hamTop', [
        'lumx'
    ])
    .controller('PostList', ['$scope', '$http', function ($scope, $http) {
        $scope.posts= [];

        $scope.initPosts= function () {
            $http.get('/posts/list').then(
                function (result) {
                    $scope.posts = result.data;
                },
                function (result) {
                    console.log(result);
                }
            );
        };
    }]);
