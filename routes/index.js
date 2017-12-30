var express = require('express');
var router = express.Router();
var ugs = require('ultimate-guitar-scraper')
var fs = require('fs');
var pdf = require('html-pdf');
var uuid = require('uuid/v1')

function buildInnerTabHTML(tab){
  return `
  <h1><a href="${tab.url}" target="_blank">${tab.name}</a></h1>
  <h2>${tab.artist}</h2>
  <div class="tabContent" contenteditable="true">
    ${tab.content.html.replace(/\n|\r/g, '<br>').replace(/\s{3,}/g, match => match.split('').map(t => '<span>&nbsp;</span>').join(''))}
  </div>
  `
}

function buildTabHTML(tab){
  return `
  <div class="tab">
    <div class="tab-inner">
      <div>
        ${buildInnerTabHTML(tab)}
      </div>
    </div>
  </div>
  `
}

function createPDF(html){
  return new Promise((resolve, reject) => {
    var filename = `./public/downloads/${uuid()}.pdf`

    html = html.replace(/<span class="replaceButton">Replace Tab<\/span>/g, '')

    pdf.create(html).toFile(filename, function(err, data){
      if(err) reject(err)
      else resolve(filename.replace('./public', ''))
    })
  })
}

function getBestTab(tabs){

  return new Promise((resolve, reject) => {
    tabs = tabs.filter(t => t.rating && t.numberRates)
    
    tabs.sort((a,b) => {
      return b.rating - a.rating || b.numberRates - a.numberRates
    })

    //console.log(tabs.map(t => { return { rating: t.rating, numberRates: t.numberRates, url: t.url }}))

    ugs.get(tabs[0].url, (error, tab) => {
      if(error){
        reject(error)
      } else {
        resolve(buildTabHTML(tab))
      }
    })
  })
}

function getTab(song){
  var splitsong = song.split('|'),
    bandname = splitsong[0].trim(),
    songname = splitsong[1].trim()

  return new Promise((resolve, reject) => {
    ugs.search({
      bandName: bandname,
      songName: songname,
      type: ['tabs', 'chords']
    }, (error, tabs) => {
      if(error){
        resolve(null)
      } else {
        if(tabs.length) {
          getBestTab(tabs).then(tab => {
            resolve(tab)
          }).catch(err => {
            resolve(null)
          })
        }
        else resolve(null)
      }
    })
  })
  
}

function getTabs(songlist){
  return new Promise((resolve, reject) => {
    Promise.all(songlist.map(song => getTab(song)).filter(song => song && song != null)).then(data => {
      resolve(data)
    })
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//post /
router.post('/', function(req, res, next){
  console.log(req.originalUrl)
  getTabs(req.body.songlist.split(/\n/)).then(results => {
    res.render('index', { title: 'Results', results: results.join('') })
  })
})

//post /replace-tab
router.post('/replace-tab', function(req, res, next){
  ugs.get(req.body.url, (error, tab) => {
    if(error){
      res.status(500).json({error: error})
    } else {
      res.status(200).json({tab: buildInnerTabHTML(tab)})
    }
  })
})

//post /create-pdf

router.post('/create-pdf', function(req, res, next){
  createPDF(req.body.html).then(filename => {
    res.status(200).json({filename: filename})
  }).catch(err => {
    res.status(500).json({error: err})
  })
})

module.exports = router;