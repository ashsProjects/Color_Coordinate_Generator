<?php
#get values from form
$numDimension = $_GET['rowCol'];
$numColors = $_GET['numColors'];

#set colors and alphabets
class MyDB extends SQLite3 {
    function __construct() {
        $this->open('./database.db');
    }
}

$conn = new MyDB();
if (!$conn) die('Failed to connect to the database');
$sql = "select * from colors;";
$results = $conn->query($sql);

$colors = array();
$hexVals = array();
while($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $colors[] = $row['name'];
    $hexVals[] = $row['hex_value'];
}
$letters = range('A', 'Z');

#setup upper table with numColors rows and dropdowns
$upperTable = "<div id='upperContainer'><h5>UPPER TABLE</h5><table style='width:90%' id='upperTable'>";
for ($i = 0; $i < $numColors; $i++) {
    $upperTable .= "<tr>";
    $dropdown = "<select class='dropdown' id='d" . $i . "'>";
    for ($j = 0; $j < count($colors); $j++) {
        if ($j == $i) $dropdown .= "<option value='" . $hexVals[$j] . "' selected>" . $colors[$j] . "</option>";
        else $dropdown .= "<option value='" . $hexVals[$j] . "'>" . $colors[$j] . "</option>";
    }
    $dropdown .= "</select>";

    $radio = ($i == 0) 
        ? "<input type='radio' id='selectedColor' name='selectedColor' checked value='{$i}'>" 
        : "<input type='radio' id='selectedColor' name='selectedColor' value='{$i}'>" ;

    $upperTable .= "<td style='width:20%'>" . $dropdown . $radio . "</td>";
    $upperTable .= "<td style='width:80%' id='upper{$i}''></td>";
    $upperTable .= "</tr>";
}
$upperTable .= "</table>";
$upperTable .= "<span id='invalidColors'></span></div>";

#setup lower table with numDimension x numDimension cells
$lowerTable = "<div id='lowerContainer'><h5>LOWER TABLE</h5><table id='lowerTable'>";
for ($i = 0; $i <= $numDimension; $i++) {
    $lowerTable .= "<tr>";
    for ($j = 0; $j <= $numDimension; $j++) {
        if ($i == 0) {
            if (!$j == 0) $lowerTable .= "<th>" . $letters[$j-1] . "</th>";
            else $lowerTable .= "<th></th>";
        } else {
            if ($j == 0) $lowerTable .= "<td>" . $i . "</td>";
            else $lowerTable .= "<td id='{$letters[$j-1]}{$i}' class='colorable' value=''></td>";
        }
    }
    $lowerTable .= "</tr>";
}
$lowerTable .= "</table></div>";

#setup submit button
$submitButton = "<input type='button' onclick='printGenerated()' value='Print'><br><br>";

#render all tables and button by echoing
echo ($upperTable .  $lowerTable . $submitButton);
?>