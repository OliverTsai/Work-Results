import { Scene } from 'phaser';

export class Boot extends Scene{
    constructor ()
    {
        super('Boot');
    }

    preload (){
        this.load.image('background', '/public/assets/picture/bgTable.png');
        this.load.image('Table', '/public/assets/picture/Table.png');
        this.load.image('logo', '/public/assets/picture/logo.png');
        this.load.image('star', '/public/assets/picture/star.png');
    }

    create(){
        console.log('Boot')
        this.scene.start('Preloader');
    }
}