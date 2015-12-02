angular.module('hamTop', [
    'lumx'
]).filter('verbose', function(){
    return function(text){
        switch(text){
            case 'bunko':
                return '文庫風';
                break;
            case 'shinsho':
                return '新書風';
                break;
            case 'publish':
                return '公開中';
                break;
            case 'future':
                return '公開予定';
                break;
            case 'draft':
                return '下書き';
                break;
            case 'pending':
                return '承認待ち';
                break;
            default:
                return text;
                break;
        }
    };
});