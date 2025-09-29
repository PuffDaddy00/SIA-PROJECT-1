<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Member') {
    header("Location: login.html");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<h1>
    MEMEBERS
</h1>
<img src="SITES LOGO.png" alt="">
    
</body>
</html>