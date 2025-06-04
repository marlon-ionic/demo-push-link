# Demo Push Link

This project demonstrates push notifications with action buttons that include an external URL link in a Capacitor application.

## Features

- Push notification setup and handling
- Example code for both iOS and Android

## Project Overview

This project uses the approach of using [Silent Notifications](https://capacitorjs.com/docs/apis/push-notifications#silent-push-notifications--data-only-notifications) for both iOS & Android. This notification should include all of your required information (as the `data` payload). A local notifcation will then be triggered with your action buttons. The approach varies a bit by platform.

During app initialization, it's important to call `LocalNotifications.registerActionTypes()` to setup the configuration for Action Buttons. [registerActionTypes](https://capacitorjs.com/docs/apis/local-notifications#registeractiontypes) takes a `RegisterActionTypesOptions` object that includes an `id` property is key because it's the identifier used to associate the Action Buttons to the notification.

### Android

For Android, this project uses [Silent Notifications](https://capacitorjs.com/docs/apis/push-notifications#silent-push-notifications--data-only-notifications) with a custom service that extends `FirebaseMessagingService` to get the notifcation if the app's been killed. This service defines the action buttons configuration. [MyOpenLinkMessagingService](android/app/src/main/java/io/ionic/demo/push/MyOpenLinkMessagingService.java) is also declared in the `AndroidManifest.xml` file.

### iOS

For iOS, we use the take standard APNS notifiction with a category defined. The [LocalNotifications](https://capacitorjs.com/docs/apis/local-notifications#registeractiontypes) plugin provides method to define the action buttons, and a handler.


## Push Notification Paylaod
This project was based on the payload structure from the [Google API FCM documentation](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages/send). You may need to refer to your push provider's documentation to determine how to map this. Effectively, we're sending a data-only notification to Android devices, and a relatively standard iOS notifcation with a `category` [payload key](https://developer.apple.com/documentation/usernotifications/generating-a-remote-notification#Payload-key-reference), and the custom `outboundUrl` field that holds the URL. This cURL works for both iOS and Android platforms:
See the [Message documentation](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages#Message) provides more details on the structure of the message.
```shell
curl --location 'https://fcm.googleapis.com/v1/projects/YOUR-FIREBASE-PROJECT-ID/messages:send' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR-ACCESS-TOKEN' \
--data '{
  "message": {
    "token": "DEVICE-TOKEN",
    "data": {
      "body": "Tap '\''Open Link'\'' to view details",
      "title": "My Notification",
      "category": "OPEN_BROWSER_URL",
      "outboundUrl": "https://www.outsystems.com/developers/"
    },
    "apns": {
      "payload": {
        "aps": {
            "alert" : {
                "body": "Tap '\''Open Link'\'' to view details",
                "title": "My Notification"
            },
            "outboundUrl": "https://www.outsystems.com/developers/",
            "category": "OPEN_BROWSER_URL"
        }
      }
    }
  }
}'
```


## Getting Started

1. Clone the repository:
  ```shell
  git clone https://github.com/marlon-ionic/demo-push-link.git
  ```
2. Install dependencies:
  ```shell
  npm install
  ```
3. Add the following files required for Firebase Cloud Messaging (FCM) to your project:
  ```
android/app/google-services.json
ios/App/App/GoogleService-Info.plist
```

## Prepare and run for iOS and Android

```shell
ionic build && npx cap sync
npx cap run ios
npx cap run android
```



## License

MIT
