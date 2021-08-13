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
    otherUsers: any = [];
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
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        this.currentUser = JSON.parse(user);
        if(!sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', user);
        }
        // if(sessionStorage.getItem('user'))
        //     this.currentUser = JSON.parse(sessionStorage.getItem('user'));
        // else {
        //     localStorage.getItem('user') {

        //     }
        // }
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
        this.coverLink = this.dpLink = this.nowplaying = this.gameData = this.currentData = this.currentUser = null;
    }

    saveUserProperty(_id, property, value) {
        const otherUser = JSON.parse(this.getSessionData(_id));
        // console.log("other users = ", this.getSessionData(_id), "_id ", _id);
        if(otherUser) {
            otherUser[property] = value;
            this.setSessionData(_id, JSON.stringify(otherUser));
        }
    }

    saveFullUser(userob, checkIfExists?: boolean) {
        if(checkIfExists) {
            if(this.getSessionData(userob['_id']))  return;
        }
        console.log("writing user to session");
        this.setSessionData(userob['_id'], JSON.stringify(userob));
    }

    getUserProperty(_id, property) {
        const user = JSON.parse(this.getSessionData(_id));
        // console.log("_id ", _id, "property asked ", property, " value ", user);
        return JSON.parse(this.getSessionData(_id))[property];
    }

    userExistsInSession(_id) {
        return JSON.parse(this.getSessionData(_id));
    }

    /*
    * CurrentUser functions help get properties of logged in user
    */
    changeCurrentUserProperty(property: string, value) {
        let user = JSON.parse( sessionStorage.getItem('user'));
        user[property] = value;
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    getCurrentUserProperty(property) {
        let user = JSON.parse( sessionStorage.getItem('user'));
        return user[property];
    }

}