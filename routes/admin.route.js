const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const {roles} = require('../utils/constants')

router.get('/users', async (req, res, next)=>{
    try {
        const users = await User.find();
        // res.send(users);
        res.render('../views/manage-users', {users});
    } catch (error) {
        next(error)        
    }
});

router.get('/user/:id', async (req, res, next)=>{
    try {
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            req.flash('error', 'Invalid Object Id')
            res.redirect('/admin/users')
            return;
        }
        const person = await User.findById(id);
        res.render('profile', {person})
    } catch (error) {
        next(error);        
    }
})

router.post('/update-role', async (req, res, next)=>{
    const {id, role} = req.body;

    //Checking for id and role in req.body
    if(!id || !role){
        req.flash('error', 'Invalid Request');
        return res.redirect('back');
    }

    //Check for valid mongoose objectID
    if(!mongoose.Types.ObjectId.isValid(id)){
        req.flash('error', 'Invalid ID');
        return res.redirect('back');
    }

    //Check for valid role
    const rolesArray = Object.values(roles);
    if(!rolesArray.includes(role)){
        req.flash('error', 'Invalid Role');
        return res.redirect('back'); 
    }

    //Admin cannot remove himself as admin
    if(req.user.id === id){
        req.flash('error', 'Admin Can not remove themselves from admin');
        return res.redirect('back'); 
    }

    //Update the user
    const user = await User.findByIdAndUpdate(id, {role: role}, {new: true, runValidators: true});

    req.flash('info', `Updated role for ${user.name} to ${user.role}`);
    res.redirect('/admin/users');
});

module.exports = router;