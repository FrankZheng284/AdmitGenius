import { User, School, Essay, Recommendation } from '@/types'

/**
 * 模拟数据服务
 * 用于在没有后端API的情况下提供示例数据
 */
export const MockService = {
  /**
   * 获取模拟用户数据
   */
  getMockUser(): User {
    return {
      id: 1,
      email: 'user@example.com',
      fullName: '演示用户',
      role: 'USER',
      undergraduateSchool: '北京大学',
      gpa: 3.8,
      gmatScore: 720,
      greScore: 325,
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      savedSchools: [101, 102, 103]
    }
  },

  /**
   * 获取模拟学校列表
   */
  getMockSchools(): School[] {
    return [
      {
        id: 101,
        name: '哈佛大学',
        country: '美国',
        ranking: 1,
        acceptanceRate: 0.05,
        averageGPA: 3.9,
        averageGRE: 330,
        averageGMAT: 730,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/1200px-Harvard_shield_wreath.svg.png',
        description: '哈佛大学是一所位于美国马萨诸塞州剑桥市的私立研究型大学。'
      },
      {
        id: 102,
        name: '斯坦福大学',
        country: '美国',
        ranking: 2,
        acceptanceRate: 0.04,
        averageGPA: 3.95,
        averageGRE: 328,
        averageGMAT: 732,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Stanford_University_seal_2003.svg/1200px-Stanford_University_seal_2003.svg.png',
        description: '斯坦福大学是一所位于美国加利福尼亚州斯坦福的私立研究型大学。'
      },
      {
        id: 103,
        name: '麻省理工学院',
        country: '美国',
        ranking: 3,
        acceptanceRate: 0.07,
        averageGPA: 3.9,
        averageGRE: 335,
        averageGMAT: 728,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/MIT_Seal.svg/1200px-MIT_Seal.svg.png',
        description: '麻省理工学院是一所位于美国马萨诸塞州剑桥市的私立研究型大学。'
      },
      {
        id: 104,
        name: '牛津大学',
        country: '英国',
        ranking: 4,
        acceptanceRate: 0.17,
        averageGPA: 3.8,
        averageGRE: 325,
        averageGMAT: 720,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png',
        description: '牛津大学是英国一所公立研究型大学，位于英格兰牛津。'
      },
      {
        id: 105,
        name: '剑桥大学',
        country: '英国',
        ranking: 5,
        acceptanceRate: 0.21,
        averageGPA: 3.85,
        averageGRE: 322,
        averageGMAT: 715,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg/1200px-Coat_of_Arms_of_the_University_of_Cambridge.svg.png',
        description: '剑桥大学是英国一所公立研究型大学，位于英格兰剑桥。'
      }
    ]
  },

  /**
   * 获取模拟文书列表
   */
  getMockEssays(): Essay[] {
    return [
      {
        id: 201,
        title: '我的学术经历',
        content: '在我的本科学习过程中，我参与了多个研究项目...',
        status: 'DRAFT',
        createdAt: '2023-05-15T14:30:00Z',
        updatedAt: '2023-05-15T14:30:00Z',
        type: 'PERSONAL_STATEMENT'
      },
      {
        id: 202,
        title: '我为什么选择计算机科学',
        content: '计算机科学一直是我的热情所在...',
        status: 'COMPLETED',
        createdAt: '2023-04-20T09:15:00Z',
        updatedAt: '2023-04-25T11:30:00Z',
        type: 'STATEMENT_OF_PURPOSE'
      }
    ]
  },

  /**
   * 获取模拟推荐结果
   */
  getMockRecommendations(): Recommendation[] {
    const schools = this.getMockSchools()
    return [
      {
        id: 301,
        schoolId: 101,
        school: schools[0],
        matchScore: 85,
        reasons: ['GPA符合要求', '研究经历丰富', 'GRE成绩优秀'],
        applicationDeadline: '2023-12-15T00:00:00Z'
      },
      {
        id: 302,
        schoolId: 102,
        school: schools[1],
        matchScore: 90,
        reasons: ['专业背景强匹配', 'GPA优秀', '研究经历丰富'],
        applicationDeadline: '2023-12-01T00:00:00Z'
      },
      {
        id: 303,
        schoolId: 103,
        school: schools[2],
        matchScore: 75,
        reasons: ['GRE成绩优秀', '专业背景匹配'],
        applicationDeadline: '2023-11-15T00:00:00Z'
      }
    ]
  },

  /**
   * 获取可用的国家列表
   */
  getAvailableCountries(): string[] {
    return ['美国', '英国', '加拿大', '澳大利亚', '德国', '法国', '中国香港', '新加坡', '日本']
  },

  /**
   * 获取可用的专业列表
   */
  getAvailablePrograms(): string[] {
    return [
      '计算机科学',
      '工商管理',
      '电子工程',
      '机械工程',
      '数学',
      '经济学',
      '金融学',
      '化学工程',
      '生物学',
      '物理学'
    ]
  }
} 