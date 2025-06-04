package io.ionic.demo.push;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

@SuppressLint("MissingFirebaseInstanceTokenRefresh")
public class MyOpenLinkMessagingService extends FirebaseMessagingService {

  private static final String CHANNEL_ID = "MyChannelId";

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {

    // Extract the category from the data payload
    String category = remoteMessage.getData().get("category");

    // Only handle messages with "OPEN_BROWSER_URL"
    if (!"OPEN_BROWSER_URL".equals(category)) {
      super.onMessageReceived(remoteMessage);
      return;
    }

    String url = remoteMessage.getData().get("outboundUrl");

    // Create Notification Channel (required for Android 8+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
          "My Notifications",
          NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Channel for url notifications");
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
      }

      // Intent to open the URL in the browser
      Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
      browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      PendingIntent openLinkPendingIntent = PendingIntent.getActivity(
        this, 0, browserIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
      );

      // Intent to dismiss the notification without launching the app
      Intent dismissIntent = new Intent(this, NotificationDismissReceiver.class);
      dismissIntent.setAction("ACTION_DISMISS");
      PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(
        this, 1, dismissIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
      );

      // Extract title and body dynamically if available
        String title = remoteMessage.getData().get("title") != null ? remoteMessage.getData().get("title") : "Notification";
        String body = remoteMessage.getData().get("body") != null ? remoteMessage.getData().get("body") : "Tap to open link";

      NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_dialog_info)  // Ensure this icon exists in `res/drawable`
        .setContentTitle(title)
        .setContentText(body)
        .setContentIntent(openLinkPendingIntent)
        .setAutoCancel(true)
        .setPriority(NotificationCompat.PRIORITY_HIGH)  // Ensures visibility
        .setStyle(new NotificationCompat.BigTextStyle().bigText(body)) // Expandable layout
        .addAction(0, "Open Link", openLinkPendingIntent)  // Ensure icons exist
        .addAction(0, "Later", dismissPendingIntent);

      NotificationManagerCompat manager = NotificationManagerCompat.from(this);
      if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        return;
      }
      manager.notify(1, builder.build());
  }
}
