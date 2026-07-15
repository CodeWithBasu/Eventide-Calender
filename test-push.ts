import webpush from 'web-push';

webpush.setVapidDetails(
  "mailto:admin@eventide.com",
  "BLv3zGt7WJ6CYF4Wxnlfec192nBB9IOXCCSDH-tYehs8w1lVbtXJOL7fUo_VG2ybrubspSS5KsgGAdcdJCvQcuM",
  "YlP2jPIMFY7iErPdmQRKLoYU52M-iGpMKe4xza8jpJg"
);

const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/cZ0HQQbuDcE:APA91bFm4cjFhPzYrZriwagC0tca10ncjRgL9EwXb3Ebnto269OA_OtyZJUPP0voSV12Bz3yqypUBB0f8OdY_Kt-bllYSk3e-uAjf0Fv2ehpHMN7JZYOn-h3VXgvACpEkVJoRLfDRcU-",
  keys: {
    p256dh: "BLWOVa5Ji4Afqnjvoi0MCfEQGCi7x_jNYviR-3L8GUfcX6ya8VPxQQLzJzUWFBexpPvyChdCwiNgJU5ivtZT4Bs",
    auth: "iJElGWpeYsq5VWpisHJenw"
  }
};

const payload = JSON.stringify({
  title: `MANUAL OVERRIDE: Test Ping!`,
  body: `If you see this, push notifications are working PERFECTLY!`,
  url: "https://eventide-calendar.vercel.app/"
});

webpush.sendNotification(subscription, payload)
  .then(() => console.log("SUCCESS! Notification sent to user's device!"))
  .catch(err => console.error("FAILED to send notification:", err));
