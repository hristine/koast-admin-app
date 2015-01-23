'use strict';

describe('backupCtrl:', function () {
  var backupCtrl,
    backupRecord = {
      backupId: '34072750-9b3a-11e4-adf0-8b69b77a50cb',
      receipts: [
        {
          collection: 'tasks',
          data: {
            bucket: 'mock-bucket',
            key: 'mock'
          }
        },
        {
          collection: 'users',
          data: {
            bucket: 'mock-bucket',
            key: 'mock'
          }
        }
      ]
    },
    createdRecord = {
      backupId: '11111111-9b3a-11e4-adf0-8b69b77a50cb',
      receipts: [
        {
          collection: 'tasks',
          data: {
            bucket: 'mock-bucket',
            key: 'mock'
          }
        },
        {
          collection: 'users',
          data: {
            bucket: 'mock-bucket',
            key: 'mock'
          }
        }
      ]
    };

  beforeEach(module('koastAdminApp.sections.backup.backup-controller'));

  beforeEach(inject(function ($controller, $interval, $q, $rootScope) {
    var mockBackup = {
      list: function () {
        return $q.when([backupRecord]);
      },
      restoreBackup: function (id) {
        var deferred = $q.defer();
        deferred.resolve('done');  // this is what seems to happen currently.
        return deferred.promise;
      },
      createBackup: function(name, collections, type) {
        return $q.when({id: '11111111-9b3a-11e4-adf0-8b69b77a50cb'});
      },
      deleteBackup: function(id) {
        return $q.when({'status': 'done'});
      },
      status: function(id) {
        return $q.when({'status': 'saved'});
      },
      details: function(id) {
        return $q.when(createdRecord)
      }
    },
    tagList = {
      requestReset: function () {}
    };

    backupCtrl = $controller('backupCtrl', {
      $rootScope: $rootScope,
      $interval: $interval,
      backup: mockBackup,
      tagList: tagList
    });
    backupCtrl.$rootScope.$apply();
  }));

  it('should add an item to the list of backups when a backup is created', function () {
    expect(backupCtrl.backups.length).to.be.equal(1);

    backupCtrl.createBackup('test', ['test'], 'local');
    backupCtrl.$rootScope.$apply();
    backupCtrl.$interval.flush(200);

    expect(backupCtrl.backups.length).to.be.equal(2);
  });

  it('should remove an item from the list of backups when a backup is deleted', function() {
    expect(backupCtrl.backups.length).to.be.equal(1);
    backupCtrl.deleteBackup('34072750-9b3a-11e4-adf0-8b69b77a50cb');

    backupCtrl.$rootScope.$apply();

    expect(backupCtrl.backups.length).to.be.equal(0);
    expect(backupCtrl.toDelete).to.be.empty();
    expect(backupCtrl.confirmingDelete).to.be.false();
  });

  describe('verify correct effects happen from backup delete confirmation dialog', function () {
    beforeEach(function () {
      backupCtrl.toDelete = backupRecord;
      backupCtrl.confirmingDelete = true;
    });

    it('should delete when OK is clicked in the confirmation dialog', function () {
      backupCtrl.deleteBackup(backupRecord.backupId);

      backupCtrl.$rootScope.$apply();

      expect(backupCtrl.confirmingDelete).to.be.false();
      expect(backupCtrl.toDelete).to.be.empty();
      expect(backupCtrl.backups).to.be.empty();
    });

    it('should not delete when Cancel is clicked in the confirmation dialog', function () {
      backupCtrl.cancelDelete();

      backupCtrl.$rootScope.$apply();

      expect(backupCtrl.confirmingDelete).to.be.false();
      expect(backupCtrl.toDelete).to.be.empty();
      expect(backupCtrl.backups).to.be.not.empty();
    });
  });

  it('should show a dialog when restore is clicked', function () {
    expect(backupCtrl.confirmingRestore).to.be.false();
    expect(backupCtrl.restoringBackup).to.be.not.ok();

    backupCtrl.confirmRestore(backupRecord);

    expect(backupCtrl.confirmingRestore).to.be.true();
    expect(backupCtrl.restoringBackup).to.be.not.ok();
    expect(backupCtrl.toRestore).to.be.equal(backupRecord);
  });

  describe('verify correct effects happen from backup restore confirmation dialog', function () {
    beforeEach(function () {
      backupCtrl.toRestore = backupRecord;
      backupCtrl.confirmingRestore = true;
    });

    it('should start restoring when OK is clicked in the confirmation dialog', function () {
      expect(backupCtrl.restoringBackup).to.be.not.ok();

      backupCtrl.restoreBackup(backupRecord.backupId);

      expect(backupCtrl.confirmingRestore).to.be.false();
      expect(backupCtrl.restoringBackup).to.be.true();
      expect(backupCtrl.toRestore).to.be.equal(backupRecord);
    });

    it('should not start restoring when Cancel is clicked in the confirmation dialog', function () {
      expect(backupCtrl.restoringBackup).to.be.not.ok();

      backupCtrl.cancelRestore();

      expect(backupCtrl.confirmingRestore).to.be.false();
      expect(backupCtrl.restoringBackup).to.be.not.ok();
      expect(backupCtrl.toRestore).to.be.empty();
    });
  });
});