var express = require('express');
var mongoose = require('mongoose');
var f = require('formidable');
var fs = require('fs');
// var mailer = require('nodemailer');
var time = require('./dateModule');
var app = express();
var port = 3002;
var bodyParser = require('body-parser');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
mongoose.Promise = global.Promise;
let url = "mongodb://localhost:27017/DeltaTeamDB";
mongoose.connect(url);
let form = new f.IncomingForm();

var nameSchema = mongoose.Schema({
    fname: String,
    lname: String,
    phone: String,
    email: String,
    pspt: String
});

// var transporter = mailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'afolabifavouroluwatobi@gmail.com',
//       pass: '81655359'
//     }
//   });

var user = mongoose.model("user", nameSchema);

// app.get('/', (req, res)=>{
//     res.sendFile(__dirname+"/index.ejs");
// });

app.get('/', (req, res)=>{
    res.render(__dirname+"/index.ejs", {success: null});
});
app.post('/logs', (req, res)=>{
    // let list = req.body.view;
    let fname = req.body.fname;
    let lname = req.body.lname;
    let phone = req.body.phone;
    let email = req.body.email;
    let image = req.body.image;
    let prop= {};
    let toView = [];
    let vList = [];
    if(fname){
        prop.fname=1
        toView.push("First Name");
        vList.push("fname");
        
    }
    if(lname){
        prop.lname=lname= 1;
        toView.push("Last Name");
        vList.push("lname");
        
    }
    if(phone){
        prop.phone=phone= 1;
        toView.push("Phone");
        vList.push("phone");
        
    }
    if(email){
        prop.email=email= 1;
        toView.push("Email");
        vList.push("email");
        
    }
    if(image){
        prop.pspt= 1;
        toView.push("Image");
        vList.push("pspt");
        
    }
    // console.log(list1);
    // res.render(__dirname+"/logs.ejs", {logs: null});
    user.find({}, prop, (err, result)=>{
      res.render(__dirname+"/logs.ejs", {logs: result, tv: toView, vl: vList});
      console.log(result);
    //   console.log(vList)
    });
});
app.get('/delete', (req,res)=>{
  res.sendFile(__dirname+"/logs.ejs");
});
app.post('/delete', (req, res)=>{
    let id = req.body.uid;
//   console.log(id);
  user.deleteOne({ _id: id }, ()=>{
    //   console.log(result);
    user.find((err, result)=>{
      res.render(__dirname+"/logs.ejs", {logs: result});
    });
  });
})
app.post('/search', (req, res)=>{
    let name = req.body.search;
    console.log(name);
//   console.log(id);
    //   console.log(result);
    user.find({ fname: { $regex: req.body.search, $options: 'i' } },(err, result)=>{
      res.render(__dirname+"/logs.ejs", {logs: result});
      console.log(result);
    });

})
app.get('/update', (req, res)=>{
    res.sendFile(__dirname+"/logs.ejs")
});
app.post('/update', (req, res)=>{
    let id = req.body.uid;
    // console.log(id);
    // console.log(req.body.email);
    form.parse(req, (err, fields, files)=>{
        let fname = fields.fname;
        let lname = fields.lname;
        let phone = fields.phone;
        let email = fields.email;
        let pspt = fields.pspt;
        user.updateOne({ _id: id }, {fname: fname, lname: lname, phone: phone, email: email, pspt: pspt}, (err, result)=>{
        //    console.log(result);
           user.find((err, result)=>{
            res.render(__dirname+"/logss.ejs", {logs: result});
          });
        })
    })
})
app.post('/addDetails', (req,res)=>{
    form.parse(req, function(err, fields, files){
        // console.log(fields);
        
        let ctime = time.dateTime();
        var tmp = files.pspt.path;
        var pname = files.pspt.name;
        var pl = "images/"+pname;
        let fname = fields.fname;
        let lname = fields.lname;
        let phone = fields.phone;
        let email =fields.email;
        fs.rename(tmp, pl, ()=>{
        // console.log(fname);
            let nuser = {
                fname: fname,
                lname: lname,
                phone: phone,
                email: email,
                pspt: pl
                // _id: new objectId()
            }
            var myData = new user(nuser);
            
            myData.save().then(item =>{
                // console.log('here2');
                   res.render(__dirname+"/index.ejs", {success: 'success', time: ctime});
               }).catch(err => {
                   // console.log('here3');
                   res.status(400).send("Unable to save to database " + err);
               })
        });
    });

    // var myData = new user(req.body);
    // console.log('here');
    
    
    // var mailOptions = {
    //     from: 'afolabifavouroluwatobi@gmail.com',
    //     to: email,
    //     subject: 'Details added',
    //     html: `<h1 style="background: lightblue; color: white">Details Submitted</h1><p>Congratulation!!!, ${fname}, your details has successfully been submitted to our portal.<br>Date and Time: ${ctime}</p>`
    //   };

      // transporter.sendMail(mailOptions, function(error, info){
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //     res.render(__dirname+"/index.ejs", {success: success})
      //   }
      // }); 
});

app.listen(port, ()=>{
    console.log("Server started and listening at: " + port )
})