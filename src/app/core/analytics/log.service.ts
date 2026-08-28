import { Injectable, InjectionToken } from '@angular/core';
import { isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Firestore, FirestoreInstances, setDoc, doc } from '@angular/fire/firestore';
import { TimeAtRoute } from './time-analytics.service';

interface LogData extends TimeAtRoute {
  interactions?: Array<{ 0: number; 1: string; 2: string; 3: string; }>;
}

/**
 * Helper function for getting a log id to make sure we don't save two logs
 * of the same session at the same time
 */
function getLogId(data: LogData): string {
  return `${data.__sessionId}__${data.startTime}`;
}

export interface LogService {
  rawLog(data: LogData): void;
  rawLogOnBeaconEvent(data: LogData): void;
}

// InjectionToken that can be swapped out for
export const LOG_SERVICE = new InjectionToken<LogService>('LogService');

// When using the mock DB we don't want any Firestore dependencies, which is why we're creating a separate one
@Injectable({
  providedIn: 'root',
})
export class LogInDevService {
  /** Whether should log to the console in dev. */
  LOG_IN_DEV = true;

  constructor() { }

  rawLog(data: LogData) {
    if (this.LOG_IN_DEV) {
      const logId = getLogId(data);
      console.log('LOGGING', logId, data);
    }
  }

  rawLogOnBeaconEvent(data: LogData) {
    if (this.LOG_IN_DEV) {
      const logId = getLogId(data);
      if (data !== null) {
        console.log('BEACON LOGGING', logId, data);
      }
    }
  }
}

/** Function for reformatting log for beacon. */
function reformatLogForBeacon(data: LogData, logType, logId) {
  // Converts JSON objects to Firestore's REST API Document format
  // from: https://stackoverflow.com/questions/62246410/how-to-convert-a-firestore-document-to-plain-json-and-vice-versa/62304377#62304377
  const jsonToDocument = (value) => {
    if (!value) {
      return { 'nullValue': null };
    } else if (!isNaN(value) && !(value && value.constructor === Array)) { // edit, checking if not an array since empty arrays pass the isNan test
      if (value.toString().indexOf('.') != -1) {
        return { 'doubleValue': value };
      } else {
        return { 'integerValue': value };
      }
    } else if (value === 'true' || value === 'false' || typeof value === 'boolean') {
      return { 'booleanValue': value };
    } else if (typeof value === 'string') { // edit: removed check for Date that was before String check (see below)
      return { 'stringValue': value };
    } else if (value && value.constructor === Array) {
      return { 'arrayValue': { values: value.map((v) => jsonToDocument(v)) } };
    } else if (typeof value === 'object') {
      const obj = {};
      for (const o in value) {
        if (Object.prototype.hasOwnProperty.call(value, o)) {
          obj[o] = jsonToDocument(value[o]);
        }
      }
      return { 'mapValue': { fields: obj } };
    }
  };

  if (data !== null && environment.firebaseLogs['projectId']) {
    const wrappedData = {
      writes: [
        {
          update: {
            name: `projects/${environment.firebaseLogs['projectId']}/databases/(default)/documents/${logType}/${logId}`,
            fields: {
              ...jsonToDocument(data).mapValue.fields,
            },
          },
        },
      ],
    };

    // console.log('WRAPPED_DATA', wrappedData);

    const preparedData = new Blob([JSON.stringify(wrappedData, null, 2)], {
      type: 'application/json',
    });

    return preparedData;
  } else {
    return null;
  }
}


@Injectable({
  providedIn: 'root',
})
export class LogDBService {
  private log: Firestore;

  constructor(
    private allFirestoreInstances: FirestoreInstances,
  ) {
    this.log = this.allFirestoreInstances.find((x) => x.toJSON()['app'].name === 'logs');
  }

  rawLog(data: LogData) {
    const logId = getLogId(data);
    const logType = 'logs';

    if (!isDevMode()) {
      // Note that we are intentionally overriding logs with same id.
      // This allows for making sure the same log doesn't get stored twice,
      // e.g. for storing things in localStorage and saving next time we load
      // the browser
      const docRef = doc(this.log, logType, logId);
      setDoc(docRef, data);
    }
  }

  rawLogOnBeaconEvent(data: LogData) {
    const logId = getLogId(data);
    const logType = 'logs';

    if (data !== null) {
      if (!isDevMode() && environment.firebaseLogs['projectId']) {
        navigator.sendBeacon(
          `https://firestore.googleapis.com/v1/projects/${environment.firebaseLogs['projectId']}/databases/(default)/documents:commit`,
          reformatLogForBeacon(data, logType, logId),
        );
      }
    }
  }
}
