'use strict';

const express = require("express");
const fs = require("fs");
const multer = require("multer");
const app = express();
const bodyparser = require("body-parser");
const path = require("path");
const atob=require("atob");

app.use(bodyparser.urlencoded({
    extended : true
}));
app.use(bodyparser.json());
app.use(express.static("public"));



const AddInfo = function(folder, Obj) {
    fs.writeFile("./private/users/" + folder + "/name.txt", JSON.stringify({
        fname: Obj.firstName
    }), function(err) {
        if (err) console.log("There was an error while loading name");
    }); //Writing Names
    fs.writeFile("./private/users/" + folder + "/Last_Name.txt", JSON.stringify({
        lname: Obj.lastName
    }), function(err) {
        if (err) console.log("There was an error while loading last name");
    });
    fs.writeFile("./private/users/" + folder + "/email.txt", JSON.stringify({
        mail: Obj.email
    }), function(err) {
        if (err) console.log("There was an error while loading email");
    });
    fs.mkdirSync('./private/users/' + folder + "/Private");
    fs.writeFile("./private/users/" + folder + "/Private/username.txt", JSON.stringify({
        user: Obj.username
    }), function(err) {
        if (err) console.log("There was an error while loading username");
    });
    fs.writeFile("./private/users/" + folder + "/Private/password.txt", JSON.stringify({
        pass: Obj.password
    }), function(err) {
        if (err) console.log("There was an error while loading password");
    });
    if (Obj.team != "") {
        fs.mkdirSync('./private/users/' + folder + "/Team");
        fs.writeFile("./private/users/" + folder + "/Team/team.txt", JSON.stringify({
            team: Obj.team
        }), function(err) {
            if (err) console.log("There was an error while loading Team Name");
        });
    }
    return 1;
};

const ProjectSet = function (user, categ, colabs, descr, project) {
    if (categ !== 'Web Sites' && categ !== 'Blogs' && categ !== 'Other') {
        let path = './private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project;
        fs.writeFile(path + '/title.txt', project, function (err) {
            if (err) {
                console.log(err);
                return false;
            }
        });
        if (colabs) {
            fs.writeFile(path + '/colaborators.txt', colabs, function (err) {
                if (err) {
                    console.log(err);
                    return false
                }
            })
        }
        if (descr) {
            fs.writeFile(path + '/description.txt', descr, function (err) {
               if (err) {
                   console.log(err);
                   return false
               }
            });
        }
        return 1;
    }
};
//End of Useful functions




//Setup

let dest = "";
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        fs.mkdirSync('./private/users/' + dest + "/Images");
        cb(null, './private/users/' + dest + "/Images");
    },

    filename: function(req, file, cb) {
        let extStart = file.originalname.indexOf(path.extname(file.originalname));
        cb(null, dest + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});
//End of Setup



app.get("/public/Form.html", function(req, res, next) { //get the form
    res.sendFile(path.join(__dirname, "./public/Form.html"));
});
app.get("/public/LogIn.html", function(req, res, next) { //get to the login page
    res.sendFile(path.join(__dirname, "./public/LogIn.html"));
});
app.get("/private/ProfPage/prof.html", function(req, res, next) {
    if(req.query.hdgcSaSAsSADASucac) {
        if (req.query.hdgcSaSAsSADASucac.length >= 6) {
            res.sendFile(path.join(__dirname, '/private/ProfPage/prof.html'));
        }
        else {
            res.send("Not Found");
        }
    }
    else{
        res.send("Not Found");
    }
});
app.get("/GetThingReady",function(req,res){
    console.log(atob(atob(req.query.smth)));
    const Dat=atob(atob(req.query.smth));
    fs.exists("./private/users/"+Dat,function(exists){
        if(exists){
            fs.exists("./private/users/"+Dat+'/Images', function (exists) {
               if(exists) {
                   fs.readdir("./private/users/" + Dat + "/Images/", function (err, data) {
                       console.log(path.extname(data[0]));
                       const ext = path.extname(data[0]);
                       fs.readFile("./private/users/" + Dat + "/Images/" + Dat + ext, function (err, data) {
                            res.send(data.toString("base64"));
                       });
                   });
               } else {
                   res.send('The user has no image');
               }
            });
        }
        else{
            console.log("Blown");
            res.statusCode=500;
            res.send("OOPS Smth blown");
        }
    });
});

