<?php
// Copy this file to backend/config.php and edit values before deployment.
return [
  // Absolute path to a directory OUTSIDE your public_html where uploads and requests will be stored.
  // e.g. '/home/username/data' or __DIR__ . '/../data_secure'
  'data_root' => __DIR__ . '/../data_secure',

  // Optional SMTP settings to enable authenticated email sending (PHPMailer or similar required):
  // 'smtp' => [
  //   'host' => 'smtp.example.com',
  //   'port' => 587,
  //   'username' => 'comenzi@example.com',
  //   'password' => 'secret',
  //   'secure' => 'tls'
  // ],
];
