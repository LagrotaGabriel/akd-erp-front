import { animate, style, transition, trigger } from "@angular/animations";

export const fadeInOutAnimation = [
    trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate(300, style({ opacity: 1 }))
        ]),
        transition(':leave', [
            animate(300, style({ opacity: 0 }))
        ])
    ]),
]

export const slideUpDownAnimation = [
    trigger('slideUpDown', [
        transition(':enter', [style({ height: 0 }), animate(90)]),
        transition(':leave', [animate(90, style({ height: 0 }))]),
    ]),
]