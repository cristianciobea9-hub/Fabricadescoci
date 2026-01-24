<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const ADMIN_EMAIL = 'comenzi@fabricadescoci.ro';
const FROM_EMAIL = 'no-reply@fabricadescoci.ro';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'pdf'];

$storageBaseDefault = __DIR__ . '/../../data';
$configFile = dirname(__DIR__, 2) . '/backend/config.php';
$storageBase = $storageBaseDefault;
if (file_exists($configFile)) {
  $cfg = include $configFile;
  if (is_array($cfg) && !empty($cfg['data_root'])) {
    $storageBase = rtrim($cfg['data_root'], '\\/');
  }
}

$uploadRoot = $storageBase . '/uploads';
$rateRoot = $storageBase . '/ratelimit';
$dataRoot = $storageBase . '/cereri';
$rateLimitSeconds = 60;

function respond(int $status, array $payload): void {
  if (!array_key_exists('success', $payload)) {
    $payload['success'] = $status >= 200 && $status < 300;
  }
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

function sanitize_text(string $value): string {
  $value = trim($value);
  $value = str_replace(["\r", "\n"], ' ', $value);
  $value = strip_tags($value);
  return preg_replace('/\s+/', ' ', $value) ?? '';
}

function sanitize_filename(string $value): string {
  $value = preg_replace('/[^a-zA-Z0-9._-]/', '_', $value) ?? '';
  return trim($value, '._-');
}

function mime_from_ext(string $ext): string {
  $map = [
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'pdf' => 'application/pdf'
  ];
  return $map[$ext] ?? 'application/octet-stream';
}

// Fallback mail() transport. Pentru fiabilitate mai bună, configurează PHPMailer + SMTP dacă e disponibil.
function send_mail(string $to, string $subject, string $body, array $attachments = [], array $headersExtra = []): bool {
  $boundary = '==MIME_BOUNDARY_' . md5((string) microtime(true));
  $headers = [
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"'
  ];
  foreach ($headersExtra as $header) {
    $headers[] = $header;
  }

  $message = "--{$boundary}\r\n";
  $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
  $message .= $body . "\r\n";

  foreach ($attachments as $attachment) {
    $fileContent = file_get_contents($attachment['path']);
    if ($fileContent === false) {
      continue;
    }
    $encoded = chunk_split(base64_encode($fileContent));
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: {$attachment['mime']}; name=\"{$attachment['name']}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$attachment['name']}\"\r\n\r\n";
    $message .= $encoded . "\r\n";
  }

  $message .= "--{$boundary}--";

  return mail($to, $subject, $message, implode("\r\n", $headers));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(405, ['success' => false, 'error' => 'Method not allowed']);
}

$honeypot = trim((string) ($_POST['website'] ?? ''));
if ($honeypot !== '') {
  respond(400, ['success' => false, 'error' => 'Spam detected']);
}

$payloadRaw = (string) ($_POST['payload'] ?? '');
if ($payloadRaw === '') {
  respond(400, ['success' => false, 'error' => 'Missing payload']);
}

$payload = json_decode($payloadRaw, true);
if (!is_array($payload)) {
  respond(400, ['success' => false, 'error' => 'Invalid payload']);
}

$requestId = sanitize_text((string) ($payload['requestId'] ?? ''));
if ($requestId === '') {
  $requestId = 'OF-' . date('Ymd') . '-' . random_int(1000, 9999);
}

$client = $payload['client'] ?? [];
$product = $payload['product'] ?? [];
$print = $payload['print'] ?? [];
$quantity = $payload['quantity'] ?? [];
$delivery = $payload['delivery'] ?? [];

$clientEmail = sanitize_text((string) ($client['email'] ?? ''));
$clientPhone = sanitize_text((string) ($client['phone'] ?? ''));
$clientName = sanitize_text((string) ($client['companyName'] ?? ''));
if ($clientName === '') {
  $clientName = sanitize_text((string) ($client['fullName'] ?? ''));
}
if ($clientName === '') {
  $clientName = sanitize_text((string) ($client['contactPerson'] ?? ''));
}

if ($clientName === '') {
  respond(400, ['success' => false, 'error' => 'Numele sau firma sunt obligatorii.']);
}
if ($clientEmail === '' && $clientPhone === '') {
  respond(400, ['success' => false, 'error' => 'Completeaza email sau telefon.']);
}
if ($clientEmail !== '' && !filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['success' => false, 'error' => 'Email invalid.']);
}

