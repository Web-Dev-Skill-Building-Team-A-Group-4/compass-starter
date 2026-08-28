import { Injectable, inject, Injector, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, merge, of, from, pipe } from 'rxjs';
import { tap, pluck, mergeMap, pairwise, delay, startWith, filter, takeUntil, skip, switchMap, map, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DocumentSnapshot, serverTimestamp, Timestamp, getDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, docData, collection, collectionData, collectionChanges, query, where, orderBy, OrderByDirection, limit, startAt, startAfter, endAt, endBefore, DocumentChange, increment, AggregateQuerySnapshot, AggregateField, AggregateSpec, getAggregateFromServer, getCountFromServer } from '@angular/fire/firestore';
import { AnyEntity, QueryParams, QueryOptions } from '../store/app.model';
import { DatabaseService } from './database.service';
import { SelectEntityId } from '@ngrx/signals/entities';
import { AuthMockDB } from '../store/auth/auth.mock';

// Entity Model DB Data
import { WeeklyGoalReflectionsMockDB, WEEKLYGOALREFLECTIONS_DB } from '../store/weekly-goal-reflections/weekly-goal-reflections.mock';
import { LongTermGoalMockDB, LONGTERMGOAL_DB } from '../store/long-term-goal/long-term-goal.mock';
import { QuarterlyGoalMockDB, QUARTERLYGOAL_DB } from '../store/quarterly-goal/quarterly-goal.mock';
import { WeeklyGoalMockDB, WEEKLYGOAL_DB } from '../store/weekly-goal/weekly-goal.mock';
import { HashtagMockDB, HASHTAG_DB } from '../store/hashtag/hashtag.mock';
import { UserMockDB, USER_DB } from '../store/user/user.mock';

const selectId: SelectEntityId<AnyEntity> = (entity) => entity.__id;

@Injectable({
  providedIn: 'root',
})
export class FirebaseMockService implements DatabaseService {
  readonly authDB = inject(AuthMockDB);
  readonly DB = {
    'weeklyGoalReflectionss': inject(WeeklyGoalReflectionsMockDB),
    'longTermGoals': inject(LongTermGoalMockDB),
    'quarterlyGoals': inject(QuarterlyGoalMockDB),
    'weeklyGoals': inject(WeeklyGoalMockDB),
    'hashtags': inject(HashtagMockDB),
    'users': inject(UserMockDB),
  };
  private user$ = toObservable(this.authDB.user);

  // Constant for simulating delay (e.g. to see loading icon in action)
  GET_LATENCY_SIMULATION_DELAY = 100;
  PUT_LATENCY_SIMULATION_DELAY = 300;

  constructor(
    private injector: Injector,
  ) {
    // Init Entity Models
    this.DB['weeklyGoalReflectionss'].init(WEEKLYGOALREFLECTIONS_DB);
    this.DB['longTermGoals'].init(LONGTERMGOAL_DB);
    this.DB['quarterlyGoals'].init(QUARTERLYGOAL_DB);
    this.DB['weeklyGoals'].init(WEEKLYGOAL_DB);
    this.DB['hashtags'].init(HASHTAG_DB);
    this.DB['users'].init(USER_DB);
  }

  /** Creates a unique id */
  createId(): string {
    // see https://stackoverflow.com/questions/56574593/access-firestore-id-generator-on-the-front-end?noredirect=1&lq=1
    // see https://github.com/firebase/firebase-js-sdk/blob/73a586c92afe3f39a844b2be86086fddb6877bb7/packages/firestore/src/util/misc.ts#L36
    // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  afUser(): Observable<{ uid: string, accessToken: string, email: string, displayName: string, photoURL: string }> {
    return this.user$;
  }

  async login(providerId, scope?: string): Promise<any> {
    this.authDB.login();
    return {
      user: {
        uid: USER_DB[0].__id,
        email: USER_DB[0].email,
        displayName: USER_DB[0].name,
        photoURL: USER_DB[0].photoURL,
      },
    };
  }

  loginLink(error) { }

  logout() {
    this.authDB.logout();
  }

  streamEntity<T>(collectionName: string, id: string) {
    const store = this.DB[collectionName];
    const entity = computed(() => {
      return store.selectEntity(id);
    });
    return toObservable(entity, { injector: this.injector }).pipe(
      delay(this.GET_LATENCY_SIMULATION_DELAY),
    );
  }

  streamEntities<T>(collectionName, queryParams, queryOptions) {
    const store = this.DB[collectionName];
    const entities = computed(() => {
      return store.selectEntities(queryParams, queryOptions);
    });

    return toObservable(entities, { injector: this.injector }).pipe(
      delay(this.GET_LATENCY_SIMULATION_DELAY),
    );
  }

