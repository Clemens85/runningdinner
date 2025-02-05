import { isArrayEmpty, isStringEmpty } from "..";

export type ZipRestrictionsCalculationResult = {
  zipRestrictions: string[];
  invalidZips: string[];
}

export function calculateResultingZipRestrictions(zipRestrictionsStr?: string): ZipRestrictionsCalculationResult {

  const result: ZipRestrictionsCalculationResult = {
    zipRestrictions: [],
    invalidZips: [] 
  };

  if (isStringEmpty(zipRestrictionsStr)) {
    return result;
  }

  const zipEntries = zipRestrictionsStr!.split(",");
  for (const zipEntry of zipEntries) {
    const singleZipEntry = zipEntry.trim();
    if (isStringEmpty(singleZipEntry)) {
      continue;
    }
    if (singleZipEntry.includes("-")) {
      const [startZip, endZip] = singleZipEntry.split("-");
      if (isStringEmpty(startZip) || isStringEmpty(endZip)) {
        result.invalidZips.push(singleZipEntry);
        continue;
      }
      const expandedZips = expandZipRange(startZip, endZip);
      if (isArrayEmpty(expandedZips)) {
        result.invalidZips.push(singleZipEntry);
      } else {
        result.zipRestrictions.push(...expandedZips);
      }
    } else {
      result.zipRestrictions.push(singleZipEntry);
    }
  }

  // Filter out duplicates
  result.zipRestrictions = result.zipRestrictions.filter((value, index, self) => self.indexOf(value) === index);
  result.zipRestrictions.sort();

  return result;
}

function expandZipRange(startZip: string, endZip: string): string[] {
  const expandedZips = [];
  let startZipNumber, endZipNumber;
  try {
    startZipNumber = parseInt(startZip);
    endZipNumber = parseInt(endZip);
  } catch (e) {
    return [];
  }

  if (isNaN(startZipNumber) || isNaN(endZipNumber)) {
    return [];
  }

  for (let i = startZipNumber; i <= endZipNumber; i++) {
    expandedZips.push(i.toString());
  }
  return expandedZips;
}