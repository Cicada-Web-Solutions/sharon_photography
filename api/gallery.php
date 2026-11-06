<?php
header("Content-Type: application/json");

$baseDir = __DIR__ . "/../assets/images/";
$baseUrl = "assets/images/";

$folders = [
  "bride" => "Bride",
  "couple" => "Couple",
  "formal_couple" => "Formal"
];

$allowed = ["jpg", "jpeg", "png", "webp", "avif"];
$items = [];

foreach ($folders as $folder => $label) {
  $dir = $baseDir . $folder;

  if (!is_dir($dir)) {
    continue;
  }

  $files = scandir($dir);

  foreach ($files as $file) {
    if ($file === "." || $file === "..") {
      continue;
    }

    $path = $dir . "/" . $file;
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (!is_file($path) || !in_array($ext, $allowed)) {
      continue;
    }

    $size = @getimagesize($path);

    if (!$size) {
      continue;
    }

    $width = $size[0];
    $height = $size[1];
    $ratio = $width / $height;

    $layout = "is-portrait";

    if ($ratio > 1.45) {
      $layout = "is-wide";
    } elseif ($ratio > 0.95 && $ratio < 1.15) {
      $layout = "is-square";
    } elseif ($ratio < 0.65) {
      $layout = "is-tall";
    }

    $number = pathinfo($file, PATHINFO_FILENAME);

    $items[] = [
      "id" => $folder . "-" . $number,
      "title" => $label . " wedding portrait " . $number,
      "category" => $folder === "formal_couple" ? "formal" : $folder,
      "label" => $label,
      "src" => $baseUrl . $folder . "/" . $file,
      "alt" => $label . " wedding photograph " . $number,
      "width" => $width,
      "height" => $height,
      "ratio" => $ratio,
      "layout" => $layout,
      "filename" => $file
    ];
  }
}

usort($items, function ($a, $b) {
  return strnatcmp($a["src"], $b["src"]);
});

echo json_encode($items, JSON_PRETTY_PRINT);