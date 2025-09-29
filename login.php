<?php
session_start();

// Database connection
$conn = new mysqli("localhost", "root", "", "sites_db");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$username = $_POST['username'];
$password = $_POST['password'];

// Query user by username
$sql = "SELECT * FROM users WHERE username=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        // Store user in session
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        // Redirect by role
        if ($user['role'] === "Admin") {
            header("Location: admin.php");
        } elseif ($user['role'] === "Leader") {
            header("Location: leader.php");
        } else {
            header("Location: member.php");
        }
        exit();
    } else {
        echo "<p style='color:red;'>Invalid username or password</p>";
    }
} else {
    echo "<p style='color:red;'>Invalid username or password</p>";
}

$conn->close();
?>
