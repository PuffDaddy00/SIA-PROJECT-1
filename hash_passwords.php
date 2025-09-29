<?php
$conn = new mysqli("localhost","root","","sites_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$res = $conn->query("SELECT id, password FROM users");
$updated = 0;

while ($row = $res->fetch_assoc()) {
    $id = $row['id'];
    $pw = $row['password'];

    // Skip if it already looks like a bcrypt hash
    if (substr($pw,0,4) === '$2y$') continue;

    $hash = password_hash($pw, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE users SET password=? WHERE id=?");
    $stmt->bind_param("si", $hash, $id);
    $stmt->execute();
    $updated++;
}

echo "Updated $updated passwords.";
$conn->close();
