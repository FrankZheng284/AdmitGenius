import request from '@/utils/request'

// Moved CommunityStatsData to frontend/src/types/index.ts
// export interface CommunityStatsData {
//   totalUsers: number;
//   totalPosts: number;
//   // activeToday?: number; // Future enhancement
// }

import type { CommunityStatsData } from '@/types'; // Import it from types

class StatisticsService {
  /**
   * 获取社区统计数据
   */
  getCommunityStats(): Promise<CommunityStatsData> {
    return request({
      url: '/api/statistics/community',
      method: 'get'
    })
  }

  // TODO: Add methods for hot topics and active users when backend API is ready
  // getHotTopics(): Promise<any[]> {
  //   // return request({ url: '/api/statistics/hot-topics', method: 'get' });
  //   return Promise.resolve([]); // Placeholder
  // }

  // getActiveUsers(): Promise<any[]> {
  //   // return request({ url: '/api/statistics/active-users', method: 'get' });
  //   return Promise.resolve([]); // Placeholder
  // }
}

export default new StatisticsService() 