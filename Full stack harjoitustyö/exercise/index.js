// Tuodaan Express-kirjasto, joka on Node.js:lle suunnattu verkkopalvelin-kirjasto
const express = require('express');

// Tuodaan CORS-kirjasto, joka mahdollistaa rajapintojen käytön eri alueilta
const cors = require('cors');

// Luodaan uusi Express-sovellus
const app = express();

// Määritellään palvelimen portti
const port = 8000;

// Tuodaan path-kirjasto, joka auttaa polkujen käsittelyssä
const path = require('path');

// Middleware JSON-datan käsittelyyn
app.use(cors()); // Käytetään CORS-middlewarea
app.use(express.json()); // Käytetään Expressin JSON-middlewarea

// Palvellaan staattisia tiedostoja kansiosta "images"
app.use('/images', express.static(path.join(__dirname, 'images')));

// Tuodaan Mongoose-kirjasto, joka on MongoDB:n kanssa työskentelyyn tarkoitettu ODM (Object Data Modeling) -kirjasto
const mongoose = require('mongoose');

// Määritellään MongoDB-yhteysmerkkijono
const mongoDB ='mongodb+srv://user:8PLv5glXBMr34oe9@jamkdem0.6o9mb.mongodb.net/harkka?retryWrites=true&w=majority&appName=JamkDem0';

// Yhdistetään MongoDB-tietokantaan
mongoose.connect(mongoDB);

// Luodaan tietokantayhteys-olio
const db = mongoose.connection;

// Käsitellään yhteyden virheet
db.on('error', console.error.bind(console, 'connection error:'));

// Käsitellään yhteyden avautuminen
db.once("open", () => console.log("Tietokanta yhteys testattu"));

// Määritellään Mongoose-skeema autoille
const Schema = new mongoose.Schema({
    kuva: { type: String, required: true }, // Auton kuva
    merkki: { type: String, required: true }, // Auton merkki
    malli: { type: String, required: true }, // Auton malli
    hinta: { type: Number, required: true }, // Auton hinta
    kori: { type: String, required: true }, // Auton korimalli
    väri: { type: String, required: true }, // Auton väri
    nimi: { type: String, required: true }, // Auton nimi
    vuosimalli: { type: Number, required: true } // Auton vuosimalli
});

// Luodaan Mongoose-malli 'harkka' käyttäen yllä määriteltyä skeemaa ja kohdistetaan se 'autot'-kokoelmaan
const Auto = mongoose.model("harkka", Schema, "autot");

// Määritellään GET-reitti kaikkien autojen hakemiseksi
app.get("/autot", async (request, response) => {
    const kaara = await Auto.find({}); // Etsitään kaikki autot
    response.json(kaara); // Palautetaan autot JSON-muodossa
});

// Autojen lisäys: POST-reitti /autot
app.post('/autot', async (req, res) => {
    const { merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori } = req.body; // Haetaan tiedot requestin bodysta

    // Varmistetaan, että kaikki pakolliset kentät on annettu
    if (!merkki || !malli || !väri || !vuosimalli || !hinta || !nimi || !kuva || !kori) {
        return res.status(400).send('Kaikki kentät ovat pakollisia!');
    }

    try {
        // Luo uusi auto
        const uusiAuto = new Auto({ merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori });

        // Tallenna tietokantaan
        const tallennettuAuto = await uusiAuto.save();

        console.log('Auto lisätty:', tallennettuAuto); // Tulosta lisätty auto konsoliin
        res.status(201).json(tallennettuAuto); // Palauta lisätty auto vastauksena
    } catch (error) {
        console.error('Virhe auton tallennuksessa:', error); // Tulosta virhe konsoliin
        res.status(500).send('Virhe auton tallennuksessa'); // Palauta virheviesti
    }
});

// Poisto
app.delete('/autot/:id', async (req, res) => {
    const autoId = req.params.id; // Haetaan ID URL-parametristä
    console.log("Poistettava auto ID:", autoId); // Debugging: tulosta ID palvelimelle
    try {
        // Muunna ID MongoDB ObjectId -muotoon käyttäen 'new' avainsanaa
        const result = await Auto.deleteOne({ _id: new mongoose.Types.ObjectId(autoId) });

        if (result.deletedCount > 0) {
            res.status(200).send('Auto poistettu!'); // Palauta onnistunut poisto
        } else {
            res.status(404).send('Autoa ei löydy'); // Palauta virheviesti jos autoa ei löydy
        }
    } catch (error) {
        console.error('Virhe auton poistamisessa:', error); // Tulosta virhe konsoliin
        res.status(500).send('Sisäinen palvelinvirhe'); // Palauta sisäinen palvelinvirhe
    }
});

// Muokkaus
app.put('/autot/:id', async (req, res) => {
    const autoId = req.params.id; // Haetaan auto ID URL-parametristä
    const { merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori } = req.body; // Haetaan tiedot requestin bodysta

    // Varmistetaan, että kaikki pakolliset kentät on annettu
    if (!merkki || !malli || !väri || !vuosimalli || !hinta || !nimi || !kuva || !kori) {
        return res.status(400).send('Kaikki kentät ovat pakollisia!');
    }

    try {
        // Etsitään auto, jonka ID on annettu ja päivitetään sen tiedot
        const updatedAuto = await Auto.findByIdAndUpdate(
            autoId, // Haetaan auto ID:n mukaan
            { merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori }, // Päivitetyt tiedot
            { new: true } // Uusi auto palautetaan päivityksen jälkeen
        );

        if (!updatedAuto) {
            return res.status(404).send('Autoa ei löydy'); // Palauta virheviesti jos autoa ei löydy
        }

        // Palautetaan päivitetty auto
        res.status(200).json(updatedAuto);
    } catch (error) {
        console.error('Virhe auton päivittämisessä:', error); // Tulosta virhe konsoliin
        res.status(500).send('Sisäinen palvelinvirhe'); // Palauta sisäinen palvelinvirhe
    }
});

// Muokkaus (toinen kopio, joka on identtinen edellisen kanssa)
app.put('/autot/:id', async (req, res) => {
    const autoId = req.params.id; // Haetaan auto ID URL-parametristä
    const { merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori } = req.body; // Haetaan tiedot requestin bodysta

    // Varmistetaan, että kaikki pakolliset kentät on annettu
    if (!merkki || !malli || !väri || !vuosimalli || !hinta || !nimi || !kuva || !kori) {
        return res.status(400).send('Kaikki kentät ovat pakollisia!');
    }

    try {
        // Etsitään auto, jonka ID on annettu ja päivitetään sen tiedot
        const updatedAuto = await Auto.findByIdAndUpdate(
            autoId, // Haetaan auto ID:n mukaan
            { merkki, malli, väri, vuosimalli, hinta, nimi, kuva, kori }, // Päivitetyt tiedot
            { new: true } // Uusi auto palautetaan päivityksen jälkeen
        );

        if (!updatedAuto) {
            return res.status(404).send('Autoa ei löydy'); // Palauta virheviesti jos autoa ei löydy
        }

        // Palautetaan päivitetty auto
        res.status(200).json(updatedAuto);
    } catch (error) {
        console.error('Virhe auton päivittämisessä:', error); // Tulosta virhe konsoliin
        res.status(500).send('Sisäinen palvelinvirhe'); // Palauta sisäinen palvelinvirhe
    }
});

// Käynnistetään palvelin ja kuunnellaan määriteltyä porttia
app.listen(port, () => console.log(`Ohjelma kuuntelee portissa ${port}`));
