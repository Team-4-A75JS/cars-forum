export async function decodeVin(vin) {
    const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`              // Taken from: https://vpic.nhtsa.dot.gov/api/
    );

    if (!response.ok) {
        throw new Error("VIN API request failed.");
    }

    const data = await response.json();
    const results = data.Results;

    const getValue = (variable) =>
        results.find((r) => r.Variable === variable)?.Value || "N/A";

    return {
        make: getValue("Make"),
        model: getValue("Model"),
        year: getValue("Model Year"),
        bodyClass: getValue("Body Class"),
    };
}