// sayuTypes.js

class SAYUTypes {
    constructor() {
        // 8가지 기능 정의
        this.functions = {
            'Le': '혼자 외부관찰',
            'Li': '혼자 내면탐구', 
            'Se': '함께 외부교류',
            'Si': '함께 내면공유',
            'Ae': '추상 추구',
            'Ai': '추상 음미',
            'Re': '구상 추구', 
            'Ri': '구상 음미',
            'Ee': '감정 표현',
            'Ei': '감정 수용',
            'Me': '의미 전달',
            'Mi': '의미 탐구',
            'Fe': '경로 창조',
            'Fi': '흐름 따르기',
            'Ce': '체계 설계',
            'Ci': '순서 준수'
        };
        
        // 16가지 유형별 기능 서열 (1-4차: 의식, 5-8차: 무의식)
        this.typeFunctions = {
            // L+A 그룹 (혼자 + 추상)
            'LAEF': {
                name: '몽환적 방랑자',
                conscious: ['Le', 'Ai', 'Ee', 'Ci'],
                unconscious: ['Li', 'Ae', 'Ei', 'Fe'],
                description: '혼자서 추상 작품을 감정적으로 자유롭게 감상'
            },
            'LAEC': {
                name: '감성 큐레이터',
                conscious: ['Le', 'Ai', 'Ee', 'Fi'],
                unconscious: ['Li', 'Ae', 'Ei', 'Ce'],
                description: '혼자서 추상 작품을 감정적으로 체계적으로 감상'
            },
            'LAMF': {
                name: '직관적 탐구자',
                conscious: ['Le', 'Ai', 'Me', 'Ci'],
                unconscious: ['Li', 'Ae', 'Mi', 'Fe'],
                description: '혼자서 추상 작품의 의미를 자유롭게 탐구'
            },
            'LAMC': {
                name: '철학적 수집가',
                conscious: ['Le', 'Ai', 'Me', 'Fi'],
                unconscious: ['Li', 'Ae', 'Mi', 'Ce'],
                description: '혼자서 추상 작품의 의미를 체계적으로 정리'
            },
            
            // L+R 그룹 (혼자 + 구상)
            'LREF': {
                name: '고독한 관찰자',
                conscious: ['Le', 'Ri', 'Ee', 'Ci'],
                unconscious: ['Li', 'Re', 'Ei', 'Fe'],
                description: '혼자서 구상 작품을 감정적으로 자유롭게 관찰'
            },
            'LREC': {
                name: '섬세한 감정가',
                conscious: ['Le', 'Ri', 'Ee', 'Fi'],
                unconscious: ['Li', 'Re', 'Ei', 'Ce'],
                description: '혼자서 구상 작품을 감정적으로 체계적으로 음미'
            },
            'LRMF': {
                name: '디지털 탐험가',
                conscious: ['Le', 'Ri', 'Me', 'Ci'],
                unconscious: ['Li', 'Re', 'Mi', 'Fe'],
                description: '혼자서 구상 작품의 의미를 자유롭게 분석'
            },
            'LRMC': {
                name: '학구적 연구자',
                conscious: ['Le', 'Ri', 'Me', 'Fi'],
                unconscious: ['Li', 'Re', 'Mi', 'Ce'],
                description: '혼자서 구상 작품의 의미를 체계적으로 연구'
            },
            
            // S+A 그룹 (함께 + 추상)
            'SAEF': {
                name: '감성 나눔이',
                conscious: ['Se', 'Ai', 'Ee', 'Ci'],
                unconscious: ['Si', 'Ae', 'Ei', 'Fe'],
                description: '함께 추상 작품의 감정을 자유롭게 나눔'
            },
            'SAEC': {
                name: '예술 네트워커',
                conscious: ['Se', 'Ai', 'Ee', 'Fi'],
                unconscious: ['Si', 'Ae', 'Ei', 'Ce'],
                description: '함께 추상 작품의 감정을 체계적으로 공유'
            },
            'SAMF': {
                name: '영감 전도사',
                conscious: ['Se', 'Ai', 'Me', 'Ci'],
                unconscious: ['Si', 'Ae', 'Mi', 'Fe'],
                description: '함께 추상 작품의 의미를 자유롭게 전파'
            },
            'SAMC': {
                name: '문화 기획자',
                conscious: ['Se', 'Ai', 'Me', 'Fi'],
                unconscious: ['Si', 'Ae', 'Mi', 'Ce'],
                description: '함께 추상 작품의 의미를 체계적으로 기획'
            },
            
            // S+R 그룹 (함께 + 구상)
            'SREF': {
                name: '열정적 관람자',
                conscious: ['Se', 'Ri', 'Ee', 'Ci'],
                unconscious: ['Si', 'Re', 'Ei', 'Fe'],
                description: '함께 구상 작품을 감정적으로 자유롭게 즐김'
            },
            'SREC': {
                name: '따뜻한 안내자',
                conscious: ['Se', 'Ri', 'Ee', 'Fi'],
                unconscious: ['Si', 'Re', 'Ei', 'Ce'],
                description: '함께 구상 작품을 감정적으로 체계적으로 안내'
            },
            'SRMF': {
                name: '지식 멘토',
                conscious: ['Se', 'Ri', 'Me', 'Ci'],
                unconscious: ['Si', 'Re', 'Mi', 'Fe'],
                description: '함께 구상 작품의 의미를 자유롭게 가르침'
            },
            'SRMC': {
                name: '체계적 교육자',
                conscious: ['Se', 'Ri', 'Me', 'Fi'],
                unconscious: ['Si', 'Re', 'Mi', 'Ce'],
                description: '함께 구상 작품의 의미를 체계적으로 교육'
            }
        };
    }
    
    getTypeInfo(typeCode) {
        return this.typeFunctions[typeCode] || null;
    }
    
    getDominantFunction(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        return typeInfo ? typeInfo.conscious[0] : null;
    }
    
    getInferiorFunction(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        return typeInfo ? typeInfo.conscious[3] : null;
    }
    
    getGrowthAreas(typeCode) {
        const typeInfo = this.getTypeInfo(typeCode);
        if (!typeInfo) return null;
            
        return {
            tertiary: typeInfo.conscious[2],  // 3차 기능
            inferior: typeInfo.conscious[3],  // 열등 기능
            description: `${this.functions[typeInfo.conscious[2]]}와 ${this.functions[typeInfo.conscious[3]]} 능력 개발 필요`
        };
    }
}

module.exports = SAYUTypes;