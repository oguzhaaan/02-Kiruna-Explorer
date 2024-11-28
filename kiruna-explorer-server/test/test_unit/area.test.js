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
    test("should return the ID of the newly created area on successful insert", async () => {
        // Mock data
        const geoJson = '{"type": "Polygon", "coordinates": [[...]]}';
        const newAreaId = 15; // Expected ID of the newly created area
    
        // Mock `compareAreas` to return null (no existing area matches)
        vi.spyOn(areaDao, "compareAreas").mockResolvedValueOnce(null);
    
        // Mock `db.run` to simulate a successful insert into the database
        const dbRunMock = vi.spyOn(db, "run").mockImplementation((_query, _params, callback) => {
            callback.call({ lastID: newAreaId }, null); // Simulate insert with new area ID
        });
    
        // Execute the function
        const result = await areaDao.addArea(geoJson);
    
        // Assertions
        expect(result).toBe(newAreaId); // Should return the ID of the newly created area
        expect(areaDao.compareAreas).toHaveBeenCalledWith(geoJson); // Ensure `compareAreas` was called with the correct GeoJSON
        expect(dbRunMock).toHaveBeenCalledWith(
            expect.stringMatching(/INSERT INTO area \(geoJson\)\s+VALUES \(\?\)/),
            [geoJson],
            expect.any(Function)
        ); // Match query ignoring whitespace differences
    });
    
    

    // Caso di errore durante l'inserimento
    test("should throw an error if db.run returns an error", async () => {
        // Mock data
        const geoJson = '{"type": "Polygon", "coordinates": [[...]]}';
        const dbError = new Error("Database error");
    
        // Mock `compareAreas` to return null (no existing area matches)
        vi.spyOn(areaDao, "compareAreas").mockResolvedValueOnce(null);
    
        // Mock `db.run` to simulate an error
        const dbRunMock = vi.spyOn(db, "run").mockImplementation((_query, _params, callback) => {
            callback(dbError); // Simulate a database error
        });
    
        // Execute the function and verify it throws an error
        await expect(areaDao.addArea(geoJson)).rejects.toThrow(dbError);
    
        // Assertions
        expect(areaDao.compareAreas).toHaveBeenCalledWith(geoJson); // Ensure `compareAreas` was called with the correct GeoJSON
        expect(dbRunMock).toHaveBeenCalledWith(
            expect.stringMatching(/INSERT INTO area \(geoJson\)\s+VALUES \(\?\)/),
            [geoJson],
            expect.any(Function)
        ); // Match query ignoring whitespace differences
    });
    

    test("should throw an error if geoJson is null", async () => {
        // Mock data
        const geoJson = null;
    
        // Mock `compareAreas` to ensure it is not called
        const compareAreasMock = vi.spyOn(areaDao, "compareAreas");
    
        // Execute the function and verify it throws an error
        await expect(areaDao.addArea(geoJson)).rejects.toThrow("GeoJson cannot be null");
    
        // Ensure `compareAreas` is never called
        expect(compareAreasMock).not.toHaveBeenCalled();
    });
    
    // Caso di parametro geoJson undefined
    test("should throw an error if geoJson is undefined", async () => {
        const geoJson = undefined;
        const expectedError = new Error("GeoJson cannot be null or undefined");

        vi.spyOn(db, "run").mockImplementation((_sql, _params, callback) => {
            callback(expectedError); // Simula un errore
        });
        const compareAreasMock = vi.spyOn(areaDao, "compareAreas");

        // Verifica che la funzione lanci un errore di tipo
        await expect(areaDao.addArea(geoJson)).rejects.toThrow("GeoJson cannot be null or undefined");

        // db.run non dovrebbe essere chiamato in questo caso
        expect(compareAreasMock).not.toHaveBeenCalled();
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