  streamEntitiesChanges<T>(collectionName, queryParams, queryOptions) {
    const store = this.DB[collectionName];
    const streamEntities = computed(() => {
      return store.selectEntities(queryParams, queryOptions);
    });

    return toObservable(streamEntities, { injector: this.injector }).pipe(
      // convert to entityMap to more easily compare
      map((entities) => {
        const entityMap = {};
        for (const entity of entities) {
          entityMap[entity.__id] = entity;
        }
        return entityMap;
      }),
      // compare current with prior including the first
      startWith({}),
      pairwise(),
      // get the changedEntities
      map(([prevEntities, currEntities]) => {
        const changedEntities = [];
        for (const key in currEntities) {
          if (!(key in prevEntities)) {
          // the entity was added
            changedEntities.push({
              type: 'added',
              docData: currEntities[key],
            });
          } else if (currEntities[key]['_deleted']) {
          // the entity was removed
            changedEntities.push({
              type: 'removed',
              docData: currEntities[key],
            });
          } else if (currEntities[key]['_updatedAt'] !== prevEntities[key]['_updatedAt']) {
          // the entity was modified
            changedEntities.push({
              type: 'modified',
              docData: currEntities[key],
            });
          }
        }

        return changedEntities;
      }),
      filter((changes: Array<{ type: string, docData: T }>) => changes.length > 0),
      delay(this.GET_LATENCY_SIMULATION_DELAY),
    );
  }

  async getEntity<T>(collectionName: string, id: string) {
    const store = this.DB[collectionName];
    await new Promise((resolve) => setTimeout(resolve, this.GET_LATENCY_SIMULATION_DELAY));
    return store.selectEntity(id);
  }

  async getEntities<S>(
    collectionName: string,
    queryParams: [string, string, any][],
    queryOptions?: { [index: string]: any },
  ): Promise<S[]> {
    const db = this.DB[collectionName];
    await new Promise((resolve) => setTimeout(resolve, this.GET_LATENCY_SIMULATION_DELAY));
    return db.selectEntities(queryParams, queryOptions);
  }

  async count(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions?: QueryOptions,
  ): Promise<number> {
    const result = await this.aggregate(collectionName, queryParams, queryOptions, {
      count: ['count'],
    });
    await new Promise((resolve) => setTimeout(resolve, this.GET_LATENCY_SIMULATION_DELAY));
    return result['count'];
  }

  /*
   * Example of aggregateSpec
   * {
   *   countOfDocs: ['count'],
   *   totalPopulation: ['sum', 'population'],
   *   averagePopulation: ['average', 'population'],
   * }
   */
  async aggregate<S extends { [k: string]: number }>(
    collectionName: string,
    queryParams: QueryParams,
    queryOptions: QueryOptions,
    aggregateSpec: { [K in keyof S]: [string] | [string, string] },
  ): Promise<{ [K in keyof S]: number }> {
    const store = this.DB[collectionName];
    const entities = store.selectEntities(queryParams, queryOptions);
    const result: Partial<{ [K in keyof S]: number }> = {};
    for (const key in aggregateSpec) {
      if (Object.prototype.hasOwnProperty.call(aggregateSpec, key)) {
        const value = aggregateSpec[key];

        if (value[0] === 'count') {
          result[key] = entities.length;
        } else if (value[0] === 'sum') {
          result[key] = entities.reduce((s, e) => s + e[value[1]], 0);
        } else if (value[0] === 'average') {
          result[key] = entities.reduce((s, e) => s + e[value[1]], 0)/entities.length;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, this.GET_LATENCY_SIMULATION_DELAY));
    return result as { [K in keyof S]: number };
  }

  async addEntity(collectionName, entity, batch?) {
    const store = this.DB[collectionName];
    const entityFinal = Object.assign({}, entity, {
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
    });

    if (batch) {
      const docRef = {
        path: `${collectionName}/${entity.__id}`,
      };
      return batch.set(docRef, entityFinal);
    } else {
      await new Promise((resolve) => setTimeout(resolve, this.PUT_LATENCY_SIMULATION_DELAY));
      return store.add(entityFinal);
    }
  }

  async updateEntity(collectionName, id, changes, batch?) {
    const store = this.DB[collectionName];
    const changesFinal = Object.assign({}, changes, {
      _updatedAt: Timestamp.now(),
    });

    if (batch) {
      const docRef = {
        path: `${collectionName}/${id}`,
      };
      return batch.update(docRef, changesFinal);
    } else {
      await new Promise((resolve) => setTimeout(resolve, this.PUT_LATENCY_SIMULATION_DELAY));
      return store.update(id, changesFinal);
    }
  }

  async removeEntity(collectionName, id, batch?) {
    const store = this.DB[collectionName];
    const changes = {
      _updatedAt: Timestamp.now(),
      _deleted: true,
    };

    if (batch) {
      const docRef = {
        path: `${collectionName}/${id}`,
      };
      return batch.update(docRef, changes);
    } else {
      await new Promise((resolve) => setTimeout(resolve, this.PUT_LATENCY_SIMULATION_DELAY));
      return store.update(id, changes);
    }
  }

  async incrementEntityField(collectionName, id, field, delta) {
    const store = this.DB[collectionName];
    const entity = store.selectEntity(id);
    const changes = {
      _updatedAt: Timestamp.now(),
    };
    changes[field] = entity[field] + delta;

    await new Promise((resolve) => setTimeout(resolve, this.PUT_LATENCY_SIMULATION_DELAY));
    return await store.update(id, changes);
  }
}
