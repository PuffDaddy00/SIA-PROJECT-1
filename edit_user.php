<?php
$conn = new mysqli("localhost","root","","sites_db");
$id = $_GET['id'] ?? 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $name = $_POST['name'];
    $role = $_POST['role'];
    $password = $_POST['password'];

    if (!empty($password)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET username=?, name=?, role=?, password=? WHERE id=?");
        $stmt->bind_param("ssssi", $username, $name, $role, $hash, $id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET username=?, name=?, role=? WHERE id=?");
        $stmt->bind_param("sssi", $username, $name, $role, $id);
    }

    if ($stmt->execute()) {
        $success = "User updated successfully!";
    } else {
        $error = "Update failed: " . $conn->error;
    }
}

// Fetch user info
$stmt = $conn->prepare("SELECT username, name, role FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();
?>


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Edit User</title>
<style>


    :root {
  --primary-violet: #8D39A3; /* Button color */
    --background-start: #5A2C85;
    --background-end: #D5459B;
    --label-color: #4B5563; /* Medium dark grey for labels (professional look) */
    --input-text-color: #1F2937; /* Very dark grey for high contrast in input fields */
    --deep-shadow: rgba(0, 0, 0, 0.4);
}

    body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, var(--background-start) 0%, var(--background-end) 100%); 
        margin: 0;
        padding: 0;
    }
    .form-container {
        max-width: 450px;
        margin: 60px auto;
        background-color: #fff;
        padding: 30px 40px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .form-container h2 {
        text-align: center;
        margin-bottom: 25px;
        color: #333;
    }
    label {
        display: block;
        margin-bottom: 6px;
        font-weight: bold;
        color: #555;
    }
    input[type="text"], input[type="password"] {
        width: 100%;
        padding: 10px 12px;
        margin-bottom: 20px;
        border-radius: 5px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        transition: border-color 0.3s;
    }
    input:focus {
        border-color: #007BFF;
        outline: none;
    }
    .btn {
        display: inline-block;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
    }
    .btn-success {
        background-color: #28a745;
        color: #fff;
    }
    .btn-success:hover {
        background-color: #218838;
    }
    .btn-secondary {
        background-color: #6c757d;
        color: #fff;
        margin-left: 10px;
    }
    .btn-secondary:hover {
        background-color: #5a6268;
    }
    .alert {
        padding: 12px;
        margin-bottom: 20px;
        border-radius: 5px;
    }
    .alert-success {
        background-color: #d4edda;
        color: #155724;
    }
    .alert-error {
        background-color: #f8d7da;
        color: #721c24;
    }
    small {
        color: #888;
    }


    select[name="role"] {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 20px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #fff;
    color: #1F2937;
    box-sizing: border-box;
    transition: border-color 0.3s, background-color 0.3s;
}

select[name="role"]:focus {
    border-color: #007BFF;
    outline: none;
    background-color: #f9f9f9;
}


</style>
</head>
<body>

<div class="form-container">
    <h2>Edit User</h2>

    <?php if(!empty($success)) echo "<div class='alert alert-success'>$success</div>"; ?>
    <?php if(!empty($error)) echo "<div class='alert alert-error'>$error</div>"; ?>

    <?php if($user): ?>
    <form method="POST" action="edit_user.php?id=<?= $id ?>">
        <label>Username</label>
        <input type="text" name="username" value="<?= htmlspecialchars($user['username']) ?>" required>

        <label>Name</label>
        <input type="text" name="name" value="<?= htmlspecialchars($user['name']) ?>" required>

   <label>Role</label>
<select name="role" required>
    <option value="Admin" <?= $user['role'] === 'Admin' ? 'selected' : '' ?>>Admin</option>
    <option value="Leader" <?= $user['role'] === 'Leader' ? 'selected' : '' ?>>Leader</option>
    <option value="Member" <?= $user['role'] === 'Member' ? 'selected' : '' ?>>Member</option>
</select>


        <label>New Password <small>(leave blank to keep current)</small></label>
        <input type="password" name="password">

        <button type="submit" class="btn btn-success">Update User</button>
        <a href="admin.php" class="btn btn-secondary">Back to Admin Dashboard</a>

    </form>
    <?php else: ?>
        <div class="alert alert-error">User not found.</div>
    <?php endif; ?>
</div>

</body>
</html>
