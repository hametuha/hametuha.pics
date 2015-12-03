angular.module('hamTop')
    .controller('PostList', ['$scope', 'LxDialogService', 'LxNotificationService', '$http', function($scope, LxDialogService, LxNotificationService, $http){

        function redirect(msg){
            LxNotificationService.error(msg);
                    setTimeout(function(){
                        document.location.href = '/covers/';
                    }, 3000);

        }

        // Posts list.
        $scope.posts = [];

        // SRC of cover image.
        $scope.src = false;

        // Get post list
        $scope.initPosts = function(){
            LxNotificationService.info('作品集のリストを取得しています……');
            $http.get('/covers/posts/').then(
                function(result){
                    var data = JSON.parse(result.data);
                    $scope.posts = data;
                },
                function(result){
                    console.log('エラー', result);
                    //redirect('作品集を取得できませんでした。一覧に戻ります。');
                }
            );
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
                    redirect('画像の生成に失敗しました。一覧に戻ります。');
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
                        $http.post('/covers/assign/' + id + '/to/' + postID + '/').then(
                            function(result){
                                LxNotificationService.success('表紙画像を設定しました。');
                                var post = JSON.parse(result.data);
                                for( var i = 0, l = $scope.posts.length; i < l; i++ ){
                                    if( $scope.posts[i].id == post.id ){
                                        $scope.posts[i] = post;
                                        break;
                                    }
                                }
                            },
                            function(result){
                                console.log(result.data);
                                LxNotificationService.error('表紙画像の設定に失敗しました。');
                            }
                        );
                    }
                }
            );
        };
    }]);
