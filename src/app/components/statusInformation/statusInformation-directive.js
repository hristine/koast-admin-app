'use strict';
angular.module('koastAdminApp.components.statusInformation.statusInformation-directive', []).directive('statusInformation', ['$interval', 'backup', function ($interval, backup) {
  return {
    restrict: 'E',
    scope: {
      backup: '='
    },
    link: function (scope, element, attrs) {
      if (scope.backup.status) {
        var statusInterval = $interval(function () {
          backup.status({
            id: scope.backup.backupId
          })
            .then(function (status) {
              scope.backup.status = status.status;
              if (status.status === 'saved') {
                $interval.cancel(statusInterval);
              }
            });
        }, 100);
      }
    },
    template: "{{ backup.status }}"
  };
}]);