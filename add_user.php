<?php
session_start();

// Ensure only Admin can add users
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Admin') {
    header("Location: login.html");
    exit();
}

$conn = new mysqli("localhost", "root", "", "sites_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form submit
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['newUsername'];
    $name = $_POST['newName'];
    $password = password_hash($_POST['newPassword'], PASSWORD_DEFAULT); // Secure hash
    $role = $_POST['newRole'];

    $stmt = $conn->prepare("INSERT INTO users (username, name, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $username, $name, $password, $role);

    if ($stmt->execute()) {
        // Redirect back to admin page with success message
        header("Location: admin.php?msg=UserAdded");
        exit();
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
