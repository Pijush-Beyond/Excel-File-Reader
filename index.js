import Express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import util from 'util';
import xlsx from 'xlsx';
import exphbs from 'express-handlebars';
import fs from "fs";
import axios from "axios";

const database = 'files.json';

const __dirname = path.resolve(path.dirname(''))

const app = Express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// midilwares
app.use(Express.json());
app.use(Express.urlencoded());
app.use(fileUpload());
app.use(Express.static(path.join(__dirname, 'static')));

// simple request handelers
// uploading file
app.get('/', (req, res) => {
  res.render('home');
})
app.post('/upload',async (req, res) => {
  try {
    // console.log(req.files);
    const file = req.files.files;
    const fileName = file.name;
    const extension = path.extname(fileName);
    const alowedExtensions = /xlsx/;
    if (!alowedExtensions.test(extension)) throw 'File Type is not allowed!!';
    else {
      const URL = '/static/' + file.md5+extension;
      await util.promisify(file.mv)('./static/' + URL);
      fs.readFile(database, 'utf8', (err, string) => {
        let data = JSON.parse(string);
        data.push({ fileName: file.md5 + extension, name: fileName,url: URL })
        fs.writeFile('files.json', JSON.stringify(data), () => {
          console.log('File Upload is Successfull!!');
          res.status(200).json({ url: URL, name: fileName });
        })
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message:err})
  }
})
// reading file
app.get('/data/:fileName', (req, res) => {
  // console.log('/data/' + req.params.fileName);
  try {
    const fileName = req.params.fileName;
    const wb = xlsx.readFile(path.join(__dirname,'static/static/' +fileName), { cellDates: true });
    
    const responsedata = {};
    
    if (req.params.fileName === "427e1fc0b3fd5e90090672ab7681391b.xlsx") {
      for (let i in wb.Sheets)
        responsedata[i] = xlsx.utils.sheet_to_json(wb.Sheets[i]);
      special(res, responsedata);
    } else {
      for (let i in wb.Sheets)
        responsedata[i] = xlsx.utils.sheet_to_json(wb.Sheets[i]).map(((value) => {
          for (let j of Object.keys(value))
            if (value[j] instanceof Date) value[j] = value[j].toDateString();
          return value;
        }));
      res.status(200).json(responsedata);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
})
app.get('/files', (req, res) => {
  fs.readFile(database, 'utf8', (err,string) => res.render('index', { xlsx: string }));
})

const special = (res, responsedata) => {
  const date = new Date();
  const sheetName = Object.keys(responsedata)[0];
  responsedata[sheetName] = responsedata[sheetName].map(value => {
    let diff = new Date(date - value.DOB);
    value.Age = diff.getFullYear() - 1970;
    value.Tax = parseInt(value.Salary * 0.15);
    try { value.DOB = value.DOB.toDateString(); } catch (err) { }
    return {Name:value.Name,DOB:value.DOB,Age:value.Age,Salary:value.Salary,Tax:value.Tax};
  })
  res.status(200).json(responsedata);
}

app.get('/api_fetch', (req, res) => {
  res.render('api_fetch');
})

app.get('/api_data', (req, res) => {
  axios.get("https://api.myzila.com/LiveDashboard").then(response => res.status(200).json({ data: response.data.data })).catch(err => res.status(200).json({ message: "somthng wrong!!"}));
})
const port = process.env.port || 5000;
app.listen(port, () => console.log(`App is Listening to port ${port} \n\n`));