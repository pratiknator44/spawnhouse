import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    currentData = {};
    currentUser: any;
    dpLink: any;
    coverLink: any;
    nowplaying: any;
    gameData: any;
    constructor() {}
    setSessionData(key, value) {
        sessionStorage.setItem(key, value);
    }

    getSessionData(key) {
        return sessionStorage.getItem(key);
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

    // called when session token is found when a user reopens the browser or refreshes it
    setUserFromSession() {
        if(sessionStorage.getItem('user'))
        this.currentUser = JSON.parse(sessionStorage.getItem('user'));
    }

    setCover(url) {
        this.setSessionData('cover', url);
        this.coverLink = url;
    }

    setDp(url) {
        this.setSessionData('dp', url);
        this.dpLink = url;
    }

    reset() {
        localStorage.clear();
        sessionStorage.clear();
    }

}