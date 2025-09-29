<?php
$servername = "localhost";
$username = "root";     // default for XAMPP
$password = "";         // default has no password
$dbname = "sites_db";   // use your actual DB name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
} else {
    echo "✅ Database connected successfully!";
}
?>