$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? '');
$isLocal = in_array($clientIp, ['127.0.0.1', '::1'], true) || stripos($host, 'localhost') !== false;

if (!$isLocal) {
  $rateFile = $rateRoot . '/' . hash('sha256', $clientIp) . '.txt';
  if (!is_dir($rateRoot) && !mkdir($rateRoot, 0755, true) && !is_dir($rateRoot)) {
    respond(500, ['success' => false, 'error' => 'Cannot create rate limit folder']);
  }
  if (file_exists($rateFile)) {
    $last = (int) trim((string) file_get_contents($rateFile));
    if (time() - $last < $rateLimitSeconds) {
      respond(429, ['success' => false, 'error' => 'Too many requests']);
    }
  }
  file_put_contents($rateFile, (string) time(), LOCK_EX);
}

foreach ([$uploadRoot, $dataRoot] as $dir) {
  if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
    respond(500, ['success' => false, 'error' => 'Cannot create storage folder']);
  }
}

// Protejează data/ dacă e în webroot
$htaccessPath = $storageBase . '/.htaccess';
$htaccessContent = "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n";
if (!file_exists($htaccessPath)) {
  @file_put_contents($htaccessPath, $htaccessContent);
}

$uploads = [];
if (!empty($_FILES['logo']) && $_FILES['logo']['error'] !== UPLOAD_ERR_NO_FILE) {
  if ($_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
    respond(400, ['success' => false, 'error' => 'Upload error']);
  }

  if ((int) $_FILES['logo']['size'] > MAX_FILE_SIZE) {
    respond(400, ['success' => false, 'error' => 'Fisierul depaseste 10MB']);
  }

  $originalName = basename((string) $_FILES['logo']['name']);
  $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
  if (!in_array($extension, ALLOWED_EXT, true)) {
    respond(400, ['success' => false, 'error' => 'Tip fisier neacceptat (doar pdf/jpg/jpeg/png).']);
  }

  $safeBase = sanitize_filename(pathinfo($originalName, PATHINFO_FILENAME));
  $safeName = $safeBase !== '' ? $safeBase . '.' . $extension : 'logo.' . $extension;
  $requestDir = $uploadRoot . '/' . $requestId;
  if (!is_dir($requestDir) && !mkdir($requestDir, 0755, true) && !is_dir($requestDir)) {
    respond(500, ['success' => false, 'error' => 'Cannot create upload folder']);
  }

  $targetPath = $requestDir . '/' . $requestId . '_' . $safeName;
  if (!move_uploaded_file($_FILES['logo']['tmp_name'], $targetPath)) {
    respond(500, ['success' => false, 'error' => 'Cannot save upload']);
  }

  $uploads[] = [
    'name' => $requestId . '_' . $safeName,
    'path' => $targetPath,
    'size' => (int) $_FILES['logo']['size'],
    'mime' => mime_from_ext($extension)
  ];
}

$payload['server'] = [
  'receivedAt' => date('c'),
  'ip' => $clientIp
];
$payload['files'] = $uploads;

$dataFile = $dataRoot . '/' . $requestId . '.json';
file_put_contents($dataFile, json_encode($payload, JSON_PRETTY_PRINT));

$printColors = '';
if (isset($print['colors']) && is_array($print['colors'])) {
  $printColors = implode(', ', $print['colors']);
}

