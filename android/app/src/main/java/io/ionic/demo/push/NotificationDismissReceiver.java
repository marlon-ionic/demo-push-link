package io.ionic.demo.push;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationManagerCompat;

public class NotificationDismissReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    if ("ACTION_DISMISS".equals(intent.getAction())) {
      NotificationManagerCompat manager = NotificationManagerCompat.from(context);
      manager.cancel(1); // Dismiss the notification
    }
  }
}
