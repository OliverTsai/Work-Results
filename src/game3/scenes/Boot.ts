import { Scene } from 'phaser';

export class Boot extends Scene{
    constructor ()
    {
        super('Boot');
    }

    preload (){
        this.load.image('background', 'https://olivertsai.github.io/Work-Results/assets/picture/bgTable.png');
        this.load.image('Table', 'https://olivertsai.github.io/Work-Results/assets/picture/Table.png');
        this.load.image('logo', 'https://olivertsai.github.io/Work-Results/assets/picture/logo.png');
        this.load.image('star', 'https://olivertsai.github.io/Work-Results/assets/picture/star.png');
    }

    create(){
        console.log('Boot')
        this.scene.start('Preloader');
    }
}