$lines = [];
$lines[] = 'Solicitare oferta';
$lines[] = 'ID cerere: ' . $requestId;
$lines[] = 'Data: ' . sanitize_text((string) ($payload['createdAt'] ?? date('c')));
$lines[] = '';
$lines[] = 'Date client:';
$lines[] = 'Tip: ' . sanitize_text((string) ($client['type'] ?? ''));
$lines[] = 'Nume / Firma: ' . $clientName;
$lines[] = 'Persoana contact: ' . sanitize_text((string) ($client['contactPerson'] ?? ''));
$lines[] = 'Telefon: ' . $clientPhone;
$lines[] = 'Email: ' . $clientEmail;
$lines[] = 'Localitate: ' . sanitize_text((string) ($client['locality'] ?? ''));
$lines[] = 'Judet: ' . sanitize_text((string) ($client['county'] ?? ''));
$lines[] = 'Tara: ' . sanitize_text((string) ($client['country'] ?? ''));
$lines[] = 'Adresa: ' . sanitize_text((string) ($client['address'] ?? ''));
$lines[] = 'Observatii adresa: ' . sanitize_text((string) ($client['addressNotes'] ?? ''));
$lines[] = '';
$lines[] = 'Produs:';
$lines[] = 'Tip banda: ' . sanitize_text((string) ($product['tapeType'] ?? ''));
$lines[] = 'Latime: ' . sanitize_text((string) ($product['width'] ?? ''));
$lines[] = 'Lungime: ' . sanitize_text((string) ($product['length'] ?? ''));
$lines[] = 'Grosime: ' . sanitize_text((string) ($product['thickness'] ?? ''));
$lines[] = 'Culoare banda: ' . sanitize_text((string) ($product['color'] ?? ''));
$lines[] = 'Adeziv: ' . sanitize_text((string) ($product['adhesive'] ?? ''));
$lines[] = '';
$lines[] = 'Print:';
$lines[] = 'Activat: ' . (!empty($print['enabled']) ? 'Da' : 'Nu');
$lines[] = 'Text: ' . sanitize_text((string) ($print['text'] ?? ''));
$lines[] = 'Culori: ' . sanitize_text($printColors);
$lines[] = 'Repetitie: ' . sanitize_text((string) ($print['repeat'] ?? ''));
$lines[] = 'Pozitionare: ' . sanitize_text((string) ($print['position'] ?? ''));
$lines[] = 'Alte detalii print: ' . sanitize_text((string) ($print['colorOther'] ?? ''));
$lines[] = '';
$lines[] = 'Cantitate si livrare:';
$lines[] = 'Role: ' . sanitize_text((string) ($quantity['rolls'] ?? ''));
$lines[] = 'Ambalare: ' . sanitize_text((string) ($quantity['packaging'] ?? ''));
$lines[] = 'Termen: ' . sanitize_text((string) ($quantity['deadline'] ?? ''));
$lines[] = 'Metoda livrare: ' . sanitize_text((string) ($delivery['method'] ?? ''));
$lines[] = 'Oras livrare: ' . sanitize_text((string) ($delivery['city'] ?? ''));
$lines[] = 'Plata: ' . sanitize_text((string) ($delivery['payment'] ?? ''));
$lines[] = 'TVA: ' . sanitize_text((string) ($delivery['vatInfo'] ?? ''));
$lines[] = '';
$lines[] = 'Mesaj suplimentar: ' . sanitize_text((string) ($payload['notes'] ?? ''));
$lines[] = 'Fisiere: ' . (empty($uploads) ? 'Niciun fisier' : implode(', ', array_map(fn($u) => $u['name'], $uploads)));
$lines[] = '';
$lines[] = 'Meta:';
$lines[] = 'IP: ' . $clientIp;
$lines[] = 'User-Agent: ' . sanitize_text((string) ($payload['meta']['userAgent'] ?? ''));
$lines[] = 'Pagina: ' . sanitize_text((string) ($payload['meta']['page'] ?? ''));

$bodyAdmin = implode("\r\n", $lines);

$headers = [
  'From: FABRICADESCOCI <' . FROM_EMAIL . '>'
];
if ($clientEmail !== '') {
  $headers[] = 'Reply-To: ' . $clientEmail;
}

$sent = true;
$mailSkipped = false;
if (!$isLocal) {
  $sent = send_mail(ADMIN_EMAIL, 'Solicitare oferta - ' . $clientName, $bodyAdmin, $uploads, $headers);
} else {
  $mailSkipped = true;
}

if (!$sent) {
  respond(500, ['success' => false, 'error' => 'Email send failed']);
}

respond(200, ['success' => true, 'requestId' => $requestId, 'mailSkipped' => $mailSkipped]);
