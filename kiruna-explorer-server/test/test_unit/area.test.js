import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import db from "../../db.mjs";
import AreaDAO from "../../dao/AreaDAO.mjs";
import Area from "../../models/Area.mjs";

describe("Unit Test addArea", () => {
    let areaDao;

    beforeEach(() => {
        areaDao = new AreaDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vi.clearAllMocks();
    });

    // Caso base: inserimento riuscito
    test("should return the id of the newly created area on successful insert", async () => {
        const lastID = 42; // ID di esempio per il documento inserito
        const geoJson = '{"type": "Polygon", "coordinates": [[...]]}';

        // Mock della funzione db.run per simulare un'inserzione con successo
        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback.call({ lastID }, null); // Simula l'inserzione con successo e lastID
        });

        // Esegui la funzione addArea
        const id = await areaDao.addArea(geoJson);

        // Verifica che l'id restituito sia corretto
        expect(id).toEqual(lastID);

        // Verifica che db.run sia stata chiamata con i parametri corretti
        expect(db.run).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO area (geoJson)"),
            [geoJson],
            expect.any(Function)
        );
    });

    // Caso di errore durante l'inserimento
    test("should throw an error if db.run returns an error", async () => {
        const geoJson = '{"type": "Polygon", "coordinates": [[...]]}';
        const expectedError = new Error("Database Error");

        // Mock di db.run per simulare un errore
        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(expectedError); // Simula un errore
        });

        // Verifica che venga lanciato un errore con il messaggio corretto
        await expect(areaDao.addArea(geoJson)).rejects.toThrow("Database Error");

        // Verifica che db.run sia stata chiamata
        expect(db.run).toHaveBeenCalledTimes(1);
    });

    // Caso di parametro geoJson nullo
    test("should throw an error if geoJson is null", async () => {
        const geoJson = null;
        const expectedError = new Error("Database Error");


        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(expectedError); // Simula un errore
        });

        await expect(areaDao.addArea(geoJson)).rejects.toThrow("Database Error");

        // db.run non dovrebbe essere chiamato in questo caso
        expect(db.run).toHaveBeenCalled(1);
    });

    // Caso di parametro geoJson undefined
    test("should throw an error if geoJson is undefined", async () => {
        const geoJson = undefined;
        const expectedError = new Error("Database Error");

        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(expectedError); // Simula un errore
        });

        // Verifica che la funzione lanci un errore di tipo
        await expect(areaDao.addArea(geoJson)).rejects.toThrow("Database Error");

        // db.run non dovrebbe essere chiamato in questo caso
        expect(db.run).toHaveBeenCalled(1);
    });
});


describe("Unit Test getAreaById", () => {
    let areaDao;

    beforeEach(() => {
        areaDao = new AreaDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vi.clearAllMocks();
    });

    test("should return an Area object if the area with the given id is found", async () => {
        const areaId = 1;
        const geoJson = '{"type": "Polygon", "coordinates": [[...]]}';

        // Mock di db.get per simulare una risposta valida
        vi.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, { id: areaId, geoJson });
        });

        // Chiama la funzione da testare
        const area = await areaDao.getAreaById(areaId);

        // Verifica che l'oggetto area sia un'istanza di Area e contenga i dati corretti
        expect(area).toBeInstanceOf(Area);
        expect(area.id).toBe(areaId);
        expect(area.geoJson).toBe(geoJson);

        // Verifica che db.get sia stato chiamato con i parametri corretti
        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.get).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area WHERE id = ?"),
            [areaId],
            expect.any(Function)
        );
    });

    // Caso di area non trovata
    test("should return null if no area with the given id is found", async () => {
        const areaId = 2;

        // Mock di db.get per simulare un'area non trovata
        vi.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(null, null); // Simula il caso in cui nessuna riga sia trovata
        });

        // Chiama la funzione da testare
        const area = await areaDao.getAreaById(areaId);

        // Verifica che il risultato sia null
        expect(area).toBeNull();

        // Verifica che db.get sia stato chiamato correttamente
        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.get).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area WHERE id = ?"),
            [areaId],
            expect.any(Function)
        );
    });

    // Caso di errore nella query
    test("should throw an error if db.get returns an error", async () => {
        const areaId = 3;
        const expectedError = new Error("Database error");

        // Mock di db.get per simulare un errore
        vi.spyOn(db, "get").mockImplementation((_sql, _params, callback) => {
            callback(expectedError); // Simula un errore nel callback
        });

        // Verifica che venga lanciato un errore
        await expect(areaDao.getAreaById(areaId)).rejects.toThrow("Database error");

        // Verifica che db.get sia stato chiamato correttamente
        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.get).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area WHERE id = ?"),
            [areaId],
            expect.any(Function)
        );
    });
});

describe("Unit Test getAllAreas", () => {
    let areaDao;

    beforeEach(() => {
        areaDao = new AreaDAO();
    });

    afterEach(() => {
        // Clear all created function mocks after each test
        vi.clearAllMocks();
    });

    // Caso base: lista di aree trovate
    test("should return an array of Area objects if areas are found", async () => {
        const mockRows = [
            { id: 1, geoJson: '{"type": "Polygon", "coordinates": [[...]]}' },
            { id: 2, geoJson: '{"type": "Polygon", "coordinates": [[...]]}' }
        ];

        // Mock di db.all per simulare una lista di aree trovate
        vi.spyOn(db, "all").mockImplementation((_sql, callback) => {
            callback(null, mockRows);
        });

        // Chiama la funzione da testare
        const areas = await areaDao.getAllAreas();

        // Verifica che il risultato sia un array di istanze di Area con i dati corretti
        expect(areas).toHaveLength(mockRows.length);
        expect(areas[0]).toBeInstanceOf(Area);
        expect(areas[0].id).toBe(mockRows[0].id);
        expect(areas[0].geoJson).toBe(mockRows[0].geoJson);
        expect(areas[1].id).toBe(mockRows[1].id);

        // Verifica che db.all sia stato chiamato una volta
        expect(db.all).toHaveBeenCalledTimes(1);
        expect(db.all).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area"),
            expect.any(Function)
        );
    });

    // Caso di nessuna area trovata
    test("should return an empty array if no areas are found", async () => {
        // Mock di db.all per simulare un array vuoto
        vi.spyOn(db, "all").mockImplementation((_sql, callback) => {
            callback(null, []); // Simula la restituzione di nessuna area
        });

        // Chiama la funzione da testare
        const areas = await areaDao.getAllAreas();

        // Verifica che il risultato sia un array vuoto
        expect(areas).toEqual([]);

        // Verifica che db.all sia stato chiamato una volta
        expect(db.all).toHaveBeenCalledTimes(1);
        expect(db.all).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area"),
            expect.any(Function)
        );
    });

    // Caso di errore nella query
    test("should throw an error if db.all returns an error", async () => {
        const expectedError = new Error("Database error");

        // Mock di db.all per simulare un errore
        vi.spyOn(db, "all").mockImplementation((_sql, callback) => {
            callback(expectedError); // Simula un errore nel callback
        });

        // Verifica che venga lanciato un errore
        await expect(areaDao.getAllAreas()).rejects.toThrow("Database error");

        // Verifica che db.all sia stato chiamato una volta
        expect(db.all).toHaveBeenCalledTimes(1);
        expect(db.all).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM area"),
            expect.any(Function)
        );
    });
});