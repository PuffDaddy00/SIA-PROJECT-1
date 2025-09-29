<?php
session_start();

// Only admin can delete
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Admin') {
    header("Location: login.html");
    exit();
}

if (isset($_GET['id'])) {
    $id = intval($_GET['id']); // Sanitize input

    $conn = new mysqli("localhost", "root", "", "sites_db");

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    $stmt->close();
    $conn->close();

    // Redirect back to admin page with success message
   header("Location: admin.php?msg=UserDeleted");
   exit();

}
?>

