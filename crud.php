<?php
    class MyDB extends SQLite3 {
        function __construct() {
            $this->open('./database.db');
        }
    }

    $conn = new MyDB();
    if (!$conn) die('Failed to connect to the database');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_POST['action'] == 'add') {
            $colorName = $_POST['colorName'];
            $hexValue = $_POST['hexValue'];
            $sql = "insert into colors (name, hex_value) values ('$colorName', '$hexValue')";

            if ($conn->query($sql) === FALSE) echo "Error: " . $conn->lastErrorMsg();
            else echo "Color inserted successfully"; 
        }
        else if ($_POST['action'] == 'edit') {
            $colorName = $_POST['colorName'];
            $hexValue = $_POST['hexValue'];
            $colorSelection = $_POST['colorSelection'];
            $sql = "update colors set name = '$colorName', hex_value = '$hexValue' where id = $colorSelection";

            if ($conn->query($sql) === FALSE) echo "Error: " . $conn->lastErrorMsg();
            else echo "Color modified successfully"; 
        }
        else if ($_POST['action'] == 'delete') {
            $colorSelection = $_POST['colorSelection'];
            $sql = "delete from colors where id = $colorSelection";

            if ($conn->query($sql) === FALSE) echo "Error: " . $conn->lastErrorMsg();
            else echo "Color deleted successfully";
        }
    }
    else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $result = $conn->query('select * from colors;');
        $options = "";

        while($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $options .= "<option value={$row['id']}>{$row['name']}</option>";
        }
        echo json_encode($options);
    }
?>