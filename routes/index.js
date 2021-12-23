const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
//------------ User Model ------------//
const User = require('../models/User');
const Feedb = require('../models/Feed');
const Queryy = require('../models/Query');
//------------ Welcome Route ------------//
router.get('/', (req, res) => {
    res.render('home');
});
router.get('/home', (req, res) => {
  res.render('home');
});

//------------ Dashboard Route ------------//
router.get('/dashboard', ensureAuthenticated, (req, res) => res.render('dash', {
    name: req.user.name
}));
router.get('/contact', (req, res) => res.render('contact_us', {
  
}));

router.get('/submit_feedback',ensureAuthenticated, (req, res) => res.render('submit_feedback',{
  email: req.user.email
  
}));
router.get('/submit_query',ensureAuthenticated, (req, res) => res.render('submit_query',{
  email: req.user.email
  
}));


router.get('/display', ensureAuthenticated, function(req, res , next) {
  email: req.user.email,
  
  Feedb.find( {email1: req.user.email},function(err, feeds) {
    if (err) {
      console.log(err);
    } else {
      res.render('display', { feeds: feeds });
      console.log(feeds);
    }
}); 
});
router.get('/view_feedback', ensureAuthenticated, function(req, res , next) {
  email: req.user.email,
  
  Feedb.find( {email1: req.user.email},function(err, users) {
    if (err) {
      console.log(err);
    } else {
      res.render('view_feedback', { users: users });
      console.log(users);
    }
}); 
});
router.get('/view_query', ensureAuthenticated, function(req, res , next) {
  email: req.user.email,
  
  Queryy.find( {email1: req.user.email},function(err, users) {
    if (err) {
      console.log(err);
    } else {
      res.render('view_query', { users: users });
      console.log(users);
    }
}); 
});
router.get('/user_profile', ensureAuthenticated, function(req, res , next) {
  email: req.user.email,
  
  User.find( {email: req.user.email},function(err, users) {
    if (err) {
      console.log(err);
    } else {
      res.render('user_profile', { users: users});
      console.log(users);
    }
}); 
});

router.get('/view_all_feedback',  function(req, res) {
    User.aggregate([
        {
          $lookup: {
            from: "feeds",
            localField: "email",
            foreignField: "email1",
            as: "feed_info",
          },
        },
        {
            $unwind: "$feed_info",
          },
      ]) 
        .then((result) => {
          res.render('view_all_feedback', { users : result });
          console.log(result);
        })
        .catch((error) => {
          console.log(error);
        });
   
});
router.get('/view_all_feedback1',  function(req, res) {
  User.aggregate([
      {
        $lookup: {
          from: "feeds",
          localField: "email",
          foreignField: "email1",
          as: "feed_info",
        },
      },
      {
          $unwind: "$feed_info",
        },
    ]) 
      .then((result) => {
        res.render('view_all_feedback1', { users : result });
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
 
});
router.get('/feedbb',ensureAuthenticated,  function(req, res) {
  User.aggregate([
      {
        $lookup: {
          from: "feeds",
          localField: "email",
          foreignField: "email1",
          as: "feed_query_info",
        },
      },
      {
          $unwind: "$feed_query_info",
        },
    ])
      .then((result) => {
        res.render('feedbb', { users : result });
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  
});
 /* DELETE User BY ID */
 router.get('/delete/:id', ensureAuthenticated,function(req, res) {
  User.findByIdAndRemove(req.params.id, function (err, project) {
    if (err) {
    
    req.flash('error_msg', 'Record Not Deleted');
    res.redirect('../feedb');
    } 
    else {
      req.flash('success_msg', 'Record Deleted');
      res.redirect('../feedb');
    }
  });
});  

      /* GET SINGLE User BY ID */
 router.get('/edit/:id', ensureAuthenticated,function(req, res) {
  console.log(req.params.id);
  User.findById(req.params.id, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user);
       
      res.render('edit', {users: user });
    }
  });
});
 
/* UPDATE User */
router.post('/edit/:id', ensureAuthenticated,function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err) {
    if(err){
      req.flash('error_msg', 'Something went wrong! User could not updated.');
      res.redirect('edit/'+req.params.id);
  } else {
    req.flash(
      'success_msg',
      'UPDATED successfully!');
    res.redirect('../feedb');
  }
  });
});

 /* DELETE User BY ID */
 router.get('/delete_fd/:id', ensureAuthenticated,function(req, res) {
  Feedb.findByIdAndRemove(req.params.id, function (err, project) {
    if (err) {
    
    req.flash('error_msg', 'feedback Not Deleted');
    res.redirect('../view_feedback');
    } 
    else {
      req.flash('success_msg', 'Feedback Deleted');
      res.redirect('../view_feedback');
    }
  });
});  
/* DELETE User BY ID */
router.get('/delete_query/:id',ensureAuthenticated, function(req, res) {
  Queryy.findByIdAndRemove(req.params.id, function (err, project) {
    if (err) {
    
    req.flash('error_msg', 'Query Not Deleted');
    res.redirect('../view_query');
    } 
    else {
      req.flash('success_msg', 'Query Deleted');
      res.redirect('../view_query');
    }
  });
});  


      /* GET SINGLE User BY ID */
 router.get('/update_feedback/:id', ensureAuthenticated,function(req, res) {
  console.log(req.params.id);
  Feedb.findById(req.params.id, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user);
       
      res.render('update_feedback', {users: user });
    }
  });
});
 
/* UPDATE User */
router.post('/update_feedback/:id',ensureAuthenticated, function(req, res) {
  Feedb.findByIdAndUpdate(req.params.id, req.body, function (err) {
    if(err){
      req.flash('error_msg', 'Something went wrong! User could not updated.');
      res.redirect('edit/'+req.params.id);
  } else {
    req.flash(
      'success_msg',
      'Feedback Updated Successfully!');
    res.redirect('../view_feedback');
  }
  });
});

      /* GET SINGLE User BY ID */
      router.get('/update_query/:id', ensureAuthenticated,function(req, res) {
        console.log(req.params.id);
        Queryy.findById(req.params.id, function (err, user) {
          if (err) {
            console.log(err);
          } else {
            console.log(user);
             
            res.render('update_query', {users: user });
          }
        });
      });
       
      /* UPDATE User */
      router.post('/update_query/:id',ensureAuthenticated, function(req, res) {
        Queryy.findByIdAndUpdate(req.params.id, req.body, function (err) {
          if(err){
            req.flash('error_msg', 'Something went wrong! User could not updated.');
            res.redirect('edit/'+req.params.id);
        } else {
          req.flash(
            'success_msg',
            'Query Updated Successfully!');
          res.redirect('../view_query');
        }
        });
      });
      
/* Update User Profile */
/* UPDATE User */
router.get('/user_profile_edit/:id', ensureAuthenticated,function(req, res) {
  console.log(req.params.id);
  User.findById(req.params.id, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log(user);
       
      res.render('user_profile_edit', {users: user });
    }
  });
});
router.post('/user_profile_edit/:id',ensureAuthenticated, function(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err) {
    if(err){
      req.flash('error_msg', 'Something went wrong! User could not updated.');
      res.redirect('user_profile_edit/'+req.params.id);
  } else {
    req.flash(
      'success_msg',
      'UPDATED SUCCESSFULLY!');
    res.redirect('../user_profile');
  }
  });
});

module.exports = router;
