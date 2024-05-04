<?php
    class MyDB extends SQLite3 {
        function __construct() {
            $this->open('./database.db');
        }
    }

    $conn = new MyDB();
    if (!$conn) die('Failed to connect to the database');

    $sql = "insert into colors (name, hex_value) values ('Black', '#000000'), ('Blue', '#0000ff'), 
        ('Brown', '#a52a2a'), ('Green', '#008000'), ('Grey', '#808080'), ('Orange', '#ffa500'), 
        ('Purple', '#800080'), ('Red', '#ff0000'), ('Teal', '#008080'), ('Yellow', '#ffff00');";
    
    if ($conn->exec('delete from colors; vacuum;') === FALSE) echo 'error with truncate' . $conn->lastErrorMsg();
    if ($conn->exec($sql) === FALSE) echo 'error with insert' . $conn->lastErrorMsg();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Color Coordinate Generator Project for CS312">
    <meta name="keywords" content="HTML, CSS, PHP, JavaScript, CS312">
    <title>Color Coordinate Generator</title>

    <link href="index.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<body>
    <div id="navbar">
        <?php include("navbar.html"); ?>
    </div>
    <div id="mainContent">
        <header id="header">Color Coordinate Generator</header>
        <hr>
        <div id="mainBody"></div>
    </div>
    <script src="index.js"></script>
</body>
</html>