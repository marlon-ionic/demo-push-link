import { Component, inject, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScheduleOptions, LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { PushNotifications, PushNotificationSchema, ActionPerformed as PushActionPerformed, Token } from '@capacitor/push-notifications';
import { IonApp, IonRouterOutlet, AlertController, AlertButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private readonly alertController = inject(AlertController);
  constructor() {}

  async ngOnInit(): Promise<void> {
    // Skip if not running on a native platform
    // This is important because PushNotifications and LocalNotifications are not available in web mode
    if(!Capacitor.isNativePlatform()) {
      return;
    }

    PushNotifications.addListener('registrationError',
      (error: any) => console.error('Push registration error', error)
    );
    // Request permissions and register for notifications/actions
    await this.checkPermissions();
    PushNotifications.addListener('registration',
      (token: Token) => console.log('Push registration success, token: ', token.value)
    );


    // Since this won't be called if the app is killed, we also have an Android service in the native code
    // See android/app/src/main/java/io/ionic/demo/push/MyOpenLinkMessagingService.java
    // Docs: https://capacitorjs.com/docs/apis/push-notifications#silent-push-notifications--data-only-notifications
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('pushNotificationReceived', notification);
        // When the data-only notification is received for Android with the desired category specfied, we schedule a local notification so the action buttons will appear
        if(Capacitor.getPlatform() === 'android' && notification.data && notification.data.category === 'OPEN_BROWSER_URL') {
          const opts: ScheduleOptions = {
            notifications: [
              {
                // Generates a random 32-bit int identifier for the notification
                id: ((Math.random() * 0xFFFFFFFF) | 0) * (Math.random() < 0.5 ? -1 : 1),
                title: notification.data.title,
                body: notification.data.body,
                actionTypeId: notification.data.category,
                extra: notification.data
              }
            ]
          }
          const result = await LocalNotifications.schedule(opts);
          console.log('LocalNotifications: result', result), opts;
        }
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('localNotificationActionPerformed', action);
        // Handle the accept action (this is for Android)
        if(action.actionId === 'OPEN_LINK' && action.notification.extra?.outboundUrl) {
          const outboundUrl = action.notification.extra.outboundUrl;
          if(outboundUrl) {
            window.open(outboundUrl, '_system');
          }
        }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: PushActionPerformed) => {
        console.log('pushNotificationActionPerformed', action);
        // Handle the accept action (this is for iOS)
        if(action.actionId === 'OPEN_LINK' && action.notification.data?.outboundUrl) {
          const outboundUrl = action.notification.data.outboundUrl;
          if(outboundUrl) {
            window.open(outboundUrl, '_system');
          }
        }
    });
  }

  private async checkPermissions(): Promise<void> {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      console.log('permStatus', permStatus);
      if(permStatus.receive === 'granted') {
        await PushNotifications.register();
        return;
      } else if(permStatus.receive === 'denied') {
        await this.actionPrompt(
          'Notification Permissions Denied',
          'Please check your device settings, close the app, and try again!');
          return;
      } else {
        //Prompt
        const permissionStatus = await PushNotifications.requestPermissions();
        if(permissionStatus.receive === 'granted') {
          await PushNotifications.register();
        }
      }

    } catch(e) {
      console.error('checkPermissions:error', e);
    }
  }
  async actionPrompt(header: string, message?: string, actions?: (string | AlertButton )[], subHeader?: string) {
    const buttons = actions || ['OK'];
    const alert = await this.alertController.create({
      mode: 'ios',
      header,
      subHeader,
      message,
      buttons
    });
    await alert.present();
  }
}
