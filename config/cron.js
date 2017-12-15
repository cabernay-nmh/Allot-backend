var firebase = require('firebase-admin');
var fs = require('fs');

// firebase
var firebaseAdminFilePath = "config/secret/firebaseAdmin.json";
var isFirebaseActive = false;
var firebaseAdmin = null;

if (fs.existsSync(firebaseAdminFilePath)) {

  isFirebaseActive = true;
  firebaseAdmin = JSON.parse(fs.readFileSync(firebaseAdminFilePath, 'utf8'));

  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseAdmin),
    databaseURL: "https://allot-2e179.firebaseio.com/"
  });

}

module.exports.cron = {

  pendingTaskPushNotificationCronJob: {

    schedule: '* * * * *',

    onTick: function () {

      if (isFirebaseActive) {

        // get upcoming tasks
        var timeBeforeActualTask = 1800;
        var currentTime = Math.floor(new Date() / 1000);
        // console.log("Current Time: "+currentTime);

        Task
          .find({notificationSent: false, isDone: false})
          .populate('participants')
          .exec(function(err, unfinishedTasks){

            if (unfinishedTasks) {
              unfinishedTasks.forEach(function(eachTask){

                var taskUnixTime = Number(eachTask.time);
                var secondsToTask = Math.abs(taskUnixTime - currentTime);

                if (secondsToTask < timeBeforeActualTask && taskUnixTime > currentTime) {

                  if (eachTask.participants.length != 0) {

                    // send notification to each participant
                    eachTask.participants.forEach(function (eachParticipant) {

                      var payload = {
                        notification: {
                          title: "Upcoming Task: " + eachTask.title,
                          body: "Pending in 1 minute"
                        }
                      };

                      // Set the message as high priority and have it expire after 24 hours.
                      var options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                      };

                      // console.log("DeviceId: " + eachParticipant.androidDeviceId);
                      firebase.messaging().sendToDevice(eachParticipant.androidDeviceId.toString(), payload, options)
                        .then(function(response) {
                        })
                        .catch(function(error) {
                          console.log("Push Notification Failure: " + error);
                        });
                    });

                    // mark task as notified
                    Task.update({id: eachTask.id}, {notificationSent: true})
                      .exec(function(err, record){

                        if (err) {
                          console.log("Push Notification error in updating Task: " + err);
                        } else {
                        }
                      });
                  }
                }
              });
            }
          });

        console.log('Pending task Push Notification Epoch');

      }


    }
  }
};
