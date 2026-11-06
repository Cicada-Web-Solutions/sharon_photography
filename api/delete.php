<?php
header("Content-Type: application/json");

$allowedBase = realpath(__DIR__ . "/../assets/images");

$data = json_decode(file_get_contents("php://input"), true);
$src = $data["src"] ?? "";

if (!$src) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing image path"]);
  exit;
}

$target = realpath(__DIR__ . "/../" . $src);

if (!$target || strpos($target, $allowedBase) !== 0 || !is_file($target)) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid file"]);
  exit;
}

if (!unlink($target)) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Delete failed"]);
  exit;
}

echo json_encode([
  "success" => true,
  "message" => "Image deleted"
]);