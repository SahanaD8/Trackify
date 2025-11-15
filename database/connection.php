<?php
$conn = new mysqli("localhost", "root", "", "trackify");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>