import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ErrorMessagesEnum } from "../variables/api-vars.enum";
import { SocketService } from "./socket.service";
import { StorageService } from "./storage.service";

@Injectable()
export class NowplayingService {

    pwdRequestQueue = [];
    pwdRequestListener;
    pwdResposeListener;
    newPwdRequestSubject = new Subject();
    playersNpData;
    pendingRequests = [];
    pendingRequestUpdated = new Subject();
    constructor(
        private _storageService: StorageService,
        private _socketService: SocketService
        ) {}
    
    // setups passwords, variables, queues etc.
    init() {

    }

    startListeningNPpwdRequests() {
        console.log("started listening for pwd requests");
        this.pwdRequestListener = this._socketService.getData('get-np-pwd-request');
        this.pwdRequestListener.subscribe(data => {
            console.log("nppwd request received = ", data);
            let accessorIds = JSON.parse(this._storageService.getSessionData("accessorIds"));
            accessorIds.push(data.senderid);
            accessorIds = [...new Set<string>(accessorIds)];
            
            if(this.playersNpData.maxconnections && this.playersNpData.maxconnections > 0) {
                if(accessorIds.length >  this.playersNpData.maxconnections) {      // stack is full
                    this.respondToRequest(data, false, ErrorMessagesEnum.NP_REQUEST_LIMIT_REACHED);
                    return;
                }
            }
            this.respondToRequest(data, true);
            
            // save only when request is sent
            this._storageService.setSessionData('accessorIds', JSON.stringify(accessorIds));
            this.newPwdRequestSubject.next(accessorIds.length);


        });
    }

    // called when a user deletes now playing data
    stopListeningNPpwdRequests() {
        console.log("stopping pwd listener");
        this.pwdRequestListener.unsubscribe();
    }

    startPwdResponseListener() {
        console.log("starting pwd response listener");
        this.pwdResposeListener = this._socketService.getData("get-np-pwd-response");
        this.pwdResposeListener.subscribe(data => {
            console.log("got pwd repsonse data from user ", data);
            this.stopPwdResonseListener();
        });
    }

    getPwdResponseListener() {
        return this._socketService.getData("get-np-pwd-response");
    }

    stopPwdResonseListener() {
        console.log("unsubscribed npPwdResponseListener");
        this.pwdResposeListener.unsubscribe();
    }

    respondToRequest(request, decision?: boolean, errorBody?: string) {

        if(decision) {
            this._socketService.pushData('get-np-pwd-response',{
                senderid: this._storageService.currentUser._id,
                receiverid: request['senderid'],
                pswd: this._storageService.getSessionData('nppwd')
            });
        } else {
            const body = {
                senderid: this._storageService.currentUser._id,
                receiverid: request['senderid'],
                error: errorBody
            };
            this._socketService.pushData('get-np-pwd-response', body);
            // add to pending requests
            this.pendingRequests.push(body);
            this.pendingRequestUpdated.next(this.pendingRequests);
        }
    }

    // returns how many players have already joined the game.
    // this data is present in the session storage of the target user
    getPlayersJoined(userid) {
        // send data
        console.log("sending request for no of players joined userid = ", userid);
        this._socketService.pushData('request-np-players-joined', {senderid: this._storageService.currentUser._id, receiverid: userid});
        return this._socketService.getData('response-np-players-joined').toPromise().then(response => response);
    }

    // used to send the number ofplayers who joined the user while now playing was live to requestor user
    startGetNpPlayerJoinedListener() {
        this._socketService.getData('request-np-players-joined').subscribe(req => {
            console.log("got request about no. of players");
            const noOfPlayers = JSON.parse(this._storageService.getSessionData("accessorIds")).length;
           
            console.log("reverting no. of players ",noOfPlayers);
            this._socketService.pushData('response-np-players-joined', {senderid: req.receiverid, receiverid: req.senderid, joined: noOfPlayers});
        });
        // emiting back
    }
}