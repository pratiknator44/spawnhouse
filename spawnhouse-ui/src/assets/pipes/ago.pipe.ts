import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'ago',
    pure: true
})
export class AgoPipe implements PipeTransform {

    terms = [
        {label: 'min', divisor: 60000},
        {label: 'h', divisor: 60},
        {label: 'd', divisor: 24},
        {label: 'm', divisor: 30},
        {label: 'y', divisor: 12}
    ];
    transform(value: number, fullForm?:boolean): string {

        let time = new Date().getTime() - value;
        if(time < 60000) return 'Just Now';

        // just now, minutes, hours, days, weeks, months, years
        for(let x = 0; x < 5; x++) {
            time = time/this.terms[x].divisor;
            if(time < 12) {
                return Math.floor(time)+this.terms[x].label;
            }
        }
    }
}