app.get("/GetThingsReady",function(req,res){
    const Dat=atob(atob(req.query.smth));
    console.log(Dat);
    fs.exists("./private/users/"+Dat,function(exists){
        if(exists){
            const name=JSON.parse(fs.readFileSync("./private/users/"+Dat+"/name.txt",'utf8')).fname;
            const Surn=JSON.parse(fs.readFileSync("./private/users/"+Dat+"/Last_Name.txt",'utf8')).lname;
            const Team=fs.existsSync("./private/users/"+Dat+"/Team")===true ? JSON.parse(fs.readFileSync("./private/users/"+Dat+"/Team/team.txt",'utf8')).team : undefined;
            console.log(name+" "+Surn+" ",Team);
            const ToBeSent={
                Name:name,
                LName:Surn,
                team:Team
            };
            res.send(JSON.stringify(ToBeSent));
        }
        else{
            console.log("Blown");
            res.statusCode=500;
            res.send("OOPS Smth blown");
        }
    });
});

app.get('/private/ProfPage/projectUpload', function (req, res) {
    const user = atob(atob(req.query.jahsdhfggahsjdhfg));
    console.log(user);
    fs.exists('./private/users/' + user, function (exists) {
        if(exists) {
            res.sendFile(path.join(__dirname, '/private/ProfPage/Project.html'));
        } else {
            res.statusCode = 500;
            res.send('Something blew up');
        }
    });
    
});

app.post("/lol", upload.any(), function(req, res) {
    console.log(req.files);
    res.send("OK");
});
app.post("/TXT", function(req, res, next) {
    console.log(req.body);
    fs.exists('./private/users/' + req.body.username, function(exists) {
        if (exists) {
            console.log(exists);
            res.statusCode = 404;
            res.send('user exists');
        } else {
            dest = req.body.username;
            fs.mkdirSync('./private/users/' + req.body.username);
            if (AddInfo(req.body.username, req.body)) res.send("Done");
        }
    });

});


app.post("/CheckAndLogIn", function(req, res) {
    console.log(req.body);
    fs.exists("./private/users/" + req.body.user, function(exists) {
        if (exists) {
            console.log("Username matches");
            fs.readFile("./private/users/" + req.body.user + "/Private/password.txt", function(err, data) {
                if (err) {
                    console.log("Error Checking Password");
                    res.send('Denied');
                } else {
                    if (JSON.parse(data).pass === req.body.pass) {
                        console.log("Password matches");
                        res.send('Logged in');
                    } else {
                        console.log("Password doesn't match");
                        res.send("Denied");
                    }
                }
            })

        } else {
            console.log("Username doesn't match");
            res.send("Denied");
        }
    });
});

app.post('/ProjectDetails', function (req, res) {
    let user = atob(atob(req.body.user));
    let categ = req.body.categ;
    let project = req.body.title;
    let colabs = req.body.colabs;
    let descr = req.body.desc;
    console.log(req.body);
    fs.exists('./private/users/' + user, function (exists) {
       if (exists) {
           if (categ !== 'Web Sites' && categ !== 'Blogs' && categ !== 'Other') {
               fs.exists('./private/Projects/Mobile Applications/' + categ + '/' + user, function (exists) {
                   if (exists) {
                       console.log('Yes');
                   } else {
                       fs.mkdirSync('./private/Projects/Mobile Applications/' + categ + '/' + user);
                   }
               });
              fs.exists('./private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project, function (exists) {
                    if (exists) {
                        res.send('Project already exists');
                    } else {
                        fs.mkdirSync('./private/Projects/Mobile Applications/' + categ + '/' + user + '/' + project);
                        if (ProjectSet(user, categ, colabs, descr, project)) {
                            res.send('Done');
                        } else {
                            res.statusCode = 500;
                            res.send('Blown');
                        }
                    }
              });
           }
       } else {
           res.statusCode = 500;
           res.send('Blown');
       }
    });
});


app.listen(3333, console.log("Server Started"));