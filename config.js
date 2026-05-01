export const CONFIG = {
    PLAYER: {
        MOVE_SPEED: 4,
        RUN_SPEED: 7,
        EYE_HEIGHT: 1.6,
        SNEAK_SPEED: 2,
    },
    ENEMY: {
        LURKER: {
            SPEED: 2.5,
            DETECTION_RANGE: 10,
            ATTACK_RANGE: 1.5,
            SPRITE: 'assets/lurker_gritty.webp',
            SCALE: 2,
            OFFSET_Y: 1
        },
        CRAWLER: {
            SPEED: 5.0,
            DETECTION_RANGE: 12,
            ATTACK_RANGE: 1.2,
            SPRITE: 'assets/crawler_gritty.webp',
            SCALE: 1.8,
            OFFSET_Y: 0.6
        },
        BRUTE: {
            SPEED: 1.8,
            DETECTION_RANGE: 15,
            ATTACK_RANGE: 2.5,
            SPRITE: 'assets/brute_gritty.webp',
            SCALE: 4.5,
            OFFSET_Y: 2.2
        }
    },
    DIFFICULTY: {
        SANDBOX: { SPEED_MULT: 0.5, DETECT_MULT: 0, IMMORTAL: true },
        EASY: { SPEED_MULT: 0.7, DETECT_MULT: 0.7, IMMORTAL: false },
        NORMAL: { SPEED_MULT: 1.0, DETECT_MULT: 1.0, IMMORTAL: false },
        HARD: { SPEED_MULT: 1.3, DETECT_MULT: 1.5, IMMORTAL: false }
    },
    COLORS: {
        CONCRETE: 0x444444,
        BLOOD: 0x880000,
        EMERGENCY_RED: 0xff0000,
    },
    FACILITY: {
        CORRIDOR_WIDTH: 4,
        CORRIDOR_HEIGHT: 4,
        SECTION_SIZE: 10,
    }
};
