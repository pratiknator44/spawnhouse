import { Pipe, PipeTransform } from "@angular/core";
import { GameConsoleEnum } from '../variables/game-consoles.enum';
import { ConsoleIconEnum, GameGenreEnum } from '../variables/gamegenre.enum';

@Pipe({
    name: 'gameGenre',
    pure: true
})
export class GameGenrePipe implements PipeTransform {

    transform(value: string, gc?: boolean): string {
        if(gc) {
            return GameConsoleEnum[value];
        }
        return GameGenreEnum[value];
    }
}

@Pipe({
    name: 'consoleicon',
    pure: true
})
export class ConsoleIconPipe implements PipeTransform {
    transform(console: string): string {
        return ConsoleIconEnum[console];
    }
}

@Pipe({
    name: 'randombg',
    pure: true
})
export class RandomBgPipe implements PipeTransform {

    bg = ['bg-success', 'bg-primary', 'bg-theme', 'bg-danger', 'bg-danger', 'bg-off-black bg-white', 'bg-grey'];
    transform(farziInput: string): string {
        let l = this.bg.length;
        return this.bg[Math.floor(Math.random()*l)];
    }
}

// determines the path of the stream to output icon and colour for the link
@Pipe({
    name: 'streamlink',
    pure: true
})
export class StreamLinkPipe implements PipeTransform {

    transform(link: string, onlyVendor?: boolean) {
        
        if(!link)   return '';
        
        let returnValue;
        if(link.includes('youtu')) {
            returnValue = 'youtube text-danger';
        }
        else if (link.includes('twitch')) {
            returnValue = 'twitch text-twitch';
        }
        else if (link.includes('vimeo')) {
            returnValue = 'vimeo text-vimeo';
        } else returnValue = 'link text-theme';

        returnValue = onlyVendor ? returnValue.split(" ")[0] : returnValue;
        return returnValue;
    }
}

// determines the full name of the player type
@Pipe({
    name: 'playertype',
    pure: true
})
export class PLayerTypePipe implements PipeTransform {

    transform(str: string, isIcon?: boolean, iconColor?: boolean, desc?: boolean) {
        let full = str;
        if(desc) {
            switch(str) {
                case 'as': full = 'Forward shooter, aggressive and highly lethal to enemies';
                break;
                case 'md': full = 'Carried supplies for health, stamina, and mana for teammates';
                break;
                case 'df': full = 'Defends the area, bomb, spike or tower behind the enemy lines. Highly tactical';
                break;
                case 'sn': full = 'The Sharpest shooter in town';
                break;
                case 'sp': full = 'Carries the lethal object, acts as imposter or divergent, secondary shooter';
                break;
                case 'fr': full = 'Good wih grenades, flashbangs, and stealth';
                break;
                case 'co': full = 'Loots while you blink, the main supplier of the team';
                break;
                case 'st': full = 'defines strategies and approach, like the Queen in chess';
                break;
            }
        }
        else if(iconColor) {
            switch(str) {
                case 'as': full = 'danger';
                break;
                case 'md': full = 'black';
                break;
                case 'df': full = 'theme';
                break;
                case 'sn': full = 'black';
                break;
                case 'sp': full = 'danger';
                break;
                case 'fr': full = 'success';
                break;
                case 'co': full = 'theme';
                break;
                case 'st': full = 'black';
            }
        } else
        switch(str) {
            case 'as': full = 'assaulter';
            break;
            case 'md': full = 'medic';
            break;
            case 'df': full = 'defender';
            break;
            case 'sn': full = 'sniper';
            break;
            case 'sp': full = 'support';
            break;
            case 'fr': full = 'fragger';
            break;
            case 'co': full = isIcon ? 'bag' : 'collector';
            break;
            case 'st': full = isIcon ? 'queen iconset2' : 'strategist';
        }
        return full;
    }
}