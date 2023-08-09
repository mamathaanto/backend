const express = require('express');
const router = express.Router();
// const multer = require('multer');
// const path = require('path');



const jwt=require('jsonwebtoken')
const requirementData=require("../model/schema")
const userData=require("../model/userschema")

router.use(express.json());
router.use(express.urlencoded({extended:true}));

function verifytoken(req, res, next) {
  try {
    if (!req.headers.authorization) throw 'Unauthorized';
    let token = req.headers.authorization.split(' ')[1];
    if (!token) throw 'Unauthorized';
    let payload = jwt.verify(token, 'secretKey');
    if (!payload) throw 'Unauthorized';
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
}

// Get All requirement list - Admin
router.get('/requirementlist',verifytoken, (req, res) => {
    requirementData.find()
      .then((Requirements) => {
        res.json(Requirements);
      })
      .catch((error) => {
        console.error('Error retrieving Requirements:', error);
        res.status(500).send('Error retrieving Requirements');
      });
  });

//   get a single requirement details - Admin
  router.get('/get-requirement/:id',verifytoken, (req, res) => {
    const id = req.params.id;
  
    requirementData.findById(id)
      .then((data) => {
        if (!data) {
          return res.status(404).json({ error: 'Data not found' });
        }
        res.json(data);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Error retrieving data' });
      });
  });

  
//   Add requirements - Admin
router.post('/addrequirement',verifytoken, async (req,res)=>{                              
    try{
        const item = req.body;                                               
        const newdata = await requirementData(item);                               
        newdata.save();                                
        res.status(200).json("Requirement Added");    
        console.log(` POST data`);                                                                         
    }catch(error){
        res.status(400).json("Cannot /POST data");                            
        console.log(`Cannot POST data`);                                      
    }
})


// Update requirement details - Admin
router.put('/update-requirement/:id',verifytoken, (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
  
    requirementData.findByIdAndUpdate(id, updatedData, { new: true })
      .then((updated) => {
        res.json(updated);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Error updating requirement' });
      });
  });

router.get('/viewdata/:_id',verifytoken, async (req,res)=>{
  try {
      let id = req.params._id;
      let data = await requirementData.findById(id);
      res.json({data:data,status:200}).status(201);
  } catch (error) {
      res.status(400).json({ message: "GET request CANNOT be completed" });    
  }
}) 


//  Approve Curriculum - Admin
router.put('/approve-curriculum/:id',verifytoken, async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;

  try {
    const updatedItem = await requirementData.findByIdAndUpdate(id, { approved }, { new: true });
    return res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item:', err);
    return res.status(500).json({ error: 'Error updating item' });
  }
});


//   delete a requirement - Admin
  router.delete('/delete-requirement/:id',verifytoken, (req, res) => {
    const id = req.params.id;
  
    requirementData.findByIdAndRemove(id)
      .then((removedData) => {
        if (removedData) {
          console.log('Requirement deleted successfully:', removedData);
          res.json({ message: 'Requirement deleted successfully' });
        } else {
          res.status(404).json({ error: 'Requirement not found' });
        }
      })
      .catch((err) => {
        console.error('Error deleting requirement:', err);
        res.status(500).json({ error: 'Error deleting requirement' });
      });
  });


//   search filter - Admin

  router.get('/search', (req, res) => {
    const { name, institution, area, requirements } = req.query;
    const filters = {};
    if (name !== undefined && name !== '') filters.name = name;
    if (institution !== undefined && institution !== '') filters.institution = institution;
    if (area !== undefined && area !== '') filters.area = area;
    if (requirements !== undefined && requirements !== '') filters.requirements = requirements;
    
    // Fetch data from db based on the filters
    requirementData.find(filters)
      .then(result => res.json(result))
      .catch(err => res.status(500).json({ error: 'Error fetching data.' }));
  });


  router.get('/searchfilter', (req, res) => {
    requirementData.find()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.status(500).json({ error: 'An error occurred' });
      });
  });

// Add Response - Faculty
router.put('/save-requirement/:id',verifytoken, (req, res) => {
  const id = req.params.id;
  const responseData = req.body;

  requirementData.findByIdAndUpdate(id, responseData, { new: true })
    .then((updated) => {
      res.json(updated);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error updating response' });
    });
});




  router.post('/adminlogin', (req, res) => {
    try {      
        var username = req.body.username;
        var password = req.body.password;
      
        // Send the token in the response
        if (username === 'admin@gmail.com' && password === 'admin@123') {
        const token = jwt.sign({ username, password }, 'secretKey');

          res.status(200).send({ message: 'Admin logged in Successful', token: token, role:'admin' })
          console.log('Admin logged in Successful')
        } else {
          res.status(400).send({message:'Unauthorized'});
        }
      } catch (error) {
        res.status(404).send({message:'Not found'});
    }
  });


  router.post('/facultylogin', async (req, res) => {
    try {
      const { username, password } = req.body;
      const faculty = await userData.findOne({ username, password });
      if (faculty) {
        const token = jwt.sign({ username, password }, 'secretKey');
        res.status(200).json({ message: 'Faculty login successful.', token: token, role:'user', user:username });
      } else {
        res.status(400).json({ error: 'Invalid credentials.' });
      }
    } catch (error) {
      res.status(404).json({ error: 'Internal Server Error' });
    }
  
  });

  router.post('/signup', async (req, res) => {
    try {
      const { facultyname, username, password } = req.body;
      const faculty = new userData({ facultyname, username, password });
      await faculty.save();
      const token = jwt.sign({facultyname, username, password }, 'secretKey');

      res.status(201).json({ message: 'Faculty signup successful.' ,token:token});
      console.log('Faculty signup successful.')
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.log('Internal Server Error')
    }
  });



module.exports = router