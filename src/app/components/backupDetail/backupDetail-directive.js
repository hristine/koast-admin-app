'use strict';
angular.module('koastAdminApp.components.backupDetail.backupDetail-directive', []).directive('backupDetail', [function () {
  return {
    restrict: 'E',
    templateUrl: 'app/components/backupDetail/backupDetail.html',
    scope: {
      backup: '='
    }
  };
}]);