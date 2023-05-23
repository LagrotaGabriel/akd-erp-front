import { animate, group, state, style, transition, trigger } from "@angular/animations";

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '500px', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
        })),
        transition('in => out', [group([
            animate('400ms ease-in-out', style({
                'opacity': '0'
            })),
            animate('600ms ease-in-out', style({
                'max-height': '0px'
            })),
            animate('700ms ease-in-out', style({
                'visibility': 'hidden'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('1ms ease-in-out', style({
                'visibility': 'visible'
            })),
            animate('600ms ease-in-out', style({
                'max-height': '500px'
            })),
            animate('800ms ease-in-out', style({
                'opacity': '1'
            }))
        ]
        )])
    ]),
]

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
        transition(':enter', [style({ height: 0 }), animate(150)]),
        transition(':leave', [animate(150, style({ height: 0 }))]),
    ]),
]