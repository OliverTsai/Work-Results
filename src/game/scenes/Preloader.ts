import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('enter', 'btn-enter-game.png');
        this.load.image('seatButton', 'btn-play.png');

        // 選桌場景需要的資源
        this.load.image('bg_select', 'bg_select.png');
        this.load.image('select-bg', 'select-bg.png');
        this.load.image('jackpot-bg', 'jackpot-bg.png');
        this.load.image('btn-back', 'btn-back.png');
        this.load.image('btn-enterfast', 'btn-enterfast.png');
        this.load.image('btn-create-room', 'btn-create-room.png');

        // 牌桌框架圖片
        this.load.image('table_regular', '框-一般.png');
        this.load.image('table_turbo', '框-急速.png');
        this.load.image('table_short_deck', '框-短牌.png');
        this.load.image('table_omaha', '框-奧馬哈.png');
        this.load.image('table_tournament', '框-積分賽.png');

        // 盲注和玩家數量背景
        this.load.image('blind-bg', '忙注.png');
        this.load.image('player-bg', '人數.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
        console.log('Preloader')
    }
}
