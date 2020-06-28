import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
    currentData = {};
    constructor() {}
    
    setSessionData(key, value) {
        sessionStorage.setItem(key, value);
    }

    getSessionData(key) {
        sessionStorage.getItem(key);
    }

    deleteSessionData(key) {
        sessionStorage.removeItem(key);
    }

    setLocalData(key, value) {
        localStorage.setItem(key, value);
    }

    deleteLocalData(key) {
        localStorage.removeItem(key);
    }

    setCurrentData(key, value) {
        this.currentData[key] = value;
    }

    deleteCurrentData(key) {
        delete this.currentData[key];
    }

    flushSession() {
        sessionStorage.clear();
    }

}