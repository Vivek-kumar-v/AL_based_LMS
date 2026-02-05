export const normalizeConceptName = (name = "") => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\n\r\t]/g, " ")
      .replace(/[^a-z0-9\s]/g, "") // remove symbols
      .replace(/\s+/g, " "); // remove extra spaces
  };
  