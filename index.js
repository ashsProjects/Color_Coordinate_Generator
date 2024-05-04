var options = "";
var colors = ["Black", "Blue", "Brown", "Green", "Grey", "Orange", "Purple", "Red", "Teal", "Yellow"];
const currVals = {}

$(document).ready(() => {
    //Changing which page is loaded using AJAX
    $('#mainBody').load('homepage.html');
    $('.navInput').click(function(e) {
        e.preventDefault();
        let page = $(this).attr('href');
        $('#mainBody').load(page, function() {
            if (page === 'colorSelection.html') getColors();
        });
    });

    //adding new color to database
    $(document).on('submit', '#addColorForm', function(e) {
        e.preventDefault();

        let params = {};
        $(this).serializeArray().forEach(function(item) {
            params[item.name] = item.value;
        });

        let regExp = new RegExp(/^#[a-f0-9]{6}$/i);
        if (!regExp.test(params.hexValue)) {
            $('#addSpan').html("Hex value must be valid! Example: '#fff000'")
            return;
        }

        $.ajax({
            url: 'crud.php',
            type: 'POST',
            data: params,
            success: function(response) {
                getColors('add', response);
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                console.log(status);
                console.log(error);
            }
        });
        colors.push(params.colorName);
    });

    //editing colors in database
    $(document).on('submit', '#editColorForm', function(e) {
        e.preventDefault();

        let params = {};
        $(this).serializeArray().forEach(function(item) {
            params[item.name] = item.value;
        });
        
        let regExp = new RegExp(/^#[a-f0-9]{6}$/i);
        if (!regExp.test(params.hexValue)) {
            $('#addSpan').html("Hex value must be valid! Example: '#fff000'")
            return;
        }

        $.ajax({
            url: 'crud.php',
            type: 'POST',
            data: params,
            success: function(response) {
                getColors('edit', response);
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                console.log(status);
                console.log(error);
            }
        });
        colors[params.colorSelection-1] = params.colorName;
    });

    //deleting colors from database
    $(document).on('submit', '#deleteColorForm', function(e) {
        e.preventDefault();

        let params = {};
        $(this).serializeArray().forEach(function(item) {
            params[item.name] = item.value;
        });

        if (colors.length <= 2) {
            $('#deleteSpan').html('Cannot delete as there are only 2 items left!');
            return;
        }

        $.ajax({
            url: 'crud.php',
            type: 'POST',
            data: params,
            success: function(response) {
                getColors('delete', response);
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
                console.log(status);
                console.log(error);
            }
        });
        colors.splice(colors[params.colorSelection-1], 1);
    });

    //loading in the content for the generator when submit is clicked
    $(document).on('submit', '#userInputForm', function(e) {
        e.preventDefault();
        let formAction = $(this).attr('action');
        let formData = $(this).serialize();

        let params = {};
        $(this).serializeArray().forEach(function(item) {
            params[item.name] = item.value;
        });
        if (validateParams(params)) return;

        for (let i = 0; i < parseInt(params.numColors); i++) {
            currVals[`d${i}`] = i;
        }
        
        window.history.replaceState(null, '', window.location.pathname + '?' + formData);
        $('#mainBody').load(formAction + '?' + formData);

    });

    //check if dropdowns contain unique values
    $(document).on('change', '.dropdown', function() {
        $('#invalidColors').text("");
        let val = $(this).val();
        let changed = false;

        $('.dropdown').not(this).each(function() {
            if (val === $(this).val()) {
                $('#invalidColors').text("This value has already been selected!");
                changed = true;
            }
        });
        if (changed) this.selectedIndex = currVals[this.id];
        else {
            currVals[this.id] = colors.indexOf(val);
            const rightID = `#upper${this.id.substring(1)}`;
            let cellsInRow = $(rightID).text().split(",");
            if (cellsInRow[0] === "") return;
            
            for (cell of cellsInRow) {
                $(`#${cell}`).css('background', $(this).val());
            }
        }
    });

    $(document).on('click', '.colorable',  function() {
        let currSelectedRadio = $("input[name='selectedColor']:checked").val();
        let currSelectedColor = $(`#d${currSelectedRadio} :selected`).val();
        let currAddCell = $(`#upper${currSelectedRadio}`);
        let prevCell = $(this).val();
        let prevAddCell = $(`#upper${prevCell}`);

        $(this).css("background", currSelectedColor);

        let currentText = currAddCell.text().split(',');
        if (currentText[0] == "") currentText.shift();
        const currID = $(this).attr('id');
        if (!currentText.includes(currID)) currentText.push(currID);
        currentText.sort();
        currAddCell.text(currentText.toString());

        if (prevAddCell !== '' && prevCell !== currSelectedRadio) {
            let prevText = prevAddCell.text().split(',');
            const currID = $(this).attr('id');
            prevText.splice(prevText.indexOf(currID), 1);
            prevAddCell.text(prevText.toString());
        }

        $(this).val(currSelectedRadio);
    });
});

//gets the color in the database 
function getColors(type=null, response=null) {
    $.ajax({
        url: 'crud.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            options = data;
            $('.colorSelection').each(function() {$(this).html(options);});
            switch (type) {
                case 'add': $('#addSpan').html(response); break;
                case 'delete': $('#deleteSpan').html(response); break;
                case 'edit': $('#editSpan').html(response); break;
                default: break;
            }
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseText);
            console.log(status);
            console.log(error);
        }
    });
}

//validates if the numbers passed in through form
function validateParams(params) {
    if (params.rowCol < 1 || params.rowCol > 26 || !Number.isInteger(parseInt(params.rowCol))) {
        $('#invalidForm').text("Number of rows/cols was invalid!");
        return true;
    }

    if (params.numColors < 1 || params.numColors > colors.length || !Number.isInteger(parseInt(params.numColors))) {
        $('#invalidForm').text("Number of colors was invalid!");
        return true;
    }

    return false;
}

// Create printable view of tables when called
function printGenerated() {
    let extractedUpperTable = document.getElementById('upperTable').cloneNode(true);
    let extractedLowerTable = document.getElementById('lowerTable').cloneNode(true);

    //Extract plaintext from color selection drop-downs, maintain table structure
    let colorDropdowns = extractedUpperTable.getElementsByClassName("dropdown");
    for (var i = 0; i < colorDropdowns.length; i++) {
        var selectedColor = colorDropdowns[i].options[colorDropdowns[i].selectedIndex];
        colorDropdowns[i].outerHTML = selectedColor.text;
        i--;
    }

    let radioButtons = extractedUpperTable.getElementsByTagName("input");
    for (i = radioButtons.length - 1; i >= 0; i--) {
        radioButtons[i].remove();
    }

    let colorables = extractedLowerTable.getElementsByClassName("colorable");
    for (cells of colorables) {
        cells.style.background = "white";
    }

    if(extractedUpperTable && extractedLowerTable) {
        var printView = window.open('', '_blank');
        let upperHTML = extractedUpperTable.outerHTML;
        let lowerHTML = extractedLowerTable.outerHTML;
        var printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Table Print View</title>
            <link href="printTables.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <br>
                <div id="upperContainer">
                    ${upperHTML}
                </div>
                <br>
                <div id="lowerContainer">
                    ${lowerHTML}
                </div>
            </div>
            <div class="print-only">
            </div>
        </body>
        </html>
        `;
        printView.document.write(printContent);
    }
}

//changing urls to default when clicking on nav links
const navLinks = document.querySelectorAll('.navInput');
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        window.history.replaceState(null, '', window.location.pathname);
    });
});