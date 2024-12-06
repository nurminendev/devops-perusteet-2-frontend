//
// devops-perusteet-2-frontend
//
// https://tieto.nurminen.dev/devops-perusteet-2
//
// Esimerkkisovelluksen Javascript koodi
//


// Täysi URL backendiin
const backendUrl = 'http://192.168.1.144:4000'

// Muuttuja johon tallennetaan TODO avain
let todoAvain = ''


// Avaa ja hakee todo listan avaimella
function avaaTodoLista(e) {
    e.preventDefault()

    const todoKirjauduInputEl = document.getElementById('todo-kirjaudu-input')
    todoAvain = todoKirjauduInputEl.value

    paivitaTodoLista()
}


// Hakee TODO listan backendistä
async function paivitaTodoLista() {
    try {
        // Kutsu backend APIn "index" endpointtia. Tämä on määritelty backendissä api/todo/index.js:ssä
        // ja itse toiminto api/todo/todo.controller.js -tiedoston index() funktiossa
        const todoLista = await backendApiKutsu('GET', '/api/todo')

        // Tarkista että backendin vastaus on array muodossa
        if(!Array.isArray(todoLista)) {
            return renderoiVirhe(`Backend ei palauttanut oikeanlaista TODO-listaa`)
        }

        // Renderöi TODO lista sivulle
        renderoiTodoLista(todoLista)

    } catch (error) {
        console.error(error)
        kasitteleVirhe(error)
    }

}


// Lisää uuden TODO rivin backendiin
async function uusiTodoRivi(e) {
    e.preventDefault()

    // Haetaan uuden TODO rivin input elementti, tämä luotiin renderoiTodoLista() funktiossa
    const todoRiviInputEl = document.getElementById(`uusi-todo-rivi-input`)

    // Uuden Todo rivin teksti löytyy inputin 'value' kentästä
    const uusiTodoTeksti = todoRiviInputEl.value

    // Teksti vaaditaan
    if(!uusiTodoTeksti) return

    try {
        // Kutsu backend APIn "create" endpointtia. Tämä on määritelty backendissä api/todo/index.js:ssä
        // ja itse toiminto api/todo/todo.controller.js -tiedoston create() funktiossa
        await backendApiKutsu('POST', `/api/todo`, { text: uusiTodoTeksti })

        // Hae päivitetty TODO lista ja renderöi se sivulle
        paivitaTodoLista()

        // Tyhjennä input kenttä
        todoRiviInputEl.value = ''

        // Poista focus input kentästä, piilottaa näppäimistön mobiilissa
        todoRiviInputEl.blur()
    } catch (error) {
        kasitteleVirhe(error)
    }
}


// Tallentaa TODO rivin uudelleen backendiin
// todoId = Todo rivin mongo ID
async function tallennaTodoRivi(todoId) {
    // Haetaan TODO rivin input elementti, tämä luotiin renderoiTodoLista() funktiossa
    const todoRiviInputEl = document.getElementById(`todo-rivi-input-${todoId}`)

    // Todo rivin teksti löytyy inputin 'value' kentästä
    const paivitettyTodoTeksti = todoRiviInputEl.value

    try {
        // Kutsu backend APIn "patch" endpointtia. Tämä on määritelty backendissä api/todo/index.js:ssä
        // ja itse toiminto api/todo/todo.controller.js -tiedoston patch() funktiossa
        await backendApiKutsu('PATCH', `/api/todo/${todoId}`, { text: paivitettyTodoTeksti })

        // Hae päivitetty TODO lista ja renderöi se sivulle
        // Muokkauksessa periaatteessa listaa ei tarvitse päivittää, koska muokattu arvo on jo
        // TODO rivin input-kentässä
        // Päivitetään kuitenkin TODO lista varmuuden vuoksi tässä esimerkissä...
        paivitaTodoLista()
    } catch (error) {
        kasitteleVirhe(error)
    }
}


