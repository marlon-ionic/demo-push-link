import { LocalNotifications } from '@capacitor/local-notifications';


// This function makes use of functionality of the LocalNotifications plugin to regsiter actions for the Action Buttons
// For iOS, this registers the category and actions using UNNotificationCategory and UNNotificationAction (https://developer.apple.com/documentation/usernotifications/unnotificationaction)
// see https://capacitorjs.com/docs/apis/local-notifications#registeractiontypes
export function registerNotificationActions() {
  return () => {
    return new Promise<void>((resolve) => {
      LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'OPEN_BROWSER_URL',
              actions: [
                {
                  id: 'OPEN_LINK',
                  title: 'Open Link',
                  foreground: true
                },
                {
                  id: 'LATER',
                  title: 'Later'
                }
              ],
            },
          ],
        }).finally(() => resolve());
    });
  }
};
