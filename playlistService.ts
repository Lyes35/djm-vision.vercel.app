/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import logger from './logger.client';

export const fetchFilteredPlaylist = async (url: string, category?: string, limit?: number) => {
  try {
    const params = new URLSearchParams();
    params.append('url', url);
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/playlist?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.channels || [];
  } catch (error) {
    logger.error('Error fetching filtered playlist:', error);
    return [];
  }
};

export const getPlaylistStats = async (url: string) => {
  try {
    const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      filtered: data.filtered || 0
    };
  } catch (error) {
    logger.error('Error fetching playlist stats:', error);
    return { total: 0, filtered: 0 };
  }
};