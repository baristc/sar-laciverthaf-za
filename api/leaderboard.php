<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
date_default_timezone_set('Europe/Istanbul');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $configFile = __DIR__ . '/config.php';
    if (!is_file($configFile)) {
        respond(503, ['ok' => false, 'message' => 'Skor tablosu henüz yapılandırılmadı.']);
    }

    $config = require $configFile;
    foreach (['host', 'port', 'database', 'username', 'password'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key])) {
            throw new RuntimeException('Geçersiz sunucu ayarı.');
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $config['host'],
        $config['port'],
        $config['database']
    );
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $pdo->exec("CREATE TABLE IF NOT EXISTS solo_scores (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(18) NOT NULL,
        score INT UNSIGNED NOT NULL DEFAULT 0,
        score_day DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_daily_player (score_day, player_name),
        KEY daily_ranking (score_day, score),
        KEY all_time_ranking (score)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $today = date('Y-m-d');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'POST') {
        $input = json_decode((string) file_get_contents('php://input'), true);
        if (!is_array($input)) {
            respond(400, ['ok' => false, 'message' => 'Geçersiz istek.']);
        }

        $name = trim((string) ($input['name'] ?? ''));
        $score = filter_var($input['score'] ?? null, FILTER_VALIDATE_INT);
        $nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
        if ($nameLength < 1 || $nameLength > 18 || $score === false || $score < 0 || $score > 1000000) {
            respond(422, ['ok' => false, 'message' => 'Oyuncu adı veya skor geçersiz.']);
        }

        $statement = $pdo->prepare(
            'INSERT INTO solo_scores (player_name, score, score_day)
             VALUES (:name, :score, :day)
             ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))'
        );
        $statement->execute(['name' => $name, 'score' => $score, 'day' => $today]);
    } elseif ($method !== 'GET') {
        header('Allow: GET, POST');
        respond(405, ['ok' => false, 'message' => 'Bu işlem desteklenmiyor.']);
    }

    $dailyStatement = $pdo->prepare(
        'SELECT player_name AS name, score
         FROM solo_scores
         WHERE score_day = :day
         ORDER BY score DESC, updated_at ASC
         LIMIT 10'
    );
    $dailyStatement->execute(['day' => $today]);
    $daily = array_map(static fn(array $row): array => [
        'name' => $row['name'],
        'score' => (int) $row['score'],
    ], $dailyStatement->fetchAll());

    $allTimeRow = $pdo->query(
        'SELECT player_name AS name, score
         FROM solo_scores
         ORDER BY score DESC, updated_at ASC
         LIMIT 1'
    )->fetch();

    respond(200, [
        'ok' => true,
        'date' => $today,
        'daily' => $daily,
        'allTime' => $allTimeRow ? [
            'name' => $allTimeRow['name'],
            'score' => (int) $allTimeRow['score'],
        ] : null,
    ]);
} catch (Throwable $error) {
    error_log('Leaderboard error: ' . $error->getMessage());
    respond(500, ['ok' => false, 'message' => 'Skor tablosuna şu anda ulaşılamıyor.']);
}