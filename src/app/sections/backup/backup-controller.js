'use strict';
angular.module('koastAdminApp.sections.backup.backup-controller', [
  'koastAdminApp.sections.backup.backup-controller'
])
  .controller('backupCtrl', function ($rootScope, $interval, backup, tagList) {
    var vm = this;
    vm.$rootScope = $rootScope;
    vm.$interval = $interval;

    vm.isModalVisible = false;

    vm.hide = function(){
      vm.isModalVisible = false;
    };

    vm.show = function(){
      init();
      vm.isModalVisible = true;
    };

    function init() {
      vm.backupName = '';
      vm.backupType = null;
      tagList.requestReset();
    }

    vm.collections = function () {
      return tagList.val('collections');
    };

    vm.backups = [];
    backup.list()
      .then(function (backups) {
        vm.backups = backups;
      });

    var backingupInterval;
    vm.createBackup = function (name, collections, type) {
      if (!(name && collections.length && type)) {
        return;
      }

      vm.percent = 0;
      vm.creatingBackup = true;

      backup.createBackup(name, collections, type)
        .then(function (receipt) {
          var id = receipt.id;
          backingupInterval = $interval(function () {
            backup.status({
              id: id
            })
              .then(function (status) {
                vm.percent = (status.status === 'in-progress') ? 50 : 100;
                if (vm.percent >= 100) {
                  $interval.cancel(backingupInterval);
                  vm.hide();
                  vm.creatingBackup = false;
                  backup.details({id: id})
                    .then(function (backupDetails) {
                      vm.backups.push(backupDetails);
                    });
                }
              });
          }, 100);
        })
        .then(null, function (e) {
          //TODO indicate failure
          console.error(e.stack);
          vm.hide();
          vm.creatingBackup = false;
        });
    };

    vm.confirmingDelete = false;
    vm.confirmDelete = function(backupToDelete) {
      vm.confirmingDelete = true;
      vm.toDelete = backupToDelete;
    };

    vm.cancelDelete = function() {
      vm.confirmingDelete = false;
      vm.toDelete = {};
    };

    vm.deleteBackup = function (id) {
      backup.deleteBackup({id: id})
        .then(function () {
          vm.confirmingDelete = false;
          vm.backups = R.filter(function(backupRecord) {
            return backupRecord.backupId !== id;
          }, vm.backups);
          vm.toDelete = {};
        });
    };

    vm.confirmingRestore = false;
    vm.confirmRestore = function(backupToRestore) {
      vm.confirmingRestore = true;
      vm.toRestore = backupToRestore;
    };

    vm.cancelRestore = function() {
      vm.confirmingRestore = false;
      vm.toRestore = {};
    };

    var restoringInterval;
    vm.restoreBackup = function (id) {
      vm.confirmingRestore = false;
      vm.restoringBackup = true;
      vm.restoringPercent = 0;
      vm.restoringName = id;
      backup.restoreBackup(id)
        .then(function (receipt) {
          restoringInterval = $interval(function () {
            backup.status({
              id: id
            })
              .then(function (status) {
                vm.restoringPercent = status.completed;
                if (vm.restoringPercent >= 100) {
                  $interval.cancel(restoringInterval);
                  vm.restoringBackup = false;
                }
              });
          }, 100);
        })
        .then(null, function (e) {
          //TODO indicate failure
          console.error(e.stack);
          vm.restoringBackup = false;
        });
    };
  });
