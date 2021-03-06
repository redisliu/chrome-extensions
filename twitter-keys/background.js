
// Called when the user clicks on the browser action.
// It won't work if 'default_popup' is specified in manifest.json
//chrome.browserAction.onClicked.addListener(eventHandler);

chrome.runtime.onMessage.addListener(messageHandler);

chrome.alarms.onAlarm.addListener(alarmHandler);
chrome.alarms.create("default", {delayInMinutes: 1, periodInMinutes: 1});

function alarmHandler(alarm) {
    if (!alarm) {
        console.log("Unexpected null Alarm object");
        return;
    }
    console.log("got alarm!");
    console.log(alarm);
    if (alarm.name === "default") {
        syncLocalToServer();
    }
}

chrome.commands.onCommand.addListener(commandHandler);

function commandHandler(command) {
    console.log('Command:', command);
    defaultTask();
}

function messageHandler(request, sender, sendResponse) {
    console.log(request);
    if (request.action === ACTION_FOR_SAVING_TWITTER_APP_KEY) {
        console.log("got it from extension !");
        var newData = {};
        for (var appId in request.data) {
            var detail = request.data[appId];
            var key = getOauthStorageKey(appId);
            newData[key] = detail;
        }
        chrome.storage.sync.set(newData, function() {
            syncLocalToServer();
        });
    } else if (request.action === ACTION_FOR_ASYNC_LOGIN) {
        console.log("reeived request for async logging");
        if (sender.tab) {
            console.log("GOOD, request is from tab");
            // Only accept message posted from sender.
            var key = getLocalStorageKeyForLoginTab(sender.tab.id);
            console.log("getting data from storage");
            chrome.storage.local.get(key, function(items) {
                console.log("got data from storage, removing existing data");
                chrome.storage.local.remove(key, function() {});
                console.log("sending data back to tab page");
                chrome.tabs.sendMessage(sender.tab.id, {"action" : ACTION_FOR_ASYNC_LOGIN, data: items[key]});
            });
        } else {
            console.log("reeived ILLEGAL request for async logging, which is not from TAB page");
        }
    } else if (request.action === ACTION_FOR_SIGNUP_NEW_USER_NAME) {
        var data = request['data'];
        var key = getUserPasswdStorageKey(data['username']);
        var newData = {};
        newData[key] = data;
        chrome.storage.sync.set(newData);
    } else {
    }
};

