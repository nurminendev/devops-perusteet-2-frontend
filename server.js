//
// devops-perusteet-2-frontend
//
// https://tieto.nurminen.dev/devops-perusteet-2
//
// Esimerkkisovelluksen Node/Express tynkäpalvelin joka tarjoilee frontendin
//


import './dotenv.js'

import path           from 'node:path'
import express        from 'express'

import logger         from './logger.js'


const __dirname = path.dirname(new URL(import.meta.url).pathname)

const port = process.env.PORT || 3000

const app = express()

setupRoutes(app)

app.listen(port, () => {
    logger.info(`Frontend käynnistetty ja kuuntelee portissa ${port} (Node versio ${process.versions.node})`)
})


function setupRoutes(app) {
    const frontendDir = path.resolve(__dirname, 'frontend')

    const cssDir = path.join(frontendDir, 'css')
    const imagesDir = path.join(frontendDir, 'images')
    const jsDir = path.join(frontendDir, 'js')

    // Tarjoa frontend/css hakemisto /css URL:n takana
    app.use('/css', express.static(cssDir, { etag: false, lastModified: false, maxAge: '16070400 sec' }))

    // Tarjoa frontend/images hakemisto /images URL:n takana
    app.use('/images', express.static(imagesDir, { etag: false, lastModified: false, maxAge: '16070400 sec' }))

    // Tarjoa frontend/js hakemisto /js URL:n takana
    app.use('/js', express.static(jsDir, { etag: false, lastModified: false, maxAge: '16070400 sec' }))
    
    // Tarjoa index.html 
    app.get('/', (req, res) => {
        logger.logRequest(req, 'app/index')

        res.sendFile(path.join(frontendDir, 'index.html'))
    })
}
