//
// devops-perusteet-2-frontend
//
// https://tieto.nurminen.dev/devops-perusteet-2
//
// Esimerkkisovelluksen Node/Express tynkäpalvelin joka tarjoilee frontendin
//


import * as pino from 'pino'

//
// Yksinkertainen loggeritoteutus 'pino' kirjastolla
//

const options = { level: process.env.LOG_LEVEL || 'error' }

// Käytä pino-pretty:ä ei-tuotantoympäristössä, jotta lokiviestejä on helpompi lukea devauksen aikana
if(process.env.NODE_ENV !== 'production') {
    options['transport'] = {
        target: 'pino-pretty',
        options: { colorize: true }
    }
}

const logger = pino.default(options)

// Apufunktio HTTP kutsun lokitukseen
logger.logRequest = (req, text = null) => {
    logger.debug(`${req.method} ${req.originalUrl} (${text})`)
}


export default logger
