var ExcelToJSON = function () {

    this.parseExcel = function (file,tag) {
        var reader = new FileReader();

        reader.onload = function (e) {
            let input = tag.cloneNode(true);
            input.removeAttribute('id');

            const path = document.getElementById('upload').value.split(`\\`);
            const fileName = path[path.length - 1];
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            putData(workbook, fileName, input)
        };
        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

const putData = (workbook, fileName,fileInputTag) => {
    hideotherFile();
    const sideContainer = document.getElementById('file-names');

    // Container for File 
    const name = document.createElement('div');
    name.classList.add('names', 'names-active');
    let divForName = document.createElement('div');
    divForName.innerText = fileName;
    divForName.classList.add("div-file-name");
    // name.innerText = nameFromDataBase;
    name.title = fileName;
    divForName.addEventListener('click', handleChangefile, true);
    name.appendChild(divForName);
    // 
    // name.innerText = fileName;
    // name.title = fileName;
    // name.addEventListener('click', handleChangefile, true);
    sideContainer.appendChild(name);
    // id for storing the file container id
    let fileId = document.createElement('input');
    fileId.type = 'hidden';
    fileId.value = fileName + '-file';
    name.appendChild(fileId);

    // setting the form to upload it to sever
    let form = document.createElement('form');
    form.method = "post";
    form.action = "/upload";
    form.appendChild(fileInputTag);
    let uploadButton = document.createElement("button");
    uploadButton.type = "button";
    uploadButton.addEventListener("click", postFile);
    uploadButton.innerText = "⬆";
    uploadButton.classList.add('action-button');
    form.appendChild(uploadButton);
    form.style.display = "inline-block";
    name.appendChild(form);

    const sheetContainer = document.getElementById('sheet-container');

    // displayed file container
    let sheets = document.createElement('div');
    sheets.classList.add('sheets', 'active-sheets');
    sheets.id = fileId.value;
    sheetContainer.appendChild(sheets);

    let sheetNameContainer = document.createElement('div');
    sheetNameContainer.classList.add('sheet-name-container');
    let sheetsContainer = document.createElement('div');
    sheetsContainer.classList.add('sheets-container')

    sheets.appendChild(sheetNameContainer);
    sheets.appendChild(sheetsContainer);

    workbook.SheetNames.forEach(function (sheet) {
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
        var json_object = JSON.stringify(XL_row_object);

        //sheet data
        let data = JSON.parse(json_object);
        // console.log(data);
        // 
        let sheetName = document.createElement('div')
        sheetNameContainer.appendChild(sheetName);
        sheetName.innerText = sheet;
        sheetName.classList.add('sheet-name')
        !sheetName.previousElementSibling ? sheetName.classList.add('sheet-name-active') : '';
        sheetName.title = sheet;
        sheetName.addEventListener('click', handleChangeSheet, true);
        let id = document.createElement('input');
        id.type = 'hidden';
        id.value = fileId.value + '-' + sheet + '-name';
        sheetName.appendChild(id);

        let sheetDiv = document.createElement('div');
        sheetDiv.id = id.value;
        sheetDiv.classList.add('sheet');
        !sheetName.previousElementSibling ? sheetDiv.classList.add('sheet-active') : '';
        sheetsContainer.appendChild(sheetDiv);
        let tag = document.createElement('table');
        sheetDiv.appendChild(tag);

        let row = document.createElement('tr');
        if (data.length === 0) return null;
        const property = Object.keys(data[0]);
        row.innerHTML = `<th>No.</th>`
        property.forEach(value => {
            row.innerHTML += `<th>${value}</th>`;
        })
        tag.appendChild(row);

        //pushing actual data
        data.map((value,index) => {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${index+1}</td>`;
            property.forEach(key => {
                row.innerHTML += `<td>${value[key]}</td>`;
            })
            tag.appendChild(row);
        })
    })
}

const postFile = e => {
    oData = new FormData(e.target.parentElement);
    let message = document.createElement("i");
    message.classList.add("fas", "fa-spinner", "fa-spin");
    message.style.color = "white";
    e.target.parentElement.parentElement.replaceChild(message, e.target.parentElement);

    var oReq = new XMLHttpRequest();
    oReq.open("POST", e.target.parentElement.action, true);
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            // oOutput.innerHTML = "Uploaded!";
            let file = JSON.parse(this.responseText);
            let dowloadLink = document.createElement('a');
            dowloadLink.href = file.url;
            dowloadLink.download = file.name;//check this is is i sis ssissssssssssssssssssssssssssssssssssssssssss
            dowloadLink.innerText = "⬇";
            dowloadLink.classList.add("action-button");
            message.parentElement.replaceChild(dowloadLink, message);
        } else {
            oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
        }
    };

    oReq.send(oData);
    e.preventDefault();
}

function handleFileSelect(e) {
    e.preventDefault();
    if (e.target.files[0].type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        alert("Please Give A Valid File");
        return;
    }
    var files = e.target.files; 
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0], e.target);
}

const loadData = () => {
    document.getElementById('upload').addEventListener('change', handleFileSelect, false);
    document.getElementById('upload').addEventListener('submit', e => e.preventDefault(), true);
    // for (let file of ALLFIELS) iterativeXMLCall(file.name, file.fileName,file.url);
    ALLFIELS.map((file,key)=>iterativeXMLCall(file.name, file.fileName,file.url,key===0));
}

function iterativeXMLCall(nameFromDataBase,fileNameFromDataBase,url,key){
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/data/" + fileNameFromDataBase, true);
    xhttp.send();
    xhttp.onload = function () {
        if (this.status == 200) {
            let data = JSON.parse(this.responseText);
            const sideContainer = document.getElementById('file-names');
            try {
                document.querySelector('i.fas.fa-spinner.fa-spin').remove();
            } catch (err) {}

            // Container for File 
            const name = document.createElement('div');
            name.classList.add('names');
            // console.log(sideContainer.children.length, nameFromDataBase);
            key ? name.classList.add('names-active') : '';

            // putting the name of the file in a span
            let divForName = document.createElement('div');
            divForName.innerText = nameFromDataBase;
            divForName.classList.add("div-file-name");
            // name.innerText = nameFromDataBase;
            name.title = nameFromDataBase;
            divForName.addEventListener('click', handleChangefile, true);
            name.appendChild(divForName);
            sideContainer.appendChild(name);
            // id for storing the file container id
            let fileId = document.createElement('input');
            fileId.type = 'hidden';
            fileId.value = fileNameFromDataBase + '-file';
            name.appendChild(fileId);
            // dowload Link
            let dowloadLink = document.createElement('a');
            dowloadLink.href = url;
            dowloadLink.download = nameFromDataBase;//check this is is i sis ssissssssssssssssssssssssssssssssssssssssssss
            dowloadLink.innerText = "⬇";
            dowloadLink.classList.add('action-button');
            name.appendChild(dowloadLink);

            const sheetContainer = document.getElementById('sheet-container');

            // displayed file container
            let sheets = document.createElement('div');
            sheets.classList.add('sheets')
            key ? sheets.classList.add('active-sheets'):'';
            sheets.id = fileId.value;
            sheetContainer.appendChild(sheets);

            let sheetNameContainer = document.createElement('div');
            sheetNameContainer.classList.add('sheet-name-container');
            let sheetsContainer = document.createElement('div');
            sheetsContainer.classList.add('sheets-container')

            sheets.appendChild(sheetNameContainer);
            sheets.appendChild(sheetsContainer);
            for (sheet in data) {
                let sheetName = document.createElement('div')
                sheetNameContainer.appendChild(sheetName);
                sheetName.innerText = sheet;
                sheetName.classList.add('sheet-name');
                !sheetName.previousElementSibling ? sheetName.classList.add('sheet-name-active') : '';
                sheetName.title = sheet;
                sheetName.addEventListener('click', handleChangeSheet, true);
                let id = document.createElement('input');
                id.type = 'hidden';
                id.value = fileId.value + '-' + sheet + '-name';
                sheetName.appendChild(id);

                let sheetDiv = document.createElement('div');
                sheetDiv.id = id.value;
                // sheetDiv.classList.add('sheet', !sheetName.previousElementSibling ? 'sheet-active' : '');
                sheetDiv.classList.add('sheet');
                !sheetName.previousElementSibling ? sheetDiv.classList.add('sheet-active') : '';
                sheetsContainer.appendChild(sheetDiv);
                let tag = document.createElement('table');
                sheetDiv.appendChild(tag);

                let row = document.createElement('tr');
                const property = Object.keys(data[sheet][0]);
                row.innerHTML = `<th>No.</th>`;
                property.forEach(value => {
                    row.innerHTML += `<th>${value}</th>`;
                })
                tag.appendChild(row);

                //pushing actual data
                data[sheet].map((value,index) => {
                    let row = document.createElement('tr');
                    row.innerHTML = `<td>${index+1}</td>`;
                    property.forEach(key => {
                        row.innerHTML += `<td>${value[key]}</td>`;
                    })
                    tag.appendChild(row);
                })
            }
        }
    }
}

const handleChangeSheet = e => {
    console.log('this is into handleChangeSheet');
    hideOtherSheet(e.target.parentElement);
    let id = e.target.firstElementChild.value;
    e.target.classList.add('sheet-name-active');
    document.getElementById(id).classList.add('sheet-active');
}
const hideOtherSheet = (container) => {
    let tag = container.children;
    for (let i = 0; i < tag.length;i++) {
        tag[i].classList.remove('sheet-name-active');
    }
    tag = container.nextElementSibling.children;
    for (let i = 0; i < tag.length; i++) tag[i].classList.remove('sheet-active');
};
const handleChangefile = e => {
    hideotherFile();
    let id = e.target.parentElement.children[1].value;
    e.target.parentElement.classList.add('names-active');
    document.getElementById(id).classList.add('active-sheets');
}
const hideotherFile=()=>{
    let tag = document.getElementById('file-names').children;
    for (let i = 0; i < tag.length;i++) {
        tag[i].classList.remove('names-active');
    }
    tag = document.getElementsByClassName('sheets');
    for (let i = 0; i < tag.length; i++) tag[i].classList.remove('active-sheets');
};