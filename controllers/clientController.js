const { response, request } = require("express");
const express = require("express");
const { Client } = require("../models/entities");
const clientDAO = require("../db/clientDAO");
const database = require("../db/dbQuery");

const loginControl = (request, response) => {
    const clientServices = require('../services/clientServices');

    let username = request.body.username;
    let password = request.body.password;
    if (!username || !password) {
        response.render("postLogin", {result: "Please type in a valid username or password",});
    }else {
        if (request.session && request.session.user== username) {
            response.render("postLogin", { result: "Already logged in!" });
        } else {
            clientServices.loginService(username, password, function(err, dberr, client) {
                console.log("Client from login service :" + JSON.stringify(client));
                if (client === null) {
                    console.log("Authentication problem!");
                    response.render("postLogin", { result: "Login failed" });
                } else {
                    console.log("User from login service :" + client[0].num_client);
                    //add to session
                    request.session.user = username;
                    request.session.num_client = client[0].num_client;
                    if (username == "Hana") {
                        request.session.admin = true;
                    } else {
                        request.session.admin = false;
                    }
                    response.render("postLogin", {
                        result: `Login successful! (Username: ${username}, ID: ${client[0].num_client})`,
                    });
                }
            });
        }
    }
};


const registerControl = (request, response) => {
    const clientServices = require('../services/clientServices');

    let username = request.body.username;
    let password = request.body.password;
    let society = request.body.society;
    let contact = request.body.contact;
    let addres = request.body.addres;
    let zipcode = request.body.zipcode;
    let city = request.body.city;
    let phone = request.body.phone;
    let fax = request.body.fax;
    let max_outstanding = request.body.max_outstanding;
    let client = new Client(username, password, 0, society, contact, addres, zipcode, city, phone, fax, max_outstanding);

    clientServices.registerService(client, function(err, exists, insertedID) {
        console.log("User from register service :" + insertedID);
        if (err) {
        }else if (exists) {
            console.log("Username taken!");
            response.render('postRegister', { result: `Registration failed. Username "${username}" already taken!` });
        } else {
            client.num_client = insertedID;
            console.log(`Registration (${username}, ${insertedID}) successful!`);
            console.log('Please login to continue');
            response.render('login');
        response.end();
        }
    });
};

const getClients = (request, response) => {
    const clientServices = require('../services/clientServices');
    clientServices.searchService(function(err, rows) {
        response.json(rows);
        response.end();
    });
};

function getClientByNumclient(num, callback) {
    clientDAO.findByNumclient(num, function (err, rows) {
      callback(null, rows);
    });
  }
  
const getClient = (request, response) => {
  const clientServices = require('../services/clientServices');
  let username = request.session.user;
  if (request.session.admin) {
    const selectClient = "SELECT * from client";
    database.getResult(selectClient, function (err, rows) {
      if (!err) {
        response.render("clients_admin", { client: rows });
      } else {
      }
    });
  } else {
    clientDAO.findByUsername(username, function (err, rows) {
      num = rows[0].num_client;
      getClientByNumclient(num, function (err, rows_2) {
        response.render("clients_user", {
          username: username,
          num: num,
          society: rows_2[0].society,
          contact: rows_2[0].contact,
          addres: rows_2[0].addres,
          zipcode: rows_2[0].zipcode,
          city: rows_2[0].city,
          phone: rows_2[0].phone,
          fax: rows_2[0].fax,
          max: rows_2[0].max_outstanding,
        });
      });
    });
  }
};

module.exports = {
    loginControl,
    registerControl,
    getClients,
    getClientByNumclient,
    getClient,
};