// Poistaa TODO rivin backendistä
async function poistaTodoRivi(todoId) {
    try {
        // Kutsu backend APIn "delete" endpointtia. Tämä on määritelty backendissä api/todo/index.js:ssä
        // ja itse toiminto api/todo/todo.controller.js -tiedoston destroy() funktiossa
        await backendApiKutsu('DELETE', `/api/todo/${todoId}`)

        // Hae päivitetty TODO lista ja renderöi se sivulle
        paivitaTodoLista()
    } catch (error) {
        kasitteleVirhe(error)
    }
}


//
// Renderöi TODO listan sivulle
// todoLista argumentti täytyy olla array-muotoinen lista objekteja
// Todo objekti muotoa:
//
// {
//   _id: "<mongodb id>",
//   text: "todo rivin teksti"
// }
//
// Objektin muoto on määritelty backendissä models/todo.model.js tiedostossa
//
function renderoiTodoLista(todoLista) {
    if(!Array.isArray(todoLista)) return

    // Hae elementit sivulla
    const todoKirjauduEl = document.getElementById('todo-kirjaudu')
    const todoListaEl = document.getElementById('todo-lista')
    const todoListaRivitEl = document.getElementById('todo-lista-rivit')
    const virheEl = document.getElementById('virhe')

    // Piilota "Syötä TODO avain" divi
    todoKirjauduEl.style.display = 'none'

    // Näytä itse todo lista
    todoListaEl.style.display = 'block'

    // Piilota virheviestit
    virheEl.style.display = 'none'

    // Tähän muuttujaan kerätään todo listan HTML
    let todoListaHtml = ''

    // Looppaa kaikki todo rivit, luo HTML jokaiselle riville
    todoLista.forEach(todo => {
        todoListaHtml += `
        <div class="todo-rivi">
          <div><input type="text" value="${todo.text}" id="todo-rivi-input-${todo._id}"></div>
          <div><button type="button" onclick="tallennaTodoRivi('${todo._id}')">Tallenna</button></div>
          <div><button type="button" onclick="poistaTodoRivi('${todo._id}')">Poista</button></div>
        </div>
        `
    })

    // Aseta TODO rivien html #todo-lista divin sisällöksi
    todoListaRivitEl.innerHTML = todoListaHtml
}


// Tekee API kutsun backendiin käyttäen TODO avainta joka on tallennettu "todoAvain" muuttujaan
async function backendApiKutsu(method, apiUrl, data = null) {
    const options = {
        method, headers: {},
        headers: { 'X-Todo-Avain': todoAvain }
    }

    if(data) {
        // Asetetaan Content-Type koska lähetämme JSON muotoista dataa
        options['headers']['Content-Type'] = 'application/json'
        options['body'] = JSON.stringify(data)
    }

    const fullUrl = backendUrl + apiUrl

    const response = await fetch(fullUrl, options)

    if(!response.ok) {
        const error = new Error(`${apiUrl}: ${response.status} ${response.statusText}`)
        error.status = response.status
        error.body = await response.text()

        throw error
    }

    const body = await response.text()

    try {
        return JSON.parse(body)
    } catch(error) {
        return body
    }

}


function kasitteleVirhe(error) {
    console.error(error)
    // Käsittele virheet
    if(error?.status === 401) {
        // 401 tarkoittaa, että TODO avain oli väärä, renderöi virheilmoitus sivulle
        // Tämä vastaus voi palautua backendistä api/auth/auth.service.js tiedoston
        // isAuthenticated() middleware funktiosta, joka on lisätty koko Todo APIin 
        // backendin api/index.js tiedostossa
        renderoiVirhe(`Väärä TODO avain`)
    } else {
        // Joku muu virhe
        renderoiVirhe(`Virhe (${error?.status}): ${error?.body}`)
    }
}


// Renderöi virheen sivulle
function renderoiVirhe(text) {
    const todoKirjauduEl = document.getElementById('todo-kirjaudu')
    const todoListaEl = document.getElementById('todo-lista')
    const virheEl = document.getElementById('virhe')

    todoKirjauduEl.style.display = 'block'
    todoListaEl.style.display = 'none'
    virheEl.style.display = 'block'

    virheEl.innerHTML = text
}
