<?php
header("Content-Type: application/json");

$allowedCategories = [
  "bride" => "bride",
  "couple" => "couple",
  "formal" => "formal_couple"
];

$allowedExtensions = ["jpg", "jpeg", "png", "webp", "avif"];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit;
}

$category = $_POST["category"] ?? "";

if (!isset($allowedCategories[$category])) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid category"]);
  exit;
}

if (!isset($_FILES["image"])) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "No image uploaded"]);
  exit;
}

$file = $_FILES["image"];
$extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

if (!in_array($extension, $allowedExtensions)) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid file type"]);
  exit;
}

$folder = $allowedCategories[$category];
$targetDir = __DIR__ . "/../assets/images/" . $folder . "/";

if (!is_dir($targetDir)) {
  mkdir($targetDir, 0755, true);
}

$safeName = preg_replace("/[^a-zA-Z0-9-_\.]/", "", $file["name"]);
$newName = time() . "-" . $safeName;
$targetPath = $targetDir . $newName;

if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Upload failed"]);
  exit;
}

echo json_encode([
  "success" => true,
  "message" => "Image uploaded",
  "src" => "assets/images/" . $folder . "/" . $newName
]);