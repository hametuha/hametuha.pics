
// Dialog
angular.module('hamTop')
    .controller('CoverList', ['$scope', 'LxDialogService', 'LxNotificationService', '$http', function($scope, LxDialogService, LxNotificationService, $http){

        $scope.openDialog = function(id){
            LxDialogService.open(id);
        };

        $scope.covers = [];

        $scope.data = {
            title: '',
            subTitle: '',
            author: '',
            type: 'bunko',
            user: 0
        };

        $scope.initCovers = function(){
            $http.get('/covers/list/').then(
                function(result){
                    $scope.covers = result.data;
                },
                function(result){
                    console.log(result);
                }
            );
        };

        $scope.addForm = function(id){
            $http.post('/covers/add/', $scope.data).then(
                function(result){
                    $scope.covers.push(result.data);
                    $scope.data.title = '';
                    $scope.data.subTitle = '';
                    $scope.data.author = '';
                    LxDialogService.close(id);
                    console.log($scope.covers);
                },
                function(result){
                    console.log(result);
                }
            );
        };

        $scope.close = function(id){
            LxDialogService.close(id);
        };

        $scope.getScreenShot = function(index){
            var cover = $scope.covers[index];
            LxNotificationService.info('表紙画像を生成しています……');
            $http.get('/covers/capture/' + cover._id  + '/', {

            }).then(
                function(result){
                    if( result.data.message ) {
                        LxNotificationService.error(result.data.message);
                    }else{
                        var iframe = document.createElement('iframe');
                        iframe.src = result.data.url;
                        iframe.style.display = 'none';
                        document.getElementsByTagName('body')[0].appendChild(iframe);
                        LxNotificationService.info('画像の生成が完了しました！');
                    }
                    console.log(result);
                },
                function(result){
                    LxNotificationService.error('ダウンロードに失敗しました。');
                }
            );
        };

        $scope.confirm = function(index){
            var cover = $scope.covers[index];
            LxNotificationService.confirm(
                '確認',
                '本当に削除してよろしいですか？　この操作は取り消すことができません。',
                {
                    cancel:'削除しない',
                    ok:'削除する'
                },
                function(answer){
                    if( answer ){
                        $http.delete('/covers/' + cover._id + '/').then(
                            function(result){
                                $scope.covers.splice(index, 1);
                                LxNotificationService.info('削除完了しました');
                            },
                            function(result){
                                LxNotificationService.warning('削除に失敗しました');
                            }
                        );
                    }
                }
            );
        };

    }]);
