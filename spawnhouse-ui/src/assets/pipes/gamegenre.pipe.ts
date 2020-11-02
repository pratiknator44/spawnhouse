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
        let returnValue;
        if(link.includes('yout')) {
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