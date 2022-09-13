// packages
const cheerio = require('cheerio');
const fs = require('fs');
const express = require('express');
const app = express();
const axios = require("axios");

// Needed variables
const port = 3000;
const folder = __dirname + '/pages/';

app.get('/', (req, res) => {
    res.send("hola");
})

app.get('/page', async (req, res) => {
    var start = new Date().getTime(); // For measure the time of response
    var url = req.query.url;
    var name = url.replace(/[^a-zA-Z0-9 ]/g, '');
    console.log(`Getting the url: ${url}`);

    fs.readFile(folder + name + '.html', async function(err, page) {
        if (err) {
            try {
                // Cargo la web, pillo el html
                const { data } = await axios.get(url);
                var $ = cheerio.load(data);

                // TODO
                // Before save the HTML, process the code in order to delete all and
                // get just the h1, h2... p... pre... etc

                // TODO -> meter esto en un archivo fuera y en una funcion que lo formatee
                // usar .html() o .tex()
                var html = `<html><head>
                    <style>
                    body * {font-family: Helvetica, Arial;}
                    body {text-align: justify;}
                    body svg {display: none;}
                    div#content_main { width: 1000px; margin: 0 auto;}
                    </style>
                    <head>
                    <body>
                    <div id="content_main">
                    ${$('body').html()} 
                    </div>
                    </body></html>`;
    
                // Guardo el html en un fichero
                fs.writeFile(folder + '/' + name + '.html', html, function (err) {
                if (err) throw err;
                    console.log('Url not found, saving in cache...');
                });
            } catch (error){
                console.log(error);
            }
    
            // Get the time at the end 
            var end = new Date().getTime();
            console.log(`Request served in ${end - start}ms`);
            res.send(html);
        }else{
            console.log("Found! Serving file from cache...");
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);

            // Get the time at the end 
            var end = new Date().getTime();
            console.log(`Request served in ${end - start}ms`);

            return res.end();

        }
    });
})

app.listen( port, () => {
    console.log(`App on port ${port}`);
})