// packages
const cheerio = require('cheerio');
const fs = require('fs');
const express = require('express');
const app = express();
const axios = require("axios");

// Needed variables
const port = process.env.PORT || 80;
const folder = __dirname + '/pages/';

app.get('/', (req, res) => {
    res.send("hola");
})

app.get('/page', async (req, res) => {
    var start = new Date().getTime(); // For measure the time of response
    var url = req.query.url;
    var name = url.replace(/[^a-zA-Z0-9 ]/g, '');
    console.log(`Getting the url: ${url}`);

    fs.readFile(folder + name + '.html', async function (err, page) {
        if (err) {
            try {
                // Cargo la web, pillo el html
                const { data } = await axios.get(url);
                var $ = cheerio.load(data);

                var html = processHTML($);

                // Guardo el html en un fichero
                fs.writeFile(folder + '/' + name + '.html', html, function (err) {
                    if (err) throw err;
                    console.log('Url not found, saving in cache...');
                });
            } catch (error) {
                console.log(error);
            }

            // Get the time at the end 
            var end = new Date().getTime();
            console.log(`Request served in ${end - start} ms`);
            res.send(html);
        } else {
            console.log("Found! Serving file from cache...");
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(page);

            // Get the time at the end 
            var end = new Date().getTime();
            console.log(`Request served in ${end - start} ms`);

            return res.end();

        }
    });
})

app.listen(port, () => {
    console.log(`App on port ${port} `);
})

/**
 * Function that iterates all elements in body and create a 
 * new processed HTML only with a list of accepted elements
 * 
 * @param {HTML} $ 
 */
function processHTML($) {
    var _html = "";

    var acceptedElements = [
        'h1',
        'h2',
        'img',
        'p'
    ];

    var children = $("body").find("*");
    children.each((i, elem) => {
        // console.log(elem.name);
        var indexEl = acceptedElements.indexOf(elem.name);

        if (indexEl > -1) {
            var e = acceptedElements[indexEl];
            if (elem.name == 'img') {
                _html += $(elem);
            } else {
                _html += `<${e}> ${$(elem).html()} </${e}>`;
            }
        }
    });
    var processed_html = `<html> <head>
                    <style>
                    body * {font-family: Helvetica, Arial;}
                    body {text-align: justify;}
                    body svg {display: none;}
                    body input {display: none;}
                    body button {display: none;}
                    body p {margin: 50px 0;}
                    div#content_main {width: 1000px; margin: 0 auto;}
                    @media screen and (max-width: 1000px){
                        div#content_main {width: 90%; margin: 0 auto;}
                    }
                    @media
                    </style>
                                <head>
                                    <body>
                                        <div id="content_main">
                                            ${_html}
                                        </div>
                                    </body></html>`;

    return processed_html;
}