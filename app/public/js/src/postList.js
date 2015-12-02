angular.module('hamTop')
    .controller('PostList', ['$scope', 'LxDialogService', 'LxNotificationService', '$http', function($scope, LxDialogService, LxNotificationService, $http){

        // Posts list.
        $scope.posts = [
            {
                id: 1,
                title: '投稿タイトル',
                cover: 'http://s.hametuha.com/wp-content/uploads/2015/08/uta-and-on2-300x480.jpg'
            }
        ];

        // SRC of cover image.
        $scope.src = false;

        // Get post list
        $scope.initPosts = function(){
            console.log('ユーザーの投稿を取得');
        };

        // Generate Cover
        $scope.getCover = function(id){
            LxNotificationService.info('表紙画像がまだ存在しません。生成します……');
            $http.post('/covers/generate/' + id + '/').then(
                function(result){
                    $scope.src = result.data.url;
                    LxNotificationService.success('表紙画像を生成しました。');
                },
                function(result){
                   LxNotificationService.error('画像の生成に失敗しました。一覧に戻ります。');
                    setTimeout(function(){
                        document.location.href = '/covers/';
                    }, 3000);
                }
            );
        };

        // Assign cover
        $scope.assign = function(id, postID){
            LxNotificationService.confirm(
                '確認',
                '本当にこの画像をカバーにしてよろしいですか？',
                {
                    cancel: 'やめる',
                    ok: '設定する'
                },
                function(answer){
                    if( answer ){
                        LxNotificationService.success(id + 'を' + postID + 'にアサインしました');
                        $scope.initPosts();
                    }
                }
            );
        };
    }]);
