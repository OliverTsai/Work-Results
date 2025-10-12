// 技能類型定義
export interface Skill {
    id: string;
    name: string;
    level: number;
    maxLevel: number;
    getDescription: (level: number) => string;
}

// 技能定義
const skillDefinitions: {[key: string]: Omit<Skill, 'level'> & {getEffect: (character: any, level: number) => void}} = {
    splitShot: {
        id: 'splitShot',
        name: '分裂射擊',
        maxLevel: 5,
        getDescription: (level: number) => `發射額外 ${level} 個光球`,
        getEffect: (character, level) => {
            character.splitShot = level;
        }
    },
    piercingShot: {
        id: 'piercingShot',
        name: '穿透射擊',
        maxLevel: 3,
        getDescription: (level: number) => `光球可以穿透 ${level} 個敵人`,
        getEffect: (character, level) => {
            character.piercingShot = level;
        }
    },
    explosion: {
        id: 'explosion',
        name: '爆炸效果',
        maxLevel: 3,
        getDescription: (level: number) => `擊殺敵人時產生半徑 ${level * 20} 的爆炸`,
        getEffect: (character, level) => {
            character.explosion = level;
        }
    },
    harmBoost: {
        id: 'harmBoost',
        name: '攻擊加成',
        maxLevel: 10,
        getDescription: (level: number) => `增加 ${level} 點攻擊力`,
        getEffect: (character, level) => {
            character.harmBoost = level;
        }
    },
    speedBoost: {
        id: 'speedBoost',
        name: '速度加成',
        maxLevel: 10,
        getDescription: (level: number) => `增加 ${level} 點速度`,
        getEffect: (character, level) => {
            character.speedBoost = level;
        }
    }
};

// 獲取角色已學習的技能
export function getLearnedSkills(character: any): Skill[] {
    const skills: Skill[] = [];
    
    // 檢查角色是否有各種技能，並添加到列表中
    Object.keys(skillDefinitions).forEach(skillId => {
        const level = character[skillId] || 0;
        if (level > 0) {
            skills.push({
                ...skillDefinitions[skillId],
                level,
            });
        }
    });
    
    return skills;
}

// 獲取可用技能列表
export function getAvailableSkills(character: any): Skill[] {
    const skills: Skill[] = [];
    
    // 添加所有技能到列表中
    Object.keys(skillDefinitions).forEach(skillId => {
        const level = character[skillId] || 0;
        skills.push({
            ...skillDefinitions[skillId],
            level,
        });
    });
    
    return skills;
}

// 升級技能
export function upgradeSkill(character: any, skillId: string): boolean {
    // 檢查技能是否存在
    if (!skillDefinitions[skillId]) {
        console.error(`技能 ${skillId} 不存在`);
        return false;
    }
    
    // 檢查角色是否有足夠的技能點數
    if (character.skillPoints <= 0) {
        console.log('沒有足夠的技能點數');
        return false;
    }
    
    // 獲取當前技能等級
    const currentLevel = character[skillId] || 0;
    
    // 檢查技能是否已達最高等級
    if (currentLevel >= skillDefinitions[skillId].maxLevel) {
        console.log(`技能 ${skillDefinitions[skillId].name} 已達最高等級`);
        return false;
    }
    
    // 升級技能
    character[skillId] = currentLevel + 1;
    character.skillPoints -= 1;
    
    // 應用技能效果
    skillDefinitions[skillId].getEffect(character, character[skillId]);
    
    console.log(`升級技能 ${skillDefinitions[skillId].name} 到等級 ${character[skillId]}`);
    return true;
}

// 應用所有已學習的技能效果
export function applyAllSkills(character: any): void {
    // 重置所有技能加成
    // character.harmBoost = 0;
    // character.speedBoost = 0;
    // character.splitShot = 0;
    // character.piercingShot = 0;
    // character.explosion = 0;
    
    // 獲取所有已學習的技能
    Object.keys(skillDefinitions).forEach(skillId => {
        const level = character[skillId] || 0;
        if (level > 0) {
            // 應用技能效果
            skillDefinitions[skillId].getEffect(character, level);
        }
    });
}